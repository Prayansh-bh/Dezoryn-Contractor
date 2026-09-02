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
      <section className="py-20 bg-[#090d14] text-white border-b border-[rgba(201,163,93,0.2)]">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <div className="section-label mb-3">
                <span /> OUR PURPOSE
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-6 font-serif">
                Strong highway infrastructure begins with disciplined manufacturing.
              </h2>
              <p className="text-[#94a3b8] text-base sm:text-lg leading-relaxed mb-6">
                Infrastructure projects cannot afford delays due to inconsistent batch quality or delayed consignments. Our workflow starts with a rigorous understanding of the road conditions, required specifications, and target timelines.
              </p>
              <p className="text-[#94a3b8] text-base leading-relaxed mb-8">
                By focusing on specialized thermoplastic compounding, precision-graded glass beads, and impact-resistant highway hardware, we provide dependable materials that withstand heavy axle traffic and extreme seasonal weather.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[rgba(201,163,93,0.2)]">
                <div>
                  <strong className="text-2xl font-black text-[#f0d796] block font-display">100%</strong>
                  <span className="text-xs font-semibold uppercase text-[#94a3b8]">Batch Tested</span>
                </div>
                <div>
                  <strong className="text-2xl font-black text-[#f0d796] block font-display">Pan-India</strong>
                  <span className="text-xs font-semibold uppercase text-[#94a3b8]">Dispatch Network</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative h-[400px] rounded-lg overflow-hidden border border-[rgba(201,163,93,0.25)] shadow-2xl">
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
      <section className="py-20 bg-[#06090d] text-white">
        <div className="container">
          <div className="max-w-3xl mb-14">
            <div className="section-label mb-3">
              <span /> CORE PILLARS
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-serif">
              What Defines Dezoryn Contractor
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <article
                  key={pillar.title}
                  className="p-8 rounded-lg bg-[#0e141f] border border-[rgba(201,163,93,0.18)] hover:border-[#c9a35d] transition-all shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded bg-[#070a0f] border border-[rgba(201,163,93,0.25)] flex items-center justify-center text-[#c9a35d] mb-6">
                      <Icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 font-serif">{pillar.title}</h3>
                    <p className="text-[#94a3b8] text-sm leading-relaxed">{pillar.desc}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Nationwide Supply Banner */}
      <section className="py-20 bg-[#090d14] border-t border-[rgba(201,163,93,0.2)] text-white">
        <div className="container">
          <div className="p-10 lg:p-14 rounded-xl bg-[#0e141f] text-white border border-[rgba(201,163,93,0.25)] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="max-w-2xl">
              <div className="section-label mb-3">
                <span /> NATIONWIDE SUPPLY
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 font-serif">
                Serving Infrastructure Projects Across India
              </h2>
              <p className="text-[#94a3b8] text-base leading-relaxed">
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
