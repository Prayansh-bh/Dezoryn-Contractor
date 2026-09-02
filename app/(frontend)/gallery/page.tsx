import Image from "next/image";
import { getActiveGalleryItems } from "@backend/services/gallery.service";
import { SiteShell, PageHero, PageCta } from "@frontend/components/site-shell";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const items = await getActiveGalleryItems();

  const curatedShowcase = [
    {
      id: "c1",
      title: "Thermoplastic Expressway Paving & Marking",
      caption: "High-speed automated application on 8-lane corridor.",
      image: "/images/products/thermoplastic-paint.jpg",
      tag: "Road Marking",
    },
    {
      id: "c2",
      title: "Retro-Reflective Micro Glass Beads Lab QC",
      caption: "Testing optical retroreflectivity under directional light beam.",
      image: "/images/products/reflective-glass-beads.jpg",
      tag: "Quality Control",
    },
    {
      id: "c3",
      title: "High-Contrast Kerb & Divider Barrier Coatings",
      caption: "Long-lasting UV-resistant kerb paint on highway median.",
      image: "/images/products/kerb-barrier-coatings.jpg",
      tag: "Barrier Coatings",
    },
    {
      id: "c4",
      title: "Solar & Cat-Eye Highway Road Studs",
      caption: "Lane delineation and night curve warning studs.",
      image: "/images/products/road-studs-delineators.jpg",
      tag: "Highway Hardware",
    },
    {
      id: "c5",
      title: "Project Safety Hardware & Barricades",
      caption: "Heavy-duty traffic cones and high-visibility work zone bollards.",
      image: "/images/products/traffic-safety-products.jpg",
      tag: "Traffic Safety",
    },
    {
      id: "c6",
      title: "Automated Material Batching Facility",
      caption: "Standardized chemical blending and temperature-controlled compounding.",
      image: "/images/products/custom-manufacturing.jpg",
      tag: "Manufacturing",
    },
  ];

  return (
    <SiteShell>
      <PageHero
        eyebrow="PROJECTS & MEDIA GALLERY"
        breadcrumbCurrent="Gallery"
        title="Visual Showcase of Highway Applications and Manufacturing Work."
        text="A curated perspective on our highway marking compounds, retro-reflective testing, safety hardware installations, and manufacturing facility."
      />

      <section className="py-20 bg-[#090d14] text-white border-b border-[rgba(201,163,93,0.2)]">
        <div className="container">
          {/* User Uploaded Live Media (if present) */}
          {items.length > 0 && (
            <div className="mb-16">
              <div className="section-label mb-2">
                <span /> LIVE PROJECT MEDIA
              </div>
              <h2 className="text-2xl font-bold text-white mb-8 font-serif">
                Recent Dispatches & Site Work ({items.length})
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map((m) => (
                  <article
                    key={m.id}
                    className="bg-[#0e141f] rounded-lg border border-[rgba(201,163,93,0.18)] overflow-hidden shadow-lg hover:border-[#c9a35d] transition-colors"
                  >
                    <div className="relative h-60 bg-[#06090d]">
                      {m.mediaType === "video" ? (
                        <video
                          src={`/api/media/${m.id}`}
                          controls
                          preload="metadata"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={`/api/media/${m.id}`}
                          alt={m.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="p-5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#f0d796] mb-1 block">
                        {m.mediaType}
                      </span>
                      <h3 className="text-base font-bold text-white mb-1 font-serif">{m.title}</h3>
                      {m.caption && <p className="text-xs text-[#94a3b8]">{m.caption}</p>}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Curated Infrastructure Showcase */}
          <div>
            <div className="section-label mb-2">
              <span /> INFRASTRUCTURE PORTFOLIO
            </div>
            <h2 className="text-2xl font-bold text-white mb-8 font-serif">
              Highway Products in Action
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {curatedShowcase.map((item) => (
                <article
                  key={item.id}
                  className="bg-[#0e141f] rounded-lg border border-[rgba(201,163,93,0.18)] overflow-hidden shadow-lg hover:border-[#c9a35d] transition-all hover:-translate-y-1"
                >
                  <div className="relative h-64 bg-[#06090d]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-[#06090d]/90 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-[#f0d796] border border-[rgba(201,163,93,0.35)]">
                      {item.tag}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-2 font-serif">{item.title}</h3>
                    <p className="text-xs text-[#94a3b8] leading-relaxed">{item.caption}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PageCta />
    </SiteShell>
  );
}
