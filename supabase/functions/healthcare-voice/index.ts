import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Healthcare AI system prompt for voice responses (more concise for TTS)
const HEALTHCARE_VOICE_PROMPT = `You are a healthcare intelligence AI assistant providing spoken recommendations.

Guidelines for voice responses:
- Keep responses concise and conversational (2-4 paragraphs max)
- Use natural speech patterns suitable for text-to-speech
- Avoid complex formatting, bullet points, or markdown
- Focus on the most important findings and actionable insights
- Speak in complete sentences that flow naturally

When analyzing healthcare data:
1. Identify critical access gaps or mismatches
2. Highlight facilities of concern or excellence  
3. Provide clear, actionable recommendations

Remember: Your response will be spoken aloud, so prioritize clarity and natural flow.`;

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
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    // Fetch healthcare facilities from database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: facilities, error: dbError } = await supabase
      .from("healthcare_facilities")
      .select("*")
      .limit(50); // Smaller limit for voice to keep context focused

    if (dbError) {
      console.error("Database error:", dbError);
    }

    // Build concise context for voice response
    const facilityContext = facilities && facilities.length > 0
      ? `\n\nHealthcare facilities in database: ${facilities.length} total.
Key facilities: ${facilities.slice(0, 10).map(f => `${f.name} in ${f.region || 'unknown region'} (${f.specialties || 'general'})`).join("; ")}`
      : "\n\nNo healthcare facility data has been uploaded yet.";

    // Step 1: Get AI text response
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: HEALTHCARE_VOICE_PROMPT + facilityContext },
          { role: "user", content: question },
        ],
        max_tokens: 800, // Shorter for voice
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const textAnswer = aiData.choices?.[0]?.message?.content || "I couldn't generate a response.";

    // Step 2: Convert text to speech using ElevenLabs
    // Using Roger voice (professional male voice suitable for healthcare)
    const voiceId = "CwhRBWXzGAHq8TQ4Fs17"; // Roger
    
    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: textAnswer,
          model_id: "eleven_turbo_v2_5", // Fast, high-quality model
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error("ElevenLabs TTS error:", ttsResponse.status, errorText);
      // Return text-only response if TTS fails
      return new Response(
        JSON.stringify({ 
          answer: textAnswer,
          audio: null,
          error: "Voice generation failed, text response provided."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get audio as ArrayBuffer and encode to base64
    const audioBuffer = await ttsResponse.arrayBuffer();
    const audioBase64 = base64Encode(audioBuffer);

    return new Response(
      JSON.stringify({ 
        answer: textAnswer,
        audio: audioBase64,
        facilities_analyzed: facilities?.length || 0
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Healthcare voice error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
