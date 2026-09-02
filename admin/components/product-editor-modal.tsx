"use client";

import { useState } from "react";
import { Save, X } from "lucide-react";
import type { Product } from "@shared/types";

export function ProductEditorModal({
  item,
  close,
  save,
}: {
  item: Partial<Product>;
  close: () => void;
  save: (p: Partial<Product>) => Promise<void>;
}) {
  const [p, setP] = useState<Partial<Product>>(item);

  const field = (k: keyof Product, v: any) => setP({ ...p, [k]: v });

  return (
    <div className="admin-modal">
      <form
        className="editor"
        onSubmit={(e) => {
          e.preventDefault();
          save(p);
        }}
      >
        <div className="editor-head">
          <div>
            <span>PRODUCT EDITOR</span>
            <h2>{p.id ? "Edit product" : "Add new product"}</h2>
          </div>
          <button type="button" onClick={close}>
            <X />
          </button>
        </div>
        <div className="editor-body">
          <div className="form-row">
            <label>
              Product Name
              <input
                required
                value={p.name || ""}
                onChange={(e) => field("name", e.target.value)}
              />
            </label>
            <label>
              URL Slug
              <input
                required
                value={p.slug || ""}
                onChange={(e) => field("slug", e.target.value)}
              />
            </label>
          </div>
          <label>
            Short Kicker
            <input
              value={p.kicker || ""}
              onChange={(e) => field("kicker", e.target.value)}
            />
          </label>
          <label>
            Description
            <textarea
              rows={4}
              required
              value={p.description || ""}
              onChange={(e) => field("description", e.target.value)}
            />
          </label>
          <label>
            Advantages <small>One per line</small>
            <textarea
              rows={4}
              value={(p.features || []).join("\n")}
              onChange={(e) =>
                field("features", e.target.value.split("\n").filter(Boolean))
              }
            />
          </label>
          <label>
            Applications <small>One per line</small>
            <textarea
              rows={4}
              value={(p.uses || []).join("\n")}
              onChange={(e) =>
                field("uses", e.target.value.split("\n").filter(Boolean))
              }
            />
          </label>
          <label>
            Specifications <small>One per line</small>
            <textarea
              rows={4}
              value={(p.specs || []).join("\n")}
              onChange={(e) =>
                field("specs", e.target.value.split("\n").filter(Boolean))
              }
            />
          </label>
          <div className="form-row">
            <label>
              Display Order
              <input
                type="number"
                value={p.sortOrder ?? 0}
                onChange={(e) => field("sortOrder", Number(e.target.value))}
              />
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={p.active ?? true}
                onChange={(e) => field("active", e.target.checked)}
              />{" "}
              Published on website
            </label>
          </div>
        </div>
        <div className="editor-foot">
          <button type="button" onClick={close}>
            Cancel
          </button>
          <button className="admin-primary">
            <Save /> Save product
          </button>
        </div>
      </form>
    </div>
  );
}
