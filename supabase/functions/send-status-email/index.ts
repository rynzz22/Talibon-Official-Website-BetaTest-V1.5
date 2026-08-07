import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface EmailPayload {
  requestId: string;
  ticketId: string;
  status: string;
  remarks: string;
  recipientEmail: string;
  recipientName: string;
  documentType: string;
  recipientMobile: string;
  notifyEmail: boolean;
  notifySms: boolean;
}

const STATUS_CONFIG: Record<string, { color: string; subject: string }> = {
  "Submitted": {
    color: "#6B7280", // Gray
    subject: "Your request has been received"
  },
  "Assigned": {
    color: "#3B82F6", // Blue
    subject: "Your request has been assigned"
  },
  "Processing": {
    color: "#F97316", // Orange
    subject: "Your request is now being processed"
  },
  "Returned": {
    color: "#EAB308", // Yellow
    subject: "Additional requirements are needed"
  },
  "Approved": {
    color: "#10B981", // Green
    subject: "Your request has been approved"
  },
  "Completed": {
    color: "#047857", // Dark Green
    subject: "Your request is ready for release"
  },
  "Rejected": {
    color: "#EF4444", // Red
    subject: "Your request has been rejected"
  }
};

async function logNotificationDelivery(
  supabaseClient: any,
  requestId: string,
  ticketId: string,
  channel: "email" | "sms",
  recipient: string,
  notificationType: string,
  status: "queued" | "sent" | "failed" | "skipped",
  providerMessageId?: string,
  errorMessage?: string
) {
  try {
    const { error } = await supabaseClient.from("notification_delivery_logs").insert([{
      request_id: requestId,
      ticket_id: ticketId,
      channel,
      recipient: recipient || null,
      notification_type: notificationType,
      status,
      provider_message_id: providerMessageId || null,
      error_message: errorMessage || null
    }]);
    if (error) throw error;
  } catch (err: any) {
    console.error(`[send-status-email] Failed to insert notification delivery log:`, err.message || err);
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // 1. Initialize Supabase Service Role client to bypass RLS securely server-side
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

  let body: Partial<EmailPayload> = {};
  try {
    body = await req.json();
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body payload" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const {
    requestId,
    ticketId,
    status,
    remarks,
    recipientEmail,
    recipientName,
    documentType,
    recipientMobile,
    notifyEmail = true,
    notifySms = false
  } = body;

  // Validate critical identifiers
  if (!requestId || !ticketId) {
    return new Response(
      JSON.stringify({ error: "Missing required identifiers: requestId and ticketId are mandatory." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // 2. Fetch authoritative contact details and preferences directly from the database using service role.
    // This implements the requirement that the Edge Function MUST NOT trust recipient details passed directly from the browser/client.
    const { data: request, error: requestError } = await supabaseClient
      .from("certificate_requests")
      .select("ticket_id, full_name, email, mobile_number, document_type")
      .eq("id", requestId)
      .single();

    if (requestError || !request) {
      throw new Error(`Authoritative certificate request not found: ${requestError?.message || 'Unknown database error'}`);
    }

    const { data: prefs, error: prefsError } = await supabaseClient
      .from("citizen_notification_preferences")
      .select("email_address, mobile_number, email_enabled, sms_enabled")
      .eq("request_id", requestId)
      .single();

    // Use authoritative values from database
    const finalTicketId = request.ticket_id || ticketId;
    const finalRecipientName = request.full_name || recipientName || "Citizen";
    const finalDocumentType = request.document_type || documentType || "Certificate Request";
    
    // Auth email comes from preference first, fallback to request table
    const finalRecipientEmail = (prefs?.email_address || request.email || "").trim();
    const finalRecipientMobile = (prefs?.mobile_number || request.mobile_number || "").trim();

    // Respect admin/client overrides (notifyEmail and notifySms) while validating against authoritative db preferences and presence of contact info
    const finalNotifyEmail = (notifyEmail !== false) && (prefs ? prefs.email_enabled : true) && finalRecipientEmail !== "";
    const finalNotifySms = (notifySms === true) && (prefs ? prefs.sms_enabled : false) && finalRecipientMobile !== "";

    // Check if both notify options are disabled
    if (!finalNotifyEmail && !finalNotifySms) {
      return new Response(
        JSON.stringify({ success: true, message: "No notification channel selected or enabled." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- 1. EMAIL PIPELINE ---
    let emailSent = false;
    let emailMsgId = "";
    let emailErrorMsg = "";

    if (finalNotifyEmail) {
      if (!finalRecipientEmail) {
        await logNotificationDelivery(
          supabaseClient,
          requestId,
          finalTicketId,
          "email",
          "",
          "status_update",
          "failed",
          undefined,
          "Missing email address"
        );
        emailErrorMsg = "Missing email address";
      } else {
        const apiKey = Deno.env.get("RESEND_API_KEY");
        if (!apiKey) {
          const errMsg = "Missing RESEND_API_KEY environment variable in Edge Secrets";
          console.error(`[send-status-email] ${errMsg}`);
          await logNotificationDelivery(
            supabaseClient,
            requestId,
            finalTicketId,
            "email",
            finalRecipientEmail,
            "status_update",
            "failed",
            undefined,
            errMsg
          );
          emailErrorMsg = errMsg;
        } else {
          // Normalize status to match key casing
          const trimmedStatus = (status || "").trim();
          let normalizedStatus = trimmedStatus;
          const matchedKey = Object.keys(STATUS_CONFIG).find(
            (k) => k.toLowerCase() === trimmedStatus.toLowerCase()
          );
          if (matchedKey) {
            normalizedStatus = matchedKey;
          }

          const config = STATUS_CONFIG[normalizedStatus] || {
            color: "#6B7280",
            subject: `Your request status has been updated to ${status}`
          };

          const statusColor = config.color;
          const subject = config.subject;

          // Build email template
          const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f3f4f6;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f3f4f6;
      padding: 24px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .header {
      background-color: #047857; /* LGU Municipal Theme Dark Green */
      color: #ffffff;
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.025em;
    }
    .header p {
      margin: 4px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 32px 24px;
      color: #1f2937;
      line-height: 1.6;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .message {
      font-size: 15px;
      margin-bottom: 24px;
      color: #4b5563;
    }
    .details-box {
      background-color: #f9fafb;
      border-left: 4px solid ${statusColor};
      padding: 20px;
      border-radius: 0 4px 4px 0;
      margin-bottom: 24px;
    }
    .detail-item {
      margin-bottom: 12px;
    }
    .detail-item:last-child {
      margin-bottom: 0;
    }
    .detail-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #6b7280;
      font-weight: 600;
      margin-bottom: 2px;
    }
    .detail-value {
      font-size: 15px;
      color: #111827;
      font-weight: 500;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      font-size: 13px;
      font-weight: 600;
      color: #ffffff;
      background-color: ${statusColor};
      border-radius: 9999px;
      text-transform: uppercase;
    }
    .remarks-box {
      padding: 16px;
      border-radius: 6px;
      margin-bottom: 24px;
      border: 1px solid #e5e7eb;
    }
    .remarks-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .remarks-content {
      font-size: 14px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 24px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
    }
    .footer p {
      margin: 4px 0;
    }
    .footer-highlight {
      font-weight: 600;
      color: #374151;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>Municipality of Talibon</h1>
        <p>Official Municipal Notification</p>
      </div>
      <div class="content">
        <p class="greeting">Hello ${finalRecipientName},</p>
        <p class="message">Your request has been updated.</p>
        
        <div class="details-box">
          <div class="detail-item">
            <div class="detail-label">Document Type</div>
            <div class="detail-value">${finalDocumentType}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Ticket Number</div>
            <div class="detail-value" style="font-family: monospace; font-size: 16px; font-weight: bold; letter-spacing: 1px; color: #047857;">${finalTicketId}</div>
          </div>
          <div class="detail-item" style="margin-top: 16px;">
            <div class="detail-label">Current Status</div>
            <div>
              <span class="status-badge">${normalizedStatus}</span>
            </div>
          </div>
        </div>

        ${remarks ? `
        <div class="remarks-box" style="${
          normalizedStatus === 'Returned' 
            ? 'background-color: #fef3c7; border-color: #fcd34d; color: #78350f;' 
            : normalizedStatus === 'Rejected' 
            ? 'background-color: #fee2e2; border-color: #fca5a5; color: #991b1b;' 
            : 'background-color: #f3f4f6; border-color: #e5e7eb; color: #374151;'
        }">
          <div class="remarks-title">Remarks from LGU Staff</div>
          <div class="remarks-content">${remarks}</div>
        </div>
        ` : ''}

        <p style="font-size: 14px; color: #4b5563; margin-top: 24px;">You may monitor your request anytime using your Ticket Number in our online tracking portal.</p>
      </div>
      <div class="footer">
        <p class="footer-highlight">Municipality of Talibon</p>
        <p>Official Government Email</p>
        <p style="margin-top: 12px; font-size: 11px; opacity: 0.8;">Do not reply to this email. This is an automated notification system.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

          const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
          const fromName = "Municipality of Talibon";

          const resendPayload = {
            from: `${fromName} <${fromEmail}>`,
            to: [finalRecipientEmail],
            subject: `[Talibon LGU] ${subject} - ${finalTicketId}`,
            html: htmlContent,
          };

          console.log(`[send-status-email] Dispatching Resend email to ${finalRecipientEmail}`);

          const resendResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(resendPayload),
          });

          if (!resendResponse.ok) {
            const resendErrorText = await resendResponse.text();
            throw new Error(`Resend API error: ${resendErrorText}`);
          }

          const resendData = await resendResponse.json();
          emailSent = true;
          emailMsgId = resendData.id;

          // Log success to delivery logs using service role
          await logNotificationDelivery(
            supabaseClient,
            requestId,
            finalTicketId,
            "email",
            finalRecipientEmail,
            "status_update",
            "sent",
            emailMsgId
          );
        }
      }
    }

    // --- 2. SMS PIPELINE ---
    if (finalNotifySms) {
      if (!finalRecipientMobile) {
        await logNotificationDelivery(
          supabaseClient,
          requestId,
          finalTicketId,
          "sms",
          "",
          "status_update",
          "failed",
          undefined,
          "Missing mobile number"
        );
      } else {
        // SMS provider is currently unconfigured/offline.
        // Log attempt as skipped for operational transparency
        await logNotificationDelivery(
          supabaseClient,
          requestId,
          finalTicketId,
          "sms",
          finalRecipientMobile,
          "status_update",
          "skipped",
          undefined,
          "SMS gateway offline: Provider credentials not configured in environment"
        );
      }
    }

    if (finalNotifyEmail && !emailSent) {
      // If email failed, report it inside response
      return new Response(
        JSON.stringify({ success: false, error: emailErrorMsg }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, messageId: emailMsgId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error(`[send-status-email] Process failed:`, error.message || error);
    
    // Log exception to delivery logs
    const finalTicketId = ticketId || "UNKNOWN";
    const finalRecipientEmail = recipientEmail || "";
    if (notifyEmail) {
      await logNotificationDelivery(
        supabaseClient,
        requestId,
        finalTicketId,
        "email",
        finalRecipientEmail,
        "status_update",
        "failed",
        undefined,
        error.message || String(error)
      );
    }

    return new Response(
      JSON.stringify({ error: error.message || "Unknown error inside Edge Function" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
