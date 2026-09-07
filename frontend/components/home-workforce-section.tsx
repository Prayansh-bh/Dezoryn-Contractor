import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  HardHat,
  ShieldCheck,
  Truck,
  Users,
  Wrench,
} from "lucide-react";
import type { WorkforceSummary } from "@shared/types";

interface HomeWorkforceSectionProps {
  summary?: WorkforceSummary;
}

const TRADES_SHOWCASE = [
  { name: "Bar Bending & Structural Rebar", count: "800+ Active" },
  { name: "Highway Paver & Roller Operators", count: "EPC Certified" },
  { name: "W-Beam Crash Barrier Crews", count: "Dezoryn Core" },
  { name: "Thermoplastic Road Marking Applicators", count: "MORTH Trained" },
  { name: "Hydra, Crane & Heavy Earthmoving", count: "Licensed" },
  { name: "Kerb Stone & Cast-in-Situ Masons", count: "Slipform Master" },
];

/**
 * HomeWorkforceSection
 * Single Responsibility: Present the 3-Way Industrial Workforce & Contractor Labour Exchange
 * gateway on the homepage with executive white architectural styling, live telemetry, and trade disciplines.
 */
export function HomeWorkforceSection({ summary }: HomeWorkforceSectionProps) {
  const workforcePool = summary?.totalWorkforcePool || 2450;
  const verifiedAgencies = summary?.verifiedAgencies || 38;

  return (
    <section
      id="workforce"
      className="py-24 bg-[#f8fafc] text-[#0f172a] border-b border-[#e2e8f0] relative"
    >
      <div className="container relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6 mb-16">
          <div>
            <div className="section-label mb-3">
              <span /> 05 — WORKFORCE & LABOUR EXCHANGE
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] tracking-tight font-serif leading-tight">
              Deploy & Mobilize Skilled Highway Crews.
            </h2>
          </div>
          <p className="text-[#475569] max-w-lg text-sm sm:text-base leading-relaxed">
            Dezoryn bridges EPC contractors, specialized manpower supply agencies, and skilled artisans across India with transparent tracking dockets, compliance verification, and rapid project mobilization.
          </p>
        </div>

        {/* Live Industrial Telemetry Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-14">
          <div className="p-5 rounded-lg bg-white border border-[#e2e8f0] shadow-sm hover:border-[#c9a35d] hover:shadow-md transition-all">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] font-display mb-1">
              {workforcePool.toLocaleString()}+
            </div>
            <div className="text-xs uppercase tracking-wider text-[#64748b] font-bold flex items-center gap-1.5">
              <Users size={14} className="text-[#c9a35d]" /> Workforce Pool
            </div>
          </div>

          <div className="p-5 rounded-lg bg-white border border-[#e2e8f0] shadow-sm hover:border-[#059669] hover:shadow-md transition-all">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] font-display mb-1">
              {verifiedAgencies}+
            </div>
            <div className="text-xs uppercase tracking-wider text-[#64748b] font-bold flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#059669]" /> Verified Agencies
            </div>
          </div>

          <div className="p-5 rounded-lg bg-white border border-[#e2e8f0] shadow-sm hover:border-[#2563eb] hover:shadow-md transition-all">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] font-display mb-1">
              24 States
            </div>
            <div className="text-xs uppercase tracking-wider text-[#64748b] font-bold flex items-center gap-1.5">
              <Truck size={14} className="text-[#2563eb]" /> Pan-India Mobility
            </div>
          </div>

          <div className="p-5 rounded-lg bg-white border border-[#e2e8f0] shadow-sm hover:border-[#c9a35d] hover:shadow-md transition-all">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] font-display mb-1">
              48 Hours
            </div>
            <div className="text-xs uppercase tracking-wider text-[#64748b] font-bold flex items-center gap-1.5">
              <Briefcase size={14} className="text-[#c9a35d]" /> Matching SLA
            </div>
          </div>
        </div>

        {/* 3 Action Gateway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Card 1: For EPC & Project Contractors */}
          <div className="p-8 rounded-xl bg-white border-2 border-[#c9a35d]/60 hover:border-[#c9a35d] transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl relative group hover:-translate-y-1.5">
            <div className="absolute top-0 right-8 -translate-y-1/2">
              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#f1d99b] to-[#c9a35d] text-[#0f172a] border border-[#c9a35d] px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                ★ EPC CONTRACTORS
              </span>
            </div>

            <div>
              <div className="w-12 h-12 rounded-lg bg-[#fdfaf3] border border-[#c9a35d]/30 flex items-center justify-center text-[#c9a35d] mb-6 group-hover:scale-110 transition-transform">
                <Building2 size={24} />
              </div>

              <h3 className="text-xl font-bold text-[#0f172a] font-serif mb-1 group-hover:text-[#c9a35d] transition-colors">
                Hire Project Manpower
              </h3>
              <p className="text-xs text-[#c9a35d] uppercase tracking-wider font-bold mb-4">
                Post Contractor Requisition
              </p>
              <p className="text-sm text-[#475569] leading-relaxed mb-6">
                Submit specific trade headcounts, project durations, and site amenities to receive matched, verified highway construction crews.
              </p>

              <ul className="space-y-2.5 mb-8 text-xs text-[#64748b]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#c9a35d] shrink-0" />
                  <span>Multi-trade matrix breakdown (Bar benders, Pavers, Masons)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#c9a35d] shrink-0" />
                  <span>Site logistics & PPE compliance specification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#c9a35d] shrink-0" />
                  <span>Instant docket code (e.g. <code className="font-mono font-bold text-[#0f172a] bg-[#f8fafc] px-1.5 py-0.5 rounded border border-[#e2e8f0]">REQ-10392825</code>)</span>
                </li>
              </ul>
            </div>

            <Link
              href="/workforce/hire"
              className="btn btn-primary w-full justify-center text-sm font-bold py-3.5 shadow-md"
            >
              Post Labour Requisition <ArrowRight size={16} />
            </Link>
          </div>

          {/* Card 2: For Labour Supply Agencies */}
          <div className="p-8 rounded-xl bg-white border border-[#e2e8f0] hover:border-[#059669] transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl relative group hover:-translate-y-1.5">
            <div className="absolute top-0 right-8 -translate-y-1/2">
              <span className="inline-flex items-center gap-1 bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0] px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                PARTNER CREWS
              </span>
            </div>

            <div>
              <div className="w-12 h-12 rounded-lg bg-[#ecfdf5] border border-[#a7f3d0] flex items-center justify-center text-[#059669] mb-6 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>

              <h3 className="text-xl font-bold text-[#0f172a] font-serif mb-1 group-hover:text-[#059669] transition-colors">
                Partner as Supply Agency
              </h3>
              <p className="text-xs text-[#059669] uppercase tracking-wider font-bold mb-4">
                Labour Contractors & Subcontractors
              </p>
              <p className="text-sm text-[#475569] leading-relaxed mb-6">
                Register your manpower supply agency, total crew strength (10 to 500+ workers), trade specializations, and state coverage.
              </p>

              <ul className="space-y-2.5 mb-8 text-xs text-[#64748b]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#059669] shrink-0" />
                  <span>Direct connection to tier-1 NHAI & PWD contractors</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#059669] shrink-0" />
                  <span>Verified partner badge & compliance credentials</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#059669] shrink-0" />
                  <span>Permanent agency docket (e.g. <code className="font-mono font-bold text-[#0f172a] bg-[#f8fafc] px-1.5 py-0.5 rounded border border-[#e2e8f0]">AGC-84920184</code>)</span>
                </li>
              </ul>
            </div>

            <Link
              href="/workforce/agency"
              className="btn btn-secondary w-full justify-center text-sm font-bold py-3.5 border-[#e2e8f0] hover:border-[#059669] text-[#0f172a] hover:text-[#059669]"
            >
              Register Supply Agency <ArrowRight size={16} />
            </Link>
          </div>

          {/* Card 3: For Individual Artisans & Workers */}
          <div className="p-8 rounded-xl bg-white border border-[#e2e8f0] hover:border-[#2563eb] transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl relative group hover:-translate-y-1.5">
            <div className="absolute top-0 right-8 -translate-y-1/2">
              <span className="inline-flex items-center gap-1 bg-[#eff6ff] text-[#1e40af] border border-[#bfdbfe] px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                FREE ENROLLMENT
              </span>
            </div>

            <div>
              <div className="w-12 h-12 rounded-lg bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-center text-[#2563eb] mb-6 group-hover:scale-110 transition-transform">
                <HardHat size={24} />
              </div>

              <h3 className="text-xl font-bold text-[#0f172a] font-serif mb-1 group-hover:text-[#2563eb] transition-colors">
                Direct Skill Registry
              </h3>
              <p className="text-xs text-[#2563eb] uppercase tracking-wider font-bold mb-4">
                Skilled Highway Workers & Operators
              </p>
              <p className="text-sm text-[#475569] leading-relaxed mb-6">
                Direct, fee-free enrollment for heavy machinery operators, rebar fabricators, masons, and road marking applicators across India.
              </p>

              <ul className="space-y-2.5 mb-8 text-xs text-[#64748b]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#2563eb] shrink-0" />
                  <span>100% free direct registration without middlemen</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#2563eb] shrink-0" />
                  <span>Daily wage expectation & pan-India deployment choice</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#2563eb] shrink-0" />
                  <span>Verified worker code (e.g. <code className="font-mono font-bold text-[#0f172a] bg-[#f8fafc] px-1.5 py-0.5 rounded border border-[#e2e8f0]">WRK-94028471</code>)</span>
                </li>
              </ul>
            </div>

            <Link
              href="/workforce/worker"
              className="btn btn-secondary w-full justify-center text-sm font-bold py-3.5 border-[#e2e8f0] hover:border-[#2563eb] text-[#0f172a] hover:text-[#2563eb]"
            >
              Enroll in Skill Registry <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Highway Trade Disciplines Strip */}
        <div className="p-6 sm:p-8 rounded-xl bg-white border border-[#e2e8f0] shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Wrench size={18} className="text-[#c9a35d]" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#0f172a]">
                Core Specialized Highway Disciplines
              </h4>
            </div>
            <Link
              href="/workforce"
              className="text-xs font-bold text-[#c9a35d] hover:underline inline-flex items-center gap-1 transition-colors"
            >
              Explore Complete Workforce Hub <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {TRADES_SHOWCASE.map((t, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-center hover:border-[#c9a35d] hover:bg-white transition-all shadow-2xs"
              >
                <div className="text-xs font-bold text-[#0f172a] line-clamp-1 mb-1">
                  {t.name}
                </div>
                <div className="text-[10px] font-bold text-[#c9a35d]">
                  {t.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
