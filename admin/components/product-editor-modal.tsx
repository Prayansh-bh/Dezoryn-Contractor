"use client";

import { useState, useRef } from "react";
import { Save, X, Upload, Trash2, Loader2, AlertCircle } from "lucide-react";
import type { Product } from "@shared/types";
import { uploadProductImage } from "../src/api";

export function ProductEditorModal({
  item,
  close,
  save,
}: {
  item: Partial<Product>;
  close: () => void;
  save: (p: Partial<Product>) => Promise<void>;
}) {
  const [p, setP] = useState<Partial<Product>>(item);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(item.imageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const field = (k: keyof Product, v: any) => setP((prev) => ({ ...prev, [k]: v }));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg("Invalid image type. Please select a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("File is too large. Product images must be under 10MB.");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    field("imageUrl", null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setUploading(true);

    try {
      let finalImageUrl = p.imageUrl ?? null;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await uploadProductImage(formData);
        finalImageUrl = uploadRes.imageUrl;
      } else if (previewUrl === null) {
        finalImageUrl = null;
      }

      await save({
        ...p,
        imageUrl: finalImageUrl,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save product. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-modal">
      <form className="editor" onSubmit={handleSubmit}>
        <div className="editor-head">
          <div>
            <span>PRODUCT EDITOR</span>
            <h2>{p.id ? "Edit product" : "Add new product"}</h2>
          </div>
          <button type="button" onClick={close} disabled={uploading}>
            <X />
          </button>
        </div>

        <div className="editor-body">
          {errorMsg && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#dc2626",
                padding: "10px 14px",
                borderRadius: "6px",
                marginBottom: "18px",
                fontSize: "13px",
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="form-row">
            <label>
              Product Name
              <input
                required
                value={p.name || ""}
                onChange={(e) => field("name", e.target.value)}
              />
            </label>
            <label>
              URL Slug
              <input
                required
                value={p.slug || ""}
                onChange={(e) => field("slug", e.target.value)}
              />
            </label>
          </div>

          <label>
            Product Custom Image <small>(Optional — photo or diagram for catalog & details)</small>
          </label>

          {previewUrl ? (
            <div
              className="file-preview-strip"
              style={{
                marginBottom: "18px",
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                background: "#f8fafc",
                border: "1.5px solid var(--border-subtle)",
                borderRadius: "6px",
              }}
            >
              <img
                src={previewUrl}
                alt="Product preview"
                style={{
                  width: "72px",
                  height: "72px",
                  objectFit: "cover",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                }}
              />
              <div style={{ flexGrow: 1 }}>
                <b style={{ display: "block", fontSize: "14px", color: "var(--text-main)" }}>
                  {selectedFile ? selectedFile.name : "Custom Product Image"}
                </b>
                <small style={{ color: "var(--text-dim)", fontSize: "12px" }}>
                  {selectedFile
                    ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload on save`
                    : "Active database-backed image"}
                </small>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="table-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  Change
                </button>
                <button
                  type="button"
                  className="file-remove-btn"
                  title="Remove image"
                  onClick={handleRemoveImage}
                  disabled={uploading}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ) : (
            <label
              className="file-pick"
              style={{ marginBottom: "18px", padding: "24px 16px" }}
            >
              <Upload size={28} />
              <span>Click to select product image</span>
              <small>Supports high-resolution JPG, PNG, WebP (Max 10MB)</small>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
            </label>
          )}

          {previewUrl && (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
          )}

          <label>
            Short Kicker
            <input
              value={p.kicker || ""}
              onChange={(e) => field("kicker", e.target.value)}
            />
          </label>
          <label>
            Description
            <textarea
              rows={4}
              required
              value={p.description || ""}
              onChange={(e) => field("description", e.target.value)}
            />
          </label>
          <label>
            Advantages <small>One per line</small>
            <textarea
              rows={4}
              value={(p.features || []).join("\n")}
              onChange={(e) =>
                field("features", e.target.value.split("\n").filter(Boolean))
              }
            />
          </label>
          <label>
            Applications <small>One per line</small>
            <textarea
              rows={4}
              value={(p.uses || []).join("\n")}
              onChange={(e) =>
                field("uses", e.target.value.split("\n").filter(Boolean))
              }
            />
          </label>
          <label>
            Specifications <small>One per line</small>
            <textarea
              rows={4}
              value={(p.specs || []).join("\n")}
              onChange={(e) =>
                field("specs", e.target.value.split("\n").filter(Boolean))
              }
            />
          </label>
          <div className="form-row">
            <label>
              Display Order <small>(Catalog position number)</small>
              <input
                type="number"
                min={1}
                value={p.sortOrder ?? ""}
                onChange={(e) =>
                  field("sortOrder", e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={p.active ?? true}
                onChange={(e) => field("active", e.target.checked)}
              />{" "}
              Published on website
            </label>
          </div>
        </div>

        <div className="editor-foot">
          <button type="button" onClick={close} disabled={uploading}>
            Cancel
          </button>
          <button className="admin-primary" type="submit" disabled={uploading}>
            {uploading ? (
              <>
                <Loader2 size={16} className="spin" />
                <span>Saving product…</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save product</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
