import { escapeHtml } from "./template-helpers";
import type { LabourAgency } from "@shared/types";

/**
 * agency-templates.ts
 * Single Responsibility: Generates executive HTML email markup for Labour Agency Registrations
 * (Admin Partner Alerts & Agency Confirmation Auto-responders).
 */

export function renderAdminAgencyEmail(
  agency: LabourAgency,
  settings: Record<string, string>,
  adminBaseUrl: string = "http://localhost:3001"
): { html: string; text: string; subject: string } {
  const companyName = (settings.company_name || "Dezoryn Contractor").trim();
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

  const html = `
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

  return {
    subject: `[Agency #${agency.agencyCode}] New Manpower Partner - ${agency.agencyName} (${agency.totalCrewSize} Workers, ${agency.city})`,
    html,
    text: `New Labour Agency Registered: ${agency.agencyName} (${agency.agencyCode})\nProprietor: ${agency.proprietorName}\nPhone: ${agency.phone}\nCrew Size: ${agency.totalCrewSize}\nLocation: ${agency.city}, ${agency.state}`,
  };
}

export function renderAgencyAutoresponder(
  agency: LabourAgency,
  settings: Record<string, string>
): { html: string; text: string; subject: string } {
  const companyName = (settings.company_name || "Dezoryn Contractor").trim();
  const safeAgency = escapeHtml(agency.agencyName);
  const safeProprietor = escapeHtml(agency.proprietorName);
  const safeLocation = escapeHtml(`${agency.city}, ${agency.state}`);

  const html = `
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

  return {
    subject: `Manpower Partner Registration Received - ${companyName} (Agency #${agency.agencyCode})`,
    html,
    text: `Dear ${agency.proprietorName},\n\nYour agency ${agency.agencyName} (Agency #${agency.agencyCode}) has been registered in the Dezoryn Manpower Network. Our verification desk will review your profile shortly.`,
  };
}
