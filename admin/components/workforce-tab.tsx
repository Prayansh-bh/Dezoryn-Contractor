import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  Filter,
  HardHat,
  Info,
  MapPin,
  Phone,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  Wrench,
  XCircle,
} from "lucide-react";
import type {
  AdminDashboardData,
  LabourRequisition,
  LabourAgency,
  IndividualWorker,
} from "@shared/types";

export function WorkforceTab({
  data,
  action,
}: {
  data: AdminDashboardData;
  action?: (payload: any) => Promise<boolean>;
}) {
  const [subTab, setSubTab] = useState<"requisitions" | "agencies" | "workers">("requisitions");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const requisitions: LabourRequisition[] = data.workforce?.requisitions || [];
  const agencies: LabourAgency[] = data.workforce?.agencies || [];
  const workers: IndividualWorker[] = data.workforce?.workers || [];
  const summary = data.workforce?.summary;

  const totalReqWorkers = requisitions.reduce((sum, r) => sum + (r.totalWorkers || 0), 0);
  const verifiedAgenciesCount = agencies.filter((a) => a.verified).length;

  // Filtered lists
  const filteredRequisitions = requisitions.filter((r) => {
    const matchesSearch =
      r.companyName.toLowerCase().includes(search.toLowerCase()) ||
      r.projectTitle.toLowerCase().includes(search.toLowerCase()) ||
      r.locationState.toLowerCase().includes(search.toLowerCase()) ||
      r.locationCity.toLowerCase().includes(search.toLowerCase()) ||
      r.requisitionCode.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredAgencies = agencies.filter((a) => {
    const matchesSearch =
      a.agencyName.toLowerCase().includes(search.toLowerCase()) ||
      a.proprietorName.toLowerCase().includes(search.toLowerCase()) ||
      a.city.toLowerCase().includes(search.toLowerCase()) ||
      a.state.toLowerCase().includes(search.toLowerCase()) ||
      a.agencyCode.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "verified" && a.verified) ||
      (statusFilter === "pending" && !a.verified);
    return matchesSearch && matchesStatus;
  });

  const filteredWorkers = workers.filter((w) => {
    const matchesSearch =
      w.fullName.toLowerCase().includes(search.toLowerCase()) ||
      w.trade.toLowerCase().includes(search.toLowerCase()) ||
      w.currentCity.toLowerCase().includes(search.toLowerCase()) ||
      w.currentState.toLowerCase().includes(search.toLowerCase()) ||
      w.workerCode.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handleRequisitionStatus(id: number, newStatus: string) {
    if (!action) return;
    await action({ action: "requisition_status", id, status: newStatus });
  }

  async function handleDeleteRequisition(id: number, code: string) {
    if (!action) return;
    if (confirm(`Are you sure you want to permanently delete Requisition ${code}?`)) {
      await action({ action: "delete_requisition", id });
    }
  }

  async function handleAgencyVerify(id: number, currentVerified: boolean) {
    if (!action) return;
    await action({ action: "agency_verify", id, verified: !currentVerified });
  }

  async function handleDeleteAgency(id: number, name: string) {
    if (!action) return;
    if (confirm(`Are you sure you want to delete agency "${name}"?`)) {
      await action({ action: "delete_agency", id });
    }
  }

  async function handleWorkerStatus(id: number, newStatus: string) {
    if (!action) return;
    await action({ action: "worker_status", id, status: newStatus });
  }

  async function handleDeleteWorker(id: number, name: string) {
    if (!action) return;
    if (confirm(`Are you sure you want to delete worker record for "${name}"?`)) {
      await action({ action: "delete_worker", id });
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#e2e8f0] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-[#c9a35d] shrink-0">
            <Building2 size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider block">
              Contractor Requisitions
            </span>
            <strong className="text-2xl font-bold text-[#0f172a]">{requisitions.length}</strong>
            <span className="text-[11px] text-[#c9a35d] block">
              {requisitions.filter((r) => r.status === "open").length} open ({totalReqWorkers} manpower needed)
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#e2e8f0] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-[#c9a35d] shrink-0">
            <Users size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider block">
              Labour Supply Agencies
            </span>
            <strong className="text-2xl font-bold text-[#0f172a]">{agencies.length}</strong>
            <span className="text-[11px] text-emerald-600 block">
              {verifiedAgenciesCount} verified partners
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#e2e8f0] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-[#c9a35d] shrink-0">
            <HardHat size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider block">
              Direct Skill Registry
            </span>
            <strong className="text-2xl font-bold text-[#0f172a]">{workers.length}</strong>
            <span className="text-[11px] text-[#64748b] block">
              {workers.filter((w) => w.status === "available").length} immediately available
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#e2e8f0] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-[#c9a35d] shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider block">
              Total Workforce Pool
            </span>
            <strong className="text-2xl font-bold text-[#0f172a]">
              {(summary?.totalWorkforcePool || 2450).toLocaleString()}
            </strong>
            <span className="text-[11px] text-slate-500 block">Pan-India Deployment</span>
          </div>
        </div>
      </div>

      {/* Workforce Management Desk */}
      <section className="admin-card">
        {/* Navigation Sub-Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-4 mb-6">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setSubTab("requisitions");
                setStatusFilter("all");
              }}
              className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${
                subTab === "requisitions"
                  ? "bg-white text-[#0f172a] shadow-sm"
                  : "text-slate-600 hover:text-[#0f172a]"
              }`}
            >
              Contractor Requisitions ({requisitions.length})
            </button>
            <button
              onClick={() => {
                setSubTab("agencies");
                setStatusFilter("all");
              }}
              className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${
                subTab === "agencies"
                  ? "bg-white text-[#0f172a] shadow-sm"
                  : "text-slate-600 hover:text-[#0f172a]"
              }`}
            >
              Labour Agencies ({agencies.length})
            </button>
            <button
              onClick={() => {
                setSubTab("workers");
                setStatusFilter("all");
              }}
              className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${
                subTab === "workers"
                  ? "bg-white text-[#0f172a] shadow-sm"
                  : "text-slate-600 hover:text-[#0f172a]"
              }`}
            >
              Individual Workers ({workers.length})
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, state, trade, code…"
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#cbd5e1] focus:border-[#c9a35d] outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-[#cbd5e1] bg-white outline-none"
            >
              <option value="all">All Statuses</option>
              {subTab === "requisitions" && (
                <>
                  <option value="open">Open</option>
                  <option value="matched">Matched</option>
                  <option value="fulfilling">Fulfilling</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </>
              )}
              {subTab === "agencies" && (
                <>
                  <option value="verified">Verified Partners Only</option>
                  <option value="pending">Pending Verification</option>
                </>
              )}
              {subTab === "workers" && (
                <>
                  <option value="available">Available</option>
                  <option value="deployed">Deployed</option>
                  <option value="inactive">Inactive</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* VIEW 1: REQUISITIONS */}
        {subTab === "requisitions" && (
          <div className="overflow-x-auto">
            {filteredRequisitions.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Building2 size={36} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-semibold">No contractor requisitions found matching criteria.</p>
              </div>
            ) : (
              <table className="admin-table w-full text-left">
                <thead>
                  <tr className="border-b border-[#e2e8f0] text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50">
                    <th className="py-3 px-4">Code & Project</th>
                    <th className="py-3 px-4">Contractor Details</th>
                    <th className="py-3 px-4">Trades & Headcount</th>
                    <th className="py-3 px-4">Location & Timeline</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0] text-xs">
                  {filteredRequisitions.map((req) => {
                    const skills = Array.isArray(req.skillsRequired) ? req.skillsRequired : [];
                    return (
                      <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-[11px] font-bold text-[#c9a35d] block">
                            {req.requisitionCode}
                          </span>
                          <strong className="text-sm text-[#0f172a] block mt-0.5">
                            {req.projectTitle}
                          </strong>
                          <span className="text-[11px] text-slate-500">{req.projectType}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <strong className="text-[#0f172a] block">{req.companyName}</strong>
                          <span className="text-slate-600 block">{req.contactPerson}</span>
                          <a
                            href={`tel:${req.phone}`}
                            className="text-[#c9a35d] hover:underline font-mono inline-flex items-center gap-1 mt-0.5"
                          >
                            <Phone size={11} /> {req.phone}
                          </a>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-[#926017] font-bold text-xs mb-1">
                            {req.totalWorkers} Workers Total
                          </span>
                          <div className="space-y-0.5 text-[11px] text-slate-600">
                            {skills.slice(0, 3).map((s: any, idx: number) => (
                              <div key={idx}>
                                • {typeof s === "string" ? s : `${s.trade} (${s.count})`}
                              </div>
                            ))}
                            {skills.length > 3 && (
                              <span className="text-[10px] text-slate-400">+{skills.length - 3} more trades</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 text-[#0f172a] font-medium">
                            <MapPin size={12} className="text-[#c9a35d]" />
                            <span>{req.locationCity}, {req.locationState}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            Duration: {req.durationMonths || "Project based"}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Lodged: {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <select
                            value={req.status}
                            onChange={(e) => handleRequisitionStatus(req.id, e.target.value)}
                            className={`px-2.5 py-1 rounded text-xs font-bold border outline-none cursor-pointer ${
                              req.status === "open"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : req.status === "matched"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : req.status === "fulfilling"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            <option value="open">Open</option>
                            <option value="matched">Matched</option>
                            <option value="fulfilling">Fulfilling</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDeleteRequisition(req.id, req.requisitionCode)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                            title="Delete requisition"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* VIEW 2: LABOUR AGENCIES */}
        {subTab === "agencies" && (
          <div className="overflow-x-auto">
            {filteredAgencies.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Users size={36} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-semibold">No registered manpower agencies found.</p>
              </div>
            ) : (
              <table className="admin-table w-full text-left">
                <thead>
                  <tr className="border-b border-[#e2e8f0] text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50">
                    <th className="py-3 px-4">Code & Agency</th>
                    <th className="py-3 px-4">Proprietor & Phone</th>
                    <th className="py-3 px-4">Crew Strength & Trades</th>
                    <th className="py-3 px-4">Base & Coverage</th>
                    <th className="py-3 px-4">Verification Badge</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0] text-xs">
                  {filteredAgencies.map((agency) => {
                    const trades = Array.isArray(agency.primaryTrades) ? agency.primaryTrades : [];
                    return (
                      <tr key={agency.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-[11px] font-bold text-[#c9a35d] block">
                            {agency.agencyCode}
                          </span>
                          <strong className="text-sm text-[#0f172a] block mt-0.5">
                            {agency.agencyName}
                          </strong>
                          {agency.gstin && (
                            <span className="text-[10px] text-slate-500 font-mono">GST: {agency.gstin}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <strong className="text-[#0f172a] block">{agency.proprietorName}</strong>
                          <a
                            href={`tel:${agency.phone}`}
                            className="text-[#c9a35d] hover:underline font-mono inline-flex items-center gap-1 mt-0.5"
                          >
                            <Phone size={11} /> {agency.phone}
                          </a>
                          {agency.email && (
                            <span className="text-[11px] text-slate-500 block">{agency.email}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-xs mb-1">
                            {agency.totalCrewSize} Workforce Crew
                          </span>
                          <div className="space-y-0.5 text-[11px] text-slate-600">
                            {trades.slice(0, 2).map((t, idx) => (
                              <div key={idx}>• {t}</div>
                            ))}
                            {trades.length > 2 && (
                              <span className="text-[10px] text-slate-400">+{trades.length - 2} more trades</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 text-[#0f172a] font-medium">
                            <MapPin size={12} className="text-[#c9a35d]" />
                            <span>{agency.city}, {agency.state}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-0.5 capitalize">
                            Availability: {agency.availability.replace(/_/g, " ")}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleAgencyVerify(agency.id, agency.verified)}
                            className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition-all ${
                              agency.verified
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200"
                            }`}
                          >
                            {agency.verified ? (
                              <>
                                <CheckCircle2 size={13} className="text-emerald-600" /> Verified Partner
                              </>
                            ) : (
                              <>
                                <Info size={13} /> Click to Verify
                              </>
                            )}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDeleteAgency(agency.id, agency.agencyName)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                            title="Delete agency"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* VIEW 3: INDIVIDUAL WORKERS */}
        {subTab === "workers" && (
          <div className="overflow-x-auto">
            {filteredWorkers.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <HardHat size={36} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-semibold">No registered individual workers found.</p>
              </div>
            ) : (
              <table className="admin-table w-full text-left">
                <thead>
                  <tr className="border-b border-[#e2e8f0] text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50">
                    <th className="py-3 px-4">ID & Artisan</th>
                    <th className="py-3 px-4">Primary Trade</th>
                    <th className="py-3 px-4">Experience & Wage</th>
                    <th className="py-3 px-4">Location & Relocation</th>
                    <th className="py-3 px-4">Deployment Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0] text-xs">
                  {filteredWorkers.map((worker) => (
                    <tr key={worker.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] font-bold text-[#c9a35d] block">
                          {worker.workerCode}
                        </span>
                        <strong className="text-sm text-[#0f172a] block mt-0.5">
                          {worker.fullName}
                        </strong>
                        <a
                          href={`tel:${worker.phone}`}
                          className="text-[#c9a35d] hover:underline font-mono inline-flex items-center gap-1 mt-0.5"
                        >
                          <Phone size={11} /> {worker.phone}
                        </a>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-1 rounded bg-slate-100 text-[#0f172a] font-bold text-xs">
                          {worker.trade}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <strong className="text-[#0f172a] block">{worker.experienceYears} Years Exp</strong>
                        <span className="text-[11px] text-slate-500">
                          {worker.dailyWageExpect || "Standard Rate"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-[#0f172a] font-medium">
                          <MapPin size={12} className="text-[#c9a35d]" />
                          <span>{worker.currentCity}, {worker.currentState}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {worker.canRelocate ? "✓ Pan-India Relocation" : "Local only"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={worker.status}
                          onChange={(e) => handleWorkerStatus(worker.id, e.target.value)}
                          className={`px-2.5 py-1 rounded text-xs font-bold border outline-none cursor-pointer ${
                            worker.status === "available"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : worker.status === "deployed"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          <option value="available">Available</option>
                          <option value="deployed">Deployed to Site</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteWorker(worker.id, worker.fullName)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                          title="Delete worker"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
