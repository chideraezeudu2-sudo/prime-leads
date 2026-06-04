import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// API keys (you'll need to set these in Supabase secrets)
const TRACERFY_API_KEY = Deno.env.get("TRACERFY_API_KEY") || "";
const DATAZAPP_API_KEY = Deno.env.get("DATAZAPP_API_KEY") || "";

serve(async (req) => {
  try {
    const { lead_ids } = await req.json();

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
    let verified = 0;
    let unverified = 0;

    // Process in batches of 20
    const batchSize = 20;
    for (let i = 0; i < lead_ids.length; i += batchSize) {
      const batch = lead_ids.slice(i, i + batchSize);
      
      for (const leadId of batch) {
        const result = await traceLead(supabase, leadId);
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

async function traceLead(supabase: any, leadId: string) {
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

  // Try Tracerfy first
  let phoneResult = await tryTracerfy(ownerName, mailingAddress);
  
  // If Tracerfy fails or low confidence, try Datazapp
  if (!phoneResult.verified || phoneResult.confidence < 0.7) {
    const datazappResult = await tryDatazapp(ownerName, mailingAddress);
    if (datazappResult.verified) {
      phoneResult = datazappResult;
    }
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
    return { verified: false, provider: "unverified", confidence: 0 };
  }

  try {
    // Note: Replace with actual Tracerfy API endpoint
    const response = await fetch("https://api.tracerfy.com/v1/phone-lookup", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TRACERFY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: ownerName,
        address: mailingAddress,
      }),
    });

    if (!response.ok) {
      return { verified: false, provider: "tracerfy", confidence: 0 };
    }

    const data = await response.json();
    
    if (data.phones && data.phones.length > 0) {
      return {
        verified: true,
        provider: "tracerfy",
        phone_primary: data.phones[0].number,
        phone_secondary: data.phones[1]?.number || null,
        confidence: data.phones[0].confidence || 0.8,
      };
    }

    return { verified: false, provider: "tracerfy", confidence: 0 };
  } catch (error) {
    console.error("Tracerfy error:", error);
    return { verified: false, provider: "tracerfy", confidence: 0 };
  }
}

async function tryDatazapp(ownerName: string, mailingAddress: string) {
  if (!DATAZAPP_API_KEY) {
    return { verified: false, provider: "datazapp", confidence: 0 };
  }

  try {
    // Note: Replace with actual Datazapp API endpoint
    const response = await fetch("https://api.datazapp.com/v2/lookup", {
      method: "POST",
      headers: {
        "Authorization": `Token ${DATAZAPP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: ownerName,
        address: mailingAddress,
      }),
    });

    if (!response.ok) {
      return { verified: false, provider: "datazapp", confidence: 0 };
    }

    const data = await response.json();
    
    if (data.phone_numbers && data.phone_numbers.length > 0) {
      return {
        verified: true,
        provider: "datazapp",
        phone_primary: data.phone_numbers[0],
        phone_secondary: data.phone_numbers[1] || null,
        confidence: data.confidence || 0.7,
      };
    }

    return { verified: false, provider: "datazapp", confidence: 0 };
  } catch (error) {
    console.error("Datazapp error:", error);
    return { verified: false, provider: "datazapp", confidence: 0 };
  }
}