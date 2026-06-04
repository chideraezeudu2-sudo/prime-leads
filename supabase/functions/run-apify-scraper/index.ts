import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const APIFY_API_TOKEN = Deno.env.get("APIFY_API_TOKEN")!;

serve(async (req) => {
  try {
    const { lead_type, state, county, limit = 100 } = await req.json();

    if (!lead_type) {
      return new Response(
        JSON.stringify({ error: "Missing required field: lead_type" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Map lead types to Apify actor IDs and input parameters
    const scraperConfig = getScraperConfig(lead_type, state, county, limit);
    
    // Run the Apify actor
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/${scraperConfig.actorId}/run-sync-get-dataset-items`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${APIFY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scraperConfig.input),
      }
    );

    if (!runResponse.ok) {
      const error = await runResponse.text();
      throw new Error(`Apify API error: ${error}`);
    }

    const leads = await runResponse.json();

    // Save leads to Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Normalize and insert leads
    const normalizedLeads = leads.map((lead: any) => normalizeLead(lead, lead_type));
    
    const { data, error } = await supabase
      .from("raw_leads")
      .insert(normalizedLeads)
      .select("id");

    if (error) {
      console.error("Supabase insert error:", error);
      // Continue anyway - leads are still scraped
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        leads_scraped: leads.length,
        leads_saved: data?.length || 0
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Scraper error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

function getScraperConfig(leadType: string, state?: string, county?: string, limit?: number) {
  // Default to County GIS Data scraper - most comprehensive for real estate leads
  const actorId = "dtrtgn/homebrew~county-gis-data";
  
  const input: any = {
    limit: limit || 100,
    scrape: {
      owners: true,
      parcels: true,
      mortgages: true,
      taxStatus: "current",
    },
  };

  if (state) input.state = state;
  if (county) input.county = county;

  // Map common lead types to appropriate scrapers
  const leadTypeScrapers: Record<string, { actorId: string; input: any }> = {
    "pre-foreclosure": {
      actorId: "apify~pre-foreclosure-scraper",
      input: { state, county, limit },
    },
    "bank-owned": {
      actorId: "apify~bank-owned-homes-scraper", 
      input: { state, limit },
    },
    "tax-liens": {
      actorId: "apify~tax-lien-scraper",
      input: { state, county, limit },
    },
    "divorce": {
      actorId: "apify~probate-scraper", // Fallback - divorce leads often in probate
      input: { state, county, limit },
    },
    "probate": {
      actorId: "apify~probate-scraper",
      input: { state, county, limit },
    },
    "bankruptcy": {
      actorId: "apify~bankruptcy-court-scraper",
      input: { state, county, limit },
    },
    "senior-relocation": {
      actorId: "apify~senior-living-scraper",
      input: { state, limit },
    },
    "code-violations": {
      actorId: "apify~code-enforcement-scraper",
      input: { state, county, limit },
    },
  };

  if (leadTypeScrapers[leadType.toLowerCase()]) {
    return leadTypeScrapers[leadType.toLowerCase()];
  }

  return { actorId, input };
}

function normalizeLead(lead: any, leadType: string) {
  // Extract common fields and map them to our schema
  return {
    owner_name: lead.ownerName || lead.owner_name || lead.name || null,
    property_address: lead.propertyAddress || lead.property_address || lead.address || null,
    mailing_address: lead.mailingAddress || lead.mailing_address || null,
    city: lead.city || null,
    state: lead.state || null,
    zip_code: lead.zipCode || lead.zip_code || lead.zip || null,
    phone_primary: lead.phone || lead.phone1 || lead.phonePrimary || null,
    phone_secondary: lead.phone2 || lead.phoneSecondary || null,
    phone_confidence: lead.phoneConfidence || null,
    property_type: lead.propertyType || lead.property_type || "unknown",
    lead_type: leadType,
    arv: lead.arv || lead.estimatedValue || lead.marketValue || null,
    loan_amount: lead.loanAmount || lead.mortgageAmount || null,
    equity_percent: lead.equityPercent || null,
    auction_date: lead.auctionDate || lead.sheriffSaleDate || null,
    foreclosure_date: lead.foreclosureDate || null,
    assessed_value: lead.assessedValue || null,
    tax_amount: lead.taxAmount || null,
    is_vacant: lead.isVacant || lead.vacant || false,
    is_absentee: lead.isAbsentee || lead.absenteeOwner || false,
    last_seen_date: new Date().toISOString(),
    source: "apify",
    raw_data: lead,
  };
}