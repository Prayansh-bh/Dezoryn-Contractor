import { Plus, Trash2 } from "lucide-react";
import type { AdminDashboardData, Product } from "@shared/types";

export function ProductsTab({
  data,
  edit,
  action,
}: {
  data: AdminDashboardData;
  edit: (p: Partial<Product>) => void;
  action: (payload: any) => Promise<boolean>;
}) {
  const emptyProduct: Partial<Product> = {
    name: "",
    slug: "",
    kicker: "",
    description: "",
    features: [],
    uses: [],
    specs: [],
    active: true,
    sortOrder: 0,
  };

  return (
    <section className="admin-card">
      <div className="card-head">
        <div>
          <span>CATALOG MANAGEMENT</span>
          <h2>Website products</h2>
        </div>
        <button className="admin-primary" onClick={() => edit(emptyProduct)}>
          <Plus /> Add product
        </button>
      </div>
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
            {(data.products || []).map((p) => (
              <tr key={p.id}>
                <td>
                  <b>{p.name}</b>
                  <small>{p.kicker}</small>
                </td>
                <td>{p.slug}</td>
                <td>{p.sortOrder}</td>
                <td>
                  <span className={p.active ? "status active" : "status"}>
                    {p.active ? "Published" : "Hidden"}
                  </span>
                </td>
                <td>
                  <button className="table-btn" onClick={() => edit(p)}>
                    Edit
                  </button>
                  <button
                    className="icon-danger"
                    onClick={() =>
                      confirm("Delete this product?") &&
                      action({ action: "delete_product", id: p.id })
                    }
                  >
                    <Trash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
