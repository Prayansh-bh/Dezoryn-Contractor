import { escapeHtml } from "./template-helpers";
import type { LabourRequisition } from "@shared/types";

/**
 * requisition-templates.ts
 * Single Responsibility: Generates executive HTML email markup for Contractor Labour Requisitions
 * (Admin Manpower Alerts & Contractor Confirmation Auto-responders).
 */

export function renderAdminRequisitionEmail(
  requisition: LabourRequisition,
  settings: Record<string, string>,
  adminBaseUrl: string = "http://localhost:3001"
): { html: string; text: string; subject: string } {
  const companyName = (settings.company_name || "Dezoryn Contractor").trim();
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

  const html = `
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

  return {
    subject: `[Workforce #${requisition.requisitionCode}] ${requisition.totalWorkers} Workers Needed - ${requisition.companyName} (${requisition.projectTitle})`,
    html,
    text: `New Labour Requisition from ${requisition.companyName} (${requisition.requisitionCode})\nProject: ${requisition.projectTitle} - ${requisition.locationCity}, ${requisition.locationState}\nWorkers: ${requisition.totalWorkers}\nContact: ${requisition.contactPerson} (${requisition.phone}, ${requisition.email})`,
  };
}

export function renderContractorRequisitionAutoresponder(
  requisition: LabourRequisition,
  settings: Record<string, string>
): { html: string; text: string; subject: string } {
  const companyName = (settings.company_name || "Dezoryn Contractor").trim();
  const safeContact = escapeHtml(requisition.contactPerson);
  const safeProject = escapeHtml(requisition.projectTitle);
  const safeLocation = escapeHtml(`${requisition.locationCity}, ${requisition.locationState}`);
  const safeStartDate = escapeHtml(requisition.startDate || "Immediate");

  const html = `
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

  return {
    subject: `Labour Requisition Confirmed - ${companyName} (Docket #${requisition.requisitionCode})`,
    html,
    text: `Dear ${requisition.contactPerson},\n\nYour labour requirement for ${requisition.projectTitle} (Docket #${requisition.requisitionCode}, ${requisition.totalWorkers} workers) has been registered. Our operations desk will contact you with matching agency crews shortly.`,
  };
}
