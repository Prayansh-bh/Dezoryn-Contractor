"use client";

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

type Tab = "dashboard" | "products" | "gallery" | "enquiries" | "settings";

export function AdminPanel({
  user,
  signOut,
}: {
  user: string;
  signOut: string;
}) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Partial<Product> | null>(null);
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin");
      if (r.ok) {
        const json = await r.json();
        setData(json);
      }
    } catch {
      setNotice("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function action(payload: any): Promise<boolean> {
    setNotice("");
    try {
      const r = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!r.ok) {
        setNotice("Action failed");
        return false;
      }

      setNotice("Saved successfully");
      await load();
      return true;
    } catch {
      setNotice("Action failed. Check network connection.");
      return false;
    }
  }

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
        <RefreshCw className="spin" /> Loading admin panel…
      </div>
    );
  }

  return (
    <div className="admin-app">
      <aside className="admin-side">
        <a className="admin-brand" href="/">
          <span>DC</span>
          <div>
            <b>DEZORYN</b>
            <small>ADMIN CONTROL</small>
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
          <span>{user}</span>
          <a href={signOut}>
            <LogOut /> Sign out
          </a>
        </div>
      </aside>

      <main className="admin-main">
        <header>
          <div>
            <span>DEZORYN CONTROL CENTRE</span>
            <h1>{nav.find((n) => n[0] === tab)?.[2]}</h1>
          </div>
          <div>
            <a className="admin-view" href="/" target="_blank">
              <Eye /> View website
            </a>
            <button className="admin-refresh" onClick={load}>
              <RefreshCw className={loading ? "spin" : ""} />
            </button>
          </div>
        </header>

        {notice && (
          <div className="admin-notice">
            <CheckCircle2 />
            {notice}
            <button onClick={() => setNotice("")}>
              <X />
            </button>
          </div>
        )}

        {data && tab === "dashboard" && <DashboardTab data={data} />}
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
