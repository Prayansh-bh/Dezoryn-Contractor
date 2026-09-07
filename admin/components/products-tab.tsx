"use client";

import { useState } from "react";
import { Plus, Trash2, Box } from "lucide-react";
import type { AdminDashboardData, Product } from "@shared/types";
import { ConfirmDialog } from "./confirm-dialog";

export function ProductsTab({
  data,
  edit,
  action,
}: {
  data: AdminDashboardData;
  edit: (p: Partial<Product>) => void;
  action: (payload: any) => Promise<boolean>;
}) {
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const products = data.products || [];
  const nextOrder =
    products.length > 0
      ? Math.max(...products.map((p) => p.sortOrder || 0), 0) + 1
      : 1;

  const emptyProduct: Partial<Product> = {
    name: "",
    slug: "",
    kicker: "",
    description: "",
    features: [],
    uses: [],
    specs: [],
    active: true,
    sortOrder: nextOrder,
  };

  const sortedProducts = [...products].sort(
    (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
  );

  return (
    <>
      <section className="admin-card">
        <div className="card-head">
          <div>
            <span>CATALOG MANAGEMENT</span>
            <h2>Website products ({sortedProducts.length})</h2>
          </div>
          <button className="admin-primary" onClick={() => edit(emptyProduct)}>
            <Plus /> Add product
          </button>
        </div>

        {sortedProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Box size={28} />
            </div>
            <h3>No Products in Catalog</h3>
            <p>
              Your product catalog is currently empty. Click &ldquo;Add Product&rdquo; to create your first highway product line and technical specification.
            </p>
            <button className="admin-primary" onClick={() => edit(emptyProduct)}>
              <Plus size={16} /> Add your first product
            </button>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Slug</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            style={{
                              width: "38px",
                              height: "38px",
                              objectFit: "cover",
                              borderRadius: "4px",
                              border: "1px solid var(--border)",
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "38px",
                              height: "38px",
                              borderRadius: "4px",
                              background: "#f1f5f9",
                              border: "1px solid var(--border)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "var(--text-dim)",
                              flexShrink: 0,
                            }}
                          >
                            <Box size={18} />
                          </div>
                        )}
                        <div>
                          <b>{p.name}</b>
                          <small>{p.kicker}</small>
                        </div>
                      </div>
                    </td>
                    <td>{p.slug}</td>
                    <td>{p.sortOrder}</td>
                    <td>
                      <span className={p.active ? "status active" : "status"}>
                        {p.active ? "Published" : "Hidden"}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="table-btn" onClick={() => edit(p)}>
                          Edit
                        </button>
                        <button
                          className="icon-danger"
                          title="Delete product"
                          onClick={() => setProductToDelete(p)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Professional In-App Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(productToDelete)}
        title="Permanently Delete Product?"
        message={`Are you sure you want to permanently delete "${productToDelete?.name}" from your catalog and database? This action cannot be undone.`}
        confirmText="Delete product"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={async () => {
          if (productToDelete) {
            await action({ action: "delete_product", id: productToDelete.id });
          }
        }}
        onClose={() => setProductToDelete(null)}
      />
    </>
  );
}
