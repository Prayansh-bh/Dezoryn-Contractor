import { escapeHtml } from "./template-helpers";
import type { Enquiry } from "@shared/types";

/**
 * enquiry-templates.ts
 * Single Responsibility: Generates executive HTML email markup for B2B product quotation inquiries
 * (Admin Lead Alerts & Customer Auto-responders).
 */

export function renderAdminEnquiryEmail(
  enquiry: Enquiry,
  settings: Record<string, string>,
  adminBaseUrl: string = "http://localhost:3001"
): { html: string; text: string; subject: string } {
  const companyName = (settings.company_name || "Dezoryn Contractor").trim();
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

  const html = `
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

  return {
    subject: `[New Lead #ENQ-${enquiry.id}] BOQ Quote Request - ${enquiry.company} (${enquiry.product})`,
    html,
    text: `New BOQ Quotation Request from ${enquiry.name} (${enquiry.company})\nPhone: ${enquiry.phone}\nEmail: ${enquiry.email}\nProduct: ${enquiry.product}\nQuantity: ${enquiry.quantity}\nLocation: ${enquiry.location}\nNotes: ${enquiry.message || "None"}`,
  };
}

export function renderCustomerEnquiryAutoresponder(
  enquiry: Enquiry,
  settings: Record<string, string>
): { html: string; text: string; subject: string } {
  const companyName = (settings.company_name || "Dezoryn Contractor").trim();
  const safeName = escapeHtml(enquiry.name);
  const safeCompany = escapeHtml(enquiry.company);
  const safeProduct = escapeHtml(enquiry.product);
  const safeQuantity = escapeHtml(enquiry.quantity);
  const safeLocation = escapeHtml(enquiry.location);

  const html = `
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

  return {
    subject: `Quotation Request Received - ${companyName} (Ref #ENQ-${enquiry.id})`,
    html,
    text: `Dear ${enquiry.name},\n\nThank you for reaching out to ${companyName}. We have received your quotation request for ${enquiry.product} (${enquiry.quantity}). Our sales team will get back to you shortly.`,
  };
}
