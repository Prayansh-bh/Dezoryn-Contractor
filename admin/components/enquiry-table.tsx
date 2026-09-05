"use client";

import { useState } from "react";
import { Trash2, Inbox } from "lucide-react";
import type { Enquiry } from "@shared/types";
import { ConfirmDialog } from "./confirm-dialog";

export function EnquiryTable({
  rows,
  action,
}: {
  rows: Enquiry[];
  action?: (payload: any) => Promise<boolean>;
}) {
  const [enquiryToDelete, setEnquiryToDelete] = useState<Enquiry | null>(null);

  return (
    <>
      <div className="admin-table-wrap">
        {!rows.length ? (
          <div
            className="empty-state"
            style={{
              padding: "48px 24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "10px",
                background: "rgba(56, 189, 248, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
                color: "#38bdf8",
              }}
            >
              <Inbox size={24} />
            </div>
            <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#f8fafc", margin: "0 0 4px 0" }}>
              No Enquiries Received Yet
            </h3>
            <p style={{ color: "var(--text-dim, #94a3b8)", maxWidth: "380px", fontSize: "13px", lineHeight: "1.5", margin: 0 }}>
              Incoming project quote requests and inquiries submitted from the public contact forms will automatically appear here.
            </p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Requirement</th>
                <th>Contact</th>
                <th>Date</th>
                <th>Status</th>
                {action && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id}>
                  <td>
                    <b>{e.name}</b>
                    <small>{e.company || "Direct Individual"}</small>
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
                  {action && (
                    <td>
                      <button
                        className="icon-danger"
                        title="Delete enquiry permanently"
                        onClick={() => setEnquiryToDelete(e)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Professional In-App Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(enquiryToDelete)}
        title="Delete Customer Enquiry?"
        message={`Are you sure you want to permanently delete the enquiry from "${enquiryToDelete?.name}" (${enquiryToDelete?.company || "Direct Enquiry"})? This record will be removed from your database.`}
        confirmText="Delete enquiry"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={async () => {
          if (enquiryToDelete && action) {
            await action({ action: "delete_enquiry", id: enquiryToDelete.id });
          }
        }}
        onClose={() => setEnquiryToDelete(null)}
      />
    </>
  );
}
