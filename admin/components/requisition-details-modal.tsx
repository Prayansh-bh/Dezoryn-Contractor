import { X } from "lucide-react";
import type { LabourRequisition } from "@shared/types";

interface RequisitionDetailsModalProps {
  requisition: LabourRequisition | null;
  onClose: () => void;
}

/**
 * RequisitionDetailsModal
 * Single Responsibility: Display detailed contractor requisition breakdown, trade headcount matrix,
 * site amenities, and logistical scope notes in an executive modal view.
 */
export function RequisitionDetailsModal({
  requisition,
  onClose,
}: RequisitionDetailsModalProps) {
  if (!requisition) return null;

  const skills = Array.isArray(requisition.skillsRequired)
    ? requisition.skillsRequired
    : [];
  const amenities = Array.isArray(requisition.amenities)
    ? requisition.amenities
    : [];

  return (
    <div className="admin-modal" onClick={onClose}>
      <div
        className="editor details-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="requisition-modal-title"
      >
        <div className="editor-head">
          <div>
            <span className="section-label">
              <span /> REQUISITION DETAILS
            </span>
            <h2 id="requisition-modal-title">
              {requisition.requisitionCode} • {requisition.projectTitle}
            </h2>
          </div>
          <button
            type="button"
            className="editor-close"
            onClick={onClose}
            aria-label="Close requisition details modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="editor-body">
          <div className="details-grid">
            <div className="details-item">
              <label>Contractor / Firm Name</label>
              <strong>{requisition.companyName}</strong>
            </div>
            <div className="details-item">
              <label>Authorized Contact</label>
              <strong>{requisition.contactPerson}</strong>
            </div>
            <div className="details-item">
              <label>Direct Phone</label>
              <a
                href={`tel:${requisition.phone}`}
                style={{ color: "var(--amber-primary)", fontWeight: 700 }}
              >
                {requisition.phone}
              </a>
            </div>
            <div className="details-item">
              <label>Email Address</label>
              <strong>{requisition.email}</strong>
            </div>
            <div className="details-item">
              <label>Project Site Location</label>
              <strong>
                {requisition.locationCity}, {requisition.locationState}
              </strong>
            </div>
            <div className="details-item">
              <label>Project Classification</label>
              <strong>{requisition.projectType}</strong>
            </div>
            <div className="details-item">
              <label>Deployment Duration</label>
              <strong>{requisition.durationMonths || "Project based"}</strong>
            </div>
            <div className="details-item">
              <label>Total Workforce Required</label>
              <strong style={{ color: "var(--amber-dark)" }}>
                {requisition.totalWorkers} Personnel
              </strong>
            </div>
          </div>

          {/* Trade Matrix Table */}
          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--text-dim)",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Trade Headcount Matrix Breakdown
            </label>
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Trade Discipline</th>
                    <th style={{ textAlign: "right" }}>Required Headcount</th>
                  </tr>
                </thead>
                <tbody>
                  {skills.map((s: any, idx: number) => (
                    <tr key={idx}>
                      <td>
                        <b>{typeof s === "string" ? s : s.trade}</b>
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          fontWeight: 700,
                          color: "var(--amber-dark)",
                        }}
                      >
                        {typeof s === "string" ? "—" : `${s.count} Workers`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Amenities Provided */}
          {amenities.length > 0 && (
            <div style={{ marginBottom: "18px" }}>
              <label
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--text-dim)",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Site Amenities & Logistics Provided
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {amenities.map((a: string, idx: number) => (
                  <span
                    key={idx}
                    className="trade-tag"
                    style={{
                      background: "#ecfdf5",
                      color: "#065f46",
                      border: "1px solid #a7f3d0",
                    }}
                  >
                    ✓ {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Additional Scope Message */}
          {requisition.message && (
            <div>
              <label
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--text-dim)",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Scope Notes
              </label>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  background: "#f8fafc",
                  padding: "12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                }}
              >
                {requisition.message}
              </p>
            </div>
          )}
        </div>

        <div className="editor-foot">
          <button
            type="button"
            className="btn-confirm-cancel"
            onClick={onClose}
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
