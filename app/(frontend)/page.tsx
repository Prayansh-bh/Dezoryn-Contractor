import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ChevronDown,
  Factory,
  Gauge,
  MapPin,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { SiteHeader } from "@frontend/components/site-header";
import { SiteFooter } from "@frontend/components/site-footer";
import { EnquiryForm } from "@frontend/components/enquiry-form";
import { HomeProductCard } from "@frontend/components/product-card";
import { CAPABILITIES } from "@shared/constants";

const products = [
  {
    no: "01",
    title: "Thermoplastic Road Marking Paint",
    text: "High-performance hot-applied compound engineered for sharp, durable and highly visible highway markings.",
    tag: "High durability",
  },
  {
    no: "02",
    title: "Reflective Glass Beads",
    text: "Precision-graded drop-on and intermix beads for powerful night-time retro-reflection and safer roads.",
    tag: "Night visibility",
  },
  {
    no: "03",
    title: "Kerb & Barrier Coatings",
    text: "Weather-resistant coatings developed for concrete kerbs, dividers and metal crash barriers.",
    tag: "All-weather",
  },
  {
    no: "04",
    title: "Road Studs & Delineators",
    text: "High-impact visibility products for lane guidance, curves, medians and critical highway zones.",
    tag: "Traffic safety",
  },
  {
    no: "05",
    title: "Traffic Safety Products",
    text: "Cones, bollards, barricades, reflectors and project-specific safety essentials supplied in bulk.",
    tag: "Bulk supply",
  },
  {
    no: "06",
    title: "Project-Specific Manufacturing",
    text: "Custom specifications, packaging and supply planning for contractors and infrastructure projects.",
    tag: "Made to requirement",
  },
];

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section id="home" className="hero">
        <div className="hero-image" />
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
            <a className="btn btn-primary" href="#products">
              Explore Products <ArrowRight size={19} />
            </a>
            <a className="btn btn-ghost" href="#enquiry">
              Discuss Bulk Requirement
            </a>
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
        <a className="scroll-hint" href="#about">
          <span>Discover</span>
          <ChevronDown />
        </a>
      </section>

      <section className="metrics">
        <div className="container metrics-grid">
          {CAPABILITIES.map(([value, label]) => (
            <div className="metric" key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="section about">
        <div className="container about-grid">
          <div className="section-label">01 — ABOUT DEZORYN</div>
          <div className="about-copy">
            <h2>
              Reliable products for
              <br />
              roads that never stop.
            </h2>
            <p>
              Dezoryn Contractor manufactures and supplies highway-use products
              built for demanding traffic, changing weather and strict project
              timelines. We work with road contractors, EPC companies,
              government vendors and distributors who need dependable quality at
              bulk scale.
            </p>
            <a href="#enquiry" className="text-link">
              Talk to our project team <ArrowRight size={18} />
            </a>
          </div>
          <div className="about-card">
            <Factory size={34} />
            <h3>Manufacturing-led supply</h3>
            <p>
              Controlled raw materials, repeatable batches and production
              planning aligned with project quantities.
            </p>
            {[
              "Material consistency",
              "Bulk-order readiness",
              "Dispatch coordination",
            ].map((x) => (
              <div className="mini-line" key={x}>
                <span>{x}</span>
                <BadgeCheck />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="products" className="section products">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-label light">02 — PRODUCT PORTFOLIO</div>
              <h2>
                One source for essential
                <br />
                highway products.
              </h2>
            </div>
            <p>
              No retail pricing. Every requirement is quoted against
              specification, quantity, packaging and delivery location.
            </p>
          </div>
          <div className="product-grid">
            {products.map((p, i) => (
              <HomeProductCard key={p.no} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section id="quality" className="section quality">
        <div className="container quality-grid">
          <div className="quality-visual">
            <div className="q-ring">
              <div>
                <Gauge />
                <strong>QC</strong>
                <span>at every batch</span>
              </div>
            </div>
            <span className="q-tag q1">Raw material check</span>
            <span className="q-tag q2">Batch traceability</span>
            <span className="q-tag q3">Dispatch verification</span>
          </div>
          <div>
            <div className="section-label">03 — QUALITY FIRST</div>
            <h2>
              Consistency is not a promise.
              <br />
              It is the process.
            </h2>
            <p className="lead">
              Our production workflow is designed around repeatability,
              performance and documented checks—so every project receives
              material aligned with its requirement.
            </p>
            <div className="quality-list">
              {[
                [
                  "01",
                  "Controlled sourcing",
                  "Selected raw materials and defined incoming checks.",
                ],
                [
                  "02",
                  "Process discipline",
                  "Monitored production parameters and batch records.",
                ],
                [
                  "03",
                  "Pre-dispatch review",
                  "Quantity, packaging and order details verified before movement.",
                ],
              ].map(([n, t, d]) => (
                <div key={n}>
                  <span>{n}</span>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="industries" className="applications">
        <div className="container">
          <div className="section-head compact">
            <div>
              <div className="section-label light">04 — BUILT FOR BIG PROJECTS</div>
              <h2>Where our products work.</h2>
            </div>
          </div>
          <div className="application-grid">
            <div>
              <Building2 />
              <span>01</span>
              <h3>National & State Highways</h3>
            </div>
            <div>
              <Truck />
              <span>02</span>
              <h3>Expressways & Logistics Corridors</h3>
            </div>
            <div>
              <MapPin />
              <span>03</span>
              <h3>Urban Roads & Smart Cities</h3>
            </div>
            <div>
              <Sparkles />
              <span>04</span>
              <h3>Airports & Industrial Campuses</h3>
            </div>
          </div>
        </div>
      </section>

      <section id="enquiry" className="section enquiry">
        <EnquiryForm />
      </section>

      <SiteFooter />
    </main>
  );
}
