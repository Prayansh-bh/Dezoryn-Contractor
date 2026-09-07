import { useState } from "react";
import {
  Award,
  CheckCircle2,
  Eye,
  FileCheck2,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { ConfirmDialog } from "./confirm-dialog";
import { CertificateEditorModal } from "./certificate-editor-modal";
import type { AdminDashboardData, Certificate } from "@shared/types";

interface CertificatesTabProps {
  data: AdminDashboardData;
  action: (payload: any) => Promise<boolean>;
}

/**
 * CertificatesTab
 * Single Responsibility: Management desk for official certificates and accreditations,
 * allowing administrators to view, add, edit, toggle visibility, and remove certificate documents.
 */
export function CertificatesTab({ data, action }: CertificatesTabProps) {
  const [editingCert, setEditingCert] = useState<Partial<Certificate> | null>(null);
  const [certToDelete, setCertToDelete] = useState<Certificate | null>(null);
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);

  const certificates: Certificate[] = data.certificates || [];
  const activeCount = certificates.filter((c) => c.active).length;

  async function handleToggleActive(cert: Certificate) {
    await action({
      action: "toggle_certificate_active",
      id: cert.id,
      active: !cert.active,
    });
  }

  async function handleDelete(cert: Certificate) {
    await action({
      action: "delete_certificate",
      id: cert.id,
    });
    setCertToDelete(null);
  }

  return (
    <section className="admin-content">
      {/* KPI Stats Strip */}
      <div className="stat-grid">
        <div className="stat-card">
          <div>
            <span>Total Accreditations</span>
            <b>{certificates.length}</b>
            <div className="stat-card-sub">Official Documents</div>
          </div>
          <Award />
        </div>

        <div className="stat-card">
          <div>
            <span>Active on Homepage</span>
            <b>{activeCount}</b>
            <div className="stat-card-sub highlight">Publicly Displayed</div>
          </div>
          <ShieldCheck />
        </div>

        <div className="stat-card">
          <div>
            <span>Standard Compliance</span>
            <b>100%</b>
            <div className="stat-card-sub success">ISO • MORTH • NABL • IRC</div>
          </div>
          <FileCheck2 />
        </div>
      </div>

      {/* Main Card */}
      <div className="admin-card">
        <div className="card-head">
          <div>
            <span>
              <span /> ACCREDITATION MANAGEMENT
            </span>
            <h2>Official Compliance & Quality Certificates</h2>
          </div>
          <button
            type="button"
            className="admin-primary"
            onClick={() =>
              setEditingCert({
                active: true,
                sortOrder: certificates.length + 1,
              })
            }
          >
            <Plus size={15} />
            <span>Add New Certificate</span>
          </button>
        </div>

        {!certificates.length ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Award size={26} />
            </div>
            <h3>No Certificates Added Yet</h3>
            <p>
              Upload official quality management and highway compliance documents to display them on the homepage.
            </p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Certificate & Document</th>
                  <th>Issuing Authority</th>
                  <th>Standard / Registration No.</th>
                  <th>Validity Status</th>
                  <th>Visibility</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((cert) => (
                  <tr key={cert.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div
                          style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "4px",
                            overflow: "hidden",
                            background: "#0f172a",
                            border: "1px solid var(--border)",
                            flexShrink: 0,
                            cursor: "pointer",
                            position: "relative",
                          }}
                          onClick={() => setPreviewCert(cert)}
                          title="Click to view high-resolution certificate"
                        >
                          <img
                            src={cert.imageUrl}
                            alt={cert.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>

                        <div>
                          <b
                            style={{ cursor: "pointer" }}
                            onClick={() => setPreviewCert(cert)}
                          >
                            {cert.title}
                          </b>
                          {cert.subtitle && <small>{cert.subtitle}</small>}
                        </div>
                      </div>
                    </td>

                    <td>
                      <b>{cert.issuer}</b>
                    </td>

                    <td>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontWeight: 700,
                          fontSize: "12px",
                          color: "var(--amber-dark)",
                          background: "var(--amber-glow)",
                          padding: "3px 7px",
                          borderRadius: "3px",
                          border: "1px solid var(--border-amber)",
                        }}
                      >
                        {cert.certificateNo || "STANDARD VERIFIED"}
                      </span>
                    </td>

                    <td>
                      <small style={{ fontWeight: 600, color: "#475569" }}>
                        {cert.validUntil || "Active / Certified"}
                      </small>
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(cert)}
                        className={`status-badge ${cert.active ? "verified" : "pending"}`}
                        style={{ cursor: "pointer", border: "1px solid", padding: "5px 10px" }}
                        title="Click to toggle public display on website"
                      >
                        {cert.active ? "✓ Published" : "Hidden"}
                      </button>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="table-btn"
                          title="Preview Document"
                          onClick={() => setPreviewCert(cert)}
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>

                        <button
                          type="button"
                          className="table-btn"
                          title="Edit Certificate Details"
                          onClick={() => setEditingCert(cert)}
                        >
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          className="icon-danger"
                          title="Delete Certificate"
                          onClick={() => setCertToDelete(cert)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Certificate Editor Modal */}
      {editingCert && (
        <CertificateEditorModal
          item={editingCert}
          close={() => setEditingCert(null)}
          save={async (c) => {
            const ok = await action({ action: "save_certificate", ...c });
            if (ok) setEditingCert(null);
          }}
        />
      )}

      {/* High-Resolution Document Image Lightbox */}
      {previewCert && (
        <div className="admin-modal" onClick={() => setPreviewCert(null)}>
          <div
            className="editor"
            style={{ maxWidth: "800px", padding: "24px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="editor-head" style={{ marginBottom: "16px" }}>
              <div>
                <span className="section-label">
                  <span /> OFFICIAL ACCREDITATION DOCUMENT
                </span>
                <h2>{previewCert.title}</h2>
                <small style={{ color: "var(--text-dim)" }}>
                  Issued by {previewCert.issuer} • {previewCert.certificateNo || "Verified Standard"}
                </small>
              </div>
              <button
                type="button"
                className="editor-close"
                onClick={() => setPreviewCert(null)}
                aria-label="Close preview"
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                borderRadius: "6px",
                overflow: "hidden",
                border: "1px solid var(--border)",
                background: "#0f172a",
                maxHeight: "560px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={previewCert.imageUrl}
                alt={previewCert.title}
                style={{
                  maxWidth: "100%",
                  maxHeight: "560px",
                  objectFit: "contain",
                }}
              />
            </div>

            <div className="editor-foot" style={{ marginTop: "16px" }}>
              <button
                type="button"
                className="btn-confirm-cancel"
                onClick={() => setPreviewCert(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Deletion */}
      <ConfirmDialog
        open={Boolean(certToDelete)}
        title="Delete Official Certificate?"
        message={`Are you sure you want to permanently delete "${certToDelete?.title}" (${certToDelete?.issuer})? This will remove it from the public homepage.`}
        confirmText="Delete Certificate"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={async () => {
          if (certToDelete) {
            await handleDelete(certToDelete);
          }
        }}
        onClose={() => setCertToDelete(null)}
      />
    </section>
  );
}
