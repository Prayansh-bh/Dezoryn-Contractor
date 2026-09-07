import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  HardHat,
  ShieldCheck,
  Truck,
  UserCheck,
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
 * gateway on the homepage with high-impact action cards, live capacity telemetry, and trade disciplines.
 */
export function HomeWorkforceSection({ summary }: HomeWorkforceSectionProps) {
  const workforcePool = summary?.totalWorkforcePool || 2450;
  const verifiedAgencies = summary?.verifiedAgencies || 38;
  const openRequisitions = summary?.openRequisitions || 12;

  return (
    <section
      id="workforce"
      className="py-24 bg-[#090d16] text-[#f8fafc] border-b border-[#1e293b] relative overflow-hidden"
    >
      {/* Background Architectural Grid & Subtle Amber Glow */}
      <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none" />
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(201,163,93,0.12),transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />

      <div className="container relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#c9a35d]/10 border border-[#c9a35d]/30 text-[#f0d796] font-bold text-xs uppercase tracking-widest mb-3">
              <span className="inline-block w-2 h-2 rounded-full bg-[#c9a35d] animate-pulse" />
              05 — WORKFORCE & LABOUR EXCHANGE
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-serif leading-tight">
              Deploy & Mobilize Skilled Highway Crews.
            </h2>
          </div>
          <p className="text-[#94a3b8] max-w-lg text-sm sm:text-base leading-relaxed">
            Dezoryn bridges EPC contractors, specialized manpower supply agencies, and skilled artisans across India with transparent tracking dockets, compliance verification, and rapid project mobilization.
          </p>
        </div>

        {/* Live Industrial Telemetry Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-14">
          <div className="p-5 rounded-lg bg-[#0f172a]/90 border border-[#1e293b] hover:border-[#c9a35d]/40 transition-colors">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#f1d99b] font-display mb-1">
              {workforcePool.toLocaleString()}+
            </div>
            <div className="text-xs uppercase tracking-wider text-[#94a3b8] font-bold flex items-center gap-1.5">
              <Users size={13} className="text-[#c9a35d]" /> Workforce Deployment Pool
            </div>
          </div>

          <div className="p-5 rounded-lg bg-[#0f172a]/90 border border-[#1e293b] hover:border-[#c9a35d]/40 transition-colors">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#f1d99b] font-display mb-1">
              {verifiedAgencies}+
            </div>
            <div className="text-xs uppercase tracking-wider text-[#94a3b8] font-bold flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-[#34d399]" /> Verified Supply Agencies
            </div>
          </div>

          <div className="p-5 rounded-lg bg-[#0f172a]/90 border border-[#1e293b] hover:border-[#c9a35d]/40 transition-colors">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#f1d99b] font-display mb-1">
              24 States
            </div>
            <div className="text-xs uppercase tracking-wider text-[#94a3b8] font-bold flex items-center gap-1.5">
              <Truck size={13} className="text-[#60a5fa]" /> Pan-India Coverage
            </div>
          </div>

          <div className="p-5 rounded-lg bg-[#0f172a]/90 border border-[#1e293b] hover:border-[#c9a35d]/40 transition-colors">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#f1d99b] font-display mb-1">
              48 Hours
            </div>
            <div className="text-xs uppercase tracking-wider text-[#94a3b8] font-bold flex items-center gap-1.5">
              <Briefcase size={13} className="text-[#c9a35d]" /> Rapid Matching SLA
            </div>
          </div>
        </div>

        {/* 3 Action Gateway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Card 1: For EPC & Project Contractors */}
          <div className="p-8 rounded-xl bg-[#0f172a] border border-[#c9a35d]/40 hover:border-[#c9a35d] transition-all duration-300 flex flex-col justify-between shadow-2xl relative group hover:-translate-y-1.5">
            <div className="absolute top-0 right-8 -translate-y-1/2">
              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#c9a35d] to-[#e6ca85] text-[#090d16] px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-lg">
                ★ EPC CONTRACTORS
              </span>
            </div>

            <div>
              <div className="w-12 h-12 rounded-lg bg-[#c9a35d]/10 border border-[#c9a35d]/30 flex items-center justify-center text-[#f1d99b] mb-6 group-hover:scale-110 transition-transform">
                <Building2 size={24} />
              </div>

              <h3 className="text-xl font-bold text-white font-serif mb-2 group-hover:text-[#f0d796] transition-colors">
                Hire Project Manpower
              </h3>
              <p className="text-xs text-[#94a3b8] uppercase tracking-wider font-bold mb-4">
                Post Contractor Requisition
              </p>
              <p className="text-sm text-[#cbd5e1] leading-relaxed mb-6">
                Submit specific trade headcounts, project durations, and site amenities to receive matched, verified highway construction crews.
              </p>

              <ul className="space-y-2.5 mb-8 text-xs text-[#94a3b8]">
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
                  <span>Instant docket code (e.g. <code className="text-[#f1d99b]">REQ-10392825</code>)</span>
                </li>
              </ul>
            </div>

            <Link
              href="/workforce/hire"
              className="btn btn-primary w-full justify-center text-sm font-bold py-3.5 shadow-lg"
            >
              Post Labour Requisition <ArrowRight size={16} />
            </Link>
          </div>

          {/* Card 2: For Labour Supply Agencies */}
          <div className="p-8 rounded-xl bg-[#0f172a] border border-[#1e293b] hover:border-[#34d399]/60 transition-all duration-300 flex flex-col justify-between shadow-xl relative group hover:-translate-y-1.5">
            <div className="absolute top-0 right-8 -translate-y-1/2">
              <span className="inline-flex items-center gap-1 bg-[#10b981] text-[#064e3b] px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-lg">
                PARTNER CREWS
              </span>
            </div>

            <div>
              <div className="w-12 h-12 rounded-lg bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center text-[#34d399] mb-6 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>

              <h3 className="text-xl font-bold text-white font-serif mb-2 group-hover:text-[#6ee7b7] transition-colors">
                Partner as Supply Agency
              </h3>
              <p className="text-xs text-[#94a3b8] uppercase tracking-wider font-bold mb-4">
                Labour Contractors & Subcontractors
              </p>
              <p className="text-sm text-[#cbd5e1] leading-relaxed mb-6">
                Register your manpower supply agency, total crew strength (10 to 500+ workers), trade specializations, and state coverage.
              </p>

              <ul className="space-y-2.5 mb-8 text-xs text-[#94a3b8]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#34d399] shrink-0" />
                  <span>Direct connection to tier-1 NHAI & PWD contractors</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#34d399] shrink-0" />
                  <span>Verified partner badge & compliance credentials</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#34d399] shrink-0" />
                  <span>Permanent agency docket (e.g. <code className="text-[#6ee7b7]">AGC-84920184</code>)</span>
                </li>
              </ul>
            </div>

            <Link
              href="/workforce/agency"
              className="btn btn-secondary w-full justify-center text-sm font-bold py-3.5 border-slate-700 hover:border-[#34d399] text-white hover:text-[#34d399]"
            >
              Register Supply Agency <ArrowRight size={16} />
            </Link>
          </div>

          {/* Card 3: For Individual Artisans & Workers */}
          <div className="p-8 rounded-xl bg-[#0f172a] border border-[#1e293b] hover:border-[#60a5fa]/60 transition-all duration-300 flex flex-col justify-between shadow-xl relative group hover:-translate-y-1.5">
            <div className="absolute top-0 right-8 -translate-y-1/2">
              <span className="inline-flex items-center gap-1 bg-[#3b82f6] text-[#1e3a8a] px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-lg">
                FREE ENROLLMENT
              </span>
            </div>

            <div>
              <div className="w-12 h-12 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/30 flex items-center justify-center text-[#60a5fa] mb-6 group-hover:scale-110 transition-transform">
                <HardHat size={24} />
              </div>

              <h3 className="text-xl font-bold text-white font-serif mb-2 group-hover:text-[#93c5fd] transition-colors">
                Direct Skill Registry
              </h3>
              <p className="text-xs text-[#94a3b8] uppercase tracking-wider font-bold mb-4">
                Skilled Highway Workers & Operators
              </p>
              <p className="text-sm text-[#cbd5e1] leading-relaxed mb-6">
                Direct, fee-free enrollment for heavy machinery operators, rebar fabricators, masons, and road marking applicators across India.
              </p>

              <ul className="space-y-2.5 mb-8 text-xs text-[#94a3b8]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#60a5fa] shrink-0" />
                  <span>100% free direct registration without middlemen</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#60a5fa] shrink-0" />
                  <span>Daily wage expectation & pan-India deployment choice</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#60a5fa] shrink-0" />
                  <span>Verified worker code (e.g. <code className="text-[#93c5fd]">WRK-94028471</code>)</span>
                </li>
              </ul>
            </div>

            <Link
              href="/workforce/worker"
              className="btn btn-secondary w-full justify-center text-sm font-bold py-3.5 border-slate-700 hover:border-[#60a5fa] text-white hover:text-[#60a5fa]"
            >
              Enroll in Skill Registry <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Highway Trade Disciplines Strip */}
        <div className="p-6 rounded-xl bg-[#0b1220] border border-[#1e293b]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-2">
              <Wrench size={18} className="text-[#c9a35d]" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                Core Specialized Highway Disciplines
              </h4>
            </div>
            <Link
              href="/workforce"
              className="text-xs font-bold text-[#f1d99b] hover:text-white inline-flex items-center gap-1 transition-colors"
            >
              Explore Complete Workforce Hub <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {TRADES_SHOWCASE.map((t, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[#0f172a] border border-slate-800 text-center hover:border-[#c9a35d]/40 transition-colors"
              >
                <div className="text-xs font-bold text-slate-200 line-clamp-1 mb-1">
                  {t.name}
                </div>
                <div className="text-[10px] font-semibold text-[#c9a35d]">
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
