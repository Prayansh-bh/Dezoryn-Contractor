"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { DEFAULT_SITE_SETTINGS } from "@shared/constants";
import type { AdminDashboardData } from "@shared/types";

export function SettingsTab({
  data,
  action,
}: {
  data: AdminDashboardData;
  action: (payload: any) => Promise<boolean>;
}) {
  const [s, setS] = useState({
    ...DEFAULT_SITE_SETTINGS,
    ...(data.settings || {}),
  });

  return (
    <section className="admin-card settings-card">
      <div className="card-head">
        <div>
          <span>WEBSITE CONTROL</span>
          <h2>Basic details & SEO</h2>
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          action({ action: "save_settings", settings: s });
        }}
      >
        <div className="form-row">
          <label>
            Company Name
            <input
              value={s.company_name}
              onChange={(e) => setS({ ...s, company_name: e.target.value })}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={s.email}
              onChange={(e) => setS({ ...s, email: e.target.value })}
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            Phone
            <input
              value={s.phone}
              onChange={(e) => setS({ ...s, phone: e.target.value })}
            />
          </label>
          <label>
            WhatsApp Number
            <input
              value={s.whatsapp}
              onChange={(e) => setS({ ...s, whatsapp: e.target.value })}
            />
          </label>
        </div>
        <label>
          Office / Factory Address
          <textarea
            rows={3}
            value={s.address}
            onChange={(e) => setS({ ...s, address: e.target.value })}
          />
        </label>
        <label>
          Homepage Hero Title
          <input
            value={s.hero_title}
            onChange={(e) => setS({ ...s, hero_title: e.target.value })}
          />
        </label>
        <label>
          Homepage Hero Description
          <textarea
            rows={3}
            value={s.hero_text}
            onChange={(e) => setS({ ...s, hero_text: e.target.value })}
          />
        </label>
        <div className="form-row">
          <label>
            SEO Page Title
            <input
              value={s.meta_title}
              onChange={(e) => setS({ ...s, meta_title: e.target.value })}
            />
          </label>
          <label>
            SEO Description
            <textarea
              rows={3}
              value={s.meta_description}
              onChange={(e) => setS({ ...s, meta_description: e.target.value })}
            />
          </label>
        </div>
        <button className="admin-primary">
          <Save /> Save website details
        </button>
      </form>
    </section>
  );
}
