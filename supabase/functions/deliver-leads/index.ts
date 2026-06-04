import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")!;
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID") || "";
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN") || "";
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER") || "";

serve(async (req) => {
  try {
    const { subscriber_id } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let subscribers;

    if (subscriber_id) {
      // Single subscriber
      const { data } = await supabase
        .from("subscribers")
        .select("*")
        .eq("id", subscriber_id)
        .eq("status", "active")
        .single();
      subscribers = data ? [data] : [];
    } else {
      // All due subscribers
      const now = new Date().toISOString();
      const { data } = await supabase
        .from("subscribers")
        .select("*")
        .eq("status", "active")
        .lte("next_delivery_at", now);
      subscribers = data || [];
    }

    if (subscribers.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No subscribers due for delivery" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const results = [];
    for (const subscriber of subscribers) {
      const result = await deliverToSubscriber(supabase, subscriber);
      results.push(result);
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Delivery error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

async function deliverToSubscriber(supabase: any, subscriber: any) {
  const plan = subscriber.plan;
  const maxLeads = plan === "Elite" ? 100 : plan === "Pro" ? 200 : 500;
  const isShared = plan === "Basic";

  // Get already delivered lead IDs
  const { data: previousDeliveries } = await supabase
    .from("delivery_leads")
    .select("lead_id")
    .eq("subscriber_id", subscriber.id);
  const deliveredLeadIds = previousDeliveries?.map((d: any) => d.lead_id) || [];

  // Query leads based on plan
  let query = supabase
    .from("raw_leads")
    .select("*")
    .not("id", "in", `(${deliveredLeadIds.join(",")})`)
    .eq("is_shared", isShared)
    .limit(maxLeads);

  // Apply plan-specific filters
  if (plan === "Pro" || plan === "Elite") {
    // Apply geography filters based on preferences
    if (subscriber.preferred_states) {
      query = query.in("state", subscriber.preferred_states);
    }
  }

  const { data: leads, error } = await query;
  
  if (error) {
    console.error(`Error fetching leads for ${subscriber.id}:`, error);
    return { subscriber_id: subscriber.id, success: false, error: error.message };
  }

  if (!leads || leads.length === 0) {
    return { subscriber_id: subscriber.id, success: true, leads_delivered: 0 };
  }

  // Skip trace leads based on plan
  const leadIds = leads.map((l: any) => l.id);
  await skipTraceLeads(leadIds, plan);

  // Sort by plan
  if (plan === "Elite") {
    leads.sort((a, b) => (b.motivation_score || 0) - (a.motivation_score || 0));
  }

  // Create delivery record
  const { data: delivery, error: deliveryError } = await supabase
    .from("deliveries")
    .insert({
      subscriber_id: subscriber.id,
      leads_count: leads.length,
      status: "completed",
    })
    .select()
    .single();

  if (deliveryError) {
    return { subscriber_id: subscriber.id, success: false, error: deliveryError.message };
  }

  // Create delivery_leads records
  const deliveryLeads = leads.map((lead: any) => ({
    delivery_id: delivery.id,
    lead_id: lead.id,
  }));

  await supabase.from("delivery_leads").insert(deliveryLeads);

  // Mark leads as delivered (non-shared)
  if (!isShared) {
    const leadIds = leads.map((l: any) => l.id);
    await supabase
      .from("raw_leads")
      .update({ is_shared: false })
      .in("id", leadIds);
  }

  // Write to Google Sheet
  if (subscriber.google_sheet_id) {
    await writeToGoogleSheet(subscriber.google_sheet_id, leads, plan);
  }

  // Send SMS alert for Elite urgency flags
  if (plan === "Elite" && TWILIO_ACCOUNT_SID) {
    const urgentLeads = leads.filter((l: any) => l.urgency_flag);
    if (urgentLeads.length > 0) {
      await sendUrgencyAlert(subscriber.phone, urgentLeads.length);
    }
  }

  // Update subscriber's next delivery date (7 days)
  const nextDelivery = new Date();
  nextDelivery.setDate(nextDelivery.getDate() + 7);
  
  await supabase
    .from("subscribers")
    .update({
      next_delivery_at: nextDelivery.toISOString(),
      leads_delivered: (subscriber.leads_delivered || 0) + leads.length,
    })
    .eq("id", subscriber.id);

  return {
    subscriber_id: subscriber.id,
    success: true,
    leads_delivered: leads.length,
    urgent_leads: leads.filter((l: any) => l.urgency_flag).length,
  };
}

async function writeToGoogleSheet(sheetId: string, leads: any[], plan: string) {
  // This would call the Google Sheets API to append rows
  // For now, return a placeholder - the actual implementation needs service account auth
  console.log(`Would write ${leads.length} leads to sheet ${sheetId}`);
  return { success: true };
}

async function sendUrgencyAlert(phone: string, count: number) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.log("Twilio not configured, skipping SMS alert");
    return;
  }

  const message = `Prime Leads Alert: ${count} urgent leads delivered to your sheet. Act fast - these sellers are highly motivated!`;

  try {
    await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: phone,
          From: TWILIO_PHONE_NUMBER,
          Body: message,
        }),
      }
    );
  } catch (error) {
    console.error("SMS send error:", error);
  }
}

async function skipTraceLeads(leadIds: string[], plan: string) {
  if (!leadIds || leadIds.length === 0) return;

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const response = await fetch(
      `${supabaseUrl}/functions/v1/skip-trace-leads`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          lead_ids: leadIds,
          plan: plan,
        }),
      }
    );

    if (!response.ok) {
      console.error("Skip trace failed:", await response.text());
    } else {
      const result = await response.json();
      console.log(`Skip traced ${result.processed} leads: ${result.verified} verified, ${result.unverified} unverified`);
    }
  } catch (error) {
    console.error("Skip trace error:", error);
  }
}