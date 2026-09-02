import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ChevronDown,
  Factory,
  Gauge,
  MapPin,
  Plane,
  Route,
  ShieldCheck,
  Sparkles,
  Truck,
  Warehouse,
} from "lucide-react";
import { SiteHeader } from "@frontend/components/site-header";
import { SiteFooter } from "@frontend/components/site-footer";
import { EnquiryForm } from "@frontend/components/enquiry-form";
import { HomeProductCard } from "@frontend/components/product-card";
import { HeroVideoHighway } from "@frontend/components/hero-video-highway";
import { CAPABILITIES } from "@shared/constants";

const products = [
  {
    no: "01",
    slug: "thermoplastic-road-marking-paint",
    title: "Thermoplastic Road Marking Paint",
    text: "Hot-applied road marking compound engineered for sharp lines, dependable adhesion and long service life under heavy highway traffic.",
    tag: "MORTH Clause 803 Compliant",
  },
  {
    no: "02",
    slug: "reflective-glass-beads",
    title: "Reflective Glass Beads",
    text: "Precision-graded drop-on and intermix glass beads that return headlight illumination to drivers for safer night-time navigation.",
    tag: "High Retro-Reflectivity",
  },
  {
    no: "03",
    slug: "kerb-barrier-coatings",
    title: "Kerb & Barrier Coatings",
    text: "High-contrast durable coatings for concrete kerbs, medians and metal crash barriers developed to retain visual clarity across all weather.",
    tag: "All-Weather UV Resistance",
  },
  {
    no: "04",
    slug: "road-studs-delineators",
    title: "Road Studs & Delineators",
    text: "High-impact road guidance products for curves, medians and lane boundaries where dependable visibility and clear direction matter.",
    tag: "Impact Resistant & Solar",
  },
  {
    no: "05",
    slug: "traffic-safety-products",
    title: "Traffic Safety Products",
    text: "A coordinated range of cones, bollards, barricades and reflectors for highway projects, diversions and active construction corridors.",
    tag: "Heavy-Duty Polymer",
  },
  {
    no: "06",
    slug: "custom-manufacturing",
    title: "Project-Specific Manufacturing",
    text: "Specification-led production, packaging and dispatch planning for contractors whose project requirements require custom batch planning.",
    tag: "Custom Formulation",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />

      {/* Hero Section — Exact Original Front-Page Fold */}
      <section id="home" className="hero">
        <HeroVideoHighway />
        <div className="hero-overlay" />
        <div className="hero-grid" />
        <div className="container hero-content">
          <div className="eyebrow">
            <span /> HIGHWAY SAFETY PRODUCT MANUFACTURER
          </div>
          <h1>
            Built for the road.
            <br />
            <em>Engineered for scale.</em>
          </h1>
          <p>
            Premium road-marking and highway safety products manufactured for
            contractors, infrastructure companies and large-scale projects across
            India.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/products">
              Explore Products <ArrowRight size={19} />
            </Link>
            <Link className="btn btn-ghost" href="/contact">
              Discuss Bulk Requirement
            </Link>
          </div>
          <div className="hero-proof">
            <span>
              <ShieldCheck /> Quality-controlled production
            </span>
            <span>
              <Truck /> Project-ready bulk dispatch
            </span>
          </div>
        </div>
        <Link
          href="/about"
          className="hidden md:flex absolute right-8 bottom-8 z-10 items-center gap-2 text-xs uppercase font-bold tracking-widest text-[#64748b] hover:text-[#c9a35d] transition-colors"
        >
          <span>Scroll to Explore</span>
          <ChevronDown size={14} className="animate-bounce text-[#c9a35d]" />
        </Link>
      </section>

      {/* Trust & Capabilities Strip */}
      <section className="bg-[#f8fafc] border-y border-[#e2e8f0] py-8 text-[#0f172a] relative z-20">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {CAPABILITIES.map(([value, label], idx) => (
              <div
                key={label}
                className="flex flex-col justify-center border-l-2 border-[#c9a35d] pl-4 py-1"
              >
                <span className="text-[#c9a35d] font-black text-xl lg:text-2xl tracking-tight font-display">
                  {value}
                </span>
                <span className="text-xs uppercase tracking-wider text-[#64748b] font-semibold mt-1">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

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

              <div className="flex items-center gap-6">
                <Link href="/about" className="btn btn-secondary">
                  Our Manufacturing Setup <ArrowRight size={15} />
                </Link>
                <Link
                  href="/quality"
                  className="text-xs font-bold uppercase tracking-wider text-[#c9a35d] hover:underline"
                >
                  Quality Protocol →
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative h-[380px] sm:h-[450px] rounded-lg overflow-hidden border border-[#e2e8f0] shadow-xl">
                <Image
                  src="/images/products/custom-manufacturing.jpg"
                  alt="Dezoryn Automated Highway Material Production Facility"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06090d]/95 via-[#06090d]/40 to-transparent flex flex-col justify-end p-8 text-white">
                  <div className="flex items-center gap-2 text-[#f0d796] text-xs font-bold uppercase tracking-widest mb-1">
                    <Factory size={16} /> Automated Batch Production
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 font-serif">
                    Standardized Chemical Compounding & Packaging
                  </h3>
                  <p className="text-xs text-[#cbd5e1]">
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

          <div className="catalog-grid">
            {products.map((p, i) => (
              <HomeProductCard key={p.no} product={p} index={i} />
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link href="/products" className="btn btn-primary">
              View Complete Product Specifications <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 3: Quality First — Signature QC Radar Visual & Process */}
      <section id="quality" className="quality-section-wrap text-[#0f172a]">
        <div className="container">
          <div className="quality-grid-split">
            {/* Left: Concentric Dial Visual */}
            <div className="quality-visual">
              <div className="q-ring">
                <div className="q-ring-center">
                  <Gauge />
                  <strong>QC</strong>
                  <span>at every batch</span>
                </div>
              </div>
              <span className="q-tag q1">Raw material check</span>
              <span className="q-tag q2">Batch traceability</span>
              <span className="q-tag q3">Dispatch verification</span>
            </div>

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
                <div className="quality-list-row">
                  <span className="row-num">01</span>
                  <div>
                    <h3>Controlled sourcing</h3>
                    <p>Selected raw materials and defined incoming checks.</p>
                  </div>
                </div>
                <div className="quality-list-row">
                  <span className="row-num">02</span>
                  <div>
                    <h3>Process discipline</h3>
                    <p>Monitored production parameters and batch records.</p>
                  </div>
                </div>
                <div className="quality-list-row">
                  <span className="row-num">03</span>
                  <div>
                    <h3>Pre-dispatch review</h3>
                    <p>Quantity, packaging and order details verified before movement.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Applications & Corridors */}
      <section className="py-24 bg-[#f8fafc] text-[#0f172a] border-b border-[#e2e8f0]">
        <div className="container">
          <div className="max-w-2xl mb-16">
            <div className="section-label mb-3">
              <span /> 04 — SECTOR APPLICABILITY
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] tracking-tight font-serif">
              Where Our Products Perform
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-8 rounded-lg bg-white border border-[#e2e8f0] hover:border-[#c9a35d] transition-all flex flex-col justify-between h-[240px] shadow-sm">
              <div>
                <Route size={32} className="text-[#c9a35d] mb-4" />
                <h3 className="text-lg font-bold text-[#0f172a]">National & State Highways</h3>
              </div>
              <span className="text-xs text-[#64748b] uppercase tracking-wider font-semibold">
                High-Volume Corridors
              </span>
            </div>

            <div className="p-8 rounded-lg bg-white border border-[#e2e8f0] hover:border-[#c9a35d] transition-all flex flex-col justify-between h-[240px] shadow-sm">
              <div>
                <Truck size={32} className="text-[#c9a35d] mb-4" />
                <h3 className="text-lg font-bold text-[#0f172a]">Expressways & Corridors</h3>
              </div>
              <span className="text-xs text-[#64748b] uppercase tracking-wider font-semibold">
                Phased Construction EPC
              </span>
            </div>

            <div className="p-8 rounded-lg bg-white border border-[#e2e8f0] hover:border-[#c9a35d] transition-all flex flex-col justify-between h-[240px] shadow-sm">
              <div>
                <Building2 size={32} className="text-[#c9a35d] mb-4" />
                <h3 className="text-lg font-bold text-[#0f172a]">Urban Roads & Smart Cities</h3>
              </div>
              <span className="text-xs text-[#64748b] uppercase tracking-wider font-semibold">
                Intersections & Crossings
              </span>
            </div>

            <div className="p-8 rounded-lg bg-white border border-[#e2e8f0] hover:border-[#c9a35d] transition-all flex flex-col justify-between h-[240px] shadow-sm">
              <div>
                <Plane size={32} className="text-[#c9a35d] mb-4" />
                <h3 className="text-lg font-bold text-[#0f172a]">Airports & Industrial Parks</h3>
              </div>
              <span className="text-xs text-[#64748b] uppercase tracking-wider font-semibold">
                Controlled Transit Areas
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: B2B Quotation Form */}
      <section id="quote" className="py-24 bg-[#ffffff] text-[#0f172a] relative">
        <EnquiryForm />
      </section>

      <SiteFooter />
    </div>
  );
}
