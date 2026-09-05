import { useEffect, useState } from "react";
import {
  Box,
  CheckCircle2,
  Eye,
  FileImage,
  Inbox,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  Settings,
  X,
} from "lucide-react";
import { DashboardTab } from "./dashboard-tab";
import { ProductsTab } from "./products-tab";
import { GalleryTab } from "./gallery-tab";
import { EnquiriesTab } from "./enquiries-tab";
import { SettingsTab } from "./settings-tab";
import { ProductEditorModal } from "./product-editor-modal";
import type { AdminDashboardData, Product } from "@shared/types";

import { fetchAdminData, postAdminAction } from "../src/api";

type Tab = "dashboard" | "products" | "gallery" | "enquiries" | "settings";

export function AdminPanel({
  user = "Dezoryn Administrator",
  signOut = "http://localhost:3000",
  onSignOut,
}: {
  user?: string;
  signOut?: string;
  onSignOut?: () => void;
}) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Partial<Product> | null>(null);
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    try {
      const json = await fetchAdminData();
      setData(json);
    } catch (err: any) {
      setNotice(err.message || "Failed to load admin data. Is backend server running on port 5000?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Auto-dismiss notice banner after 4 seconds
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => {
      setNotice("");
    }, 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  async function action(payload: any): Promise<boolean> {
    setNotice("");
    try {
      await postAdminAction(payload);
      setNotice("Saved successfully");
      await load();
      return true;
    } catch (err: any) {
      setNotice(err.message || "Action failed. Check backend connection.");
      return false;
    }
  }

  const companyName = data?.settings?.company_name || "Dezoryn";

  useEffect(() => {
    if (companyName) {
      document.title = `${companyName} | Control Centre`;
    }
  }, [companyName]);

  const nav = [
    ["dashboard", LayoutDashboard, "Dashboard"],
    ["products", Box, "Products"],
    ["gallery", FileImage, "Gallery"],
    ["enquiries", Inbox, "Enquiries"],
    ["settings", Settings, "Website settings"],
  ] as const;

  if (loading && !data) {
    return (
      <div className="admin-loading">
        <RefreshCw className="spin text-[#c9a35d]" /> Loading Control Centre…
      </div>
    );
  }

  return (
    <div className="admin-app">
      <aside className="admin-side">
        <a className="admin-brand" href="http://localhost:3000" target="_blank" rel="noreferrer">
          <div className="admin-brand-mark">
            <span className="sr-only">{companyName}</span>
          </div>
          <div className="admin-brand-info">
            <b>{companyName.toUpperCase()}</b>
            <small>CONTROL CENTRE</small>
          </div>
        </a>
        <nav>
          {nav.map(([id, Icon, label]) => (
            <button
              className={tab === id ? "active" : ""}
              onClick={() => setTab(id as Tab)}
              key={id}
            >
              <Icon /> {label}
            </button>
          ))}
        </nav>
        <div className="admin-user">
          <span>{user === "Dezoryn Administrator" ? `${companyName} Administrator` : user}</span>
          {onSignOut ? (
            <button
              type="button"
              onClick={onSignOut}
              style={{
                background: "transparent",
                border: "none",
                color: "inherit",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "inherit",
              }}
            >
              <LogOut size={14} /> Sign out
            </button>
          ) : (
            <a href={signOut}>
              <LogOut size={14} /> Exit
            </a>
          )}
        </div>
      </aside>

      <main className="admin-main">
        <header>
          <div>
            <div className="section-label">
              <span /> {companyName.toUpperCase()} CONTROL PORTAL
            </div>
            <h1>{nav.find((n) => n[0] === tab)?.[2]}</h1>
          </div>
          <div>
            <a className="admin-view" href="http://localhost:3000" target="_blank" rel="noreferrer">
              <Eye size={15} className="text-[#c9a35d]" /> View Website
            </a>
            <button className="admin-refresh" onClick={load} title="Refresh data">
              <RefreshCw size={16} className={loading ? "spin" : ""} />
            </button>
          </div>
        </header>

        {notice && (
          <div className="admin-notice">
            <CheckCircle2 size={18} className="text-[#c9a35d] shrink-0" />
            <span>{notice}</span>
            <button onClick={() => setNotice("")}>
              <X size={16} />
            </button>
          </div>
        )}

        {data && tab === "dashboard" && (
          <DashboardTab data={data} action={action} />
        )}
        {data && tab === "products" && (
          <ProductsTab data={data} edit={setProduct} action={action} />
        )}
        {data && tab === "gallery" && (
          <GalleryTab
            data={data}
            reload={load}
            action={action}
            setNotice={setNotice}
          />
        )}
        {data && tab === "enquiries" && (
          <EnquiriesTab data={data} action={action} />
        )}
        {data && tab === "settings" && (
          <SettingsTab data={data} action={action} />
        )}
      </main>

      {product && (
        <ProductEditorModal
          item={product}
          close={() => setProduct(null)}
          save={async (p) => {
            const ok = await action({ action: "save_product", ...p });
            if (ok) setProduct(null);
          }}
        />
      )}
    </div>
  );
}

