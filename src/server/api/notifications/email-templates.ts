/**
 * Digital Talibon V4 — Official LGU Email Templates
 * Responsive, secure, accessible, and branded email templates for citizen service workflows.
 */

export interface EmailTemplateData {
  citizenName: string;
  ticketId: string;
  documentType: string;
  status: string;
  statusLabel: string;
  statusColor: string;
  remarks?: string | null;
  requirements?: string[];
  submittedAt?: string;
  updatedAt?: string;
  trackingUrl: string;
  barangay?: string;
  officeResponsible?: string;
}

/**
 * Basic HTML sanitizer to prevent XSS / HTML injection in generated emails
 */
export function escapeHtml(unsafe: string | null | undefined): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Format ISO date string into readable local Philippine Standard Time format
 */
export function formatPhDate(dateStr?: string): string {
  try {
    const d = dateStr ? new Date(dateStr) : new Date();
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  } catch {
    return dateStr || new Date().toISOString();
  }
}

/**
 * Base email layout wrapper with official LGU Talibon branding and typography
 */
function wrapLayout(content: string, preheader: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Municipality of Talibon - Service Notification</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 32px 12px;
    }
    .main-container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: #0f172a;
      padding: 28px 24px;
      text-align: center;
    }
    .header-logo-text {
      color: #ffffff;
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin: 0;
    }
    .header-subtext {
      color: #94a3b8;
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .content {
      padding: 32px 28px;
    }
    .badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .ticket-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 20px;
      margin: 20px 0;
    }
    .ticket-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #64748b;
      font-weight: 700;
      margin: 0;
    }
    .ticket-val {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      font-family: 'Courier New', Courier, monospace;
      margin-top: 4px;
    }
    .info-row {
      display: table;
      width: 100%;
      padding: 8px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .info-label {
      display: table-cell;
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
      width: 38%;
      vertical-align: top;
    }
    .info-value {
      display: table-cell;
      font-size: 12px;
      color: #0f172a;
      font-weight: 700;
      vertical-align: top;
    }
    .remarks-box {
      background-color: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 10px;
      padding: 16px;
      margin: 20px 0;
    }
    .requirements-box {
      background-color: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 10px;
      padding: 16px;
      margin: 20px 0;
    }
    .action-btn {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 13px;
      font-weight: 700;
      padding: 14px 28px;
      border-radius: 10px;
      text-align: center;
      margin-top: 24px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 24px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #64748b;
      line-height: 1.6;
    }
    .footer a {
      color: #2563eb;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 24px 18px !important;
      }
      .main-container {
        border-radius: 8px !important;
      }
    }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${escapeHtml(preheader)}
  </div>
  <table role="presentation" class="wrapper" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center">
        <table role="presentation" class="main-container" cellspacing="0" cellpadding="0" border="0" width="100%">
          <!-- Header -->
          <tr>
            <td class="header">
              <h1 class="header-logo-text">Republic of the Philippines</h1>
              <div class="header-subtext">Municipality of Talibon • Province of Bohol</div>
              <div style="margin-top: 8px; color: #38bdf8; font-size: 12px; font-weight: 700; letter-spacing: 0.05em;">DIGITAL TALIBON CORE (V4)</div>
            </td>
          </tr>
          <!-- Main Content -->
          <tr>
            <td class="content">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td class="footer">
              <p style="margin: 0 0 6px 0; font-weight: 700; color: #334155;">Municipality of Talibon — Official E-Governance Portal</p>
              <p style="margin: 0 0 10px 0;">Municipal Hall, Poblacion, Talibon, Bohol, Philippines 6325</p>
              <p style="margin: 0 0 6px 0;">For inquiries or assistance, email us at <a href="mailto:talibonofficial@gmail.com">talibonofficial@gmail.com</a></p>
              <p style="margin: 12px 0 0 0; font-size: 10px; color: #94a3b8;">This is an automated administrative notification from the Municipality of Talibon Digital Core. Please do not reply directly to this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Generate Subject and HTML/Plaintext content for each workflow event
 */
export function generateEmailForEvent(
  eventType: string,
  data: EmailTemplateData
): { subject: string; html: string; text: string } {
  const safeName = escapeHtml(data.citizenName || "Citizen");
  const safeDoc = escapeHtml(data.documentType || "Certificate Request");
  const safeTicket = escapeHtml(data.ticketId);
  const safeRemarks = escapeHtml(data.remarks || "");
  const formattedDate = formatPhDate(data.updatedAt || data.submittedAt);
  const trackUrl = data.trackingUrl;
  const upper = (eventType || data.status || "").toUpperCase();

  // 1. Request Submitted
  if (upper === "SUBMITTED" || upper === "REQUEST_RECEIVED") {
    const subject = `[Received] Your ${data.documentType} Request has been logged (${data.ticketId})`;
    const preheader = `Your application for ${data.documentType} was received by the Municipality of Talibon. Ticket: ${data.ticketId}`;
    
    const bodyHtml = `
      <div style="margin-bottom: 20px;">
        <span class="badge" style="background-color: #e0f2fe; color: #0369a1;">Application Submitted</span>
      </div>
      <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Magandang Araw, ${safeName}!</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
        We have successfully received and registered your online application for <strong>${safeDoc}</strong> in the Talibon Digital Governance Core.
      </p>

      <div class="ticket-card">
        <p class="ticket-label">Tracking Number / Ticket ID</p>
        <div class="ticket-val">${safeTicket}</div>
      </div>

      <div style="margin: 20px 0;">
        <div class="info-row">
          <div class="info-label">Service Type</div>
          <div class="info-value">${safeDoc}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Barangay</div>
          <div class="info-value">${escapeHtml(data.barangay || "Poblacion")}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Date Submitted</div>
          <div class="info-value">${formattedDate}</div>
        </div>
        <div class="info-row" style="border-bottom: none;">
          <div class="info-label">Current Status</div>
          <div class="info-value" style="color: #0284c7;">Submitted / In Queue</div>
        </div>
      </div>

      <p style="font-size: 13px; line-height: 1.6; color: #475569;">
        Our municipal intake officers will verify your details and route your application to the responsible department. You can monitor progress anytime using your tracking ticket.
      </p>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${escapeHtml(trackUrl)}" class="action-btn">Track Application Online</a>
      </div>
    `;

    const bodyText = `MUNICIPALITY OF TALIBON - SERVICE NOTIFICATION
===============================================
Application Submitted: ${data.documentType}
Tracking Ticket: ${data.ticketId}

Hello ${data.citizenName},

We have received and registered your online application for ${data.documentType}.

Ticket ID: ${data.ticketId}
Service Type: ${data.documentType}
Date: ${formattedDate}
Status: Submitted / In Queue

Track your request online:
${trackUrl}

Municipality of Talibon, Bohol`;

    return { subject, html: wrapLayout(bodyHtml, preheader), text: bodyText };
  }

  // 2. Assigned to Department / Routed
  if (upper === "ASSIGNED" || upper === "ROUTED") {
    const dept = data.officeResponsible || "Responsible Municipal Department";
    const subject = `[Assigned] Your ${data.documentType} request has been routed (${data.ticketId})`;
    const preheader = `Your request is assigned to ${dept} for administrative processing.`;

    const bodyHtml = `
      <div style="margin-bottom: 20px;">
        <span class="badge" style="background-color: #f3e8ff; color: #7e22ce;">Assigned to Office</span>
      </div>
      <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Request Routed for Review</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
        Dear <strong>${safeName}</strong>, your application for <strong>${safeDoc}</strong> has been routed to <strong>${escapeHtml(dept)}</strong>.
      </p>

      <div class="ticket-card">
        <p class="ticket-label">Tracking Number</p>
        <div class="ticket-val">${safeTicket}</div>
      </div>

      ${safeRemarks ? `
      <div class="remarks-box">
        <strong style="font-size: 11px; text-transform: uppercase; color: #92400e; display: block; margin-bottom: 4px;">Staff Routing Remarks:</strong>
        <span style="font-size: 13px; color: #78350f;">${safeRemarks}</span>
      </div>` : ""}

      <div style="text-align: center; margin-top: 24px;">
        <a href="${escapeHtml(trackUrl)}" class="action-btn">View Workflow Status</a>
      </div>
    `;

    const bodyText = `MUNICIPALITY OF TALIBON
Request Routed: ${data.documentType} (${data.ticketId})
Assigned Office: ${dept}
${data.remarks ? `Remarks: ${data.remarks}\n` : ""}
Track: ${trackUrl}`;

    return { subject, html: wrapLayout(bodyHtml, preheader), text: bodyText };
  }

  // 3. Processing / Under Review
  if (upper === "PROCESSING" || upper === "UNDER REVIEW" || upper === "UNDER_REVIEW") {
    const subject = `[Under Review] Application Verification in Progress (${data.ticketId})`;
    const preheader = `Your application for ${data.documentType} is currently undergoing evaluation.`;

    const bodyHtml = `
      <div style="margin-bottom: 20px;">
        <span class="badge" style="background-color: #fef3c7; color: #b45309;">Under Review</span>
      </div>
      <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Evaluation In Progress</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
        Dear <strong>${safeName}</strong>, our municipal evaluators are actively validating your submission for <strong>${safeDoc}</strong>.
      </p>

      <div class="ticket-card">
        <p class="ticket-label">Tracking Number</p>
        <div class="ticket-val">${safeTicket}</div>
      </div>

      ${safeRemarks ? `
      <div class="remarks-box">
        <strong style="font-size: 11px; text-transform: uppercase; color: #92400e; display: block; margin-bottom: 4px;">Evaluation Notes:</strong>
        <span style="font-size: 13px; color: #78350f;">${safeRemarks}</span>
      </div>` : ""}

      <p style="font-size: 13px; line-height: 1.6; color: #475569;">
        No additional action is required from you at this time. We will notify you immediately once the evaluation is finalized.
      </p>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${escapeHtml(trackUrl)}" class="action-btn">Track Request</a>
      </div>
    `;

    const bodyText = `MUNICIPALITY OF TALIBON
Under Review: ${data.documentType} (${data.ticketId})
Your application is currently being evaluated.
${data.remarks ? `Notes: ${data.remarks}\n` : ""}
Track: ${trackUrl}`;

    return { subject, html: wrapLayout(bodyHtml, preheader), text: bodyText };
  }

  // 4. Additional Requirements Needed / Returned
  if (upper === "RETURNED" || upper === "ADDITIONAL REQUIREMENTS NEEDED" || upper === "ADDITIONAL_REQUIREMENTS") {
    const subject = `[Action Required] Additional Documents Needed for ${data.documentType} (${data.ticketId})`;
    const preheader = `Action required: Please provide additional requirements or updated files for ticket ${data.ticketId}.`;

    const reqsListHtml = data.requirements && data.requirements.length > 0
      ? `<ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 13px; color: #1e3a8a; line-height: 1.6;">
          ${data.requirements.map(r => `<li>${escapeHtml(r)}</li>`).join("")}
         </ul>`
      : `<p style="margin: 6px 0 0 0; font-size: 13px; color: #1e3a8a;">Please review the evaluator remarks below or bring a valid government-issued ID and photocopy.</p>`;

    const bodyHtml = `
      <div style="margin-bottom: 20px;">
        <span class="badge" style="background-color: #fee2e2; color: #b91c1c;">Action Required</span>
      </div>
      <h2 style="font-size: 20px; font-weight: 800; color: #991b1b; margin: 0 0 12px 0;">Additional Requirements Needed</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
        Dear <strong>${safeName}</strong>, our staff reviewed your application for <strong>${safeDoc}</strong> and determined that additional documents or clearer submissions are needed to continue processing.
      </p>

      <div class="ticket-card">
        <p class="ticket-label">Tracking Number</p>
        <div class="ticket-val">${safeTicket}</div>
      </div>

      ${safeRemarks ? `
      <div class="remarks-box" style="background-color: #fff1f2; border-color: #fecdd3;">
        <strong style="font-size: 11px; text-transform: uppercase; color: #9f1239; display: block; margin-bottom: 4px;">Staff Specific Remarks:</strong>
        <span style="font-size: 13px; color: #881337; font-weight: 600;">${safeRemarks}</span>
      </div>` : ""}

      <div class="requirements-box">
        <strong style="font-size: 11px; text-transform: uppercase; color: #1e40af; display: block; margin-bottom: 4px;">Official Service Requirements Checklist:</strong>
        ${reqsListHtml}
      </div>

      <p style="font-size: 13px; line-height: 1.6; color: #475569;">
        Please open your tracking link below to review requirements and upload the requested documentation to expedite your approval.
      </p>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${escapeHtml(trackUrl)}" class="action-btn" style="background-color: #dc2626;">Submit Required Documents</a>
      </div>
    `;

    const reqsText = data.requirements && data.requirements.length > 0
      ? `Requirements:\n` + data.requirements.map(r => `• ${r}`).join("\n")
      : `Please bring or submit valid identification and supporting documents.`;

    const bodyText = `MUNICIPALITY OF TALIBON - ACTION REQUIRED
===============================================
Additional Requirements for ${data.documentType}
Ticket: ${data.ticketId}

Hello ${data.citizenName},

Additional information or documents are needed for your request.

${data.remarks ? `Staff Remarks: "${data.remarks}"\n` : ""}
${reqsText}

Please update your application online:
${trackUrl}`;

    return { subject, html: wrapLayout(bodyHtml, preheader), text: bodyText };
  }

  // 5. Approved
  if (upper === "APPROVED") {
    const subject = `[Approved] Your ${data.documentType} Request has been Approved (${data.ticketId})`;
    const preheader = `Good news! Your request for ${data.documentType} has been approved by the municipal registrar.`;

    const bodyHtml = `
      <div style="margin-bottom: 20px;">
        <span class="badge" style="background-color: #dcfce7; color: #15803d;">Application Approved</span>
      </div>
      <h2 style="font-size: 20px; font-weight: 800; color: #166534; margin: 0 0 12px 0;">Application Approved!</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
        Dear <strong>${safeName}</strong>, we are pleased to inform you that your application for <strong>${safeDoc}</strong> has been officially approved.
      </p>

      <div class="ticket-card">
        <p class="ticket-label">Tracking Number</p>
        <div class="ticket-val">${safeTicket}</div>
      </div>

      ${safeRemarks ? `
      <div class="remarks-box">
        <strong style="font-size: 11px; text-transform: uppercase; color: #92400e; display: block; margin-bottom: 4px;">Approval Notes:</strong>
        <span style="font-size: 13px; color: #78350f;">${safeRemarks}</span>
      </div>` : ""}

      <p style="font-size: 13px; line-height: 1.6; color: #475569;">
        The office is currently generating your certificate. You will receive another notification as soon as it is sealed and ready for collection.
      </p>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${escapeHtml(trackUrl)}" class="action-btn" style="background-color: #16a34a;">View Status Online</a>
      </div>
    `;

    const bodyText = `MUNICIPALITY OF TALIBON
Approved: ${data.documentType} (${data.ticketId})

Hello ${data.citizenName},
Your application has been approved by the Municipality of Talibon.
${data.remarks ? `Notes: ${data.remarks}\n` : ""}
Track: ${trackUrl}`;

    return { subject, html: wrapLayout(bodyHtml, preheader), text: bodyText };
  }

  // 6. Preparing Document
  if (upper === "PREPARING" || upper === "PREPARING DOCUMENT" || upper === "PREPARING_DOCUMENT") {
    const subject = `[Printing] Your ${data.documentType} is being prepared (${data.ticketId})`;
    const preheader = `Your official document is currently being printed, sealed, and signed.`;

    const bodyHtml = `
      <div style="margin-bottom: 20px;">
        <span class="badge" style="background-color: #e0e7ff; color: #4338ca;">Document Preparation</span>
      </div>
      <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Printing & Sealing in Progress</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
        Dear <strong>${safeName}</strong>, your <strong>${safeDoc}</strong> is currently being prepared, dry-sealed, and signed by authorized municipal officials.
      </p>

      <div class="ticket-card">
        <p class="ticket-label">Tracking Number</p>
        <div class="ticket-val">${safeTicket}</div>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${escapeHtml(trackUrl)}" class="action-btn">Track Ready Status</a>
      </div>
    `;

    const bodyText = `MUNICIPALITY OF TALIBON
Document Preparation: ${data.documentType} (${data.ticketId})
Your document is currently being prepared and signed.
Track: ${trackUrl}`;

    return { subject, html: wrapLayout(bodyHtml, preheader), text: bodyText };
  }

  // 7. Ready for Claim / Pickup
  if (upper === "READY" || upper === "READY FOR CLAIM" || upper === "READY_FOR_CLAIM") {
    const subject = `[Ready for Pickup] Your ${data.documentType} is ready for collection (${data.ticketId})`;
    const preheader = `Your document is ready for collection at the Talibon Municipal Treasury Office.`;

    const bodyHtml = `
      <div style="margin-bottom: 20px;">
        <span class="badge" style="background-color: #dbeafe; color: #1d4ed8;">Ready for Collection</span>
      </div>
      <h2 style="font-size: 20px; font-weight: 800; color: #1e40af; margin: 0 0 12px 0;">Ready for Physical Collection</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
        Dear <strong>${safeName}</strong>, your official document for <strong>${safeDoc}</strong> has been finalized and is now ready for claim.
      </p>

      <div class="ticket-card">
        <p class="ticket-label">Tracking Number (Present at Counter)</p>
        <div class="ticket-val">${safeTicket}</div>
      </div>

      <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <strong style="font-size: 11px; text-transform: uppercase; color: #0f172a; display: block; margin-bottom: 8px; letter-spacing: 0.05em;">Collection Guidelines & Location:</strong>
        <div class="info-row">
          <div class="info-label">Pick-up Location</div>
          <div class="info-value">Municipal Treasury Office, Talibon Town Hall</div>
        </div>
        <div class="info-row">
          <div class="info-label">Office Hours</div>
          <div class="info-value">Monday to Friday • 8:00 AM – 5:00 PM</div>
        </div>
        <div class="info-row" style="border-bottom: none;">
          <div class="info-label">What to Bring</div>
          <div class="info-value">
            • Tracking Number: <code>${safeTicket}</code><br>
            • Valid Government-issued ID<br>
            • Applicable fee receipt / authorization letter (if claiming on behalf)
          </div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${escapeHtml(trackUrl)}" class="action-btn" style="background-color: #1d4ed8;">View Collection Pass</a>
      </div>
    `;

    const bodyText = `MUNICIPALITY OF TALIBON - READY FOR PICKUP
===============================================
Document Ready: ${data.documentType}
Ticket: ${data.ticketId}

Hello ${data.citizenName},

Your requested document is ready for collection at the Municipal Treasury Office.

Location: Municipal Hall, Poblacion, Talibon, Bohol
Hours: Mon-Fri 8:00 AM - 5:00 PM
What to bring:
- Tracking Number: ${data.ticketId}
- Valid Government ID
- Applicable fee receipt

Track online: ${trackUrl}`;

    return { subject, html: wrapLayout(bodyHtml, preheader), text: bodyText };
  }

  // 8. Completed / Claimed
  if (upper === "CLAIMED" || upper === "COMPLETED" || upper === "CLAIMED / COMPLETED") {
    const subject = `[Completed] Transaction Completed for ${data.documentType} (${data.ticketId})`;
    const preheader = `Your transaction for ${data.documentType} has been successfully completed. Thank you!`;

    const bodyHtml = `
      <div style="margin-bottom: 20px;">
        <span class="badge" style="background-color: #f1f5f9; color: #334155;">Transaction Completed</span>
      </div>
      <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Salamat, Talibonanon!</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
        Dear <strong>${safeName}</strong>, your document for <strong>${safeDoc}</strong> (Ticket: <strong>${safeTicket}</strong>) was successfully claimed and this service ticket is now closed.
      </p>

      <div class="ticket-card">
        <p class="ticket-label">Closed Ticket</p>
        <div class="ticket-val">${safeTicket}</div>
      </div>

      <p style="font-size: 13px; line-height: 1.6; color: #475569;">
        Thank you for transacting through Digital Talibon Core. We are dedicated to providing fast, transparent, and accessible public service.
      </p>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${escapeHtml(trackUrl)}" class="action-btn" style="background-color: #334155;">View Transaction Summary</a>
      </div>
    `;

    const bodyText = `MUNICIPALITY OF TALIBON
Transaction Completed: ${data.documentType} (${data.ticketId})

Hello ${data.citizenName},
Your document has been claimed and your ticket is closed.
Thank you for using Digital Talibon!`;

    return { subject, html: wrapLayout(bodyHtml, preheader), text: bodyText };
  }

  // 9. Rejected
  if (upper === "REJECTED") {
    const subject = `[Update] Regarding your ${data.documentType} Application (${data.ticketId})`;
    const preheader = `Important notice regarding your application for ${data.documentType}.`;

    const bodyHtml = `
      <div style="margin-bottom: 20px;">
        <span class="badge" style="background-color: #fee2e2; color: #b91c1c;">Application Declined</span>
      </div>
      <h2 style="font-size: 20px; font-weight: 800; color: #991b1b; margin: 0 0 12px 0;">Application Status Notice</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
        Dear <strong>${safeName}</strong>, we regret to inform you that your application for <strong>${safeDoc}</strong> could not be approved at this time.
      </p>

      <div class="ticket-card">
        <p class="ticket-label">Tracking Number</p>
        <div class="ticket-val">${safeTicket}</div>
      </div>

      <div class="remarks-box" style="background-color: #fff1f2; border-color: #fecdd3;">
        <strong style="font-size: 11px; text-transform: uppercase; color: #9f1239; display: block; margin-bottom: 4px;">Reason for Disapproval:</strong>
        <span style="font-size: 13px; color: #881337; font-weight: 600;">${safeRemarks || "Incomplete requirements or verification failure."}</span>
      </div>

      <p style="font-size: 13px; line-height: 1.6; color: #475569;">
        You may submit a new application with complete and verified documentation, or visit our municipal helpdesk for personal assistance.
      </p>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${escapeHtml(trackUrl)}" class="action-btn" style="background-color: #475569;">View Full Details</a>
      </div>
    `;

    const bodyText = `MUNICIPALITY OF TALIBON
Application Notice: ${data.documentType} (${data.ticketId})

Hello ${data.citizenName},
Your application could not be approved at this time.
Reason: ${data.remarks || "Incomplete requirements or verification failure."}

Details: ${trackUrl}`;

    return { subject, html: wrapLayout(bodyHtml, preheader), text: bodyText };
  }

  // 10. Cancelled
  if (upper === "CANCELLED") {
    const subject = `[Cancelled] Service Request ${data.ticketId} Cancelled`;
    const preheader = `Your request for ${data.documentType} was cancelled.`;

    const bodyHtml = `
      <div style="margin-bottom: 20px;">
        <span class="badge" style="background-color: #f1f5f9; color: #64748b;">Request Cancelled</span>
      </div>
      <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Request Cancelled</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
        Dear <strong>${safeName}</strong>, your service ticket for <strong>${safeDoc}</strong> has been cancelled.
      </p>
      <div class="ticket-card">
        <p class="ticket-label">Cancelled Ticket</p>
        <div class="ticket-val">${safeTicket}</div>
      </div>
      ${safeRemarks ? `
      <div class="remarks-box">
        <strong style="font-size: 11px; text-transform: uppercase; color: #92400e; display: block; margin-bottom: 4px;">Cancellation Reason:</strong>
        <span style="font-size: 13px; color: #78350f;">${safeRemarks}</span>
      </div>` : ""}
    `;

    const bodyText = `MUNICIPALITY OF TALIBON
Cancelled: ${data.documentType} (${data.ticketId})
${data.remarks ? `Reason: ${data.remarks}\n` : ""}`;

    return { subject, html: wrapLayout(bodyHtml, preheader), text: bodyText };
  }

  // Generic / Default status update
  const subject = `[Update] Status Changed for your ${data.documentType} (${data.ticketId})`;
  const preheader = `Your application status was updated to ${data.statusLabel || data.status}.`;

  const bodyHtml = `
    <div style="margin-bottom: 20px;">
      <span class="badge" style="background-color: #e2e8f0; color: #1e293b;">${escapeHtml(data.statusLabel || data.status)}</span>
    </div>
    <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Workflow Status Update</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
      Dear <strong>${safeName}</strong>, the status of your request for <strong>${safeDoc}</strong> is now <strong>${escapeHtml(data.statusLabel || data.status)}</strong>.
    </p>

    <div class="ticket-card">
      <p class="ticket-label">Tracking Number</p>
      <div class="ticket-val">${safeTicket}</div>
    </div>

    ${safeRemarks ? `
    <div class="remarks-box">
      <strong style="font-size: 11px; text-transform: uppercase; color: #92400e; display: block; margin-bottom: 4px;">Staff Remarks:</strong>
      <span style="font-size: 13px; color: #78350f;">${safeRemarks}</span>
    </div>` : ""}

    <div style="text-align: center; margin-top: 24px;">
      <a href="${escapeHtml(trackUrl)}" class="action-btn">Track Request</a>
    </div>
  `;

  const bodyText = `MUNICIPALITY OF TALIBON
Status Update: ${data.documentType} (${data.ticketId})
Status: ${data.statusLabel || data.status}
${data.remarks ? `Remarks: ${data.remarks}\n` : ""}
Track: ${trackUrl}`;

  return { subject, html: wrapLayout(bodyHtml, preheader), text: bodyText };
}
