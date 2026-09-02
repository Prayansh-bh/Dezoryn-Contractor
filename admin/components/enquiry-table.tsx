import type { Enquiry } from "@shared/types";

export function EnquiryTable({
  rows,
  action,
}: {
  rows: Enquiry[];
  action?: (payload: any) => Promise<boolean>;
}) {
  return (
    <div className="admin-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Requirement</th>
            <th>Contact</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => (
            <tr key={e.id}>
              <td>
                <b>{e.name}</b>
                <small>{e.company}</small>
              </td>
              <td>
                <b>{e.product}</b>
                <small>
                  {e.quantity} · {e.location}
                </small>
              </td>
              <td>
                <a href={`tel:${e.phone}`}>{e.phone}</a>
                <small>{e.email}</small>
              </td>
              <td>{new Date(e.createdAt).toLocaleDateString("en-IN")}</td>
              <td>
                {action ? (
                  <select
                    value={e.status}
                    onChange={(x) =>
                      action({
                        action: "enquiry_status",
                        id: e.id,
                        status: x.target.value,
                      })
                    }
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="closed">Closed</option>
                  </select>
                ) : (
                  <span className="status">{e.status}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <div className="empty-state">No enquiries yet.</div>}
    </div>
  );
}
