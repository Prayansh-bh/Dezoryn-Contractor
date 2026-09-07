import nodemailer from "nodemailer";
import { getSettings } from "./settings.service";
import type { Enquiry, LabourRequisition, LabourAgency, IndividualWorker } from "@shared/types";
import {
  escapeHtml,
  renderAdminEnquiryEmail,
  renderCustomerEnquiryAutoresponder,
  renderAdminRequisitionEmail,
  renderContractorRequisitionAutoresponder,
  renderAdminAgencyEmail,
  renderAgencyAutoresponder,
  renderAdminWorkerEmail,
  renderTestEmail,
} from "./email-templates";

export { escapeHtml };

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

  // 1. If an API Key (xkeysib-...) is provided, use HTTPS REST API directly (fastest, unblockable across cloud hosts)
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
            "Brevo Cloud Firewall Warning: Outbound SMTP ports (587/465) are blocked by cloud hosting firewalls. To enable unblockable HTTPS email delivery, please create an API Key (xkeysib-...) from Brevo Dashboard → 'SMTP & API' → 'API Keys' tab and enter it as your Brevo Master Key."
          );
        }
      }
    }

    throw new Error(formatEmailError(smtpErr));
  }
}

function resolveSenderAndRecipients(settings: Record<string, string>, defaultDesk: string = "Commercial Desk") {
  const companyName = (settings.company_name || "Dezoryn Contractor").trim();
  const fromAddress = (settings.email_from_address || "sales@dezoryn.com").trim();
  const fromName = (settings.email_from_name || `${companyName} ${defaultDesk}`).trim();
  const toAddress = (settings.email_admin_recipient || settings.email || "sales@dezoryn.com").trim();
  const adminBaseUrl = process.env.ADMIN_BASE_URL || "http://localhost:3001";

  const recipientList = toAddress
    .split(",")
    .map((e) => e.trim())
    .filter((e) => e.includes("@"))
    .map((email) => ({ email }));

  if (recipientList.length === 0) {
    recipientList.push({ email: fromAddress || "sales@dezoryn.com" });
  }

  return { companyName, fromAddress, fromName, recipientList, adminBaseUrl };
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

    if (settings.email_notifications_enabled !== "true") {
      return { success: true, skipped: true, reason: "notifications_disabled" };
    }

    const apiKey = (settings.brevo_smtp_key || process.env.BREVO_SMTP_KEY || "").trim();
    if (!apiKey) {
      return { success: true, skipped: true, reason: "smtp_not_configured" };
    }

    const { fromName, fromAddress, recipientList, adminBaseUrl } = resolveSenderAndRecipients(
      settings,
      "Commercial Desk"
    );

    // 1. Admin Lead Alert
    const adminTemplate = renderAdminEnquiryEmail(enquiry, settings, adminBaseUrl);
    await dispatchEmail(settings, {
      from: { name: fromName, email: fromAddress },
      to: recipientList,
      subject: adminTemplate.subject,
      html: adminTemplate.html,
      text: adminTemplate.text,
    });

    let customerSent = false;

    // 2. Customer Acknowledgment Auto-Responder
    if (settings.email_customer_autoresponder === "true" && enquiry.email && enquiry.email.includes("@")) {
      const customerTemplate = renderCustomerEnquiryAutoresponder(enquiry, settings);
      try {
        await dispatchEmail(settings, {
          from: { name: fromName, email: fromAddress },
          to: [{ name: enquiry.name, email: enquiry.email }],
          subject: customerTemplate.subject,
          html: customerTemplate.html,
          text: customerTemplate.text,
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

    const { fromName, fromAddress, recipientList, adminBaseUrl } = resolveSenderAndRecipients(
      settings,
      "Workforce Operations"
    );

    // 1. Admin Requisition Alert
    const adminTemplate = renderAdminRequisitionEmail(requisition, settings, adminBaseUrl);
    await dispatchEmail(settings, {
      from: { name: fromName, email: fromAddress },
      to: recipientList,
      subject: adminTemplate.subject,
      html: adminTemplate.html,
      text: adminTemplate.text,
    });

    let customerSent = false;

    // 2. Contractor Confirmation Auto-responder
    if (settings.email_customer_autoresponder === "true" && requisition.email && requisition.email.includes("@")) {
      const contractorTemplate = renderContractorRequisitionAutoresponder(requisition, settings);
      try {
        await dispatchEmail(settings, {
          from: { name: fromName, email: fromAddress },
          to: [{ name: requisition.contactPerson, email: requisition.email }],
          subject: contractorTemplate.subject,
          html: contractorTemplate.html,
          text: contractorTemplate.text,
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

    const { fromName, fromAddress, recipientList, adminBaseUrl } = resolveSenderAndRecipients(
      settings,
      "Agency Onboarding Desk"
    );

    // 1. Admin Agency Onboarding Alert
    const adminTemplate = renderAdminAgencyEmail(agency, settings, adminBaseUrl);
    await dispatchEmail(settings, {
      from: { name: fromName, email: fromAddress },
      to: recipientList,
      subject: adminTemplate.subject,
      html: adminTemplate.html,
      text: adminTemplate.text,
    });

    let customerSent = false;

    // 2. Agency Confirmation Auto-responder
    if (settings.email_customer_autoresponder === "true" && agency.email && agency.email.includes("@")) {
      const agencyTemplate = renderAgencyAutoresponder(agency, settings);
      try {
        await dispatchEmail(settings, {
          from: { name: fromName, email: fromAddress },
          to: [{ name: agency.proprietorName, email: agency.email }],
          subject: agencyTemplate.subject,
          html: agencyTemplate.html,
          text: agencyTemplate.text,
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

    const { fromName, fromAddress, recipientList, adminBaseUrl } = resolveSenderAndRecipients(
      settings,
      "Skill Registry"
    );

    const workerTemplate = renderAdminWorkerEmail(worker, settings, adminBaseUrl);
    await dispatchEmail(settings, {
      from: { name: fromName, email: fromAddress },
      to: recipientList,
      subject: workerTemplate.subject,
      html: workerTemplate.html,
      text: workerTemplate.text,
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

  const testTemplate = renderTestEmail(settings, fromName, fromAddress);

  const result = await dispatchEmail(settings, {
    from: { name: fromName, email: fromAddress },
    to: [{ email: cleanEmail }],
    subject: testTemplate.subject,
    html: testTemplate.html,
    text: testTemplate.text,
  });

  return {
    success: true,
    messageId: result.messageId,
    host,
    port,
    transport: result.transport,
  };
}
