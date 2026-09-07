"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  HardHat,
  Info,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
  UserCheck,
  Wrench,
} from "lucide-react";

const WORKER_TRADES = [
  { id: "bar_bender", title: "Bar Bender / Rebar Specialist", desc: "Rebar cutting, bending & footing cage tying" },
  { id: "paver_operator", title: "Highway Paver / Roller Operator", desc: "Bitumen paver, tandem & soil compactor operation" },
  { id: "crash_barrier_erector", title: "W-Beam Crash Barrier Erector", desc: "Post driving, beam fixing & torque tightening" },
  { id: "road_marker", title: "Thermoplastic Road Marking Worker", desc: "Pre-heater operation & applicator screeding" },
  { id: "heavy_operator", title: "Hydra / Crane / JCB Operator", desc: "Material handling, earthwork & lifting ops" },
  { id: "shuttering_carpenter", title: "Shuttering / Formwork Carpenter", desc: "Flyover deck, pier & wall shuttering assembly" },
  { id: "kerb_mason", title: "Kerb Stone & Masonry Specialist", desc: "Median casting, kerb alignment & drain lining" },
  { id: "structural_welder", title: "Structural Welder / Fabricator", desc: "MIG / Arc welding for highway signage & gantries" },
  { id: "civil_helper", title: "General Construction Helper", desc: "Site assistance, concrete mixing & load carrying" },
];

export function WorkerRegisterForm() {
  const [selectedTrade, setSelectedTrade] = useState("Bar Bender / Rebar Specialist");
  const [canRelocate, setCanRelocate] = useState(true);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [workerCode, setWorkerCode] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      fullName: String(formData.get("fullName") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      trade: selectedTrade,
      experienceYears: Number(formData.get("experienceYears") || 1),
      currentCity: String(formData.get("currentCity") || "").trim(),
      currentState: String(formData.get("currentState") || "").trim(),
      dailyWageExpect: String(formData.get("dailyWageExpect") || "").trim(),
      canRelocate,
      availability: String(formData.get("availability") || "immediate"),
    };

    try {
      const res = await fetch("/api/workforce/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Worker registration failed");
      }

      setWorkerCode(data.workerCode || "WRK-SUCCESS");
      setStatus("success");
      form.reset();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to register worker profile. Please verify your phone number and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-[#0b1220] border border-[#c9a35d]/40 text-center shadow-xl">
        <div className="w-16 h-16 rounded-full bg-[#c9a35d]/20 border border-[#c9a35d] flex items-center justify-center text-[#f1d99b] mx-auto mb-6">
          <CheckCircle2 size={36} />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#c9a35d] block mb-2">
          SKILL REGISTRATION COMPLETE
        </span>
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 font-serif">
          Profile Registered in Dezoryn Skill Registry
        </h3>
        <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
          You are now enrolled for <strong>{selectedTrade}</strong> project site placements. When contractors or agencies in your area need skilled hands, our team will connect directly with you on phone/WhatsApp.
        </p>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/60 inline-flex flex-col items-center gap-1 mb-8">
          <span className="text-xs text-slate-400">Worker Registry ID</span>
          <span className="text-xl font-mono font-bold text-[#f1d99b] tracking-wider">
            {workerCode}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setStatus("idle")}
            className="btn btn-primary"
          >
            Register Another Worker
          </button>
          <Link href="/workforce" className="btn btn-ghost">
            Back to Workforce Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-10 rounded-2xl bg-white border border-[#e2e8f0] shadow-sm">
      <div className="border-b border-[#e2e8f0] pb-6 mb-8">
        <div className="flex items-center gap-2 text-[#c9a35d] font-bold text-xs uppercase tracking-wider mb-2">
          <HardHat size={16} /> <span>Direct Skilled & Semi-Skilled Labour Desk</span>
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-[#0f172a] font-serif">
          Join the Dezoryn Construction Workforce
        </h3>
        <p className="text-sm text-[#64748b] mt-1">
          Free direct registration for machine operators, bar benders, masons, welders, and highway artisans looking for project work across India.
        </p>
      </div>

      {status === "error" && (
        <div className="p-4 mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <Info size={18} className="shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Basic Information */}
      <div className="space-y-6 mb-8">
        <h4 className="text-base font-bold text-[#0f172a] flex items-center gap-2 border-b border-slate-100 pb-2">
          <UserCheck size={18} className="text-[#c9a35d]" /> 1. Personal & Contact Details
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              required
              placeholder="e.g., Ramesh Kumar Yadav"
              className="w-full px-4 py-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#c9a35d] outline-none text-sm text-[#0f172a]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              Mobile / WhatsApp Number *
            </label>
            <input
              type="tel"
              name="phone"
              required
              placeholder="+91 98765 43210"
              className="w-full px-4 py-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#c9a35d] outline-none text-sm text-[#0f172a]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              Current Home City / District *
            </label>
            <input
              type="text"
              name="currentCity"
              required
              placeholder="e.g., Surat / Gorakhpur / Patna"
              className="w-full px-4 py-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#c9a35d] outline-none text-sm text-[#0f172a]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              Current State *
            </label>
            <input
              type="text"
              name="currentState"
              required
              placeholder="e.g., Gujarat / Bihar / Uttar Pradesh"
              className="w-full px-4 py-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#c9a35d] outline-none text-sm text-[#0f172a]"
            />
          </div>
        </div>
      </div>

      {/* 2. Trade & Skill Selection */}
      <div className="space-y-6 mb-8">
        <h4 className="text-base font-bold text-[#0f172a] flex items-center gap-2 border-b border-slate-100 pb-2">
          <Wrench size={18} className="text-[#c9a35d]" /> 2. Primary Trade & Work Experience
        </h4>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-3">
            Choose Your Skill Category *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {WORKER_TRADES.map((item) => {
              const selected = selectedTrade === item.title;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedTrade(item.title)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selected
                      ? "border-[#c9a35d] bg-amber-50/60 ring-2 ring-[#c9a35d]/40 shadow-sm"
                      : "border-[#e2e8f0] bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-xs font-bold text-[#0f172a]">{item.title}</strong>
                    {selected && <CheckCircle2 size={16} className="text-[#c9a35d]" />}
                  </div>
                  <p className="text-[11px] text-[#64748b] leading-tight">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              Years of Experience *
            </label>
            <select
              name="experienceYears"
              className="w-full px-4 py-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#c9a35d] outline-none text-sm text-[#0f172a] bg-white"
            >
              <option value="1">1 – 2 Years</option>
              <option value="3">3 – 5 Years (Skilled)</option>
              <option value="6">6 – 10 Years (Senior Artisan)</option>
              <option value="10">10+ Years (Master / Foreman)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              Expected Daily / Monthly Wage
            </label>
            <input
              type="text"
              name="dailyWageExpect"
              placeholder="e.g., ₹700 – ₹900 / day"
              className="w-full px-4 py-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#c9a35d] outline-none text-sm text-[#0f172a]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              Immediate Availability?
            </label>
            <select
              name="availability"
              className="w-full px-4 py-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#c9a35d] outline-none text-sm text-[#0f172a] bg-white"
            >
              <option value="immediate">Yes, Ready to Join Immediately</option>
              <option value="within_7_days">Within 7 Days</option>
              <option value="next_month">Next Month</option>
            </select>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <strong className="block text-xs font-bold text-[#0f172a]">
              Willing to Travel / Relocate to Highway Project Sites?
            </strong>
            <span className="text-xs text-[#64748b]">
              Project camps provide food, bed/lodging, and return transport.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCanRelocate(!canRelocate)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              canRelocate
                ? "bg-[#0b1220] text-[#f1d99b] border border-[#c9a35d]"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {canRelocate ? "✓ Yes, Pan-India" : "Local Only"}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#e2e8f0] pt-6">
        <div className="flex items-center gap-2 text-xs text-[#64748b]">
          <ShieldCheck size={16} className="text-[#c9a35d]" />
          <span>100% Free Registration. Zero deductions from your earnings.</span>
        </div>
        <button
          type="submit"
          disabled={status === "sending"}
          className="btn btn-primary w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2"
        >
          {status === "sending" ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Submitting Profile…
            </>
          ) : (
            <>
              Submit Worker Profile <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
