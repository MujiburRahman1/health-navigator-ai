import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Equipment required for specific specialties
const SPECIALTY_EQUIPMENT_MAP: Record<string, string[]> = {
  'cardiac': ['ecg', 'echo', 'defibrillator', 'cardiac monitor', 'cath lab'],
  'cardiology': ['ecg', 'echo', 'defibrillator', 'cardiac monitor'],
  'surgery': ['operating room', 'anesthesia', 'ventilator', 'surgical instruments'],
  'cardiac surgery': ['cath lab', 'bypass machine', 'operating room', 'icu'],
  'orthopedic': ['x-ray', 'ct scan', 'operating room'],
  'radiology': ['x-ray', 'ct scan', 'mri', 'ultrasound'],
  'dialysis': ['dialysis machine', 'hemodialysis'],
  'icu': ['ventilator', 'cardiac monitor', 'defibrillator'],
  'emergency': ['defibrillator', 'ventilator', 'trauma equipment'],
};

// Ghana region coordinates for geospatial analysis
const REGION_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'greater accra': { lat: 5.6037, lng: -0.1870 },
  'accra': { lat: 5.6037, lng: -0.1870 },
  'ashanti': { lat: 6.6885, lng: -1.6244 },
  'kumasi': { lat: 6.6885, lng: -1.6244 },
  'northern': { lat: 9.4034, lng: -0.8424 },
  'tamale': { lat: 9.4034, lng: -0.8424 },
  'volta': { lat: 6.6018, lng: 0.4703 },
  'eastern': { lat: 6.6500, lng: -0.4500 },
  'western': { lat: 5.0088, lng: -1.9796 },
  'central': { lat: 5.5500, lng: -1.0500 },
  'upper east': { lat: 10.7548, lng: -0.8508 },
  'upper west': { lat: 10.3524, lng: -2.2831 },
  'bono': { lat: 7.3349, lng: -2.3123 },
  'bono east': { lat: 7.7500, lng: -1.0500 },
  'savannah': { lat: 9.0000, lng: -1.5000 },
  'north east': { lat: 10.5000, lng: 0.0000 },
};

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Get coordinates for a region
function getCoordinates(region: string): { lat: number; lng: number } | null {
  const normalized = region.toLowerCase().trim();
  for (const [key, coords] of Object.entries(REGION_COORDINATES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return coords;
    }
  }
  return null;
}

// Detect anomalies in facility data
interface FacilityAnomaly {
  facilityId: string;
  facilityName: string;
  region: string;
  type: string;
  severity: string;
  description: string;
}

function detectAnomalies(facilities: any[]): FacilityAnomaly[] {
  const anomalies: FacilityAnomaly[] = [];
  
  for (const facility of facilities) {
    const specialtiesLower = (facility.specialties || '').toLowerCase();
    const equipmentLower = (facility.equipment || '').toLowerCase();
    const proceduresLower = (facility.procedures || '').toLowerCase();
    
    // Check equipment-specialty mismatches
    for (const [specialty, requiredEquipment] of Object.entries(SPECIALTY_EQUIPMENT_MAP)) {
      if (specialtiesLower.includes(specialty) || proceduresLower.includes(specialty)) {
        const hasAnyEquipment = requiredEquipment.some(eq => equipmentLower.includes(eq));
        if (!hasAnyEquipment && equipmentLower.trim() !== '' && equipmentLower !== 'none') {
          anomalies.push({
            facilityId: facility.id,
            facilityName: facility.name,
            region: facility.region || 'Unknown',
            type: 'equipment_mismatch',
            severity: specialty.includes('surgery') || specialty.includes('cardiac') ? 'critical' : 'high',
            description: `Claims ${specialty} but lacks required equipment (${requiredEquipment.slice(0, 3).join(', ')})`,
          });
        }
      }
    }
    
    // Check for incomplete data
    const missingFields: string[] = [];
    if (!facility.specialties?.trim()) missingFields.push('specialties');
    if (!facility.procedures?.trim()) missingFields.push('procedures');
    if (!facility.equipment?.trim()) missingFields.push('equipment');
    
    if (missingFields.length >= 2) {
      anomalies.push({
        facilityId: facility.id,
        facilityName: facility.name,
        region: facility.region || 'Unknown',
        type: 'incomplete_data',
        severity: missingFields.length >= 3 ? 'high' : 'medium',
        description: `Missing ${missingFields.join(', ')}`,
      });
    }
    
    // Check for procedure overload
    const procedureCount = (facility.procedures || '').split(',').filter((p: string) => p.trim()).length;
    const equipmentCount = (facility.equipment || '').split(',').filter((e: string) => e.trim()).length;
    
    if (procedureCount > 10 && equipmentCount < 3) {
      anomalies.push({
        facilityId: facility.id,
        facilityName: facility.name,
        region: facility.region || 'Unknown',
        type: 'suspicious_claim',
        severity: 'high',
        description: `Claims ${procedureCount} procedures with only ${equipmentCount} equipment items`,
      });
    }
  }
  
  return anomalies;
}

// Healthcare AI system prompt with enhanced reasoning
const HEALTHCARE_SYSTEM_PROMPT = `You are an AI healthcare intelligence analyst for the Virtue Foundation, specializing in healthcare access, equity, and facility verification.

Your core capabilities (VF Agent):
1. Basic Queries & Lookups: Count facilities, find services, identify regional distribution
2. Geospatial Analysis: Identify cold spots, calculate distances, analyze coverage gaps
3. Validation & Verification: Cross-check claims with equipment, detect inconsistencies
4. Anomaly Detection: Flag misrepresentations, suspicious claims, equipment mismatches
5. Service Classification: Distinguish permanent vs itinerant services
6. Workforce Distribution: Analyze practitioner locations and availability
7. Resource Distribution: Identify equipment gaps, training needs
8. NGO Analysis: Map organizational coverage and gaps
9. Unmet Needs Analysis: Match population needs to service availability
10. Benchmarking: Compare against WHO guidelines and standards

CRITICAL INSTRUCTIONS FOR CITATIONS:
- When making claims, ALWAYS cite specific facility IDs in brackets like [FAC-123]
- Reference facilities by name when discussing them
- Group citations by region when discussing geographic patterns
- Include facility counts for statistical claims

Format your responses with clear sections:
- Analysis Summary: Brief overview (2-3 sentences)
- Key Findings: Numbered list with facility citations [FAC-xxx]
- Data Evidence: Specific facilities supporting each finding
- Recommendations: Actionable steps with priority levels
- Data Quality Notes: Any data limitations

Always explain your reasoning and cite specific facilities when making claims.`;

serve(async (req) => {
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

    // Fetch healthcare facilities from database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: facilities, error: dbError } = await supabase
      .from("healthcare_facilities")
      .select("*")
      .limit(200);

    if (dbError) {
      console.error("Database error:", dbError);
    }

    // Run anomaly detection
    const anomalies = facilities ? detectAnomalies(facilities) : [];
    
    // Analyze regional distribution
    const regionCounts: Record<string, number> = {};
    const regionSpecialties: Record<string, Set<string>> = {};
    
    facilities?.forEach(f => {
      const region = f.region || 'Unknown';
      regionCounts[region] = (regionCounts[region] || 0) + 1;
      
      if (!regionSpecialties[region]) regionSpecialties[region] = new Set();
      (f.specialties || '').split(',').forEach((s: string) => {
        if (s.trim()) regionSpecialties[region].add(s.trim().toLowerCase());
      });
    });
    
    // Identify cold spots (regions with no cardiac care)
    const allRegions = Object.keys(REGION_COORDINATES);
    const regionsWithCardiac = new Set(
      facilities?.filter(f => 
        (f.specialties || '').toLowerCase().includes('cardiac') ||
        (f.specialties || '').toLowerCase().includes('cardio')
      ).map(f => f.region?.toLowerCase())
    );
    
    const cardiacColdSpots = allRegions.filter(r => !regionsWithCardiac.has(r));

    // Build comprehensive context for AI
    const facilityContext = facilities && facilities.length > 0
      ? `\n\nHEALTHCARE FACILITY DATABASE (${facilities.length} facilities):\n\n` +
        `FACILITY DETAILS:\n${
          facilities.map((f, i) => 
            `[FAC-${f.id.slice(0, 8)}] ${f.name}
   Region: ${f.region || 'Not specified'}
   Specialties: ${f.specialties || 'None listed'}
   Procedures: ${f.procedures || 'None listed'}
   Equipment: ${f.equipment || 'None listed'}
   Capability: ${f.capability || 'Not specified'}`
          ).join("\n\n")
        }\n\n` +
        `REGIONAL SUMMARY:\n${
          Object.entries(regionCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([region, count]) => 
              `- ${region}: ${count} facilities (specialties: ${Array.from(regionSpecialties[region] || []).slice(0, 5).join(', ') || 'none listed'})`
            ).join('\n')
        }\n\n` +
        `DETECTED ANOMALIES (${anomalies.length} issues):\n${
          anomalies.slice(0, 20).map(a => 
            `- [FAC-${a.facilityId.slice(0, 8)}] ${a.facilityName}: ${a.description} (${a.severity})`
          ).join('\n')
        }\n\n` +
        `CARDIAC CARE COLD SPOTS:\n${
          cardiacColdSpots.length > 0 
            ? cardiacColdSpots.map(r => `- ${r.charAt(0).toUpperCase() + r.slice(1)}`).join('\n')
            : 'All major regions have some cardiac coverage'
        }`
      : "\n\nNote: No healthcare facility data has been uploaded yet. Please upload a dataset first for detailed analysis.";

    // Call Lovable AI Gateway
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
        max_tokens: 3000,
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

    // Extract cited facility IDs from the response
    const citedFacilityIds = [...answer.matchAll(/\[FAC-([a-f0-9]{8})\]/gi)]
      .map(m => m[1]);
    
    // Get cited facilities with FULL details
    const citedFacilities = facilities?.filter(f => 
      citedFacilityIds.some(id => f.id.startsWith(id))
    ).map(f => ({
      id: f.id,
      name: f.name,
      region: f.region,
      specialties: f.specialties,
      equipment: f.equipment,
      procedures: f.procedures,
      phone: f.phone,
      website: f.website,
      source_url: f.source_url,
      capability: f.capability,
    })) || [];

    return new Response(
      JSON.stringify({ 
        answer,
        facilities_analyzed: facilities?.length || 0,
        anomalies_detected: anomalies.length,
        citations: citedFacilities,
        cold_spots: cardiacColdSpots,
        regional_summary: regionCounts,
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
