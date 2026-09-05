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

    const transporter = createTransporter(settings);
    if (!transporter) {
      console.warn("⚠️ [EmailService] Brevo SMTP credentials not configured in settings. Skipping email dispatch.");
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
    await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: toAddress,
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
        await transporter.sendMail({
          from: `"${fromName}" <${fromAddress}>`,
          to: enquiry.email,
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
}> {
  const cleanEmail = (targetEmail || "").trim();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    throw new Error("Please provide a valid email address to receive the test message.");
  }

  const settings = await getSettings();
  const transporter = createTransporter(settings);

  if (!transporter) {
    throw new Error(
      "Brevo SMTP is not configured. Please enter both Brevo SMTP User (Login) and Brevo SMTP Key."
    );
  }

  // Verify SMTP handshake
  await transporter.verify();

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
    <h2 style="color: #059669; margin-top: 0;">✓ Brevo SMTP Connection Successful</h2>
    <p style="font-size: 14px; color: #475569;">
      This test message confirms that your <strong>Brevo (Sendinblue) SMTP Relay</strong> is properly authenticated and communicating with <strong>${escapeHtml(companyName)}</strong>.
    </p>
    <div style="background: #f8fafc; border-left: 3px solid #059669; padding: 12px; font-size: 13px; margin: 16px 0;">
      <div>• <strong>Host:</strong> ${escapeHtml(host)}:${port}</div>
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

  const info = await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to: cleanEmail,
    subject: `[Test] Brevo SMTP Verification - ${companyName}`,
    html: testHtml,
    text: `Brevo SMTP Connection Verified successfully on ${host}:${port} at ${new Date().toISOString()}`,
  });

  return {
    success: true,
    messageId: info.messageId,
    host,
    port,
  };
}
