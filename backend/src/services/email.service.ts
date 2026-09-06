import nodemailer from "nodemailer";
import { getSettings } from "./settings.service";
import type { Enquiry } from "@shared/types";

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

    // Send admin lead email
    await dispatchEmail(settings, {
      from: { name: fromName, email: fromAddress },
      to: [{ email: toAddress }],
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
