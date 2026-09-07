"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { Film, Image as ImageIcon, Plus, Star, Trash2, Upload, X } from "lucide-react";
import type { AdminDashboardData, GalleryItem } from "@shared/types";
import { ConfirmDialog } from "./confirm-dialog";

import { uploadAdminMedia, deleteAdminMedia } from "../src/api";

export function GalleryTab({
  data,
  reload,
  action,
  setNotice,
}: {
  data: AdminDashboardData;
  reload: () => Promise<void>;
  action: (payload: any) => Promise<boolean>;
  setNotice: (n: string) => void;
}) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);

    if (file && file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  }

  function clearSelectedFile() {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }

  function closeModal() {
    setShowUploadModal(false);
    clearSelectedFile();
  }

  async function upload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedFile) {
      setNotice("Please select a file to upload.");
      return;
    }

    const f = e.currentTarget;
    const fd = new FormData(f);
    setUploading(true);
    setNotice("Uploading project media…");

    try {
      await uploadAdminMedia(fd);
      closeModal();
      setNotice("Media uploaded and published successfully");
      await reload();
    } catch (err: any) {
      setNotice(err.message || "Upload failed. Please check backend connection.");
    } finally {
      setUploading(false);
    }
  }

  async function confirmDelete() {
    if (!itemToDelete) return;
    try {
      await deleteAdminMedia(itemToDelete.id);
      setNotice(`Deleted "${itemToDelete.title}" permanently`);
      await reload();
    } catch (err: any) {
      setNotice(err.message || "Error deleting media. Please check connection.");
    } finally {
      setItemToDelete(null);
    }
  }

  const galleryItems = data.gallery || [];

  return (
    <>
      <section className="admin-card">
        <div className="card-head">
          <div>
            <span>PROJECT MEDIA MANAGEMENT</span>
            <h2>Website gallery ({galleryItems.length})</h2>
          </div>
          <button className="admin-primary" onClick={() => setShowUploadModal(true)}>
            <Plus /> Upload media
          </button>
        </div>

        {galleryItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <ImageIcon size={28} />
            </div>
            <h3>No Project Media Found</h3>
            <p>
              Your gallery is currently empty. Upload photos and project videos to showcase active highway installations and material quality on the public website.
            </p>
            <button className="admin-primary" onClick={() => setShowUploadModal(true)}>
              <Plus size={16} /> Upload your first media item
            </button>
          </div>
        ) : (
          <div className="media-grid">
            {galleryItems.map((m) => (
              <article key={m.id} className="media-card">
                <div>
                  <div className="media-card-preview">
                    {m.mediaType === "video" ? (
                      <video
                        src={`/api/media/${m.id}`}
                        controls
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={`/api/media/${m.id}`}
                        alt={m.title}
                        loading="lazy"
                      />
                    )}

                    <div className="media-badges-overlay">
                      <span className={`status ${m.active ? "active" : ""}`}>
                        {m.active ? "Published" : "Hidden"}
                      </span>
                      {m.featured && (
                        <span className="status" style={{ background: "#fffbeb", color: "#d97706", borderColor: "#fde68a" }}>
                          ★ Featured
                        </span>
                      )}
                    </div>

                    <div className="media-type-tag">
                      {m.mediaType === "video" ? <Film size={10} /> : <ImageIcon size={10} />}
                      {m.mediaType}
                    </div>
                  </div>

                  <div className="media-card-body">
                    <b title={m.title}>{m.title}</b>
                    {m.caption && <p>{m.caption}</p>}
                  </div>
                </div>

                <div className="media-card-footer">
                  <div className="media-card-actions">
                    <button
                      className="table-btn"
                      onClick={() =>
                        action({
                          action: "gallery_toggle",
                          id: m.id,
                          active: !m.active,
                          featured: m.featured,
                        })
                      }
                      title={m.active ? "Hide from public website" : "Publish on website"}
                    >
                      {m.active ? "Hide" : "Publish"}
                    </button>

                    <button
                      className={`btn-feature-star ${m.featured ? "is-featured" : ""}`}
                      onClick={() =>
                        action({
                          action: "gallery_toggle",
                          id: m.id,
                          active: m.active,
                          featured: !m.featured,
                        })
                      }
                      title={m.featured ? "Remove from featured" : "Set as featured on homepage"}
                    >
                      <Star size={13} fill={m.featured ? "#d97706" : "none"} />
                    </button>
                  </div>

                  <button
                    className="icon-danger"
                    title="Delete media permanently"
                    onClick={() => setItemToDelete(m)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Upload Media Modal */}
      {showUploadModal && (
        <div className="admin-modal">
          <form className="editor" onSubmit={upload}>
            <div className="editor-head">
              <div>
                <span>PROJECT MEDIA UPLOAD</span>
                <h2>Add photo or video to website gallery</h2>
              </div>
              <button type="button" onClick={closeModal}>
                <X />
              </button>
            </div>

            <div className="editor-body">
              <div className="form-row">
                <label>
                  Project / Work Title
                  <input
                    name="title"
                    required
                    placeholder="e.g. NH-48 Automated Thermoplastic Screed"
                  />
                </label>
                <label>
                  Short Caption
                  <input
                    name="caption"
                    placeholder="e.g. 8-lane expressway application under MORTH 803"
                  />
                </label>
              </div>

              <label className="file-pick">
                <Upload />
                <span>
                  {selectedFile ? (
                    <span style={{ color: "var(--amber-primary)" }}>
                      {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  ) : (
                    "Click or drag image or video here to upload"
                  )}
                </span>
                <small>Supports high-resolution JPG, PNG, WebP, MP4, WebM (Max 50MB)</small>
                <input
                  name="file"
                  required
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                />
              </label>

              {selectedFile && (
                <div className="file-preview-strip">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Upload preview" />
                  ) : (
                    <div style={{ width: 54, height: 54, display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", color: "#ffffff", borderRadius: 4 }}>
                      <Film size={20} />
                    </div>
                  )}
                  <div>
                    <b>{selectedFile.name}</b>
                    <small>{selectedFile.type || "Media file"} • {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</small>
                  </div>
                  <button
                    type="button"
                    onClick={clearSelectedFile}
                    className="file-remove-btn"
                    title="Remove selected file"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <label className="check-label" style={{ marginTop: 12 }}>
                <input name="featured" type="checkbox" value="true" />
                Feature on Homepage & Top Showcase
              </label>
            </div>

            <div className="editor-foot">
              <button type="button" onClick={closeModal}>
                Cancel
              </button>
              <button className="admin-primary" disabled={uploading}>
                <Upload /> {uploading ? "Uploading…" : "Upload & publish"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Professional In-App Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(itemToDelete)}
        title="Permanently Delete Media?"
        message={`Are you sure you want to permanently delete "${itemToDelete?.title}" from the gallery and database? This action cannot be undone.`}
        confirmText="Delete permanently"
        cancelText="Keep media"
        isDestructive={true}
        onConfirm={confirmDelete}
        onClose={() => setItemToDelete(null)}
      />
    </>
  );
}
