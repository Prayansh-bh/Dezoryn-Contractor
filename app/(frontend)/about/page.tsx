import Image from "next/image";
import Link from "next/link";
import { Award, CheckCircle2, Factory, Handshake, ShieldCheck, Truck } from "lucide-react";
import { SiteShell, PageHero, PageCta } from "@frontend/components/site-shell";

export default function AboutPage() {
  const pillars = [
    {
      icon: Factory,
      title: "Manufacturing Discipline",
      desc: "Repeatable automated batching processes, controlled raw materials, and precision heating protocols.",
    },
    {
      icon: ShieldCheck,
      title: "Quality Responsibility",
      desc: "Routine laboratory tests for retro-reflectivity, softening points, luminance, and skid resistance.",
    },
    {
      icon: Truck,
      title: "Pan-India Logistics",
      desc: "Coordinated freight network ensuring timely phased dispatches aligned with highway paving schedules.",
    },
    {
      icon: Handshake,
      title: "B2B Contractor Partnership",
      desc: "Direct communication from BOQ requirement review to site technical application support.",
    },
    {
      icon: Award,
      title: "MORTH & IRC Compliance",
      desc: "Formulations strictly engineered to meet Ministry of Road Transport & Highways guidelines.",
    },
  ];

  return (
    <SiteShell>
      <PageHero
        eyebrow="ABOUT DEZORYN CONTRACTOR"
        breadcrumbCurrent="About Us"
        title="Engineering Confidence and Safety into Every Kilometre."
        text="Dezoryn Contractor is a specialized manufacturing company focused on highway safety products and high-performance road-marking materials. We supply road contractors, EPC infrastructure firms, and government authorities across India."
      />

      {/* Purpose & Manufacturing Setup */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <div className="section-label mb-3">
                <span /> OUR PURPOSE
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                Strong highway infrastructure begins with disciplined manufacturing.
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-6">
                Infrastructure projects cannot afford delays due to inconsistent batch quality or delayed consignments. Our workflow starts with a rigorous understanding of the road conditions, required specifications, and target timelines.
              </p>
              <p className="text-slate-600 text-base leading-relaxed mb-8">
                By focusing on specialized thermoplastic compounding, precision-graded glass beads, and impact-resistant highway hardware, we provide dependable materials that withstand heavy axle traffic and extreme seasonal weather.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <strong className="text-2xl font-black text-amber-600 block">100%</strong>
                  <span className="text-xs font-semibold uppercase text-slate-500">Batch Tested</span>
                </div>
                <div>
                  <strong className="text-2xl font-black text-amber-600 block">Pan-India</strong>
                  <span className="text-xs font-semibold uppercase text-slate-500">Dispatch Network</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative h-[400px] rounded-lg overflow-hidden border border-slate-200 shadow-xl">
                <Image
                  src="/images/products/custom-manufacturing.jpg"
                  alt="Dezoryn Manufacturing Facility"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Operational Pillars */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container">
          <div className="max-w-3xl mb-14">
            <div className="section-label mb-3">
              <span /> CORE PILLARS
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              What Defines Dezoryn Contractor
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="p-8 rounded-lg bg-slate-800/70 border border-slate-700/80 hover:border-amber-500/50 transition-colors"
                >
                  <Icon size={32} className="text-amber-500 mb-6" />
                  <h3 className="text-xl font-bold text-white mb-3">{pillar.title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Market Presence */}
      <section className="py-20 bg-slate-50">
        <div className="container">
          <div className="p-10 lg:p-14 rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white border border-slate-800 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="max-w-2xl">
              <div className="section-label mb-3">
                <span /> NATIONWIDE SUPPLY
              </div>
              <h2 className="text-3xl font-extrabold text-white mb-4">
                Serving Infrastructure Projects Across India
              </h2>
              <p className="text-slate-300 text-base leading-relaxed">
                From National Highway expansions and Greenfield Expressways to smart city arterial roads and industrial transit corridors, our materials support contractors executing major infrastructure works.
              </p>
            </div>
            <div className="shrink-0">
              <Link href="/contact" className="btn btn-primary">
                Discuss Project Supply
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PageCta />
    </SiteShell>
  );
}
