import nodemailer from "nodemailer";
import { getSettings } from "./settings.service";
import type { Enquiry, LabourRequisition, LabourAgency, IndividualWorker } from "@shared/types";

/**
 * Escapes HTML characters to prevent HTML/script injection in email viewers
 */
export function escapeHtml(str: unknown): string {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Dynamically constructs a Nodemailer SMTP transporter using active database settings
 */
export function createTransporter(settings: Record<string, string>) {
  const host = (settings.brevo_smtp_host || process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com").trim();
  const port = Number(settings.brevo_smtp_port || process.env.BREVO_SMTP_PORT || 587);
  const user = (settings.brevo_smtp_user || process.env.BREVO_SMTP_USER || "").trim();
  const pass = (settings.brevo_smtp_key || process.env.BREVO_SMTP_KEY || "").trim();

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
  });
}

export interface EmailPayload {
  from: { name: string; email: string };
  to: { name?: string; email: string }[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Formats low-level SMTP and API errors into actionable administrator messages
 */
export function formatEmailError(err: any): string {
  const msg = err?.message || String(err);
  if (
    err?.code === "EAUTH" ||
    msg.includes("535") ||
    msg.includes("Authentication failed") ||
    msg.includes("Key not found") ||
    msg.includes("unauthorized")
  ) {
    return "Brevo Authentication Failed: Invalid Brevo SMTP User (Login) or API/SMTP Key. In your Brevo dashboard, go to 'SMTP & API' → 'SMTP' tab, copy the exact SMTP Login and generate a new Master SMTP Key (xsmtpsib-...), then save them in settings.";
  }
  if (msg.includes("unverified") || msg.includes("sender") || msg.includes("Sender is not allowed")) {
    return `Brevo Sender Error: ${msg}. Make sure your 'Sender Email Address' is added as a Verified Sender in Brevo (Brevo Dashboard → Senders & IP → Senders).`;
  }
  if (err?.code === "ETIMEDOUT" || err?.code === "ECONNREFUSED" || err?.code === "ESOCKET") {
    return `Brevo Connection Timeout (${err.code}): Unable to connect to Brevo SMTP host over TCP port. Ensure network connectivity or rely on HTTPS API delivery.`;
  }
  return msg;
}

/**
 * Dispatches transactional email via Brevo REST API (HTTPS port 443)
 * Essential for cloud hosts (Vercel, Render, AWS Lambda) where SMTP TCP ports 587/465 are firewalled.
 */
export async function sendViaBrevoRestApi(
  apiKey: string,
  payload: EmailPayload
): Promise<{ success: boolean; messageId: string }> {
  const cleanKey = apiKey.trim();
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": cleanKey,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: payload.from,
      to: payload.to,
      subject: payload.subject,
      htmlContent: payload.html,
      textContent: payload.text,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.message || `Brevo REST API error (${res.status})`;
    throw new Error(formatEmailError(new Error(errorMsg)));
  }

  return {
    success: true,
    messageId: data.messageId || "brevo-rest-api",
  };
}

/**
 * Universal email dispatcher with automatic HTTPS and multi-port fallback
 */
export async function dispatchEmail(
  settings: Record<string, string>,
  payload: EmailPayload
): Promise<{ success: boolean; messageId: string; transport: string }> {
  const apiKey = (settings.brevo_smtp_key || process.env.BREVO_SMTP_KEY || "").trim();

  // 1. If an API Key (xkeysib-...) is provided, use HTTPS REST API directly (fastest, unblockable across all cloud hosts)
  if (apiKey.startsWith("xkeysib-")) {
    const restRes = await sendViaBrevoRestApi(apiKey, payload);
    return { ...restRes, transport: "Brevo REST API (HTTPS Port 443)" };
  }

  const transporter = createTransporter(settings);

  // If transporter cannot be initialized (e.g. user missing but key present), use REST API directly
  if (!transporter) {
    if (apiKey) {
      const restRes = await sendViaBrevoRestApi(apiKey, payload);
      return { ...restRes, transport: "Brevo REST API (HTTPS)" };
    }
    throw new Error("Brevo credentials not configured. Please enter your Brevo Key in settings.");
  }

  // 2. Attempt primary SMTP Relay
  try {
    const info = await transporter.sendMail({
      from: `"${payload.from.name}" <${payload.from.email}>`,
      to: payload.to.map((t) => (t.name ? `"${t.name}" <${t.email}>` : t.email)).join(", "),
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
    return {
      success: true,
      messageId: info.messageId,
      transport: `SMTP Relay (${settings.brevo_smtp_host || "smtp-relay.brevo.com"}:${settings.brevo_smtp_port || 587})`,
    };
  } catch (smtpErr: any) {
    const isNetworkError =
      smtpErr?.code === "ETIMEDOUT" ||
      smtpErr?.code === "ECONNREFUSED" ||
      smtpErr?.code === "ESOCKET" ||
      smtpErr?.code === "EHOSTUNREACH" ||
      smtpErr?.code === "ENETUNREACH" ||
      String(smtpErr?.message).includes("Timeout") ||
      String(smtpErr?.message).includes("Greeting never received");

    if (isNetworkError) {
      // Try fallback port 465 direct SSL if primary was 587
      const primaryPort = Number(settings.brevo_smtp_port || 587);
      if (primaryPort !== 465 && settings.brevo_smtp_user && apiKey) {
        try {
          console.warn("⚠️ [EmailService] SMTP port 587 timed out. Retrying over SMTPS direct SSL port 465...");
          const sslTransporter = nodemailer.createTransport({
            host: settings.brevo_smtp_host || "smtp-relay.brevo.com",
            port: 465,
            secure: true,
            auth: { user: settings.brevo_smtp_user.trim(), pass: apiKey },
            connectionTimeout: 8000,
            greetingTimeout: 8000,
          });
          const info = await sslTransporter.sendMail({
            from: `"${payload.from.name}" <${payload.from.email}>`,
            to: payload.to.map((t) => (t.name ? `"${t.name}" <${t.email}>` : t.email)).join(", "),
            subject: payload.subject,
            html: payload.html,
            text: payload.text,
          });
          return {
            success: true,
            messageId: info.messageId,
            transport: "SMTP Relay SSL (smtp-relay.brevo.com:465)",
          };
        } catch (sslErr: any) {
          console.warn("⚠️ [EmailService] Port 465 also blocked. Attempting HTTPS REST API fallback...");
        }
      }

      // Try REST API fallback
      if (apiKey) {
        try {
          const restRes = await sendViaBrevoRestApi(apiKey, payload);
          return { ...restRes, transport: "Brevo REST API (HTTPS Fallback)" };
        } catch (restErr: any) {
          throw new Error(
            "Brevo Cloud Firewall Warning: Outbound SMTP ports (587/465) are blocked by the cloud hosting firewall. To enable unblockable HTTPS email delivery, please create an API Key (xkeysib-...) from Brevo Dashboard → 'SMTP & API' → 'API Keys' tab and enter it as your Brevo Master Key."
          );
        }
      }
    }

    throw new Error(formatEmailError(smtpErr));
  }
}

/**
 * Dispatches transactional email notifications when a new quote request is submitted
 */
export async function sendEnquiryNotifications(enquiry: Enquiry): Promise<{
  success: boolean;
  skipped?: boolean;
  reason?: string;
  adminSent?: boolean;
  customerSent?: boolean;
}> {
  try {
    const settings = await getSettings();

    // Check if email notifications are enabled
    if (settings.email_notifications_enabled !== "true") {
      console.log("ℹ️ [EmailService] Email notifications are disabled in settings. Skipping email dispatch.");
      return { success: true, skipped: true, reason: "notifications_disabled" };
    }

    const apiKey = (settings.brevo_smtp_key || process.env.BREVO_SMTP_KEY || "").trim();
    if (!apiKey) {
      console.warn("⚠️ [EmailService] Brevo key not configured in settings. Skipping email dispatch.");
      return { success: true, skipped: true, reason: "smtp_not_configured" };
    }

    const companyName = (settings.company_name || "Dezoryn Contractor").trim();
    const fromAddress = (settings.email_from_address || "sales@dezoryn.com").trim();
    const fromName = (settings.email_from_name || `${companyName} Commercial Desk`).trim();
    const toAddress = (settings.email_admin_recipient || settings.email || "sales@dezoryn.com").trim();
    const adminBaseUrl = process.env.ADMIN_BASE_URL || "http://localhost:3001";

    const safeName = escapeHtml(enquiry.name);
    const safeCompany = escapeHtml(enquiry.company);
    const safePhone = escapeHtml(enquiry.phone);
    const safeEmail = escapeHtml(enquiry.email);
    const safeProduct = escapeHtml(enquiry.product);
    const safeQuantity = escapeHtml(enquiry.quantity);
    const safeLocation = escapeHtml(enquiry.location);
    const safeMessage = escapeHtml(enquiry.message || "None provided");
    const enqDate = new Date(enquiry.createdAt || Date.now()).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });

    // 1. Executive Admin Lead Alert Template
    const adminHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>New Commercial BOQ Quotation Request</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #334155; margin: 0; padding: 24px 0; }
    .wrapper { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; }
    .header { background: #090d16; padding: 28px 32px; border-bottom: 3px solid #c9a35d; }
    .header-tag { font-size: 11px; font-weight: 800; color: #c9a35d; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; }
    .header h1 { margin: 0; font-size: 20px; color: #ffffff; font-weight: 700; letter-spacing: -0.5px; }
    .content { padding: 32px; }
    .lead-badge { display: inline-block; background: #fffbeb; color: #b45309; border: 1px solid #fde68a; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; margin-bottom: 20px; }
    .grid-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13.5px; }
    .grid-table th { text-align: left; padding: 10px 14px; background: #f8fafc; color: #64748b; font-weight: 600; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; width: 35%; }
    .grid-table td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 500; }
    .notes-box { background: #f8fafc; border-left: 3px solid #c9a35d; padding: 14px 18px; font-size: 13px; color: #334155; line-height: 1.6; margin-bottom: 24px; border-radius: 0 4px 4px 0; }
    .action-btn { display: inline-block; background: #0f172a; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: 700; font-size: 13px; letter-spacing: 0.5px; }
    .footer { background: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-tag">${escapeHtml(companyName)} Commercial Portal</div>
      <h1>New Project BOQ Quotation Request</h1>
    </div>
    <div class="content">
      <div class="lead-badge">⚡ Live Lead • Ref #ENQ-${enquiry.id} • ${enqDate}</div>
      <p style="margin: 0 0 18px 0; font-size: 14px; color: #475569;">
        A new bulk requirement enquiry has been received through the website quotation desk.
      </p>

      <table class="grid-table">
        <tr>
          <th>Client Name</th>
          <td><strong>${safeName}</strong></td>
        </tr>
        <tr>
          <th>Contractor / Company</th>
          <td><strong>${safeCompany}</strong></td>
        </tr>
        <tr>
          <th>Contact Phone</th>
          <td><a href="tel:${safePhone}" style="color: #c9a35d; font-weight: 700; text-decoration: none;">${safePhone}</a></td>
        </tr>
        <tr>
          <th>Business Email</th>
          <td><a href="mailto:${safeEmail}" style="color: #2563eb; text-decoration: none;">${safeEmail}</a></td>
        </tr>
        <tr>
          <th>Product Category</th>
          <td><strong style="color: #0f172a;">${safeProduct}</strong></td>
        </tr>
        <tr>
          <th>Estimated Volume</th>
          <td><span style="background: #f1f5f9; padding: 2px 8px; border-radius: 3px; font-weight: 700;">${safeQuantity}</span></td>
        </tr>
        <tr>
          <th>Delivery Destination</th>
          <td>${safeLocation}</td>
        </tr>
      </table>

      <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 6px;">Technical Specifications & Project Notes:</div>
      <div class="notes-box">
        ${safeMessage.replace(/\n/g, "<br>")}
      </div>

      <div style="text-align: center; margin: 28px 0 12px 0;">
        <a href="${adminBaseUrl}" class="action-btn">
          View in Control Centre →
        </a>
      </div>
    </div>
    <div class="footer">
      Automated alert generated by ${escapeHtml(companyName)} Control System.
    </div>
  </div>
</body>
</html>
    `;

    const recipientList = toAddress
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.includes("@"))
      .map((email) => ({ email }));

    if (recipientList.length === 0) {
      recipientList.push({ email: fromAddress || "sales@dezoryn.com" });
    }

    // Send admin lead email
    await dispatchEmail(settings, {
      from: { name: fromName, email: fromAddress },
      to: recipientList,
      subject: `[New Lead #ENQ-${enquiry.id}] BOQ Quote Request - ${enquiry.company} (${enquiry.product})`,
      html: adminHtml,
      text: `New BOQ Quotation Request from ${enquiry.name} (${enquiry.company})\nPhone: ${enquiry.phone}\nEmail: ${enquiry.email}\nProduct: ${enquiry.product}\nQuantity: ${enquiry.quantity}\nLocation: ${enquiry.location}\nNotes: ${enquiry.message || "None"}`,
    });

    let customerSent = false;

    // 2. Customer Acknowledgment Auto-Responder (if enabled)
    if (settings.email_customer_autoresponder === "true" && enquiry.email && enquiry.email.includes("@")) {
      const customerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Quotation Request Received - ${escapeHtml(companyName)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #334155; margin: 0; padding: 24px 0; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: #090d16; padding: 24px 30px; border-bottom: 3px solid #c9a35d; }
    .header-tag { font-size: 11px; font-weight: 800; color: #c9a35d; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px; }
    .header h1 { margin: 0; font-size: 18px; color: #ffffff; font-weight: 700; }
    .content { padding: 28px 30px; }
    .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 20px 0; font-size: 13px; }
    .footer { background: #f8fafc; padding: 18px 30px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-tag">${escapeHtml(companyName)}</div>
      <h1>Quotation Request Received</h1>
    </div>
    <div class="content">
      <p style="margin-top: 0; font-size: 14px; line-height: 1.6;">
        Dear <strong>${safeName}</strong>,
      </p>
      <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        Thank you for contacting <strong>${escapeHtml(companyName)}</strong>. We have received your commercial requirement enquiry (Ref <strong>#ENQ-${enquiry.id}</strong>) for <strong>${safeProduct}</strong>.
      </p>

      <div class="summary-card">
        <div style="font-weight: 700; color: #0f172a; margin-bottom: 8px; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">Requirement Summary:</div>
        <div>• <strong>Product:</strong> ${safeProduct}</div>
        <div>• <strong>Estimated Quantity:</strong> ${safeQuantity}</div>
        <div>• <strong>Destination:</strong> ${safeLocation}</div>
        <div>• <strong>Company:</strong> ${safeCompany}</div>
      </div>

      <p style="font-size: 13px; color: #475569; line-height: 1.6;">
        Our technical sales engineering team is reviewing your project parameters against active MORTH / IRC manufacturing batches and will reach out with a detailed BOQ supply schedule and quotation shortly.
      </p>
      <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
        For urgent corridor dispatches, contact our desk at <a href="tel:${escapeHtml(settings.phone || "")}" style="color: #c9a35d; font-weight: 700;">${escapeHtml(settings.phone || "")}</a>.
      </p>
    </div>
    <div class="footer">
      ${escapeHtml(companyName)} • Industrial Highway Product Manufacturer
    </div>
  </div>
</body>
</html>
      `;

      try {
        await dispatchEmail(settings, {
          from: { name: fromName, email: fromAddress },
          to: [{ name: enquiry.name, email: enquiry.email }],
          subject: `Quotation Request Received - ${companyName} (Ref #ENQ-${enquiry.id})`,
          html: customerHtml,
          text: `Dear ${enquiry.name},\n\nThank you for reaching out to ${companyName}. We have received your quotation request for ${enquiry.product} (${enquiry.quantity}). Our sales team will get back to you shortly.`,
        });
        customerSent = true;
      } catch (custErr: any) {
        console.warn("⚠️ [EmailService] Failed to send customer acknowledgment:", custErr.message);
      }
    }

    console.log(`✅ [EmailService] Email notification successfully dispatched for Lead #ENQ-${enquiry.id}`);
    return { success: true, adminSent: true, customerSent };
  } catch (err: any) {
    console.error("❌ [EmailService] Error dispatching enquiry notification:", err.message);
    return { success: false, reason: err.message };
  }
}

/**
 * Dispatches transactional email notifications when a contractor posts a labour requisition
 */
export async function sendWorkforceRequisitionNotifications(
  requisition: LabourRequisition
): Promise<{
  success: boolean;
  skipped?: boolean;
  reason?: string;
  adminSent?: boolean;
  customerSent?: boolean;
}> {
  try {
    const settings = await getSettings();

    if (settings.email_notifications_enabled !== "true") {
      return { success: true, skipped: true, reason: "notifications_disabled" };
    }

    const apiKey = (settings.brevo_smtp_key || process.env.BREVO_SMTP_KEY || "").trim();
    if (!apiKey) {
      return { success: true, skipped: true, reason: "smtp_not_configured" };
    }

    const companyName = (settings.company_name || "Dezoryn Contractor").trim();
    const fromAddress = (settings.email_from_address || "sales@dezoryn.com").trim();
    const fromName = (settings.email_from_name || `${companyName} Workforce Operations`).trim();
    const toAddress = (settings.email_admin_recipient || settings.email || "sales@dezoryn.com").trim();
    const adminBaseUrl = process.env.ADMIN_BASE_URL || "http://localhost:3001";

    const safeCompany = escapeHtml(requisition.companyName);
    const safeContact = escapeHtml(requisition.contactPerson);
    const safePhone = escapeHtml(requisition.phone);
    const safeEmail = escapeHtml(requisition.email);
    const safeProject = escapeHtml(requisition.projectTitle);
    const safeType = escapeHtml(requisition.projectType);
    const safeLocation = escapeHtml(`${requisition.locationCity}, ${requisition.locationState}`);
    const safeWage = escapeHtml(requisition.dailyWageBudget || "Negotiable / Standard Rate");
    const safeDuration = escapeHtml(requisition.durationMonths || "Not specified");
    const safeStartDate = escapeHtml(requisition.startDate || "Immediate");
    const safeMessage = escapeHtml(requisition.message || "None provided");
    const reqDate = new Date(requisition.createdAt || Date.now()).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });

    let skillsList: { trade: string; count: number }[] = [];
    if (Array.isArray(requisition.skillsRequired)) {
      skillsList = requisition.skillsRequired;
    } else if (typeof requisition.skillsRequired === "string") {
      try {
        skillsList = JSON.parse(requisition.skillsRequired);
      } catch {
        skillsList = [];
      }
    }

    let amenitiesList: string[] = [];
    if (Array.isArray(requisition.amenities)) {
      amenitiesList = requisition.amenities;
    } else if (typeof requisition.amenities === "string") {
      try {
        amenitiesList = JSON.parse(requisition.amenities);
      } catch {
        amenitiesList = [];
      }
    }

    const skillsHtml = skillsList.length > 0
      ? `<table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px;">
          <thead>
            <tr style="background: #f1f5f9; text-align: left;">
              <th style="padding: 8px 12px; font-size: 11px; text-transform: uppercase; color: #475569;">Trade Skill Discipline</th>
              <th style="padding: 8px 12px; font-size: 11px; text-transform: uppercase; color: #475569; text-align: right;">Required Headcount</th>
            </tr>
          </thead>
          <tbody>
            ${skillsList.map((s) => `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 12px; color: #0f172a; font-weight: 600;">${escapeHtml(s.trade)}</td>
                <td style="padding: 8px 12px; text-align: right; font-weight: 700; color: #c9a35d;">${Number(s.count) || 1} workers</td>
              </tr>
            `).join("")}
          </tbody>
        </table>`
      : `<p style="font-size: 13px; color: #64748b; margin: 6px 0;">Total Headcount: <strong>${requisition.totalWorkers} Workers</strong></p>`;

    const adminHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>New Contractor Labour Requisition - ${requisition.requisitionCode}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #334155; margin: 0; padding: 24px 0; }
    .wrapper { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; }
    .header { background: #090d16; padding: 28px 32px; border-bottom: 3px solid #c9a35d; }
    .header-tag { font-size: 11px; font-weight: 800; color: #c9a35d; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; }
    .header h1 { margin: 0; font-size: 20px; color: #ffffff; font-weight: 700; }
    .content { padding: 32px; }
    .lead-badge { display: inline-block; background: #fdfaf3; color: #926f28; border: 1px solid #f3e6ca; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; margin-bottom: 20px; }
    .grid-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13.5px; }
    .grid-table th { text-align: left; padding: 9px 12px; background: #f8fafc; color: #64748b; font-weight: 600; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; width: 35%; }
    .grid-table td { padding: 9px 12px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 500; }
    .notes-box { background: #f8fafc; border-left: 3px solid #c9a35d; padding: 14px 18px; font-size: 13px; color: #334155; line-height: 1.6; margin-bottom: 24px; border-radius: 0 4px 4px 0; }
    .action-btn { display: inline-block; background: #0f172a; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: 700; font-size: 13px; letter-spacing: 0.5px; }
    .footer { background: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-tag">${escapeHtml(companyName)} Industrial Workforce Exchange</div>
      <h1>New Contractor Labour Requisition</h1>
    </div>
    <div class="content">
      <div class="lead-badge">⚡ Docket Ref #${escapeHtml(requisition.requisitionCode)} • ${reqDate}</div>
      <p style="margin: 0 0 18px 0; font-size: 14px; color: #475569;">
        A main contractor has posted a manpower requisition requiring verified workforce matching.
      </p>

      <table class="grid-table">
        <tr>
          <th>Contractor Firm</th>
          <td><strong>${safeCompany}</strong></td>
        </tr>
        <tr>
          <th>Contact Person</th>
          <td>${safeContact}</td>
        </tr>
        <tr>
          <th>Contact Phone</th>
          <td><a href="tel:${safePhone}" style="color: #c9a35d; font-weight: 700; text-decoration: none;">${safePhone}</a></td>
        </tr>
        <tr>
          <th>Contact Email</th>
          <td><a href="mailto:${safeEmail}" style="color: #2563eb; text-decoration: none;">${safeEmail}</a></td>
        </tr>
        <tr>
          <th>Project Title</th>
          <td><strong>${safeProject}</strong> (${safeType})</td>
        </tr>
        <tr>
          <th>Project Location</th>
          <td>${safeLocation}</td>
        </tr>
        <tr>
          <th>Total Crew Required</th>
          <td><span style="background: #fdfaf3; color: #926f28; padding: 2px 8px; border-radius: 3px; font-weight: 800; font-size: 14px;">${requisition.totalWorkers} Workers</span></td>
        </tr>
        <tr>
          <th>Start Date & Duration</th>
          <td>${safeStartDate} • ${safeDuration}</td>
        </tr>
        <tr>
          <th>Daily Wage Budget</th>
          <td>${safeWage}</td>
        </tr>
        <tr>
          <th>Site Amenities</th>
          <td>${amenitiesList.length > 0 ? amenitiesList.map(escapeHtml).join(", ") : "Standard Site Terms"}</td>
        </tr>
      </table>

      <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin: 18px 0 6px 0;">Required Trade Skills Matrix:</div>
      ${skillsHtml}

      <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin: 18px 0 6px 0;">Special Scope & Notes:</div>
      <div class="notes-box">
        ${safeMessage.replace(/\n/g, "<br>")}
      </div>

      <div style="text-align: center; margin: 28px 0 12px 0;">
        <a href="${adminBaseUrl}" class="action-btn">
          Match Agencies in Control Centre →
        </a>
      </div>
    </div>
    <div class="footer">
      Automated workforce dispatch generated by ${escapeHtml(companyName)} Control System.
    </div>
  </div>
</body>
</html>
    `;

    const recipientList = toAddress
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.includes("@"))
      .map((email) => ({ email }));

    if (recipientList.length === 0) {
      recipientList.push({ email: fromAddress || "sales@dezoryn.com" });
    }

    await dispatchEmail(settings, {
      from: { name: fromName, email: fromAddress },
      to: recipientList,
      subject: `[Workforce #${requisition.requisitionCode}] ${requisition.totalWorkers} Workers Needed - ${requisition.companyName} (${requisition.projectTitle})`,
      html: adminHtml,
      text: `New Labour Requisition from ${requisition.companyName} (${requisition.requisitionCode})\nProject: ${requisition.projectTitle} - ${requisition.locationCity}, ${requisition.locationState}\nWorkers: ${requisition.totalWorkers}\nContact: ${requisition.contactPerson} (${requisition.phone}, ${requisition.email})`,
    });

    let customerSent = false;
    if (settings.email_customer_autoresponder === "true" && requisition.email && requisition.email.includes("@")) {
      const contractorHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Labour Requirement Acknowledgment - ${escapeHtml(companyName)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #334155; margin: 0; padding: 24px 0; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: #090d16; padding: 24px 30px; border-bottom: 3px solid #c9a35d; }
    .header-tag { font-size: 11px; font-weight: 800; color: #c9a35d; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px; }
    .header h1 { margin: 0; font-size: 18px; color: #ffffff; font-weight: 700; }
    .content { padding: 28px 30px; }
    .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 20px 0; font-size: 13px; }
    .footer { background: #f8fafc; padding: 18px 30px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-tag">${escapeHtml(companyName)} Workforce Exchange</div>
      <h1>Labour Requisition Received</h1>
    </div>
    <div class="content">
      <p style="margin-top: 0; font-size: 14px; line-height: 1.6;">
        Dear <strong>${safeContact}</strong>,
      </p>
      <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        We have received your manpower requisition docket <strong>#${escapeHtml(requisition.requisitionCode)}</strong> for project <strong>${safeProject}</strong>.
      </p>
      <div class="summary-card">
        <div style="font-weight: 700; color: #0f172a; margin-bottom: 8px; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">Requisition Details:</div>
        <div>• <strong>Docket Code:</strong> ${escapeHtml(requisition.requisitionCode)}</div>
        <div>• <strong>Total Headcount:</strong> ${requisition.totalWorkers} Workers</div>
        <div>• <strong>Project Location:</strong> ${safeLocation}</div>
        <div>• <strong>Target Start:</strong> ${safeStartDate}</div>
      </div>
      <p style="font-size: 13px; color: #475569; line-height: 1.6;">
        Our industrial workforce coordination desk is matching your trade criteria with verified manpower agencies and skilled crews across ${escapeHtml(requisition.locationState)}. An operations officer will contact you shortly with deployment options.
      </p>
    </div>
    <div class="footer">
      ${escapeHtml(companyName)} • Industrial Workforce & Highway Infrastructure Platform
    </div>
  </div>
</body>
</html>
      `;

      try {
        await dispatchEmail(settings, {
          from: { name: fromName, email: fromAddress },
          to: [{ name: requisition.contactPerson, email: requisition.email }],
          subject: `Labour Requisition Confirmed - ${companyName} (Docket #${requisition.requisitionCode})`,
          html: contractorHtml,
          text: `Dear ${requisition.contactPerson},\n\nYour labour requirement for ${requisition.projectTitle} (Docket #${requisition.requisitionCode}, ${requisition.totalWorkers} workers) has been registered. Our operations desk will contact you with matching agency crews shortly.`,
        });
        customerSent = true;
      } catch (err: any) {
        console.warn("⚠️ [EmailService] Failed to send requisition customer acknowledgment:", err.message);
      }
    }

    console.log(`✅ [EmailService] Workforce requisition email notification dispatched for Docket #${requisition.requisitionCode}`);
    return { success: true, adminSent: true, customerSent };
  } catch (err: any) {
    console.error("❌ [EmailService] Error dispatching workforce requisition notification:", err.message);
    return { success: false, reason: err.message };
  }
}

/**
 * Dispatches transactional email notifications when a labour agency registers
 */
export async function sendLabourAgencyNotifications(
  agency: LabourAgency
): Promise<{
  success: boolean;
  skipped?: boolean;
  reason?: string;
  adminSent?: boolean;
  customerSent?: boolean;
}> {
  try {
    const settings = await getSettings();

    if (settings.email_notifications_enabled !== "true") {
      return { success: true, skipped: true, reason: "notifications_disabled" };
    }

    const apiKey = (settings.brevo_smtp_key || process.env.BREVO_SMTP_KEY || "").trim();
    if (!apiKey) {
      return { success: true, skipped: true, reason: "smtp_not_configured" };
    }

    const companyName = (settings.company_name || "Dezoryn Contractor").trim();
    const fromAddress = (settings.email_from_address || "sales@dezoryn.com").trim();
    const fromName = (settings.email_from_name || `${companyName} Agency Onboarding Desk`).trim();
    const toAddress = (settings.email_admin_recipient || settings.email || "sales@dezoryn.com").trim();
    const adminBaseUrl = process.env.ADMIN_BASE_URL || "http://localhost:3001";

    const safeAgency = escapeHtml(agency.agencyName);
    const safeProprietor = escapeHtml(agency.proprietorName);
    const safePhone = escapeHtml(agency.phone);
    const safeEmail = escapeHtml(agency.email || "None provided");
    const safeGstin = escapeHtml(agency.gstin || "Not provided");
    const safeLicense = escapeHtml(agency.labourLicenseNo || "Not provided");
    const safeLocation = escapeHtml(`${agency.city}, ${agency.state}`);
    const regDate = new Date(agency.createdAt || Date.now()).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });

    let tradesList: string[] = [];
    if (Array.isArray(agency.primaryTrades)) {
      tradesList = agency.primaryTrades;
    } else if (typeof agency.primaryTrades === "string") {
      try {
        tradesList = JSON.parse(agency.primaryTrades);
      } catch {
        tradesList = [];
      }
    }

    let statesList: string[] = [];
    if (Array.isArray(agency.preferredStates)) {
      statesList = agency.preferredStates;
    } else if (typeof agency.preferredStates === "string") {
      try {
        statesList = JSON.parse(agency.preferredStates);
      } catch {
        statesList = [];
      }
    }

    const adminHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>New Labour Supply Agency Onboarded - ${agency.agencyCode}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #334155; margin: 0; padding: 24px 0; }
    .wrapper { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; }
    .header { background: #090d16; padding: 28px 32px; border-bottom: 3px solid #059669; }
    .header-tag { font-size: 11px; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; }
    .header h1 { margin: 0; font-size: 20px; color: #ffffff; font-weight: 700; }
    .content { padding: 32px; }
    .agency-badge { display: inline-block; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; margin-bottom: 20px; }
    .grid-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13.5px; }
    .grid-table th { text-align: left; padding: 9px 12px; background: #f8fafc; color: #64748b; font-weight: 600; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; width: 35%; }
    .grid-table td { padding: 9px 12px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 500; }
    .action-btn { display: inline-block; background: #065f46; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: 700; font-size: 13px; letter-spacing: 0.5px; }
    .footer { background: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-tag">${escapeHtml(companyName)} Manpower Network</div>
      <h1>New Labour Agency Registration</h1>
    </div>
    <div class="content">
      <div class="agency-badge">⚡ Agency Code #${escapeHtml(agency.agencyCode)} • ${regDate}</div>
      <p style="margin: 0 0 18px 0; font-size: 14px; color: #475569;">
        A new manpower supply firm has registered and is pending operational verification.
      </p>

      <table class="grid-table">
        <tr>
          <th>Agency Name</th>
          <td><strong>${safeAgency}</strong></td>
        </tr>
        <tr>
          <th>Proprietor / Head</th>
          <td>${safeProprietor}</td>
        </tr>
        <tr>
          <th>Phone Number</th>
          <td><a href="tel:${safePhone}" style="color: #059669; font-weight: 700; text-decoration: none;">${safePhone}</a></td>
        </tr>
        <tr>
          <th>Email Address</th>
          <td>${agency.email ? `<a href="mailto:${safeEmail}" style="color: #2563eb; text-decoration: none;">${safeEmail}</a>` : "Not provided"}</td>
        </tr>
        <tr>
          <th>Base Headquarters</th>
          <td>${safeLocation}</td>
        </tr>
        <tr>
          <th>Total Crew Capacity</th>
          <td><span style="background: #ecfdf5; color: #065f46; padding: 2px 8px; border-radius: 3px; font-weight: 800; font-size: 14px;">${agency.totalCrewSize} Labourers</span></td>
        </tr>
        <tr>
          <th>GSTIN Number</th>
          <td>${safeGstin}</td>
        </tr>
        <tr>
          <th>Labour License</th>
          <td>${safeLicense}</td>
        </tr>
        <tr>
          <th>Availability</th>
          <td>${escapeHtml(agency.availability || "Immediate")}</td>
        </tr>
        <tr>
          <th>Operational Trades</th>
          <td>${tradesList.length > 0 ? tradesList.map(escapeHtml).join(", ") : "All Civil Trades"}</td>
        </tr>
        <tr>
          <th>State Coverage</th>
          <td>${statesList.length > 0 ? statesList.map(escapeHtml).join(", ") : safeLocation}</td>
        </tr>
      </table>

      <div style="text-align: center; margin: 28px 0 12px 0;">
        <a href="${adminBaseUrl}" class="action-btn">
          Verify Agency in Control Centre →
        </a>
      </div>
    </div>
    <div class="footer">
      Automated alert generated by ${escapeHtml(companyName)} Control System.
    </div>
  </div>
</body>
</html>
    `;

    const recipientList = toAddress
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.includes("@"))
      .map((email) => ({ email }));

    if (recipientList.length === 0) {
      recipientList.push({ email: fromAddress || "sales@dezoryn.com" });
    }

    await dispatchEmail(settings, {
      from: { name: fromName, email: fromAddress },
      to: recipientList,
      subject: `[Agency #${agency.agencyCode}] New Manpower Partner - ${agency.agencyName} (${agency.totalCrewSize} Workers, ${agency.city})`,
      html: adminHtml,
      text: `New Labour Agency Registered: ${agency.agencyName} (${agency.agencyCode})\nProprietor: ${agency.proprietorName}\nPhone: ${agency.phone}\nCrew Size: ${agency.totalCrewSize}\nLocation: ${agency.city}, ${agency.state}`,
    });

    let customerSent = false;
    if (settings.email_customer_autoresponder === "true" && agency.email && agency.email.includes("@")) {
      const agencyHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Partner Registration Received - ${escapeHtml(companyName)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #334155; margin: 0; padding: 24px 0; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: #090d16; padding: 24px 30px; border-bottom: 3px solid #059669; }
    .header-tag { font-size: 11px; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px; }
    .header h1 { margin: 0; font-size: 18px; color: #ffffff; font-weight: 700; }
    .content { padding: 28px 30px; }
    .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 20px 0; font-size: 13px; }
    .footer { background: #f8fafc; padding: 18px 30px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-tag">${escapeHtml(companyName)} Manpower Network</div>
      <h1>Agency Registration Received</h1>
    </div>
    <div class="content">
      <p style="margin-top: 0; font-size: 14px; line-height: 1.6;">
        Dear <strong>${safeProprietor}</strong>,
      </p>
      <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        Thank you for enrolling <strong>${safeAgency}</strong> with the Dezoryn Industrial Workforce Exchange. Your partner docket code is <strong>#${escapeHtml(agency.agencyCode)}</strong>.
      </p>
      <div class="summary-card">
        <div style="font-weight: 700; color: #0f172a; margin-bottom: 8px; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">Registered Details:</div>
        <div>• <strong>Agency Docket:</strong> ${escapeHtml(agency.agencyCode)}</div>
        <div>• <strong>Registered Crew:</strong> ${agency.totalCrewSize} Labourers</div>
        <div>• <strong>Headquarters:</strong> ${safeLocation}</div>
        <div>• <strong>Verification Status:</strong> Verification In Progress</div>
      </div>
      <p style="font-size: 13px; color: #475569; line-height: 1.6;">
        Our team verifies agency credentials before direct allocation to highway and expressway projects. We will reach out once matching contractor requisitions become available in your operational territory.
      </p>
    </div>
    <div class="footer">
      ${escapeHtml(companyName)} • Industrial Highway Contractor Platform
    </div>
  </div>
</body>
</html>
      `;

      try {
        await dispatchEmail(settings, {
          from: { name: fromName, email: fromAddress },
          to: [{ name: agency.proprietorName, email: agency.email }],
          subject: `Manpower Partner Registration Received - ${companyName} (Agency #${agency.agencyCode})`,
          html: agencyHtml,
          text: `Dear ${agency.proprietorName},\n\nYour agency ${agency.agencyName} (Agency #${agency.agencyCode}) has been registered in the Dezoryn Manpower Network. Our verification desk will review your profile shortly.`,
        });
        customerSent = true;
      } catch (err: any) {
        console.warn("⚠️ [EmailService] Failed to send agency customer acknowledgment:", err.message);
      }
    }

    console.log(`✅ [EmailService] Labour agency email notification dispatched for Agency #${agency.agencyCode}`);
    return { success: true, adminSent: true, customerSent };
  } catch (err: any) {
    console.error("❌ [EmailService] Error dispatching labour agency notification:", err.message);
    return { success: false, reason: err.message };
  }
}

/**
 * Dispatches transactional email notifications when an individual skilled artisan registers
 */
export async function sendIndividualWorkerNotification(
  worker: IndividualWorker
): Promise<{
  success: boolean;
  skipped?: boolean;
  reason?: string;
  adminSent?: boolean;
}> {
  try {
    const settings = await getSettings();

    if (settings.email_notifications_enabled !== "true") {
      return { success: true, skipped: true, reason: "notifications_disabled" };
    }

    const apiKey = (settings.brevo_smtp_key || process.env.BREVO_SMTP_KEY || "").trim();
    if (!apiKey) {
      return { success: true, skipped: true, reason: "smtp_not_configured" };
    }

    const companyName = (settings.company_name || "Dezoryn Contractor").trim();
    const fromAddress = (settings.email_from_address || "sales@dezoryn.com").trim();
    const fromName = (settings.email_from_name || `${companyName} Skill Registry`).trim();
    const toAddress = (settings.email_admin_recipient || settings.email || "sales@dezoryn.com").trim();
    const adminBaseUrl = process.env.ADMIN_BASE_URL || "http://localhost:3001";

    const safeName = escapeHtml(worker.fullName);
    const safePhone = escapeHtml(worker.phone);
    const safeTrade = escapeHtml(worker.trade);
    const safeLocation = escapeHtml(`${worker.currentCity}, ${worker.currentState}`);
    const safeWage = escapeHtml(worker.dailyWageExpect || "Standard Daily Rate");
    const regDate = new Date(worker.createdAt || Date.now()).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });

    const adminHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>New Artisan Enrolled - ${worker.workerCode}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #334155; margin: 0; padding: 24px 0; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; }
    .header { background: #090d16; padding: 24px 30px; border-bottom: 3px solid #2563eb; }
    .header-tag { font-size: 11px; font-weight: 800; color: #60a5fa; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px; }
    .header h1 { margin: 0; font-size: 18px; color: #ffffff; font-weight: 700; }
    .content { padding: 28px 30px; }
    .grid-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13.5px; }
    .grid-table th { text-align: left; padding: 9px 12px; background: #f8fafc; color: #64748b; font-weight: 600; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; width: 35%; }
    .grid-table td { padding: 9px 12px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 500; }
    .action-btn { display: inline-block; background: #0f172a; color: #ffffff !important; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-weight: 700; font-size: 13px; }
    .footer { background: #f8fafc; padding: 18px 30px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-tag">${escapeHtml(companyName)} Artisan Registry</div>
      <h1>New Direct Worker Enrollment</h1>
    </div>
    <div class="content">
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #475569;">
        A skilled artisan has registered for highway deployment in the skill pool.
      </p>

      <table class="grid-table">
        <tr>
          <th>Worker Code</th>
          <td><strong>${escapeHtml(worker.workerCode)}</strong></td>
        </tr>
        <tr>
          <th>Artisan Name</th>
          <td><strong>${safeName}</strong></td>
        </tr>
        <tr>
          <th>Primary Trade</th>
          <td><strong style="color: #2563eb;">${safeTrade}</strong></td>
        </tr>
        <tr>
          <th>Experience</th>
          <td>${worker.experienceYears} Years</td>
        </tr>
        <tr>
          <th>Phone Number</th>
          <td><a href="tel:${safePhone}" style="color: #c9a35d; font-weight: 700; text-decoration: none;">${safePhone}</a></td>
        </tr>
        <tr>
          <th>Location</th>
          <td>${safeLocation}</td>
        </tr>
        <tr>
          <th>Daily Wage Expectation</th>
          <td>${safeWage}</td>
        </tr>
        <tr>
          <th>Willing to Relocate</th>
          <td>${worker.canRelocate ? "Yes (Pan-India / Inter-State)" : "Local Sites Only"}</td>
        </tr>
        <tr>
          <th>Registered At</th>
          <td>${regDate}</td>
        </tr>
      </table>

      <div style="text-align: center; margin: 24px 0 8px 0;">
        <a href="${adminBaseUrl}" class="action-btn">
          View in Worker Registry →
        </a>
      </div>
    </div>
    <div class="footer">
      Automated notification generated by ${escapeHtml(companyName)} Control System.
    </div>
  </div>
</body>
</html>
    `;

    const recipientList = toAddress
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.includes("@"))
      .map((email) => ({ email }));

    if (recipientList.length === 0) {
      recipientList.push({ email: fromAddress || "sales@dezoryn.com" });
    }

    await dispatchEmail(settings, {
      from: { name: fromName, email: fromAddress },
      to: recipientList,
      subject: `[Worker #${worker.workerCode}] ${worker.fullName} (${worker.trade} • ${worker.experienceYears}y exp)`,
      html: adminHtml,
      text: `New Worker Registered: ${worker.fullName} (${worker.workerCode})\nTrade: ${worker.trade}\nExperience: ${worker.experienceYears} Years\nPhone: ${worker.phone}\nLocation: ${worker.currentCity}, ${worker.currentState}`,
    });

    console.log(`✅ [EmailService] Worker registration email notification dispatched for Worker #${worker.workerCode}`);
    return { success: true, adminSent: true };
  } catch (err: any) {
    console.error("❌ [EmailService] Error dispatching worker registration notification:", err.message);
    return { success: false, reason: err.message };
  }
}

/**
 * Diagnostic test email function for Admin Portal verification
 */
export async function sendTestEmail(targetEmail: string): Promise<{
  success: boolean;
  messageId?: string;
  host?: string;
  port?: number;
  transport?: string;
}> {
  const cleanEmail = (targetEmail || "").trim();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    throw new Error("Please provide a valid email address to receive the test message.");
  }

  const settings = await getSettings();
  const apiKey = (settings.brevo_smtp_key || process.env.BREVO_SMTP_KEY || "").trim();

  if (!apiKey) {
    throw new Error(
      "Brevo Master Key is not configured. Please enter your Brevo Key in the settings above."
    );
  }

  const companyName = (settings.company_name || "Dezoryn Contractor").trim();
  const fromAddress = (settings.email_from_address || "sales@dezoryn.com").trim();
  const fromName = (settings.email_from_name || `${companyName} Control Centre`).trim();
  const host = (settings.brevo_smtp_host || "smtp-relay.brevo.com").trim();
  const port = Number(settings.brevo_smtp_port || 587);

  const testHtml = `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; padding: 20px; color: #0f172a;">
  <div style="max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; background: #ffffff;">
    <h2 style="color: #059669; margin-top: 0;">✓ Brevo Connection Successful</h2>
    <p style="font-size: 14px; color: #475569;">
      This test message confirms that your <strong>Brevo (Sendinblue) Service</strong> is properly authenticated and communicating with <strong>${escapeHtml(companyName)}</strong>.
    </p>
    <div style="background: #f8fafc; border-left: 3px solid #059669; padding: 12px; font-size: 13px; margin: 16px 0;">
      <div>• <strong>Sender:</strong> ${escapeHtml(fromName)} &lt;${escapeHtml(fromAddress)}&gt;</div>
      <div>• <strong>Timestamp:</strong> ${new Date().toISOString()}</div>
    </div>
    <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">
      Future quotation requests submitted on the website will be delivered to your configured notification email automatically.
    </p>
  </div>
</body>
</html>
  `;

  const result = await dispatchEmail(settings, {
    from: { name: fromName, email: fromAddress },
    to: [{ email: cleanEmail }],
    subject: `[Test] Brevo Connection Verification - ${companyName}`,
    html: testHtml,
    text: `Brevo Connection Verified successfully at ${new Date().toISOString()}`,
  });

  return {
    success: true,
    messageId: result.messageId,
    host,
    port,
    transport: result.transport,
  };
}
