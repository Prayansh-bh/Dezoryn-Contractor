import { Box, Building2, CheckCircle2, FileImage, HardHat, Inbox, Users } from "lucide-react";
import { StatCard } from "./stat-card";
import { EnquiryTable } from "./enquiry-table";
import {
  RequisitionTradeDemandChart,
  RequisitionStatusDonutChart,
  WorkforceCompositionChart,
} from "./analytics-charts";
import type { AdminDashboardData, LabourRequisition } from "@shared/types";

export function DashboardTab({
  data,
  action,
}: {
  data: AdminDashboardData;
  action?: (payload: any) => Promise<boolean>;
}) {
  const enquiries = data.enquiries || [];
  const pending = enquiries.filter((x) => x.status === "new").length;
  const activeProducts = (data.products || []).filter((x) => x.active).length;
  const galleryCount = (data.gallery || []).length;

  const requisitions: LabourRequisition[] = data.workforce?.requisitions || [];
  const agencies = data.workforce?.agencies || [];
  const workers = data.workforce?.workers || [];
  const summary = data.workforce?.summary;

  const openReqs = requisitions.filter((r) => r.status === "open").length;
  const totalReqWorkers = requisitions.reduce((sum, r) => sum + (r.totalWorkers || 0), 0);
  const verifiedAgencies = agencies.filter((a) => a.verified).length;
  const totalWorkforcePool = summary?.totalWorkforcePool || 2450;

  return (
    <>
      {/* 6 Executive KPI Stat Cards */}
      <div className="stat-grid-6">
        <StatCard icon={Inbox} label="Total Enquiries" value={enquiries.length} />
        <StatCard icon={CheckCircle2} label="New Enquiries" value={pending} />
        <StatCard icon={Building2} label="Open Requisitions" value={openReqs} />
        <StatCard icon={Users} label="Verified Agencies" value={verifiedAgencies} />
        <StatCard icon={HardHat} label="Workforce Pool" value={totalWorkforcePool.toLocaleString()} />
        <StatCard icon={Box} label="Active Products" value={activeProducts} />
      </div>

      {/* KPI / Analytics / Charts Grid */}
      <div className="analytics-grid-2">
        <RequisitionTradeDemandChart requisitions={requisitions} />
        <RequisitionStatusDonutChart requisitions={requisitions} />
      </div>

      {/* Secondary Analytics Strip: Fleet Composition */}
      <div style={{ marginBottom: "28px" }}>
        <WorkforceCompositionChart agencies={agencies} workers={workers} />
      </div>

      {/* Latest Enquiries Section */}
      <section className="admin-card">
        <div className="card-head">
          <div>
            <span>COMMERCIAL LEADS</span>
            <h2>Recent BOQ Quotation Inquiries</h2>
          </div>
        </div>
        <EnquiryTable rows={enquiries.slice(0, 6)} action={action} />
      </section>
    </>
  );
}
