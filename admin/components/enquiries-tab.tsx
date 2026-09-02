import { EnquiryTable } from "./enquiry-table";
import type { AdminDashboardData } from "@shared/types";

export function EnquiriesTab({
  data,
  action,
}: {
  data: AdminDashboardData;
  action: (payload: any) => Promise<boolean>;
}) {
  return (
    <section className="admin-card">
      <div className="card-head">
        <div>
          <span>LEAD MANAGEMENT</span>
          <h2>Customer enquiries</h2>
        </div>
      </div>
      <EnquiryTable rows={data.enquiries || []} action={action} />
    </section>
  );
}
