import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RENTCAST_API_KEY = Deno.env.get("RENTCAST_API_KEY") || "";

serve(async (req) => {
  try {
    const { lead_ids, plan } = await req.json();

    if (!lead_ids || !Array.isArray(lead_ids) || lead_ids.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid lead_ids array" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let processed = 0;
    let enriched = 0;
    let skipped = 0;

    // Only Pro and Elite get enrichment
    const needsEnrichment = plan === "Pro" || plan === "Elite";

    if (!needsEnrichment) {
      return new Response(
        JSON.stringify({ processed: lead_ids.length, enriched: 0, skipped: lead_ids.length, message: "Basic plan - no enrichment" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Process in batches of 10
    const batchSize = 10;
    for (let i = 0; i < lead_ids.length; i += batchSize) {
      const batch = lead_ids.slice(i, i + batchSize);
      
      for (const leadId of batch) {
        const result = await enrichLead(supabase, leadId);
        processed++;
        if (result.enriched) enriched++;
        else skipped++;
      }

      // 300ms delay between batches
      if (i + batchSize < lead_ids.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    return new Response(
      JSON.stringify({ processed, enriched, skipped }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Enrichment error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

async function enrichLead(supabase: any, leadId: string) {
  // Fetch lead from Supabase
  const { data: lead, error } = await supabase
    .from("raw_leads")
    .select("*")
    .eq("id", leadId)
    .single();

  if (error || !lead) {
    console.error(`Lead ${leadId} not found`);
    return { enriched: false };
  }

  const propertyAddress = lead.property_address || "";
  const zipCode = lead.zip_code || "";
  const amountOwed = lead.amount_owed || lead.loan_amount || 0;

  if (!propertyAddress) {
    return { enriched: false };
  }

  // Get ARV from Rentcast
  const arv = await getARV(propertyAddress, zipCode);
  
  if (!arv) {
    return { enriched: false };
  }

  // Calculate equity and max offer
  const equityPercent = Math.round(((arv - amountOwed) / arv) * 100 * 10) / 10;
  const maxOffer = Math.round(arv * 0.70);

  // Update lead with enrichment data
  await supabase
    .from("raw_leads")
    .update({
      arv: arv,
      equity_percent: equityPercent,
      max_offer: maxOffer,
      enrichment_complete: true,
    })
    .eq("id", leadId);

  return { enriched: true };
}

async function getARV(propertyAddress: string, zipCode: string): Promise<number | null> {
  if (!RENTCAST_API_KEY) {
    console.log("RENTCAST_API_KEY not set, skipping ARV lookup");
    return null;
  }

  try {
    const params = new URLSearchParams({ address: propertyAddress });
    if (zipCode) params.append("zipCode", zipCode);

    const response = await fetch(`https://api.rentcast.io/v1/avm/value?${params}`, {
      headers: {
        "X-Api-Key": RENTCAST_API_KEY,
      },
    });

    if (!response.ok) {
      console.error(`Rentcast API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.price || null;
  } catch (error) {
    console.error("Rentcast error:", error);
    return null;
  }
}