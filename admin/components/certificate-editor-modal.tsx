import { useState, useRef } from "react";
import { Award, Check, Image as ImageIcon, Loader2, UploadCloud, X } from "lucide-react";
import type { Certificate } from "@shared/types";
import { uploadCertificateImage } from "../src/api";

interface CertificateEditorModalProps {
  item: Partial<Certificate> | null;
  close: () => void;
  save: (c: Partial<Certificate>) => Promise<void>;
}

/**
 * CertificateEditorModal
 * Single Responsibility: Modal form for creating and editing official certifications,
 * handling certificate image file uploads (.png, .jpg, .webp) with real-time preview.
 */
export function CertificateEditorModal({
  item,
  close,
  save,
}: CertificateEditorModalProps) {
  const [title, setTitle] = useState(item?.title || "");
  const [subtitle, setSubtitle] = useState(item?.subtitle || "");
  const [issuer, setIssuer] = useState(item?.issuer || "");
  const [certificateNo, setCertificateNo] = useState(item?.certificateNo || "");
  const [validUntil, setValidUntil] = useState(item?.validUntil || "");
  const [imageUrl, setImageUrl] = useState(item?.imageUrl || "");
  const [fileName, setFileName] = useState(item?.fileName || "");
  const [active, setActive] = useState(item?.active ?? true);
  const [sortOrder, setSortOrder] = useState(item?.sortOrder || 0);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate mime type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image file (.png, .jpg, .jpeg, or .webp)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image file size must be less than 10MB");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadCertificateImage(formData);
      if (res.imageUrl) {
        setImageUrl(res.imageUrl);
        setFileName(res.fileName || file.name);
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload certificate image");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Certificate title is required");
      return;
    }
    if (!issuer.trim()) {
      setError("Issuer / Authority is required");
      return;
    }
    if (!imageUrl.trim()) {
      setError("Please upload a certificate image or provide an image URL");
      return;
    }

    setError("");
    setSaving(true);
    try {
      await save({
        id: item?.id,
        title: title.trim(),
        subtitle: subtitle.trim(),
        issuer: issuer.trim(),
        certificateNo: certificateNo.trim(),
        validUntil: validUntil.trim(),
        imageUrl: imageUrl.trim(),
        fileName: fileName.trim(),
        active,
        sortOrder: Number(sortOrder) || 0,
      });
      close();
    } catch (err: any) {
      setError(err.message || "Failed to save certificate");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-modal" onClick={close}>
      <form
        className="editor"
        style={{ maxWidth: "680px" }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="editor-head">
          <div>
            <span className="section-label">
              <span /> {item?.id ? "EDIT CERTIFICATION" : "NEW COMPLIANCE CERTIFICATE"}
            </span>
            <h2>{item?.id ? `Edit ${item.title}` : "Add Official Certificate"}</h2>
          </div>
          <button
            type="button"
            className="editor-close"
            onClick={close}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="editor-body">
          {error && (
            <div
              style={{
                padding: "10px 14px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "4px",
                color: "#991b1b",
                fontSize: "12.5px",
                fontWeight: 600,
                marginBottom: "16px",
              }}
            >
              {error}
            </div>
          )}

          {/* Certificate Image Upload & Preview */}
          <div style={{ marginBottom: "20px" }}>
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
              Certificate Document Image (Required)
            </label>

            {imageUrl ? (
              <div
                style={{
                  position: "relative",
                  borderRadius: "6px",
                  overflow: "hidden",
                  border: "1.5px solid var(--border-subtle)",
                  background: "#f8fafc",
                  padding: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "90px",
                    height: "90px",
                    borderRadius: "4px",
                    overflow: "hidden",
                    border: "1px solid var(--border)",
                    background: "#0f172a",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={imageUrl}
                    alt="Certificate preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ display: "block", fontSize: "13px", color: "var(--text-main)", marginBottom: "4px" }}>
                    {fileName || "Certificate Image Uploaded"}
                  </b>
                  <small style={{ color: "var(--text-dim)", display: "block", marginBottom: "8px", wordBreak: "break-all" }}>
                    {imageUrl}
                  </small>
                  <button
                    type="button"
                    className="table-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? <Loader2 size={13} className="spin" /> : <UploadCloud size={13} />}
                    <span>Replace Image</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: "2px dashed var(--border-subtle)",
                  borderRadius: "6px",
                  padding: "28px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "#f8fafc",
                  transition: "all 0.15s ease",
                }}
              >
                {uploading ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <Loader2 size={28} className="spin text-[#c9a35d]" />
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-main)" }}>
                      Uploading certificate image…
                    </span>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background: "#fffbeb",
                        color: "var(--amber-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "4px",
                      }}
                    >
                      <UploadCloud size={22} />
                    </div>
                    <strong style={{ fontSize: "13.5px", color: "var(--text-main)" }}>
                      Click to upload certificate document image
                    </strong>
                    <span style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>
                      Supports PNG, JPG, JPEG, or WEBP (Max 10MB)
                    </span>
                  </div>
                )}
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/png,image/jpeg,image/webp,image/jpg"
              style={{ display: "none" }}
            />
          </div>

          {/* Form Fields Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
            <div className="form-group" style={{ gridColumn: "span 2" }}>
              <label>Certificate Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. ISO 9001:2015 Quality Management System"
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: "span 2" }}>
              <label>Scope / Subtitle</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Design, Manufacturing & Bulk Supply of Highway Safety Products"
              />
            </div>

            <div className="form-group">
              <label>Issuing Authority / Body *</label>
              <input
                type="text"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="e.g. ISO / MORTH / NABL / IRC / BIS"
                required
              />
            </div>

            <div className="form-group">
              <label>Certificate / Standard Code</label>
              <input
                type="text"
                value={certificateNo}
                onChange={(e) => setCertificateNo(e.target.value)}
                placeholder="e.g. ISO-9001-IND-2024-8902"
              />
            </div>

            <div className="form-group">
              <label>Validity / Expiry Description</label>
              <input
                type="text"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                placeholder="e.g. Valid Thru Dec 2027 / Batch Certified"
              />
            </div>

            <div className="form-group">
              <label>Display Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                min="0"
                placeholder="0"
              />
            </div>
          </div>

          {/* Visibility Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px", padding: "12px", background: "#f8fafc", borderRadius: "6px", border: "1px solid var(--border)" }}>
            <input
              type="checkbox"
              id="cert-active"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              style={{ width: "16px", height: "16px", accentColor: "var(--amber-primary)", cursor: "pointer" }}
            />
            <label htmlFor="cert-active" style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-main)", cursor: "pointer", margin: 0 }}>
              Publish on Homepage & Public Website
            </label>
          </div>
        </div>

        <div className="editor-foot">
          <button
            type="button"
            className="btn-confirm-cancel"
            onClick={close}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="admin-primary"
            disabled={saving || uploading}
          >
            {saving ? <Loader2 size={15} className="spin" /> : <Check size={15} />}
            <span>{item?.id ? "Update Certificate" : "Save & Publish Certificate"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
