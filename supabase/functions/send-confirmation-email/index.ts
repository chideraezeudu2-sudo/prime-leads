import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const CALENDLY_LINK = Deno.env.get("CALENDLY_LINK") || "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Prime Leads <noreply@primeleads.co>";

serve(async (req) => {
  try {
    const { email, full_name, plan, sheet_url, complimentary_leads, next_delivery_at, stripe_portal_url } = await req.json();

    if (!email || !plan) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const planName = plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase();
    const complimentaryCount = plan === "Elite" ? 100 : 50;
    const deliverySchedule = plan === "Elite" ? "Weekly (every Monday)" : "Weekly (every Monday)";

    // Build email HTML
    let htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1a1a1a; margin-bottom: 10px;">Welcome to Prime Leads, ${full_name || 'Investor'}!</h1>
        
        <p style="color: #333; line-height: 1.6;">
          Your <strong>${planName} subscription</strong> is now active. Here's what you need to know:
        </p>

        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1a1a1a;">Your Subscription Details</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
              <strong>Plan:</strong> ${planName} ($${plan === 'Basic' ? 50 : plan === 'Pro' ? 150 : 500}/month)
            </li>
            <li style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
              <strong>Your Google Sheet:</strong> ${sheet_url ? `<a href="${sheet_url}" style="color: #0066cc;">Open Your Sheet</a>` : 'Will be emailed when ready'}
            </li>
            <li style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
              <strong>Delivery Schedule:</strong> ${deliverySchedule}
            </li>
            <li style="padding: 8px 0;">
              <strong>Free Leads:</strong> ${complimentary_leads || complimentaryCount} complimentary leads ready now!
            </li>
          </ul>
        </div>
    `;

    // Add Calendly link for Elite only
    if (plan === "Elite" && CALENDLY_LINK) {
      htmlBody += `
        <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
          <h3 style="margin-top: 0; color: #2e7d32;">🎯 As an Elite subscriber, you're entitled to a monthly 30-minute strategy call</h3>
          <p style="margin-bottom: 15px;">Book your first call here:</p>
          <a href="${CALENDLY_LINK}" style="display: inline-block; background: #4caf50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Book Your Strategy Call
          </a>
        </div>
      `;
    }

    htmlBody += `
        <div style="margin: 20px 0;">
          <h3 style="color: #1a1a1a;">What Happens Next</h3>
          <ol style="color: #333; line-height: 1.8;">
            <li><strong>Check your email:</strong> Your complimentary leads are already in your Google Sheet.</li>
            <li><strong>Start calling:</strong> Your leads include skip-traced phone numbers ready to dial.</li>
            <li><strong>First delivery:</strong> ${next_delivery_at ? `Your next batch arrives on ${new Date(next_delivery_at).toLocaleDateString()}` : 'Your next batch arrives next Monday'}.</li>
          </ol>
        </div>

        ${stripe_portal_url ? `
        <div style="margin: 20px 0;">
          <a href="${stripe_portal_url}" style="color: #666; font-size: 12px;">Manage subscription →</a>
        </div>
        ` : ''}

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <p style="color: #666; font-size: 12px;">
          Questions? Reply to this email or contact <a href="mailto:support@primeleads.co" style="color: #0066cc;">support@primeleads.co</a>
        </p>
        
        <p style="color: #666; font-size: 12px;">
          © ${new Date().getFullYear()} Prime Leads. All rights reserved.
        </p>
      </div>
    `;

    // Send email via Resend
    if (!RESEND_API_KEY) {
      console.log("RESEND_API_KEY not configured, skipping email send");
      return new Response(
        JSON.stringify({ success: true, message: "Email service not configured" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: `Welcome to Prime Leads ${planName}! 🎉 Your leads are ready`,
        html: htmlBody,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error: ${error}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({ success: true, message_id: data.id }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Email send error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});