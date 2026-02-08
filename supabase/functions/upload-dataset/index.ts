import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// CSV column mapping configuration
// Expected columns: name, specialties, procedures, equipment, capability, region, website, phone, source_url
const COLUMN_MAPPING: Record<string, string> = {
  "name": "name",
  "facility_name": "name",
  "hospital_name": "name",
  "specialties": "specialties",
  "specialty": "specialties",
  "procedures": "procedures",
  "procedure": "procedures",
  "equipment": "equipment",
  "capability": "capability",
  "capabilities": "capability",
  "region": "region",
  "location": "region",
  "area": "region",
  "website": "website",
  "url": "website",
  "phone": "phone",
  "telephone": "phone",
  "contact": "phone",
  "source_url": "source_url",
  "source": "source_url",
};

// Simple CSV parser
function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  // Parse header
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine).map(h => h.toLowerCase().trim());

  // Parse data rows
  const records: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const record: Record<string, string> = {};
    
    headers.forEach((header, idx) => {
      const mappedColumn = COLUMN_MAPPING[header] || header;
      record[mappedColumn] = values[idx]?.trim() || "";
    });

    // Only add if name exists
    if (record.name) {
      records.push(record);
    }
  }

  return records;
}

// Parse a single CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);

  return values.map(v => v.replace(/^"|"$/g, "").trim());
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { csvData, clearExisting } = await req.json();

    if (!csvData) {
      return new Response(
        JSON.stringify({ error: "CSV data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Optionally clear existing data
    if (clearExisting) {
      const { error: deleteError } = await supabase
        .from("healthcare_facilities")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

      if (deleteError) {
        console.error("Error clearing existing data:", deleteError);
      }
    }

    // Parse CSV
    const records = parseCSV(csvData);

    if (records.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid records found in CSV" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert records in batches
    const batchSize = 50;
    let inserted = 0;
    let errors: string[] = [];

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize).map(r => ({
        name: r.name,
        specialties: r.specialties || null,
        procedures: r.procedures || null,
        equipment: r.equipment || null,
        capability: r.capability || null,
        region: r.region || null,
        website: r.website || null,
        phone: r.phone || null,
        source_url: r.source_url || null,
      }));

      const { error: insertError, data } = await supabase
        .from("healthcare_facilities")
        .insert(batch)
        .select();

      if (insertError) {
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${insertError.message}`);
      } else {
        inserted += data?.length || 0;
      }
    }

    // Get total count after insert
    const { count } = await supabase
      .from("healthcare_facilities")
      .select("*", { count: "exact", head: true });

    return new Response(
      JSON.stringify({ 
        success: true,
        records_parsed: records.length,
        records_inserted: inserted,
        total_in_database: count || inserted,
        errors: errors.length > 0 ? errors : undefined,
        sample_columns: Object.keys(records[0] || {})
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Upload dataset error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
