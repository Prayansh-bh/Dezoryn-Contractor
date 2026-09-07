import { useEffect, useState } from "react";
import {
  Award,
  Box,
  CheckCircle2,
  Eye,
  FileImage,
  HardHat,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  Settings,
  X,
} from "lucide-react";
import { DashboardTab } from "./dashboard-tab";
import { WorkforceTab } from "./workforce-tab";
import { ProductsTab } from "./products-tab";
import { GalleryTab } from "./gallery-tab";
import { CertificatesTab } from "./certificates-tab";
import { EnquiriesTab } from "./enquiries-tab";
import { SettingsTab } from "./settings-tab";
import { ProductEditorModal } from "./product-editor-modal";
import type { AdminDashboardData, Product } from "@shared/types";

import { fetchAdminData, postAdminAction } from "../src/api";

type Tab = "dashboard" | "workforce" | "products" | "gallery" | "certificates" | "enquiries" | "settings";


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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
      const actionMessages: Record<string, string> = {
        save_product: payload.id ? "Product updated successfully" : "New product added to catalog",
        delete_product: "Product deleted successfully",
        save_settings: "Website settings saved successfully",
        enquiry_status: `Enquiry status changed to "${payload.status}"`,
        delete_enquiry: "Enquiry deleted permanently",
        gallery_toggle: payload.featured ? "Media pinned to featured homepage showcase" : "Gallery media updated",
        requisition_status: `Requisition status changed to "${payload.status}"`,
        delete_requisition: "Labour requisition deleted successfully",
        agency_verify: "Labour agency verification updated",
        delete_agency: "Labour agency deleted successfully",
        worker_status: "Individual worker status updated",
        delete_worker: "Worker profile deleted successfully",
        save_certificate: payload.id ? "Certificate updated successfully" : "New certificate published successfully",
        delete_certificate: "Certificate deleted successfully",
        toggle_certificate_active: "Certificate visibility updated",
      };
      setNotice(actionMessages[payload?.action] || "Changes saved successfully");
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
    ["workforce", HardHat, "Workforce & Labour"],
    ["products", Box, "Products"],
    ["gallery", FileImage, "Gallery"],
    ["certificates", Award, "Certificates & Accreditations"],
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
      {/* Mobile Drawer Backdrop */}
      {mobileNavOpen && (
        <div
          className="admin-side-backdrop"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`admin-side ${mobileNavOpen ? "open" : ""}`}>
        <div className="admin-side-header">
          <a className="admin-brand" href="http://localhost:3000" target="_blank" rel="noreferrer">
            <div className="admin-brand-mark">
              <span className="sr-only">{companyName}</span>
            </div>
            <div className="admin-brand-info">
              <b>{companyName.toUpperCase()}</b>
              <small>CONTROL CENTRE</small>
            </div>
          </a>
          <button
            type="button"
            className="admin-side-close"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav>
          {nav.map(([id, Icon, label]) => (
            <button
              className={tab === id ? "active" : ""}
              onClick={() => {
                setTab(id as Tab);
                setMobileNavOpen(false);
              }}
              key={id}
            >
              <Icon /> {label}
            </button>
          ))}
        </nav>
        <div className="admin-user">
          <span>{user === "Dezoryn Administrator" ? `${companyName} Administrator` : user}</span>
          <div className="flex items-center gap-2">
            <button
              className="admin-signout"
              onClick={() => onSignOut ? onSignOut() : (window.location.href = signOut)}
              title="Sign out of Admin Portal"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <header>
          <div className="admin-header-title-group">
            <button
              type="button"
              className="admin-menu-btn"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <div className="section-label">
                <span /> {companyName.toUpperCase()} INFRASTRUCTURE PLATFORM
              </div>
              <h1>{nav.find((n) => n[0] === tab)?.[2]}</h1>
            </div>
          </div>
          <div className="admin-header-actions">
            <a className="admin-view" href="http://localhost:3000" target="_blank" rel="noreferrer">
              <Eye size={15} className="text-[#c9a35d]" /> <span className="admin-view-text">View Website</span>
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
        {data && tab === "workforce" && (
          <WorkforceTab data={data} action={action} />
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
        {data && tab === "certificates" && (
          <CertificatesTab data={data} action={action} />
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

