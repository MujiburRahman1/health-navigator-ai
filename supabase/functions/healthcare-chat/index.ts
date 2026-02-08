import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Healthcare AI system prompt for medical reasoning and gap analysis
const HEALTHCARE_SYSTEM_PROMPT = `You are an AI healthcare intelligence analyst specializing in healthcare access, equity, and facility analysis.

Your core capabilities:
1. **Medical Access Gap Detection**: Identify regions with insufficient healthcare coverage, missing specialties, or underserved populations.
2. **Equipment-Specialty Mismatch Analysis**: Flag facilities claiming specialties without required equipment (e.g., cardiac surgery without cath lab).
3. **Suspicious Claim Detection**: Identify facilities with inconsistent or potentially misleading claims about their capabilities.
4. **Equity Analysis**: Assess healthcare distribution and recommend improvements for underserved communities.

When analyzing healthcare facility data:
- Consider geographic distribution and population needs
- Cross-reference specialties with required equipment and procedures
- Look for patterns indicating healthcare deserts or oversupply
- Prioritize actionable, evidence-based recommendations

Format your responses with clear sections:
- **Analysis Summary**: Brief overview of findings
- **Key Findings**: Numbered list of specific insights
- **Recommendations**: Actionable steps for improvement
- **Data Quality Notes**: Any concerns about the data itself

Always explain your reasoning and cite specific data points when making claims.`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question } = await req.json();

    if (!question) {
      return new Response(
        JSON.stringify({ error: "Question is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch healthcare facilities from database for context
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: facilities, error: dbError } = await supabase
      .from("healthcare_facilities")
      .select("*")
      .limit(100);

    if (dbError) {
      console.error("Database error:", dbError);
    }

    // Build context from facility data
    const facilityContext = facilities && facilities.length > 0
      ? `\n\nAvailable Healthcare Facility Data (${facilities.length} facilities):\n${
          facilities.map((f, i) => 
            `${i + 1}. ${f.name} (${f.region || 'Unknown region'})
               - Specialties: ${f.specialties || 'Not specified'}
               - Procedures: ${f.procedures || 'Not specified'}
               - Equipment: ${f.equipment || 'Not specified'}
               - Capability: ${f.capability || 'Not specified'}`
          ).join("\n")
        }`
      : "\n\nNote: No healthcare facility data has been uploaded yet. Please upload a dataset first for detailed analysis.";

    // Call Lovable AI Gateway for healthcare reasoning
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: HEALTHCARE_SYSTEM_PROMPT + facilityContext },
          { role: "user", content: question },
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const answer = aiResponse.choices?.[0]?.message?.content || "Unable to generate response.";

    return new Response(
      JSON.stringify({ 
        answer,
        facilities_analyzed: facilities?.length || 0 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Healthcare chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
