import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GOOGLE_SERVICE_ACCOUNT_EMAIL = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL")!;
const GOOGLE_PRIVATE_KEY = Deno.env.get("GOOGLE_PRIVATE_KEY")!.replace(/\\n/g, "\n");

serve(async (req) => {
  try {
    const { subscriber_id, email, plan, subscriber_name } = await req.json();

    if (!subscriber_id || !email || !plan) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const now = new Date().toISOString().split("T")[0];
    const sheetTitle = `Prime Leads - ${subscriber_name || email} - ${now}`;

    const spreadsheet = await createSpreadsheet(sheetTitle, plan);
    await shareSpreadsheet(spreadsheet.spreadsheetId, email);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheet.spreadsheetId}`;
    
    await supabase
      .from("subscribers")
      .update({ 
        google_sheet_url: sheetUrl,
        google_sheet_id: spreadsheet.spreadsheetId
      })
      .eq("id", subscriber_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sheet_url: sheetUrl,
        spreadsheet_id: spreadsheet.spreadsheetId 
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating sheet:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

async function createSpreadsheet(title: string, plan: string) {
  const sheets = getSheetsForPlan(plan);
  const accessToken = await getAccessToken();
  
  const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: { title },
      sheets: sheets.map(s => ({
        properties: { title: s.title },
        data: s.data ? [{ values: s.data }] : undefined,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create spreadsheet: ${error}`);
  }

  return response.json();
}

function getSheetsForPlan(plan: string) {
  const baseColumns = [
    "Owner Name",
    "Property Address", 
    "Mailing Address",
    "Lead Type",
    "Phone Number",
    "Date Added",
  ];

  if (plan === "Basic") {
    return [{ title: "Leads", data: [baseColumns] }];
  }

  if (plan === "Pro") {
    return [{
      title: "Leads",
      data: [[
        "Owner Name", "Property Address", "Mailing Address", "Lead Type",
        "Phone Primary", "Phone Secondary", "Phone Confidence", "ARV", "Equity %",
        "Max Offer (70% Rule)", "Days Delinquent", "Amount Owed", "Is Absentee",
        "Is Vacant", "Date Added"
      ]],
    }];
  }

  // Elite plan
  return [
    {
      title: "All Leads",
      data: [[
        "Owner Name", "Property Address", "Mailing Address", "Lead Type",
        "Phone Primary", "Phone Secondary", "Phone Confidence", "ARV", "Equity %",
        "Max Offer (70% Rule)", "Days Delinquent", "Amount Owed", "Is Absentee",
        "Is Vacant", "Date Added", "Motivation Score (1-10)", "Score Reasoning",
        "Primary Pain Point", "Outreach Script", "Best Contact Time", "Urgency Flag",
        "Nearest Comp 1", "Nearest Comp 2", "Nearest Comp 3"
      ]],
    },
    {
      title: "Hotlist",
      data: [[
        "Owner Name", "Property Address", "Mailing Address", "Lead Type",
        "Phone Primary", "Phone Secondary", "Phone Confidence", "ARV", "Equity %",
        "Max Offer (70% Rule)", "Days Delinquent", "Amount Owed", "Is Absentee",
        "Is Vacant", "Date Added", "Motivation Score (1-10)", "Score Reasoning",
        "Primary Pain Point", "Outreach Script", "Best Contact Time", "Urgency Flag",
        "Nearest Comp 1", "Nearest Comp 2", "Nearest Comp 3"
      ]],
    },
  ];
}

async function shareSpreadsheet(spreadsheetId: string, email: string) {
  const accessToken = await getAccessToken();
  
  await fetch(
    `https://drive.googleapis.com/v3/files/${spreadsheetId}/permissions`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: "writer",
        type: "user",
        emailAddress: email,
      }),
    }
  );
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const body = btoa(JSON.stringify(payload))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  
  const signingInput = `${header}.${body}`;
  
  const privateKeyBytes = (() => {
    const keyPem = GOOGLE_PRIVATE_KEY;
    const lines = keyPem.split("\n");
    const base64 = lines.slice(1, -1).join("");
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  })();

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyBytes,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const jwt = `${signingInput}.${sig}`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}