import { Box, CheckCircle2, FileImage, Inbox } from "lucide-react";
import { StatCard } from "./stat-card";
import { EnquiryTable } from "./enquiry-table";
import type { AdminDashboardData } from "@shared/types";

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

  return (
    <>
      <div className="stat-grid">
        <StatCard icon={Inbox} label="Total enquiries" value={enquiries.length} />
        <StatCard icon={CheckCircle2} label="New enquiries" value={pending} />
        <StatCard icon={Box} label="Active products" value={activeProducts} />
        <StatCard icon={FileImage} label="Gallery media" value={galleryCount} />
      </div>
      <section className="admin-card">
        <div className="card-head">
          <div>
            <span>LATEST ACTIVITY</span>
            <h2>Recent enquiries</h2>
          </div>
        </div>
        <EnquiryTable rows={enquiries.slice(0, 6)} action={action} />
      </section>
    </>
  );
}

