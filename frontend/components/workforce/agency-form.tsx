"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  FileBadge2,
  Info,
  Loader2,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";

const TRADES_OPTIONS = [
  "Bar Bending & Rebar Fitters",
  "Highway Paver / Roller Operators",
  "W-Beam Crash Barrier Erection Crew",
  "Thermoplastic Road Marking Technicians",
  "Hydra / Crane / Heavy Plant Operators",
  "Shuttering & Formwork Carpenters",
  "Kerb Casting & Masonry Specialists",
  "Structural Welders / Fitters",
  "General Civil Construction Helpers",
  "Pre-cast Segment Erection Crew",
];

const POPULAR_STATES = [
  "Gujarat",
  "Maharashtra",
  "Rajasthan",
  "Madhya Pradesh",
  "Uttar Pradesh",
  "Haryana",
  "Karnataka",
  "Tamil Nadu",
  "Pan-India",
];

export function AgencyRegisterForm() {
  const [selectedTrades, setSelectedTrades] = useState<string[]>([
    "Bar Bending & Rebar Fitters",
    "Shuttering & Formwork Carpenters",
  ]);
  const [selectedStates, setSelectedStates] = useState<string[]>(["Gujarat", "Maharashtra"]);
  const [crewSize, setCrewSize] = useState(50);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [referenceCode, setReferenceCode] = useState("");

  function toggleTrade(trade: string) {
    if (selectedTrades.includes(trade)) {
      setSelectedTrades(selectedTrades.filter((t) => t !== trade));
    } else {
      setSelectedTrades([...selectedTrades, trade]);
    }
  }

  function toggleState(st: string) {
    if (selectedStates.includes(st)) {
      setSelectedStates(selectedStates.filter((s) => s !== st));
    } else {
      setSelectedStates([...selectedStates, st]);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selectedTrades.length === 0) {
      setErrorMessage("Please select at least one primary trade capability.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      agencyName: String(formData.get("agencyName") || "").trim(),
      proprietorName: String(formData.get("proprietorName") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      gstin: String(formData.get("gstin") || "").trim(),
      labourLicenseNo: String(formData.get("labourLicenseNo") || "").trim(),
      state: String(formData.get("state") || "").trim(),
      city: String(formData.get("city") || "").trim(),
      totalCrewSize: Number(crewSize) || 10,
      primaryTrades: selectedTrades,
      preferredStates: selectedStates,
      availability: String(formData.get("availability") || "immediate"),
    };

    try {
      const res = await fetch("/api/workforce/agencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Agency registration failed");
      }

      setReferenceCode(data.agencyCode || "AGC-SUCCESS");
      setStatus("success");
      form.reset();
    } catch (err: any) {
      setErrorMessage(err.message || "Could not complete agency registration. Please try again.");
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
          AGENCY PROFILE ONBOARDED
        </span>
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 font-serif">
          Registration Submitted for Verification
        </h3>
        <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
          Your agency and crew capacity of <strong>{crewSize} workforce personnel</strong> has been lodged in Dezoryn Contractor Exchange. Our desk will contact you to match with active EPC highway project packages.
        </p>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/60 inline-flex flex-col items-center gap-1 mb-8">
          <span className="text-xs text-slate-400">Agency Identification Code</span>
          <span className="text-xl font-mono font-bold text-[#f1d99b] tracking-wider">
            {referenceCode}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setStatus("idle")}
            className="btn btn-primary"
          >
            Register Another Agency
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
          <Briefcase size={16} /> <span>Subcontractor & Labour Agency Onboarding</span>
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-[#0f172a] font-serif">
          Register Your Labour Supply Agency
        </h3>
        <p className="text-sm text-[#64748b] mt-1">
          Connect your workforce crew with leading EPC contractors, road developers, and industrial infrastructure builders seeking verified staffing.
        </p>
      </div>

      {status === "error" && (
        <div className="p-4 mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <Info size={18} className="shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Firm Identification */}
      <div className="space-y-6 mb-8">
        <h4 className="text-base font-bold text-[#0f172a] flex items-center gap-2 border-b border-slate-100 pb-2">
          <FileBadge2 size={18} className="text-[#c9a35d]" /> 1. Agency Credentials & Contact
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              Agency / Firm Name *
            </label>
            <input
              type="text"
              name="agencyName"
              required
              placeholder="e.g., Royal Highway Infra Staffing Pvt Ltd"
              className="w-full px-4 py-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#c9a35d] outline-none text-sm text-[#0f172a]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              Proprietor / Representative Name *
            </label>
            <input
              type="text"
              name="proprietorName"
              required
              placeholder="e.g., Suresh Patel (Managing Partner)"
              className="w-full px-4 py-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#c9a35d] outline-none text-sm text-[#0f172a]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              Official Phone / Mobile Number *
            </label>
            <input
              type="tel"
              name="phone"
              required
              placeholder="+91 98765 43210"
              className="w-full px-4 py-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#c9a35d] outline-none text-sm text-[#0f172a]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              Email Address (Optional)
            </label>
            <input
              type="email"
              name="email"
              placeholder="agency@dezoryn-partner.com"
              className="w-full px-4 py-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#c9a35d] outline-none text-sm text-[#0f172a]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              GSTIN (If Registered)
            </label>
            <input
              type="text"
              name="gstin"
              placeholder="24AAAAA0000A1Z5"
              className="w-full px-4 py-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#c9a35d] outline-none text-sm text-[#0f172a]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              Labour License / Registration No. (Optional)
            </label>
            <input
              type="text"
              name="labourLicenseNo"
              placeholder="e.g., CLA/GUJ/2023/8492"
              className="w-full px-4 py-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#c9a35d] outline-none text-sm text-[#0f172a]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              Headquarters Base State *
            </label>
            <input
              type="text"
              name="state"
              required
              placeholder="e.g., Gujarat / Rajasthan / Maharashtra"
              className="w-full px-4 py-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#c9a35d] outline-none text-sm text-[#0f172a]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              City / Base Location *
            </label>
            <input
              type="text"
              name="city"
              required
              placeholder="e.g., Ahmedabad / Jaipur / Pune"
              className="w-full px-4 py-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#c9a35d] outline-none text-sm text-[#0f172a]"
            />
          </div>
        </div>
      </div>

      {/* 2. Crew Size & Trade Specialties */}
      <div className="space-y-6 mb-8">
        <h4 className="text-base font-bold text-[#0f172a] flex items-center gap-2 border-b border-slate-100 pb-2">
          <Users size={18} className="text-[#c9a35d]" /> 2. Workforce Capacity & Trade Expertise
        </h4>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              Total Active Crew Pool: <span className="text-base text-[#c9a35d] font-bold">{crewSize} Workers</span>
            </label>
            <span className="text-xs text-slate-500 font-mono">10 to 500+ Personnel</span>
          </div>
          <input
            type="range"
            min="5"
            max="500"
            step="5"
            value={crewSize}
            onChange={(e) => setCrewSize(Number(e.target.value))}
            className="w-full accent-[#c9a35d] h-2 bg-slate-200 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Small Squad (10-25)</span>
            <span>Medium Crew (50-100)</span>
            <span>Enterprise Fleet (250-500+)</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-3">
            Primary Trades Supplied (Select all that apply) *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {TRADES_OPTIONS.map((trade) => {
              const checked = selectedTrades.includes(trade);
              return (
                <label
                  key={trade}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                    checked
                      ? "border-[#c9a35d] bg-amber-50/50 text-[#0f172a]"
                      : "border-[#e2e8f0] bg-white text-[#64748b] hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleTrade(trade)}
                    className="accent-[#c9a35d] w-4 h-4 rounded"
                  />
                  <span className="text-xs font-semibold">{trade}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-3">
            Service Deployment States
          </label>
          <div className="flex flex-wrap gap-2">
            {POPULAR_STATES.map((st) => {
              const active = selectedStates.includes(st);
              return (
                <button
                  type="button"
                  key={st}
                  onClick={() => toggleState(st)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    active
                      ? "bg-[#0b1220] text-[#f1d99b] border-[#c9a35d]"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {active ? `✓ ${st}` : `+ ${st}`}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              Current Crew Availability Status
            </label>
            <select
              name="availability"
              className="w-full px-4 py-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#c9a35d] outline-none text-sm text-[#0f172a] bg-white"
            >
              <option value="immediate">Available for Immediate Mobilization</option>
              <option value="within_15_days">Available Within 15 Days</option>
              <option value="next_month">Available Next Month</option>
              <option value="currently_booked">Currently Booked on Site</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#e2e8f0] pt-6">
        <div className="flex items-center gap-2 text-xs text-[#64748b]">
          <ShieldCheck size={16} className="text-[#c9a35d]" />
          <span>Direct contractor leads dispatched without middleman commissions.</span>
        </div>
        <button
          type="submit"
          disabled={status === "sending"}
          className="btn btn-primary w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2"
        >
          {status === "sending" ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Registering Agency…
            </>
          ) : (
            <>
              Register Agency Profile <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
