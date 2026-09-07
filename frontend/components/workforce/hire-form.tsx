"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  HardHat,
  Info,
  Loader2,
  MapPin,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";

interface SkillItem {
  trade: string;
  count: number;
}

const COMMON_TRADES = [
  "Bar Benders & Rebar Fitters",
  "Highway Paver / Roller Operators",
  "W-Beam Crash Barrier Erection Crew",
  "Thermoplastic Road Marking Technicians",
  "Hydra / Crane / Heavy Plant Operators",
  "Shuttering & Formwork Carpenters",
  "Kerb Casting & Masonry Specialists",
  "Structural Welders / Fitters",
  "General Civil Construction Helpers",
];

const AMENITY_OPTIONS = [
  "Labour Accommodation Provided",
  "Food / Canteen Facilities",
  "Daily Site Transportation",
  "Safety PPE & Helmets Provided",
  "PF / ESIC Statutory Coverage",
];

const PROJECT_TYPES = [
  "NHAI Highway / Expressway",
  "State Highway / Road Widening",
  "Flyover / Elevated Corridor / Bridge",
  "Pre-cast Production Yard",
  "Industrial Estate / Logistics Park",
  "Urban Road & Kerbing Project",
];

export function HireLabourForm() {
  const [skills, setSkills] = useState<SkillItem[]>([
    { trade: "Bar Benders & Rebar Fitters", count: 20 },
    { trade: "General Civil Construction Helpers", count: 30 },
  ]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "Labour Accommodation Provided",
    "Safety PPE & Helmets Provided",
  ]);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [referenceCode, setReferenceCode] = useState("");

  const totalHeadcount = skills.reduce((sum, item) => sum + (Number(item.count) || 0), 0);

  function addSkill() {
    setSkills([...skills, { trade: "Highway Paver / Roller Operators", count: 10 }]);
  }

  function removeSkill(index: number) {
    if (skills.length > 1) {
      setSkills(skills.filter((_, i) => i !== index));
    }
  }

  function updateSkill(index: number, field: "trade" | "count", value: string | number) {
    const updated = [...skills];
    if (field === "trade") {
      updated[index].trade = String(value);
    } else {
      updated[index].count = Math.max(1, Number(value) || 1);
    }
    setSkills(updated);
  }

  function toggleAmenity(amenity: string) {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      companyName: String(formData.get("companyName") || "").trim(),
      contactPerson: String(formData.get("contactPerson") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      projectTitle: String(formData.get("projectTitle") || "").trim(),
      projectType: String(formData.get("projectType") || "NHAI Highway / Expressway"),
      locationState: String(formData.get("locationState") || "").trim(),
      locationCity: String(formData.get("locationCity") || "").trim(),
      siteAddress: String(formData.get("siteAddress") || "").trim(),
      totalWorkers: totalHeadcount || 1,
      skillsRequired: skills,
      startDate: String(formData.get("startDate") || "").trim(),
      durationMonths: String(formData.get("durationMonths") || "").trim(),
      amenities: selectedAmenities,
      dailyWageBudget: String(formData.get("dailyWageBudget") || "").trim(),
      message: String(formData.get("message") || "").trim(),
    };

    try {
      const res = await fetch("/api/workforce/requisitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to post requirement");
      }

      setReferenceCode(data.requisitionCode || "REQ-SUBMITTED");
      setStatus("success");
      form.reset();
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while submitting your requisition.");
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
          REQUISITION LODGED SUCCESSFULLY
        </span>
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 font-serif">
          Workforce Requisition Active
        </h3>
        <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
          Your project requirement for <strong>{totalHeadcount} workers</strong> has been broadcasted to verified labour suppliers and subcontractors across our industrial corridor network.
        </p>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/60 inline-flex flex-col items-center gap-1 mb-8">
          <span className="text-xs text-slate-400">Requisition Reference Docket</span>
          <span className="text-xl font-mono font-bold text-[#f1d99b] tracking-wider">
            {referenceCode}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setStatus("idle")}
            className="btn btn-primary"
          >
            Post Another Requisition
          </button>
          <Link href="/workforce" className="btn btn-ghost">
            Return to Workforce Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-10 rounded-2xl bg-white border border-[#e2e8f0] shadow-sm">
      <div className="border-b border-[#e2e8f0] pb-6 mb-8">
        <div className="flex items-center gap-2 text-[#c9a35d] font-bold text-xs uppercase tracking-wider mb-2">
          <HardHat size={16} /> <span>EPC & Main Contractor Requisition Desk</span>
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-[#0f172a] font-serif">
          Post Project Labour Requirements
        </h3>
        <p className="text-sm text-[#64748b] mt-1">
          Specify exact trades, crew headcount, site perks, and deployment timeline. Our matching engine pairs you with verified subcontractor agencies.
        </p>
      </div>

      {status === "error" && (
        <div className="p-4 mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <Info size={18} className="shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Section 1: Contractor & Project Details */}
      <div className="space-y-6 mb-8">
        <h4 className="text-base font-bold text-[#0f172a] flex items-center gap-2 border-b border-slate-100 pb-2">
          <Building2 size={18} className="text-[#c9a35d]" /> 1. Contractor & Site Logistics
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              Company / Firm Name *
            </label>
            <input
              type="text"
              name="companyName"
              required
              placeholder="e.g., L&T ECC / Dilip Buildcon Ltd"
              className="w-full px-4 py-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#c9a35d] focus:ring-1 focus:ring-[#c9a35d] outline-none text-sm text-[#0f172a]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              Authorized Contact Person *
            </label>
            <input
              type="text"
              name="contactPerson"
              required
              placeholder="e.g., Rajesh Sharma (Project Director)"
              className="w-full px-4 py-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#c9a35d] focus:ring-1 focus:ring-[#c9a35d] outline-none text-sm text-[#0f172a]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              Direct Phone / WhatsApp *
            </label>
            <input
              type="tel"
              name="phone"
              required
              placeholder="+91 98765 43210"
              className="w-full px-4 py-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#c9a35d] focus:ring-1 focus:ring-[#c9a35d] outline-none text-sm text-[#0f172a]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              Official Email Address *
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="procurement@contractor.com"
              className="w-full px-4 py-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#c9a35d] focus:ring-1 focus:ring-[#c9a35d] outline-none text-sm text-[#0f172a]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              Project Title / Package Name *
            </label>
            <input
              type="text"
              name="projectTitle"
              required
              placeholder="e.g., Delhi-Mumbai Expressway Pkg-4 Bridge Deck & Kerbing"
              className="w-full px-4 py-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#c9a35d] focus:ring-1 focus:ring-[#c9a35d] outline-none text-sm text-[#0f172a]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              Project Classification *
            </label>
            <select
              name="projectType"
              className="w-full px-4 py-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#c9a35d] focus:ring-1 focus:ring-[#c9a35d] outline-none text-sm text-[#0f172a] bg-white"
            >
              {PROJECT_TYPES.map((pt) => (
                <option key={pt} value={pt}>
                  {pt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              Site Location (State) *
            </label>
            <input
              type="text"
              name="locationState"
              required
              placeholder="e.g., Gujarat / Maharashtra / Rajasthan"
              className="w-full px-4 py-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#c9a35d] focus:ring-1 focus:ring-[#c9a35d] outline-none text-sm text-[#0f172a]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              Site Location (City / District) *
            </label>
            <input
              type="text"
              name="locationCity"
              required
              placeholder="e.g., Vadodara / Bharuch Site Camp"
              className="w-full px-4 py-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#c9a35d] focus:ring-1 focus:ring-[#c9a35d] outline-none text-sm text-[#0f172a]"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Skill & Trade Matrix Breakdown */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h4 className="text-base font-bold text-[#0f172a] flex items-center gap-2">
            <Users size={18} className="text-[#c9a35d]" /> 2. Trade Headcount Breakdown ({totalHeadcount} Workers Total)
          </h4>
          <button
            type="button"
            onClick={addSkill}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c9a35d] hover:text-[#b88a3d] bg-amber-50 px-3 py-1.5 rounded-md border border-amber-200 transition-colors"
          >
            <Plus size={14} /> Add Another Trade
          </button>
        </div>

        <div className="space-y-3">
          {skills.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200"
            >
              <div className="w-full sm:flex-1">
                <select
                  value={item.trade}
                  onChange={(e) => updateSkill(idx, "trade", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#cbd5e1] text-sm text-[#0f172a] bg-white"
                >
                  {COMMON_TRADES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-40 flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Headcount:</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={item.count}
                  onChange={(e) => updateSkill(idx, "count", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#cbd5e1] text-sm font-bold text-center text-[#0f172a] bg-white"
                />
              </div>
              {skills.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSkill(idx)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                  title="Remove trade"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Timeline & Site Amenities */}
      <div className="space-y-6 mb-8">
        <h4 className="text-base font-bold text-[#0f172a] flex items-center gap-2 border-b border-slate-100 pb-2">
          <Calendar size={18} className="text-[#c9a35d]" /> 3. Deployment Timeline & Site Amenities
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              Target Start Date
            </label>
            <input
              type="text"
              name="startDate"
              placeholder="e.g., Immediate / Within 15 Days"
              className="w-full px-4 py-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#c9a35d] outline-none text-sm text-[#0f172a]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              Project Duration
            </label>
            <input
              type="text"
              name="durationMonths"
              placeholder="e.g., 3 to 6 Months"
              className="w-full px-4 py-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#c9a35d] outline-none text-sm text-[#0f172a]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
              Budget / Commercial Structure
            </label>
            <input
              type="text"
              name="dailyWageBudget"
              placeholder="e.g., Per-day rate / Piece-rate"
              className="w-full px-4 py-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#c9a35d] outline-none text-sm text-[#0f172a]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-3">
            Site Amenities Provided by Main Contractor (Check all that apply)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AMENITY_OPTIONS.map((amenity) => {
              const checked = selectedAmenities.includes(amenity);
              return (
                <label
                  key={amenity}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    checked
                      ? "border-[#c9a35d] bg-amber-50/50 text-[#0f172a]"
                      : "border-[#e2e8f0] bg-white text-[#64748b] hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAmenity(amenity)}
                    className="accent-[#c9a35d] w-4 h-4 rounded"
                  />
                  <span className="text-xs font-semibold">{amenity}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
            Additional Site Requirements / Scope Notes
          </label>
          <textarea
            name="message"
            rows={3}
            placeholder="Provide any specific shift timing, tooling prerequisites, or certification requirements..."
            className="w-full px-4 py-2.5 rounded-lg border border-[#cbd5e1] focus:border-[#c9a35d] outline-none text-sm text-[#0f172a]"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#e2e8f0] pt-6">
        <div className="flex items-center gap-2 text-xs text-[#64748b]">
          <ShieldCheck size={16} className="text-[#c9a35d]" />
          <span>Strict confidential matching. No spam calls or public listing of contact numbers.</span>
        </div>
        <button
          type="submit"
          disabled={status === "sending"}
          className="btn btn-primary w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2"
        >
          {status === "sending" ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Dispatching Requisition…
            </>
          ) : (
            <>
              Submit Labour Requisition ({totalHeadcount} Workers) <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
