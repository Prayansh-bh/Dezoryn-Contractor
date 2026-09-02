import {
  CheckCircle2,
  ClipboardCheck,
  Factory,
  FlaskConical,
  PackageCheck,
  Search,
  ShieldCheck,
} from "lucide-react";
import { SiteShell, PageHero, PageCta } from "@frontend/components/site-shell";

export default function QualityPage() {
  const steps = [
    {
      icon: Search,
      num: "01",
      title: "Incoming Material Review",
      desc: "Every raw material—including synthetic hydrocarbon/alkyd resins, titanium dioxide pigments, and silica—is tested against purchase specifications before entering the production floor.",
    },
    {
      icon: Factory,
      num: "02",
      title: "Controlled Thermal Compounding",
      desc: "Batch formulation parameters, mixing durations, and heating temperatures are digitally monitored to prevent pigment degradation and ensure homogenous resin distribution.",
    },
    {
      icon: FlaskConical,
      num: "03",
      title: "Laboratory Testing & Verification",
      desc: "Samples from every batch undergo standard laboratory tests for softening point, luminance factor (whiteness/yellowness), retro-reflectivity, and skid resistance.",
    },
    {
      icon: PackageCheck,
      num: "04",
      title: "Packaging & Moisture Protection",
      desc: "Products are packed in heavy-duty poly-lined, moisture-protected 25 kg bags with clear batch coding, date of manufacture, and technical handling instructions.",
    },
    {
      icon: CheckCircle2,
      num: "05",
      title: "Pre-Dispatch Certification (MTC)",
      desc: "Final verification confirms project-specific BOQ quantities, packaging integrity, and generates a Manufacturer's Test Certificate (MTC) accompanying the vehicle.",
    },
  ];

  return (
    <SiteShell>
      <PageHero
        eyebrow="MANUFACTURING & QUALITY"
        breadcrumbCurrent="Quality Protocol"
        title="Quality Control Designed into Every Stage of Production."
        text="From strict raw material qualification to laboratory batch testing and pre-dispatch verification, our quality protocol guarantees that every consignment complies with MORTH and IRC standards."
      />

      {/* 5-Stage Protocol */}
      <section className="py-20 bg-slate-50">
        <div className="container">
          <div className="max-w-2xl mb-14">
            <div className="section-label mb-3">
              <span /> 5-STAGE PROTOCOL
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Standardized Quality Assurance Workflow
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <article
                  key={step.num}
                  className="p-8 rounded-lg bg-white border border-slate-200 hover:border-amber-500 transition-colors shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div className="w-12 h-12 rounded bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                        <Icon size={24} />
                      </div>
                      <span className="text-sm font-black text-slate-400">{step.num}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </article>
              );
            })}

            {/* Compliance Badge Card */}
            <article className="p-8 rounded-lg bg-slate-900 text-white border border-slate-800 flex flex-col justify-between">
              <div>
                <ShieldCheck size={32} className="text-amber-500 mb-6" />
                <h3 className="text-xl font-bold text-white mb-3">Specification Compliance</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  All formulations comply strictly with MORTH Specification Clause 803 and IRC guidelines for road markings and highway safety hardware.
                </p>
              </div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest mt-6 block">
                Official MTC Provided
              </span>
            </article>
          </div>
        </div>
      </section>

      {/* Quality Principle Statement */}
      <section className="py-20 bg-slate-950 text-white text-center border-t border-slate-800">
        <div className="container max-w-4xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-4">
            OUR QUALITY COMMITMENT
          </span>
          <blockquote className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
            “Deliver the exact specification agreed, in the quantity committed, with the consistency a large infrastructure project demands.”
          </blockquote>
        </div>
      </section>

      <PageCta />
    </SiteShell>
  );
}
