import { getActiveGalleryItems } from "@backend/services/gallery.service";
import { SiteShell, PageHero, PageCta } from "@frontend/components/site-shell";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const items = await getActiveGalleryItems();

  return (
    <SiteShell>
      <PageHero
        eyebrow="PROJECTS / GALLERY"
        title="Work that moves infrastructure forward."
        text="A view of our highway product applications, supply work and project activity."
      />
      <section className="inner-section">
        <div className="container public-gallery">
          {items.map((m) => (
            <article key={m.id}>
              {m.mediaType === "video" ? (
                <video src={`/api/media/${m.id}`} controls preload="metadata" />
              ) : (
                <img src={`/api/media/${m.id}`} alt={m.title} />
              )}
              <div>
                <span>{m.mediaType}</span>
                <h2>{m.title}</h2>
                {m.caption && <p>{m.caption}</p>}
              </div>
            </article>
          ))}
          {!items.length && (
            <div className="gallery-empty">
              <span>GALLERY UPDATES</span>
              <h2>Project media is being curated.</h2>
              <p>
                New work images and videos will appear here after they are published by our team.
              </p>
            </div>
          )}
        </div>
      </section>
      <PageCta />
    </SiteShell>
  );
}
