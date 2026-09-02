"use client";

import { FormEvent } from "react";
import { Trash2, Upload } from "lucide-react";
import type { AdminDashboardData } from "@shared/types";

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
  async function upload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    const fd = new FormData(f);
    setNotice("Uploading media…");

    try {
      const r = await fetch("/api/admin/media", {
        method: "POST",
        body: fd,
      });

      if (r.ok) {
        f.reset();
        setNotice("Media uploaded successfully");
        await reload();
      } else {
        const err = await r.json();
        setNotice(err.error || "Upload failed");
      }
    } catch {
      setNotice("Upload failed. Please check network connection.");
    }
  }

  return (
    <>
      <section className="admin-card upload-card">
        <div>
          <span>ADD TO WEBSITE GALLERY</span>
          <h2>Upload work image or video</h2>
          <p>JPG, PNG, WebP or MP4 up to 50 MB.</p>
        </div>
        <form onSubmit={upload}>
          <input name="title" required placeholder="Project / work title" />
          <input name="caption" placeholder="Short caption" />
          <label className="file-pick">
            <Upload />
            <span>Select image or video</span>
            <input name="file" required type="file" accept="image/*,video/*" />
          </label>
          <button className="admin-primary">
            <Upload /> Upload media
          </button>
        </form>
      </section>

      <section className="admin-card">
        <div className="card-head">
          <div>
            <span>MEDIA LIBRARY</span>
            <h2>Gallery items</h2>
          </div>
        </div>
        <div className="media-grid">
          {(data.gallery || []).map((m) => (
            <article key={m.id}>
              <div className="media-preview">
                {m.mediaType === "video" ? (
                  <video src={`/api/media/${m.id}`} controls />
                ) : (
                  <img src={`/api/media/${m.id}`} alt={m.title} />
                )}
              </div>
              <div>
                <b>{m.title}</b>
                <small>{m.mediaType}</small>
                <div>
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
                  >
                    {m.active ? "Hide" : "Publish"}
                  </button>
                  <button
                    className="icon-danger"
                    onClick={async () => {
                      if (confirm("Delete media?")) {
                        await fetch(`/api/admin/media?id=${m.id}`, {
                          method: "DELETE",
                        });
                        reload();
                      }
                    }}
                  >
                    <Trash2 />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
