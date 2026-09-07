import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  Eye,
  HardHat,
  Inbox,
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
  X,
} from "lucide-react";
import { StatCard } from "./stat-card";
import { ConfirmDialog } from "./confirm-dialog";
import {
  RequisitionTradeDemandChart,
  RequisitionStatusDonutChart,
  WorkforceCompositionChart,
} from "./analytics-charts";
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
  const [subTab, setSubTab] = useState<"requisitions" | "agencies" | "workers" | "analytics">("requisitions");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewingRequisition, setViewingRequisition] = useState<LabourRequisition | null>(null);

  // Deletion modals state
  const [reqToDelete, setReqToDelete] = useState<LabourRequisition | null>(null);
  const [agencyToDelete, setAgencyToDelete] = useState<LabourAgency | null>(null);
  const [workerToDelete, setWorkerToDelete] = useState<IndividualWorker | null>(null);

  const requisitions: LabourRequisition[] = data.workforce?.requisitions || [];
  const agencies: LabourAgency[] = data.workforce?.agencies || [];
  const workers: IndividualWorker[] = data.workforce?.workers || [];
  const summary = data.workforce?.summary;

  const totalReqWorkers = requisitions.reduce((sum, r) => sum + (r.totalWorkers || 0), 0);
  const verifiedAgenciesCount = agencies.filter((a) => a.verified).length;
  const openReqsCount = requisitions.filter((r) => r.status === "open").length;
  const totalWorkforcePool = summary?.totalWorkforcePool || 2450;

  // Filtered lists
  const filteredRequisitions = requisitions.filter((r) => {
    const term = search.toLowerCase();
    const matchesSearch =
      r.companyName.toLowerCase().includes(term) ||
      r.projectTitle.toLowerCase().includes(term) ||
      r.locationState.toLowerCase().includes(term) ||
      r.locationCity.toLowerCase().includes(term) ||
      r.requisitionCode.toLowerCase().includes(term);
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredAgencies = agencies.filter((a) => {
    const term = search.toLowerCase();
    const matchesSearch =
      a.agencyName.toLowerCase().includes(term) ||
      a.proprietorName.toLowerCase().includes(term) ||
      a.city.toLowerCase().includes(term) ||
      a.state.toLowerCase().includes(term) ||
      a.agencyCode.toLowerCase().includes(term);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "verified" && a.verified) ||
      (statusFilter === "pending" && !a.verified);
    return matchesSearch && matchesStatus;
  });

  const filteredWorkers = workers.filter((w) => {
    const term = search.toLowerCase();
    const matchesSearch =
      w.fullName.toLowerCase().includes(term) ||
      w.trade.toLowerCase().includes(term) ||
      w.currentCity.toLowerCase().includes(term) ||
      w.currentState.toLowerCase().includes(term) ||
      w.workerCode.toLowerCase().includes(term);
    const matchesStatus = statusFilter === "all" || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handleRequisitionStatus(id: number, newStatus: string) {
    if (!action) return;
    await action({ action: "requisition_status", id, status: newStatus });
  }

  async function handleAgencyVerify(id: number, currentVerified: boolean) {
    if (!action) return;
    await action({ action: "agency_verify", id, verified: !currentVerified });
  }

  async function handleWorkerStatus(id: number, newStatus: string) {
    if (!action) return;
    await action({ action: "worker_status", id, status: newStatus });
  }

  return (
    <>
      {/* KPI Stat Cards Strip */}
      <div className="stat-grid">
        <div className="stat-card">
          <div>
            <span>Contractor Requisitions</span>
            <b>{requisitions.length}</b>
            <div className="stat-card-sub highlight">
              {openReqsCount} open ({totalReqWorkers} manpower needed)
            </div>
          </div>
          <Building2 />
        </div>

        <div className="stat-card">
          <div>
            <span>Labour Supply Agencies</span>
            <b>{agencies.length}</b>
            <div className="stat-card-sub success">
              {verifiedAgenciesCount} verified partner firms
            </div>
          </div>
          <Users />
        </div>

        <div className="stat-card">
          <div>
            <span>Direct Skill Registry</span>
            <b>{workers.length}</b>
            <div className="stat-card-sub">
              {workers.filter((w) => w.status === "available").length} immediately available
            </div>
          </div>
          <HardHat />
        </div>

        <div className="stat-card">
          <div>
            <span>Total Workforce Pool</span>
            <b>{totalWorkforcePool.toLocaleString()}</b>
            <div className="stat-card-sub">Pan-India Deployment</div>
          </div>
          <ShieldCheck />
        </div>
      </div>

      {/* Main Workforce Desk Container */}
      <section className="admin-card">
        {/* Sub-Tabs Selector Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div className="workforce-subtabs">
            <button
              type="button"
              onClick={() => {
                setSubTab("requisitions");
                setStatusFilter("all");
              }}
              className={`workforce-pill ${subTab === "requisitions" ? "active" : ""}`}
            >
              <Building2 size={15} />
              <span>Contractor Requisitions</span>
              <span className="workforce-pill-count">{requisitions.length}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSubTab("agencies");
                setStatusFilter("all");
              }}
              className={`workforce-pill ${subTab === "agencies" ? "active" : ""}`}
            >
              <Users size={15} />
              <span>Labour Agencies</span>
              <span className="workforce-pill-count">{agencies.length}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSubTab("workers");
                setStatusFilter("all");
              }}
              className={`workforce-pill ${subTab === "workers" ? "active" : ""}`}
            >
              <HardHat size={15} />
              <span>Individual Artisans</span>
              <span className="workforce-pill-count">{workers.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab("analytics")}
              className={`workforce-pill ${subTab === "analytics" ? "active" : ""}`}
            >
              <Wrench size={15} />
              <span>Analytics & KPI Insights</span>
            </button>
          </div>

          {/* Search & Status Filter Toolbar (visible for lists) */}
          {subTab !== "analytics" && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <div className="workforce-search-box">
                <Search size={14} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search code, name, trade, location…"
                  className="workforce-search-input"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="workforce-select"
              >
                <option value="all">All Statuses</option>
                {subTab === "requisitions" && (
                  <>
                    <option value="open">Open Requisitions</option>
                    <option value="matched">Agency Matched</option>
                    <option value="fulfilling">Fulfilling / Deployed</option>
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
                    <option value="available">Available for Work</option>
                    <option value="deployed">Deployed on Site</option>
                    <option value="inactive">Inactive</option>
                  </>
                )}
              </select>
            </div>
          )}
        </div>

        {/* 1. CONTRACTOR REQUISITIONS TAB */}
        {subTab === "requisitions" && (
          <div className="admin-table-wrap">
            {!filteredRequisitions.length ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Building2 size={24} />
                </div>
                <h3>No Contractor Requisitions Found</h3>
                <p>Project labour requisitions submitted by EPC contractors will appear here in real-time.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Docket & Project</th>
                    <th>Contractor Details</th>
                    <th>Trade Requirements</th>
                    <th>Location & Timeline</th>
                    <th>Fulfillment Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequisitions.map((req) => {
                    const skills = Array.isArray(req.skillsRequired) ? req.skillsRequired : [];
                    return (
                      <tr key={req.id}>
                        <td>
                          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--amber-dark)", fontSize: "12px", display: "block" }}>
                            {req.requisitionCode}
                          </span>
                          <b>{req.projectTitle}</b>
                          <small>{req.projectType}</small>
                        </td>

                        <td>
                          <b>{req.companyName}</b>
                          <small>{req.contactPerson}</small>
                          <div style={{ marginTop: "3px" }}>
                            <a href={`tel:${req.phone}`} style={{ color: "var(--amber-dark)", fontWeight: 700, textDecoration: "none", fontSize: "12px" }}>
                              {req.phone}
                            </a>
                          </div>
                        </td>

                        <td>
                          <span className="trade-tag gold" style={{ fontWeight: 800, fontSize: "11.5px" }}>
                            {req.totalWorkers} Workers Total
                          </span>
                          <div style={{ marginTop: "4px" }}>
                            {skills.slice(0, 2).map((s: any, idx: number) => (
                              <span key={idx} className="trade-tag">
                                {typeof s === "string" ? s : `${s.trade} (${s.count})`}
                              </span>
                            ))}
                            {skills.length > 2 && (
                              <small style={{ color: "#64748b", display: "inline-block" }}>
                                +{skills.length - 2} more
                              </small>
                            )}
                          </div>
                        </td>

                        <td>
                          <b>{req.locationCity}, {req.locationState}</b>
                          <small>Duration: {req.durationMonths || "Project based"}</small>
                          <small style={{ color: "#94a3b8" }}>
                            Lodged: {new Date(req.createdAt).toLocaleDateString("en-IN")}
                          </small>
                        </td>

                        <td>
                          {action ? (
                            <select
                              value={req.status}
                              onChange={(e) => handleRequisitionStatus(req.id, e.target.value)}
                              className="workforce-select"
                              style={{ padding: "4px 8px", fontSize: "11.5px", fontWeight: 700 }}
                            >
                              <option value="open">Open</option>
                              <option value="matched">Matched</option>
                              <option value="fulfilling">Fulfilling</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          ) : (
                            <span className={`status-badge ${req.status}`}>{req.status}</span>
                          )}
                        </td>

                        <td style={{ textAlign: "right" }}>
                          <button
                            type="button"
                            className="table-btn"
                            title="View Full Scope & Amenities"
                            onClick={() => setViewingRequisition(req)}
                          >
                            <Eye size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} /> Details
                          </button>
                          {action && (
                            <button
                              type="button"
                              className="icon-danger"
                              title="Delete Requisition"
                              onClick={() => setReqToDelete(req)}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 2. LABOUR AGENCIES TAB */}
        {subTab === "agencies" && (
          <div className="admin-table-wrap">
            {!filteredAgencies.length ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Users size={24} />
                </div>
                <h3>No Registered Labour Agencies</h3>
                <p>Manpower supply agencies and subcontractor crews registered on the platform will appear here.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Docket & Firm Name</th>
                    <th>Proprietor & Contact</th>
                    <th>Crew Capacity & Trades</th>
                    <th>Headquarters & Coverage</th>
                    <th>Partner Verification</th>
                    {action && <th style={{ textAlign: "right" }}>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredAgencies.map((agency) => {
                    const trades = Array.isArray(agency.primaryTrades) ? agency.primaryTrades : [];
                    return (
                      <tr key={agency.id}>
                        <td>
                          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--amber-dark)", fontSize: "12px", display: "block" }}>
                            {agency.agencyCode}
                          </span>
                          <b>{agency.agencyName}</b>
                          {agency.gstin && (
                            <small style={{ fontFamily: "monospace" }}>GSTIN: {agency.gstin}</small>
                          )}
                          {agency.labourLicenseNo && (
                            <small style={{ color: "#64748b" }}>Lic: {agency.labourLicenseNo}</small>
                          )}
                        </td>

                        <td>
                          <b>{agency.proprietorName}</b>
                          <div>
                            <a href={`tel:${agency.phone}`} style={{ color: "var(--amber-dark)", fontWeight: 700, textDecoration: "none", fontSize: "12px" }}>
                              {agency.phone}
                            </a>
                          </div>
                          {agency.email && <small>{agency.email}</small>}
                        </td>

                        <td>
                          <span className="trade-tag gold" style={{ fontWeight: 800, fontSize: "11.5px" }}>
                            {agency.totalCrewSize} Crew Strength
                          </span>
                          <div style={{ marginTop: "4px" }}>
                            {trades.slice(0, 2).map((t, idx) => (
                              <span key={idx} className="trade-tag">{t}</span>
                            ))}
                            {trades.length > 2 && (
                              <small style={{ color: "#64748b" }}>+{trades.length - 2} more</small>
                            )}
                          </div>
                        </td>

                        <td>
                          <b>{agency.city}, {agency.state}</b>
                          <small style={{ textTransform: "capitalize" }}>
                            Status: {agency.availability.replace(/_/g, " ")}
                          </small>
                        </td>

                        <td>
                          <button
                            type="button"
                            onClick={() => handleAgencyVerify(agency.id, agency.verified)}
                            className={`status-badge ${agency.verified ? "verified" : "pending"}`}
                            style={{ cursor: "pointer", border: "1px solid", padding: "5px 10px" }}
                            title="Click to toggle partner verification badge"
                          >
                            {agency.verified ? "✓ Verified Partner" : "Pending Verification"}
                          </button>
                        </td>

                        {action && (
                          <td style={{ textAlign: "right" }}>
                            <button
                              type="button"
                              className="icon-danger"
                              title="Delete Agency"
                              onClick={() => setAgencyToDelete(agency)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 3. INDIVIDUAL ARTISANS TAB */}
        {subTab === "workers" && (
          <div className="admin-table-wrap">
            {!filteredWorkers.length ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <HardHat size={24} />
                </div>
                <h3>No Registered Workers Found</h3>
                <p>Individual artisans and machine operators enrolled in the Dezoryn Skill Registry will appear here.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Artisan ID & Name</th>
                    <th>Skill Category / Trade</th>
                    <th>Experience & Wage Expectation</th>
                    <th>Location & Relocation</th>
                    <th>Deployment Status</th>
                    {action && <th style={{ textAlign: "right" }}>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkers.map((worker) => (
                    <tr key={worker.id}>
                      <td>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--amber-dark)", fontSize: "12px", display: "block" }}>
                          {worker.workerCode}
                        </span>
                        <b>{worker.fullName}</b>
                        <div>
                          <a href={`tel:${worker.phone}`} style={{ color: "var(--amber-dark)", fontWeight: 700, textDecoration: "none", fontSize: "12px" }}>
                            {worker.phone}
                          </a>
                        </div>
                      </td>

                      <td>
                        <span className="trade-tag gold" style={{ fontWeight: 700 }}>
                          {worker.trade}
                        </span>
                      </td>

                      <td>
                        <b>{worker.experienceYears} Years Experience</b>
                        <small>{worker.dailyWageExpect || "Standard Daily Rate"}</small>
                      </td>

                      <td>
                        <b>{worker.currentCity}, {worker.currentState}</b>
                        <small>{worker.canRelocate ? "✓ Pan-India Relocation" : "Local only"}</small>
                      </td>

                      <td>
                        {action ? (
                          <select
                            value={worker.status}
                            onChange={(e) => handleWorkerStatus(worker.id, e.target.value)}
                            className="workforce-select"
                            style={{ padding: "4px 8px", fontSize: "11.5px", fontWeight: 700 }}
                          >
                            <option value="available">Available</option>
                            <option value="deployed">Deployed on Site</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        ) : (
                          <span className={`status-badge ${worker.status}`}>{worker.status}</span>
                        )}
                      </td>

                      {action && (
                        <td style={{ textAlign: "right" }}>
                          <button
                            type="button"
                            className="icon-danger"
                            title="Delete Worker Profile"
                            onClick={() => setWorkerToDelete(worker)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 4. ANALYTICS & DEMAND INSIGHTS TAB */}
        {subTab === "analytics" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="analytics-grid-2">
              <RequisitionTradeDemandChart requisitions={requisitions} />
              <RequisitionStatusDonutChart requisitions={requisitions} />
            </div>
            <WorkforceCompositionChart agencies={agencies} workers={workers} />
          </div>
        )}
      </section>

      {/* Requisition Details View Modal */}
      {viewingRequisition && (
        <div className="admin-modal" onClick={() => setViewingRequisition(null)}>
          <div className="editor details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="editor-head">
              <div>
                <span className="section-label">
                  <span /> REQUISITION DETAILS
                </span>
                <h2>{viewingRequisition.requisitionCode} • {viewingRequisition.projectTitle}</h2>
              </div>
              <button
                type="button"
                className="editor-close"
                onClick={() => setViewingRequisition(null)}
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="editor-body">
              <div className="details-grid">
                <div className="details-item">
                  <label>Contractor / Firm Name</label>
                  <strong>{viewingRequisition.companyName}</strong>
                </div>
                <div className="details-item">
                  <label>Authorized Contact</label>
                  <strong>{viewingRequisition.contactPerson}</strong>
                </div>
                <div className="details-item">
                  <label>Direct Phone</label>
                  <a href={`tel:${viewingRequisition.phone}`} style={{ color: "var(--amber-primary)", fontWeight: 700 }}>
                    {viewingRequisition.phone}
                  </a>
                </div>
                <div className="details-item">
                  <label>Email Address</label>
                  <strong>{viewingRequisition.email}</strong>
                </div>
                <div className="details-item">
                  <label>Project Site Location</label>
                  <strong>{viewingRequisition.locationCity}, {viewingRequisition.locationState}</strong>
                </div>
                <div className="details-item">
                  <label>Project Classification</label>
                  <strong>{viewingRequisition.projectType}</strong>
                </div>
                <div className="details-item">
                  <label>Deployment Duration</label>
                  <strong>{viewingRequisition.durationMonths || "Project based"}</strong>
                </div>
                <div className="details-item">
                  <label>Total Workforce Required</label>
                  <strong style={{ color: "var(--amber-dark)" }}>{viewingRequisition.totalWorkers} Personnel</strong>
                </div>
              </div>

              {/* Trade Matrix Table */}
              <div style={{ marginBottom: "18px" }}>
                <label style={{ fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-dim)", display: "block", marginBottom: "8px" }}>
                  Trade Headcount Matrix Breakdown
                </label>
                <div className="admin-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Trade Discipline</th>
                        <th style={{ textAlign: "right" }}>Required Headcount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(viewingRequisition.skillsRequired) ? viewingRequisition.skillsRequired : []).map((s: any, idx: number) => (
                        <tr key={idx}>
                          <td><b>{typeof s === "string" ? s : s.trade}</b></td>
                          <td style={{ textAlign: "right", fontWeight: 700, color: "var(--amber-dark)" }}>
                            {typeof s === "string" ? "—" : `${s.count} Workers`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Amenities Provided */}
              {Array.isArray(viewingRequisition.amenities) && viewingRequisition.amenities.length > 0 && (
                <div style={{ marginBottom: "18px" }}>
                  <label style={{ fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-dim)", display: "block", marginBottom: "6px" }}>
                    Site Amenities & Logistics Provided
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {viewingRequisition.amenities.map((a: string, idx: number) => (
                      <span key={idx} className="trade-tag" style={{ background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0" }}>
                        ✓ {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Scope Message */}
              {viewingRequisition.message && (
                <div>
                  <label style={{ fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-dim)", display: "block", marginBottom: "4px" }}>
                    Scope Notes
                  </label>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", background: "#f8fafc", padding: "12px", borderRadius: "6px", border: "1px solid var(--border)" }}>
                    {viewingRequisition.message}
                  </p>
                </div>
              )}
            </div>

            <div className="editor-foot">
              <button
                type="button"
                className="btn-confirm-cancel"
                onClick={() => setViewingRequisition(null)}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Requisition Deletion */}
      <ConfirmDialog
        open={Boolean(reqToDelete)}
        title="Delete Labour Requisition?"
        message={`Are you sure you want to permanently delete Requisition "${reqToDelete?.requisitionCode}" for project "${reqToDelete?.projectTitle}"?`}
        confirmText="Delete Requisition"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={async () => {
          if (reqToDelete && action) {
            await action({ action: "delete_requisition", id: reqToDelete.id });
          }
        }}
        onClose={() => setReqToDelete(null)}
      />

      {/* Confirmation Dialog for Agency Deletion */}
      <ConfirmDialog
        open={Boolean(agencyToDelete)}
        title="Delete Labour Supply Agency?"
        message={`Are you sure you want to permanently delete agency "${agencyToDelete?.agencyName}" (${agencyToDelete?.proprietorName})?`}
        confirmText="Delete Agency"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={async () => {
          if (agencyToDelete && action) {
            await action({ action: "delete_agency", id: agencyToDelete.id });
          }
        }}
        onClose={() => setAgencyToDelete(null)}
      />

      {/* Confirmation Dialog for Worker Deletion */}
      <ConfirmDialog
        open={Boolean(workerToDelete)}
        title="Delete Worker Profile?"
        message={`Are you sure you want to permanently delete artisan "${workerToDelete?.fullName}" (${workerToDelete?.workerCode})?`}
        confirmText="Delete Worker"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={async () => {
          if (workerToDelete && action) {
            await action({ action: "delete_worker", id: workerToDelete.id });
          }
        }}
        onClose={() => setWorkerToDelete(null)}
      />
    </>
  );
}
