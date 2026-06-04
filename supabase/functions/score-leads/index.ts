import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")!;

serve(async (req) => {
  try {
    const { subscriber_id, plan } = await req.json();

    if (!subscriber_id) {
      return new Response(
        JSON.stringify({ error: "Missing required field: subscriber_id" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get unsubmitted leads for this subscriber
    const { data: leads, error: leadsError } = await supabase
      .from("raw_leads")
      .select("*")
      .eq("subscriber_id", subscriber_id)
      .is("submitted", false)
      .limit(50);

    if (leadsError) throw leadsError;

    if (!leads || leads.length === 0) {
      return new Response(
        JSON.stringify({ success: true, scored: 0, message: "No leads to score" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Score leads using Groq
    const scoredLeads = await Promise.all(
      leads.map(lead => scoreLeadWithGroq(lead, plan))
    );

    // Update leads with scores
    for (const scored of scoredLeads) {
      await supabase
        .from("raw_leads")
        .update({
          motivation_score: scored.motivation_score,
          score_reasoning: scored.score_reasoning,
          primary_pain_point: scored.primary_pain_point,
          outreach_script: scored.outreach_script,
          best_contact_time: scored.best_contact_time,
          urgency_flag: scored.urgency_flag,
          enrichment_complete: true,
        })
        .eq("id", scored.id);
    }

    // Mark leads as submitted
    await supabase
      .from("raw_leads")
      .update({ submitted: true })
      .eq("subscriber_id", subscriber_id)
      .eq("enrichment_complete", true);

    // Count submitted leads
    const { count } = await supabase
      .from("raw_leads")
      .select("*", { count: "exact", head: true })
      .eq("subscriber_id", subscriber_id)
      .eq("submitted", true);

    // Update subscriber's leads_delivered
    const { data: subscriber } = await supabase
      .from("subscribers")
      .select("leads_delivered")
      .eq("id", subscriber_id)
      .single();

    if (subscriber) {
      await supabase
        .from("subscribers")
        .update({ leads_delivered: (subscriber.leads_delivered || 0) + scoredLeads.length })
        .eq("id", subscriber_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        scored: scoredLeads.length,
        total_submitted: count,
        hotlist_count: scoredLeads.filter(l => l.motivation_score >= 8).length,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Scoring error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

interface ScoredLead {
  id: string;
  motivation_score: number;
  score_reasoning: string;
  primary_pain_point: string;
  outreach_script: string;
  best_contact_time: string;
  urgency_flag: boolean;
}

async function scoreLeadWithGroq(lead: any, plan?: string): Promise<ScoredLead> {
  const prompt = `You are a real estate investment expert analyzing a potential lead.

Lead Data:
- Owner Name: ${lead.owner_name || "Unknown"}
- Property Address: ${lead.property_address || "Unknown"}
- Owner Mailing Address: ${lead.mailing_address || "Same as property"}
- Property Type: ${lead.property_type || "Unknown"}
- ARV (After Repair Value): ${lead.arv ? "$" + lead.arv.toLocaleString() : "Unknown"}
- Loan Amount: ${lead.loan_amount ? "$" + lead.loan_amount.toLocaleString() : "None/Minimal"}
- Equity: ${lead.equity_percent ? lead.equity_percent + "%" : "Unknown"}
- Is Vacant: ${lead.is_vacant ? "Yes" : "No"}
- Is Absentee Owner: ${lead.is_absentee ? "Yes" : "No"}
- Tax Amount: ${lead.tax_amount ? "$" + lead.tax_amount.toLocaleString() : "Unknown"}

Based on this data, analyze and return ONLY a JSON object with:
{
  "motivation_score": number 1-10 (10 = most motivated seller),
  "score_reasoning": "2-3 sentence explanation",
  "primary_pain_point": "The most likely reason they'd sell",
  "outreach_script": "A short, personalized cold call script (2-3 sentences)",
  "best_contact_time": "e.g., 'Monday 6pm', 'Saturday morning'",
  "urgency_flag": true/false
}

Consider:
- High equity + financial distress = motivated seller (8-10)
- Absentee owners are often easier to reach and more willing to sell (7-9)
- Vacant properties indicate potential distress or relocation (7-9)
- Large equity cushion may mean they're not motivated (3-5)
- No obvious distress signals = lower motivation (1-4)`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || "{}";

  // Parse JSON from response
  let parsed;
  try {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      parsed = JSON.parse(content);
    }
  } catch {
    // Default values if parsing fails
    parsed = {
      motivation_score: 5,
      score_reasoning: "Unable to analyze - manual review recommended",
      primary_pain_point: "Unknown",
      outreach_script: "Hi, I'm calling about your property on [address]. Are you interested in selling?",
      best_contact_time: "Evenings",
      urgency_flag: false,
    };
  }

  return {
    id: lead.id,
    motivation_score: parsed.motivation_score || 5,
    score_reasoning: parsed.score_reasoning || "Score not calculated",
    primary_pain_point: parsed.primary_pain_point || "Unknown",
    outreach_script: parsed.outreach_script || "Standard outreach",
    best_contact_time: parsed.best_contact_time || "Evenings",
    urgency_flag: parsed.urgency_flag || false,
  };
}