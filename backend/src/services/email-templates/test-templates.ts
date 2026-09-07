import { escapeHtml } from "./template-helpers";

/**
 * test-templates.ts
 * Single Responsibility: Generates HTML markup for diagnostic Brevo/SMTP connection verification emails.
 */

export function renderTestEmail(
  settings: Record<string, string>,
  fromName: string,
  fromAddress: string
): { html: string; text: string; subject: string } {
  const companyName = (settings.company_name || "Dezoryn Contractor").trim();
  const timestamp = new Date().toISOString();

  const html = `
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
      <div>• <strong>Timestamp:</strong> ${timestamp}</div>
    </div>
    <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">
      Future quotation requests submitted on the website will be delivered to your configured notification email automatically.
    </p>
  </div>
</body>
</html>
  `;

  return {
    subject: `[Test] Brevo Connection Verification - ${companyName}`,
    html,
    text: `Brevo Connection Verified successfully at ${timestamp}`,
  };
}
