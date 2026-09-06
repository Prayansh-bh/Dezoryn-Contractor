import { getActiveGalleryItems } from "@backend/services/gallery.service";
import { SiteShell, PageHero, PageCta } from "@frontend/components/site-shell";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const items = await getActiveGalleryItems();
  const backendBase =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://dezoryn-backend.onrender.com"
      : "");

  return (
    <SiteShell>
      <PageHero
        eyebrow="PROJECTS & MEDIA GALLERY"
        breadcrumbCurrent="Gallery"
        title="Visual Showcase of Highway Applications and Manufacturing Work."
        text="A curated perspective on our highway marking compounds, retro-reflective testing, safety hardware installations, and manufacturing facility."
      />

      <section className="py-20 bg-[#f8fafc] text-[#0f172a] border-b border-[#e2e8f0]">
        <div className="container">
          <div className="mb-12">
            <div className="section-label mb-2">
              <span /> LIVE PROJECT DISPATCHES & SITE APPLICATIONS
            </div>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-2 font-serif">
              Project Media & Infrastructure Gallery {items.length > 0 ? `(${items.length})` : ""}
            </h2>
            <p className="text-xs text-[#64748b] max-w-xl">
              Verified highway installation media, laboratory reflectance benchmarks, and automated material batching photographs.
            </p>
          </div>

          {items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((m) => {
                const mediaUrl = `${backendBase}/api/media/${m.id}`;
                return (
                  <article
                    key={m.id}
                    className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden shadow-sm hover:border-[#c9a35d] transition-all hover:-translate-y-1 group"
                  >
                    <div className="relative h-64 bg-[#06090d]">
                      {m.mediaType === "video" ? (
                        <video
                          src={mediaUrl}
                          controls
                          preload="metadata"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={mediaUrl}
                          alt={m.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    {m.featured && (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                        <span className="inline-flex items-center gap-1 bg-[#fffbeb] text-[#d97706] border border-[#fde68a] px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                          ★ FEATURED
                        </span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-[#06090d]/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-[#cbd5e1] border border-white/10 z-10">
                      {m.mediaType}
                    </div>
                  </div>
                    <div className="p-6">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#c9a35d] mb-1.5 block">
                        {m.mediaType === "video" ? "Field Application Video" : "Site Photography"}
                      </span>
                      <h3 className="text-base font-bold text-[#0f172a] mb-1.5 font-serif group-hover:text-[#c9a35d] transition-colors">
                        {m.title}
                      </h3>
                      {m.caption && <p className="text-xs text-[#64748b] leading-relaxed line-clamp-2">{m.caption}</p>}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-[#e2e8f0] p-12 text-center shadow-sm max-w-2xl mx-auto my-8">
              <p className="text-sm font-semibold text-[#0f172a] mb-1">
                Live Dispatch Feed Being Updated
              </p>
              <p className="text-xs text-[#64748b] max-w-md mx-auto leading-relaxed">
                Recent project videos and batch dispatch photographs are currently being compiled. Contact our sales engineering team for site test certificates and material verification datasheets.
              </p>
            </div>
          )}
        </div>
      </section>

      <PageCta />
    </SiteShell>
  );
}
