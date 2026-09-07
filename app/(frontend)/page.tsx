import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  ChevronDown,
  Factory,
  PackageX,
  Plane,
  Route,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { SiteHeader } from "@frontend/components/site-header";
import { SiteFooter } from "@frontend/components/site-footer";
import { EnquiryForm } from "@frontend/components/enquiry-form";
import { HomeProductCard } from "@frontend/components/product-card";
import { HeroVideoHighway } from "@frontend/components/hero-video-highway";
import { QcRadarVisual } from "@frontend/components/qc-radar-visual";
import { CapabilitiesStrip } from "@frontend/components/metric-odometer";
import { HighwayFlowLine } from "@frontend/components/highway-flow-line";
import { CAPABILITIES } from "@shared/constants";
import { getSettings } from "@backend/services/settings.service";
import { getActiveProducts } from "@backend/services/products.service";
import { getActiveGalleryItems } from "@backend/services/gallery.service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, products, galleryItems] = await Promise.all([
    getSettings(),
    getActiveProducts(),
    getActiveGalleryItems(),
  ]);

  const featuredItems = galleryItems.filter((item) => item.featured);

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader settings={settings} />

      {/* Hero Section — Exact Original Front-Page Fold with Telemetry HUD */}
      <section id="home" className="hero">
        <HeroVideoHighway />
        <div className="hero-overlay" />
        <div className="hero-grid" />
        <div className="container hero-content">
          <div className="eyebrow">
            <span /> HIGHWAY SAFETY PRODUCT MANUFACTURER
          </div>
          <h1>
            {settings.hero_title ? (
              settings.hero_title
            ) : (
              <>
                Built for the road.
                <br />
                <em>Engineered for scale.</em>
              </>
            )}
          </h1>
          <p>
            {settings.hero_text ||
              "Premium road-marking and highway safety products manufactured for contractors, infrastructure companies and large-scale projects across India."}
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/products">
              Explore Products <ArrowRight size={19} />
            </Link>
            <Link className="btn btn-secondary" href="/contact">
              Discuss Bulk Requirement
            </Link>
          </div>
          <div className="hero-proof">
            <span>
              <ShieldCheck className="text-[#c9a35d]" /> Quality-controlled production
            </span>
            <span>
              <Truck className="text-[#c9a35d]" /> Project-ready bulk dispatch
            </span>
          </div>
        </div>
        <a
          href="#products"
          className="group hidden md:flex absolute right-9 bottom-4 z-10 w-[160px] items-center justify-between text-[10px] uppercase font-bold tracking-widest text-[#64748b] hover:text-[#c9a35d] transition-colors cursor-pointer"
        >
          <span>Scroll to Explore</span>
          <ChevronDown size={14} className="animate-bounce text-[#64748b] group-hover:text-[#c9a35d] transition-colors" />
        </a>
      </section>

      {/* Trust & Capabilities Strip with Animated Metric Odometer */}
      <CapabilitiesStrip capabilities={CAPABILITIES} />

      {/* Section 1: About & Sourcing */}
      <section id="about" className="py-24 bg-[#ffffff] text-[#0f172a] border-b border-[#e2e8f0]">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <div className="section-label mb-3">
                <span /> 01 — COMPANY PROFILE
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] tracking-tight leading-tight mb-6 font-serif">
                Reliable material supply for roads that never pause.
              </h2>
              <p className="text-[#475569] text-base sm:text-lg leading-relaxed mb-6">
                Dezoryn Contractor manufactures and supplies highway-use products engineered for demanding traffic loads, extreme weather shifts, and strict project timelines.
              </p>
              <p className="text-[#475569] text-base leading-relaxed mb-8">
                We collaborate directly with road contractors, EPC concessionaires, State PWD vendors, and infrastructure distributors who demand repeatable batch quality, verified retro-reflectivity, and scheduled site dispatches.
              </p>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <Link href="/about" className="btn btn-secondary w-full sm:w-auto">
                  Our Manufacturing Setup <ArrowRight size={15} />
                </Link>
                <Link
                  href="/quality"
                  className="text-xs font-bold uppercase tracking-wider text-[#c9a35d] hover:underline py-2"
                >
                  Quality Protocol →
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative h-[280px] sm:h-[420px] rounded-lg overflow-hidden border border-[#e2e8f0] shadow-xl group">
                <Image
                  src="/images/products/custom-manufacturing.jpg"
                  alt="Dezoryn Automated Highway Material Production Facility"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06090d]/95 via-[#06090d]/40 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
                  <div className="flex items-center gap-2 text-[#f0d796] text-xs font-bold uppercase tracking-widest mb-1">
                    <Factory size={16} /> Automated Batch Production
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 font-serif">
                    Standardized Chemical Compounding & Packaging
                  </h3>
                  <p className="text-xs text-[#cbd5e1] line-clamp-2 sm:line-clamp-none">
                    Continuous monitoring of resin purity, pigment concentration, and retro-reflective bead gradation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Products Portfolio */}
      <section id="products" className="py-24 bg-[#f8fafc] text-[#0f172a] border-b border-[#e2e8f0] relative">
        <div className="container">
          <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6 mb-16">
            <div>
              <div className="section-label mb-3">
                <span /> 02 — HIGHWAY PRODUCT CATALOG
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] tracking-tight font-serif">
                Essential Highway Safety Solutions.
              </h2>
            </div>
            <p className="text-[#475569] max-w-md text-sm sm:text-base leading-relaxed">
              Every order is quoted based on exact technical specifications, batch volume, packaging requirements, and project destination.
            </p>
          </div>

          {products.length > 0 ? (
            <div className="catalog-grid">
              {products.map((p, i) => (
                <HomeProductCard
                  key={p.slug}
                  product={{
                    no: String(i + 1).padStart(2, "0"),
                    slug: p.slug,
                    title: p.name,
                    text: p.description,
                    tag: p.kicker || "Highway Grade",
                    imageUrl: p.imageUrl,
                  }}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-[#e2e8f0] p-12 text-center shadow-sm max-w-2xl mx-auto my-8">
              <div className="w-14 h-14 rounded-full bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center mx-auto mb-4 text-[#c9a35d]">
                <PackageX size={26} />
              </div>
              <h3 className="text-lg font-bold text-[#0f172a] font-serif mb-2">
                Highway Catalog Under Batch Update
              </h3>
              <p className="text-xs text-[#64748b] leading-relaxed max-w-md mx-auto mb-6">
                Our manufacturing lines and technical product specifications are currently being updated. Contact our sales engineering team for custom batch requirements and direct material dispatch schedules.
              </p>
              <Link href="/contact" className="btn btn-primary inline-flex items-center gap-2">
                Discuss Bulk Requirement <ArrowRight size={15} />
              </Link>
            </div>
          )}

          {products.length > 0 && (
            <div className="mt-14 text-center">
              <Link href="/products" className="btn btn-primary">
                View Complete Product Specifications <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Section 3: Quality First — Signature QC Radar Visual & Process */}
      <section id="quality" className="quality-section-wrap text-[#0f172a]">
        <div className="container">
          <div className="quality-grid-split">
            {/* Left: Concentric Dial Visual with 3D GPU Scroll Depth Animation */}
            <QcRadarVisual />

            {/* Right: Copy & Structured Steps */}
            <div>
              <div className="section-label mb-3">
                <span /> 03 — QUALITY FIRST
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] tracking-tight leading-tight mb-6 font-serif">
                Consistency is not a promise.<br />
                It is the process.
              </h2>
              <p className="text-[#475569] text-base sm:text-lg leading-relaxed mb-8">
                Our production workflow is designed around repeatability, performance and documented checks—so every project receives material aligned with its requirement.
              </p>

              <div>
                <div className="quality-list-row group/row hover:bg-slate-50 transition-colors p-2 rounded">
                  <span className="row-num">01</span>
                  <div>
                    <h3 className="group-hover/row:text-[#c9a35d] transition-colors">Controlled sourcing</h3>
                    <p>Selected raw materials and defined incoming checks.</p>
                  </div>
                </div>
                <div className="quality-list-row group/row hover:bg-slate-50 transition-colors p-2 rounded">
                  <span className="row-num">02</span>
                  <div>
                    <h3 className="group-hover/row:text-[#c9a35d] transition-colors">Process discipline</h3>
                    <p>Monitored production parameters and batch records.</p>
                  </div>
                </div>
                <div className="quality-list-row group/row hover:bg-slate-50 transition-colors p-2 rounded">
                  <span className="row-num">03</span>
                  <div>
                    <h3 className="group-hover/row:text-[#c9a35d] transition-colors">Pre-dispatch review</h3>
                    <p>Quantity, packaging and order details verified before movement.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Applications & Corridors with Highway Flow Track */}
      <section className="py-24 bg-[#f8fafc] text-[#0f172a] border-b border-[#e2e8f0] relative">
        <HighwayFlowLine />
        <div className="container relative z-10">
          <div className="max-w-2xl mb-16">
            <div className="section-label mb-3">
              <span /> 04 — SECTOR APPLICABILITY
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] tracking-tight font-serif">
              Where Our Products Perform
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 sm:p-8 rounded-lg bg-white border border-[#e2e8f0] hover:border-[#c9a35d] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between min-h-[210px] h-auto shadow-sm hover:shadow-md group">
              <div>
                <Route size={32} className="text-[#c9a35d] mb-4 transition-transform duration-300 group-hover:scale-110" />
                <h3 className="text-lg font-bold text-[#0f172a]">National & State Highways</h3>
              </div>
              <span className="text-xs text-[#64748b] uppercase tracking-wider font-semibold mt-4">
                High-Volume Corridors
              </span>
            </div>

            <div className="p-6 sm:p-8 rounded-lg bg-white border border-[#e2e8f0] hover:border-[#c9a35d] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between min-h-[210px] h-auto shadow-sm hover:shadow-md group">
              <div>
                <Truck size={32} className="text-[#c9a35d] mb-4 transition-transform duration-300 group-hover:scale-110" />
                <h3 className="text-lg font-bold text-[#0f172a]">Expressways & Corridors</h3>
              </div>
              <span className="text-xs text-[#64748b] uppercase tracking-wider font-semibold mt-4">
                Phased Construction EPC
              </span>
            </div>

            <div className="p-6 sm:p-8 rounded-lg bg-white border border-[#e2e8f0] hover:border-[#c9a35d] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between min-h-[210px] h-auto shadow-sm hover:shadow-md group">
              <div>
                <Building2 size={32} className="text-[#c9a35d] mb-4 transition-transform duration-300 group-hover:scale-110" />
                <h3 className="text-lg font-bold text-[#0f172a]">Urban Roads & Smart Cities</h3>
              </div>
              <span className="text-xs text-[#64748b] uppercase tracking-wider font-semibold mt-4">
                Intersections & Crossings
              </span>
            </div>

            <div className="p-6 sm:p-8 rounded-lg bg-white border border-[#e2e8f0] hover:border-[#c9a35d] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between min-h-[210px] h-auto shadow-sm hover:shadow-md group">
              <div>
                <Plane size={32} className="text-[#c9a35d] mb-4 transition-transform duration-300 group-hover:scale-110" />
                <h3 className="text-lg font-bold text-[#0f172a]">Airports & Industrial Parks</h3>
              </div>
              <span className="text-xs text-[#64748b] uppercase tracking-wider font-semibold mt-4">
                Controlled Transit Areas
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Featured Project Media (Rendered when database has featured items) */}
      {featuredItems.length > 0 && (
        <section id="gallery-featured" className="py-24 bg-[#090d16] text-[#f8fafc] border-b border-[#1e293b] relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
          <div className="container relative z-10">
            <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6 mb-16">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#c9a35d]/10 border border-[#c9a35d]/30 text-[#f0d796] font-bold text-xs uppercase tracking-widest mb-3">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#c9a35d] animate-pulse" /> 05 — SITE WORK & DISPATCHES
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-serif">
                  Featured Project Applications
                </h2>
              </div>
              <p className="text-[#94a3b8] max-w-md text-sm sm:text-base leading-relaxed">
                Direct field dispatches, automated thermoplastic screeding, and highway safety hardware installations across active project corridors.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredItems.map((m) => {
                const backendBase =
                  process.env.NEXT_PUBLIC_BACKEND_URL ||
                  (process.env.NODE_ENV === "production"
                    ? "https://dezoryn-backend.onrender.com"
                    : "");
                const mediaUrl = `${backendBase}/api/media/${m.id}`;
                return (
                  <article
                    key={m.id}
                    className="bg-[#0f172a] rounded-lg border border-[rgba(201,163,93,0.3)] overflow-hidden shadow-xl hover:border-[#c9a35d] transition-all hover:-translate-y-1 group"
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
                    <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                      <span className="inline-flex items-center gap-1 bg-[#c9a35d] text-[#090d16] px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                        ★ FEATURED
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 bg-[#090d16]/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-[#cbd5e1] border border-white/10 z-10">
                      {m.mediaType}
                    </div>
                  </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-white mb-2 font-serif group-hover:text-[#f0d796] transition-colors">
                        {m.title}
                      </h3>
                      {m.caption && (
                        <p className="text-xs text-[#94a3b8] leading-relaxed line-clamp-2">
                          {m.caption}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-14 text-center">
              <Link href="/gallery" className="btn btn-primary inline-flex items-center gap-2">
                Explore Full Projects & Media Gallery <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Section 6: B2B Quotation Form */}
      <section id="quote" className="py-24 bg-[#ffffff] text-[#0f172a] relative">
        <EnquiryForm />
      </section>

      <SiteFooter settings={settings} />
    </div>
  );
}

