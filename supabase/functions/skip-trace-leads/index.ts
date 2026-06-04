import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TRACERFY_API_KEY = Deno.env.get("TRACERFY_API_KEY") || "";
const BATCHSKIPTRACING_API_KEY = Deno.env.get("BATCHSKIPTRACING_API_KEY") || "";

serve(async (req) => {
  try {
    const { lead_ids, plan } = await req.json();

    if (!lead_ids || !Array.isArray(lead_ids) || lead_ids.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid lead_ids array" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Default to Pro if plan not specified
    const planType = plan || "Pro";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let processed = 0;
    let verified = 0;
    let unverified = 0;

    // Process in batches of 20
    const batchSize = 20;
    for (let i = 0; i < lead_ids.length; i += batchSize) {
      const batch = lead_ids.slice(i, i + batchSize);
      
      for (const leadId of batch) {
        const result = await traceLead(supabase, leadId, planType);
        processed++;
        if (result.verified) verified++;
        else unverified++;
      }

      // 500ms delay between batches
      if (i + batchSize < lead_ids.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return new Response(
      JSON.stringify({ processed, verified, unverified }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Skip trace error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

async function traceLead(supabase: any, leadId: string, plan: string) {
  // Fetch lead from Supabase
  const { data: lead, error } = await supabase
    .from("raw_leads")
    .select("*")
    .eq("id", leadId)
    .single();

  if (error || !lead) {
    console.error(`Lead ${leadId} not found`);
    return { verified: false };
  }

  const ownerName = lead.owner_name || "";
  const mailingAddress = lead.mailing_address || lead.property_address || "";

  let phoneResult: any;

  if (plan === "Basic") {
    // Basic: Tracerfy only, no fallback
    phoneResult = await tryTracerfy(ownerName, mailingAddress);
    phoneResult.provider = phoneResult.verified ? "tracerfy" : "unverified";
  } else if (plan === "Pro") {
    // Pro: Tracerfy first, fallback to BatchSkipTracing if confidence < 0.7 or no results
    phoneResult = await tryTracerfy(ownerName, mailingAddress);
    
    if (!phoneResult.verified || phoneResult.confidence < 0.7) {
      const batchResult = await tryBatchSkipTracing(ownerName, mailingAddress);
      if (batchResult.verified) {
        phoneResult = batchResult;
      } else {
        // Keep Tracerfy result even if low confidence for Pro
        phoneResult.provider = "tracerfy";
      }
    } else {
      phoneResult.provider = "tracerfy";
    }
  } else if (plan === "Elite") {
    // Elite: BatchSkipTracing only, skip Tracerfy entirely
    phoneResult = await tryBatchSkipTracing(ownerName, mailingAddress);
    phoneResult.provider = "batchskiptracing";
  } else {
    // Default to Pro behavior
    phoneResult = await tryTracerfy(ownerName, mailingAddress);
    if (!phoneResult.verified || phoneResult.confidence < 0.7) {
      const batchResult = await tryBatchSkipTracing(ownerName, mailingAddress);
      if (batchResult.verified) {
        phoneResult = batchResult;
      }
    }
    phoneResult.provider = phoneResult.verified ? "tracerfy" : "unverified";
  }

  // Update lead with phone info
  await supabase
    .from("raw_leads")
    .update({
      phone_primary: phoneResult.phone_primary,
      phone_secondary: phoneResult.phone_secondary,
      phone_confidence: phoneResult.confidence,
      skip_trace_provider: phoneResult.provider,
    })
    .eq("id", leadId);

  return { verified: phoneResult.verified };
}

async function tryTracerfy(ownerName: string, mailingAddress: string) {
  if (!TRACERFY_API_KEY) {
    console.log("Tracerfy API key not configured");
    return { verified: false, provider: "tracerfy", confidence: 0, phone_primary: null, phone_secondary: null };
  }

  try {
    // Tracerfy API - uses token in Authorization header
    const response = await fetch("https://api.tracerfy.com/api/v1/phone", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TRACERFY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name: ownerName,
        address: mailingAddress,
      }),
    });

    if (!response.ok) {
      console.error(`Tracerfy API error: ${response.status}`);
      return { verified: false, provider: "tracerfy", confidence: 0, phone_primary: null, phone_secondary: null };
    }

    const data = await response.json();
    
    // Tracerfy returns phone numbers in results array
    if (data.results && data.results.length > 0) {
      const primary = data.results.find((r: any) => r.type === "mobile") || data.results[0];
      const secondary = data.results.find((r: any, idx: number) => idx > 0);
      
      return {
        verified: true,
        provider: "tracerfy",
        phone_primary: primary?.phone_number || primary?.phone || null,
        phone_secondary: secondary?.phone_number || secondary?.phone || null,
        confidence: primary?.confidence || primary?.score || 0.8,
      };
    }

    return { verified: false, provider: "tracerfy", confidence: 0, phone_primary: null, phone_secondary: null };
  } catch (error) {
    console.error("Tracerfy error:", error);
    return { verified: false, provider: "tracerfy", confidence: 0, phone_primary: null, phone_secondary: null };
  }
}

async function tryBatchSkipTracing(ownerName: string, mailingAddress: string) {
  if (!BATCHSKIPTRACING_API_KEY) {
    console.log("BatchSkipTracing API key not configured");
    return { verified: false, provider: "batchskiptracing", confidence: 0, phone_primary: null, phone_secondary: null };
  }

  try {
    // BatchSkipTracing API
    const response = await fetch("https://api.batchskiptracing.com/v1/lookup", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${BATCHSKIPTRACING_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: ownerName,
        address: mailingAddress,
      }),
    });

    if (!response.ok) {
      console.error(`BatchSkipTracing API error: ${response.status}`);
      return { verified: false, provider: "batchskiptracing", confidence: 0, phone_primary: null, phone_secondary: null };
    }

    const data = await response.json();
    
    // Parse BatchSkipTracing response
    if (data.phones && data.phones.length > 0) {
      return {
        verified: true,
        provider: "batchskiptracing",
        phone_primary: data.phones[0]?.number || data.phones[0]?.phone || null,
        phone_secondary: data.phones[1]?.number || data.phones[1]?.phone || null,
        confidence: data.phones[0]?.confidence || data.confidence || 0.8,
      };
    }

    return { verified: false, provider: "batchskiptracing", confidence: 0, phone_primary: null, phone_secondary: null };
  } catch (error) {
    console.error("BatchSkipTracing error:", error);
    return { verified: false, provider: "batchskiptracing", confidence: 0, phone_primary: null, phone_secondary: null };
  }
}