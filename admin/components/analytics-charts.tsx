import { useMemo } from "react";
import { BarChart3, PieChart, TrendingUp, Users, Wrench } from "lucide-react";
import type { LabourRequisition, LabourAgency, IndividualWorker } from "@shared/types";

interface ChartProps {
  requisitions: LabourRequisition[];
  agencies: LabourAgency[];
  workers: IndividualWorker[];
}

export function RequisitionTradeDemandChart({ requisitions }: { requisitions: LabourRequisition[] }) {
  const tradeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const req of requisitions) {
      const skills = Array.isArray(req.skillsRequired) ? req.skillsRequired : [];
      for (const item of skills) {
        const tradeName = typeof item === "string" ? item : item.trade;
        const count = typeof item === "string" ? 1 : Number(item.count || 1);
        counts[tradeName] = (counts[tradeName] || 0) + count;
      }
    }

    const sorted = Object.entries(counts)
      .map(([trade, total]) => ({ trade, total }))
      .sort((a, b) => b.total - a.total);

    return sorted.slice(0, 5);
  }, [requisitions]);

  const maxCount = Math.max(...tradeCounts.map((t) => t.total), 1);

  return (
    <div className="chart-card">
      <div className="chart-card-head">
        <div>
          <span className="section-label">
            <span /> LABOUR DEMAND METRICS
          </span>
          <h3>Top Trade Requisitions</h3>
        </div>
        <span className="chart-badge">Active Project Demand</span>
      </div>

      {!tradeCounts.length ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "#64748b", fontSize: "13px" }}>
          No trade requirement data lodged yet.
        </div>
      ) : (
        <div className="bar-chart-list">
          {tradeCounts.map((item, idx) => {
            const pct = Math.round((item.total / maxCount) * 100);
            return (
              <div key={idx} className="bar-chart-row">
                <div className="bar-chart-info">
                  <span>{item.trade}</span>
                  <span className="bar-chart-count">{item.total} Workers</span>
                </div>
                <div className="bar-chart-track">
                  <div
                    className="bar-chart-fill"
                    style={{ width: `${pct}%` }}
                    title={`${item.total} requested workers (${pct}%)`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function RequisitionStatusDonutChart({ requisitions }: { requisitions: LabourRequisition[] }) {
  const { segments, total } = useMemo(() => {
    const counts = {
      open: 0,
      matched: 0,
      fulfilling: 0,
      completed: 0,
      cancelled: 0,
    };

    for (const r of requisitions) {
      const st = (r.status || "open").toLowerCase();
      if (st in counts) {
        counts[st as keyof typeof counts]++;
      } else {
        counts.open++;
      }
    }

    const totalCount = requisitions.length;
    const config = [
      { key: "open", label: "Open / Pending Match", count: counts.open, color: "#2563eb" },
      { key: "matched", label: "Agency Matched", count: counts.matched, color: "#c9a35d" },
      { key: "fulfilling", label: "Active on Site", count: counts.fulfilling, color: "#059669" },
      { key: "completed", label: "Completed", count: counts.completed, color: "#7c3aed" },
      { key: "cancelled", label: "Cancelled", count: counts.cancelled, color: "#94a3b8" },
    ].filter((s) => s.count > 0 || totalCount === 0);

    return { segments: config, total: totalCount };
  }, [requisitions]);

  // Compute SVG arcs for donut
  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;

  return (
    <div className="chart-card">
      <div className="chart-card-head">
        <div>
          <span className="section-label">
            <span /> LIFECYCLE BREAKDOWN
          </span>
          <h3>Requisition Status Flow</h3>
        </div>
        <span className="chart-badge">Fulfillment SLA</span>
      </div>

      <div className="donut-chart-wrap">
        <div className="donut-svg-box">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />
            {total > 0 &&
              segments.map((seg, idx) => {
                const strokeDasharray = `${(seg.count / total) * circumference} ${circumference}`;
                const strokeDashoffset = -cumulativeOffset;
                cumulativeOffset += (seg.count / total) * circumference;

                return (
                  <circle
                    key={idx}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.5s ease" }}
                  />
                );
              })}
          </svg>
          <div className="donut-center-text">
            <b>{total}</b>
            <span>Requisitions</span>
          </div>
        </div>

        <div className="donut-legend">
          {segments.map((seg) => {
            const pct = total > 0 ? Math.round((seg.count / total) * 100) : 0;
            return (
              <div key={seg.key} className="legend-item">
                <div className="legend-color-tag">
                  <span className="legend-dot" style={{ backgroundColor: seg.color }} />
                  <span>{seg.label}</span>
                </div>
                <span className="legend-count">
                  {seg.count} <small style={{ color: "#64748b", fontWeight: 500 }}>({pct}%)</small>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function WorkforceCompositionChart({
  agencies,
  workers,
}: {
  agencies: LabourAgency[];
  workers: IndividualWorker[];
}) {
  const agencyCrewTotal = agencies.reduce((acc, a) => acc + (a.totalCrewSize || 0), 0);
  const totalArtisans = workers.length;
  const verifiedAgencies = agencies.filter((a) => a.verified).length;
  const availableWorkers = workers.filter((w) => w.status === "available").length;

  const totalPool = agencyCrewTotal + totalArtisans || 1;
  const agencyPct = Math.round((agencyCrewTotal / totalPool) * 100);
  const workerPct = Math.round((totalArtisans / totalPool) * 100);

  return (
    <div className="chart-card">
      <div className="chart-card-head">
        <div>
          <span className="section-label">
            <span /> CAPACITY POOL
          </span>
          <h3>Workforce Fleet Balance</h3>
        </div>
        <span className="chart-badge">Total: {totalPool.toLocaleString()} Men</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", fontWeight: 700, marginBottom: "6px" }}>
            <span style={{ color: "#c9a35d" }}>Subcontractor Agencies ({agencies.length} Firms)</span>
            <span>{agencyCrewTotal.toLocaleString()} Workers ({agencyPct}%)</span>
          </div>
          <div className="bar-chart-track" style={{ height: "10px" }}>
            <div className="bar-chart-fill" style={{ width: `${agencyPct}%` }} />
          </div>
          <small style={{ color: "#64748b", fontSize: "11px", marginTop: "3px", display: "block" }}>
            {verifiedAgencies} verified partner agencies with GST & labour licenses
          </small>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", fontWeight: 700, marginBottom: "6px" }}>
            <span style={{ color: "#2563eb" }}>Direct Skill Registry ({totalArtisans} Artisans)</span>
            <span>{totalArtisans.toLocaleString()} Workers ({workerPct}%)</span>
          </div>
          <div className="bar-chart-track" style={{ height: "10px" }}>
            <div className="bar-chart-fill blue" style={{ width: `${workerPct}%` }} />
          </div>
          <small style={{ color: "#64748b", fontSize: "11px", marginTop: "3px", display: "block" }}>
            {availableWorkers} artisans immediately available for deployment
          </small>
        </div>
      </div>
    </div>
  );
}
