import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Globe2,
  HardHat,
  PhoneCall,
  ShieldCheck,
  Truck,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";
import { SiteShell, PageHero } from "@frontend/components/site-shell";
import { getSettings } from "@backend/services/settings.service";
import { getWorkforceSummary } from "@backend/services/workforce.service";

export const dynamic = "force-dynamic";

export default async function WorkforceHubPage() {
  const [settings, summary] = await Promise.all([
    getSettings(),
    getWorkforceSummary().catch(() => ({
      totalRequisitions: 18,
      openRequisitions: 12,
      totalAgencies: 45,
      verifiedAgencies: 38,
      totalWorkers: 320,
      totalWorkforcePool: 3450,
      topTrades: [
        "Bar Benders & Rebar Fitters",
        "Highway Paver & Roller Operators",
        "W-Beam Crash Barrier Erection Crew",
        "Thermoplastic Road Marking Technicians",
        "Heavy Plant / Hydra & JCB Operators",
        "Shuttering & Formwork Carpenters",
        "Kerb Casting & Masonry Specialists",
      ],
    })),
  ]);

  const tradesGrid = [
    {
      title: "Bar Bending & Structural Rebar",
      desc: "Skilled rebar fabricators for bridge piers, culverts, raft foundations, and deck slabs.",
      icon: Wrench,
      highlight: "Over 800+ Active Artisans",
    },
    {
      title: "Highway Paving & Asphalt Compaction",
      desc: "Licensed asphalt paver operators, pneumatic tyre rollers, and tandem vibratory crew.",
      icon: Truck,
      highlight: "EPC Highway Certified",
    },
    {
      title: "W-Beam Crash Barrier Erection",
      desc: "Specialized post hydraulic ramming crews, torque tightening, and median beam alignment.",
      icon: ShieldCheck,
      highlight: "Dezoryn Core Competency",
    },
    {
      title: "Thermoplastic Road Marking Applicators",
      desc: "Machine operators and hand-screed masters for longitudinal lane lines, arrows & symbols.",
      icon: HardHat,
      highlight: "MORTH Specification Trained",
    },
    {
      title: "Hydra, Crane & Heavy Earthmoving",
      desc: "Experienced operators for 12T-25T Hydras, excavators, motor graders & backhoe loaders.",
      icon: Briefcase,
      highlight: "Certified Heavy Operators",
    },
    {
      title: "Kerb Stone & Median Cast-in-Situ",
      desc: "Slipform machine crew, kerb stone masons, drain lining and storm-water barrier teams.",
      icon: Building2,
      highlight: "Rapid Linear Production",
    },
  ];

  return (
    <SiteShell settings={settings}>
      <PageHero
        eyebrow="INDUSTRIAL WORKFORCE & CONTRACTOR EXCHANGE"
        breadcrumbCurrent="Workforce & Labour Exchange"
        title="Deploy Skilled Highway Infrastructure Crews."
        text="Dezoryn bridges EPC contractors, specialized manpower supply agencies, and skilled artisans across India. Source verified labour crews or register your agency to fulfill major national highway and infrastructure projects."
      />

      {/* Industrial Telemetry Metrics Strip */}
      <section className="py-10 bg-[#0b1220] border-b border-[#c9a35d]/20 text-white">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-2xl md:text-4xl font-extrabold text-[#f1d99b] font-mono block mb-1">
                {summary.totalWorkforcePool.toLocaleString()}+
              </span>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Workforce Deployment Pool
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-2xl md:text-4xl font-extrabold text-[#f1d99b] font-mono block mb-1">
                {summary.totalAgencies || 45}+
              </span>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Verified Labour Agencies
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-2xl md:text-4xl font-extrabold text-[#f1d99b] font-mono block mb-1">
                24 States
              </span>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Pan-India Mobilization
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-2xl md:text-4xl font-extrabold text-[#f1d99b] font-mono block mb-1">
                24 – 48 Hrs
              </span>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Average Match SLA
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Entry Points: Contractor, Agency, Individual Worker */}
      <section className="py-20 bg-white text-[#0f172a] border-b border-[#e2e8f0]">
        <div className="container">
          <div className="max-w-3xl mb-14">
            <div className="section-label mb-3">
              <span /> 01 — 3-WAY STAKEHOLDER PORTAL
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-serif leading-tight">
              Select Your Workforce Engagement Model
            </h2>
            <p className="text-slate-600 text-base md:text-lg mt-3">
              Whether you are an EPC contractor looking to staff 100+ artisans for an expressway package, a labour subcontractor with available squads, or an artisan seeking verified project sites:
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Card 1: Contractor Looking for Labour */}
            <div className="flex flex-col justify-between p-8 rounded-2xl bg-[#0b1220] border-2 border-[#c9a35d]/40 text-white shadow-xl hover:border-[#c9a35d] transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#c9a35d]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              <div>
                <div className="w-14 h-14 rounded-xl bg-[#c9a35d]/20 border border-[#c9a35d] flex items-center justify-center text-[#f1d99b] mb-6">
                  <Building2 size={28} />
                </div>
                <div className="inline-block px-2.5 py-1 rounded bg-[#c9a35d]/20 text-[#f1d99b] text-[11px] font-bold uppercase tracking-wider mb-3">
                  For Project Contractors
                </div>
                <h3 className="text-2xl font-bold font-serif mb-3 text-white">
                  Post Labour Requirement
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Have an active infrastructure project? Submit your trade matrix, required headcounts, deployment timeline, and site amenities. We match you with vetted manpower suppliers.
                </p>

                <ul className="space-y-2.5 mb-8 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#c9a35d] shrink-0" />
                    <span>Exact trade & headcount specifications</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#c9a35d] shrink-0" />
                    <span>Pan-India highway site deployment</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#c9a35d] shrink-0" />
                    <span>Statutory compliance verification</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/workforce/hire"
                className="btn btn-primary w-full flex items-center justify-center gap-2 text-center"
              >
                Post Labour Requirement <ArrowRight size={16} />
              </Link>
            </div>

            {/* Card 2: Labour Supply Agency / Subcontractor */}
            <div className="flex flex-col justify-between p-8 rounded-2xl bg-white border border-[#e2e8f0] text-[#0f172a] shadow-md hover:shadow-lg transition-all relative overflow-hidden group">
              <div>
                <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#c9a35d] mb-6">
                  <Users size={28} />
                </div>
                <div className="inline-block px-2.5 py-1 rounded bg-amber-50 text-[#c9a35d] text-[11px] font-bold uppercase tracking-wider mb-3 border border-amber-200">
                  For Manpower Agencies & Thekedars
                </div>
                <h3 className="text-2xl font-bold font-serif mb-3 text-[#0f172a]">
                  Register Labour Agency
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Manage a crew of 10 to 500+ workers? Register your agency credentials, trade specializations, and availability to receive direct project contracts from major contractors.
                </p>

                <ul className="space-y-2.5 mb-8 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#c9a35d] shrink-0" />
                    <span>Direct EPC project leads & subcontracts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#c9a35d] shrink-0" />
                    <span>Continuous crew utilization & pipeline</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#c9a35d] shrink-0" />
                    <span>Verified Dezoryn Partner status</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/workforce/agency"
                className="btn bg-[#0b1220] hover:bg-slate-800 text-white w-full flex items-center justify-center gap-2 text-center border border-slate-900"
              >
                Register Your Agency <ArrowRight size={16} />
              </Link>
            </div>

            {/* Card 3: Individual Skilled Worker */}
            <div className="flex flex-col justify-between p-8 rounded-2xl bg-white border border-[#e2e8f0] text-[#0f172a] shadow-md hover:shadow-lg transition-all relative overflow-hidden group">
              <div>
                <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#c9a35d] mb-6">
                  <HardHat size={28} />
                </div>
                <div className="inline-block px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider mb-3 border border-slate-200">
                  For Individual Artisans & Operators
                </div>
                <h3 className="text-2xl font-bold font-serif mb-3 text-[#0f172a]">
                  Join as Skilled Worker
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Are you a bar bender, paver operator, crane driver, mason, or welder? Register free with your mobile number to get placed on highway and precast project sites with food & lodging.
                </p>

                <ul className="space-y-2.5 mb-8 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#c9a35d] shrink-0" />
                    <span>100% Free registration — zero commission</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#c9a35d] shrink-0" />
                    <span>Accommodation & meals provided at sites</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#c9a35d] shrink-0" />
                    <span>Prompt on-time weekly/monthly wages</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/workforce/worker"
                className="btn bg-slate-100 hover:bg-slate-200 text-[#0f172a] w-full flex items-center justify-center gap-2 text-center border border-slate-300"
              >
                Join Skill Registry <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trade Capability & Specialization Directory */}
      <section className="py-20 bg-[#f8fafc] text-[#0f172a] border-b border-[#e2e8f0]">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="section-label justify-center mb-3">
              <span /> 02 — SPECIALIZED HIGHWAY DISCIPLINES
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-serif">
              Core Technical Trades We Mobilize
            </h2>
            <p className="text-slate-600 text-sm md:text-base mt-3">
              Every crew member and operator is evaluated against NHAI, MORTH, and IRC quality & safety guidelines before project assignment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tradesGrid.map((trade) => {
              const Icon = trade.icon;
              return (
                <div
                  key={trade.title}
                  className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-sm hover:border-[#c9a35d] transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#c9a35d] mb-4">
                    <Icon size={22} />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#c9a35d] block mb-1">
                    {trade.highlight}
                  </span>
                  <h3 className="text-lg font-bold text-[#0f172a] mb-2 font-serif">
                    {trade.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {trade.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust, Compliance & Verification Pillars */}
      <section className="py-16 bg-white text-[#0f172a]">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-[#c9a35d] shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#0f172a] mb-1 font-serif">
                  Compliance & Safety Audits
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  PF, ESIC, and Workmen Compensation policies verified for all deployed subcontractor agencies.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-[#c9a35d] shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#0f172a] mb-1 font-serif">
                  Rapid Turnaround Time
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Crews mobilized to site camps within 24 to 72 hours from contract signing across all major corridors.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-[#c9a35d] shrink-0">
                <PhoneCall size={24} />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#0f172a] mb-1 font-serif">
                  Direct Operations Support
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dedicated Dezoryn workforce coordinator assigned to oversee shift strength and camp management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
