"use client";

import { useState, useEffect } from "react";
import {
  Save,
  KeyRound,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  Eye,
  EyeOff,
  Server,
} from "lucide-react";
import { DEFAULT_SITE_SETTINGS } from "@shared/constants";
import type { AdminDashboardData } from "@shared/types";
import { useAuth } from "../src/context/AuthContext";
import { postAdminAction } from "../src/api";

export function SettingsTab({
  data,
  action,
}: {
  data: AdminDashboardData;
  action: (payload: any) => Promise<boolean>;
}) {
  const { user, changePassword, changeEmail } = useAuth();
  const [s, setS] = useState({
    ...DEFAULT_SITE_SETTINGS,
    ...(data.settings || {}),
  });

  const [saveLoading, setSaveLoading] = useState(false);
  const [emailSaveLoading, setEmailSaveLoading] = useState(false);

  // Sync state whenever settings refresh from backend
  useEffect(() => {
    if (data?.settings) {
      setS((prev) => ({
        ...prev,
        ...data.settings,
      }));
    }
  }, [data?.settings]);

  // Email SMTP Test State
  const [showKey, setShowKey] = useState(false);
  const [testEmail, setTestEmail] = useState(data.settings?.email_admin_recipient || user?.email || "sales@dezoryn.com");
  const [testLoading, setTestLoading] = useState(false);
  const [testSuccess, setTestSuccess] = useState("");
  const [testError, setTestError] = useState("");

  // Email change state
  const [newEmail, setNewEmail] = useState("");
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  async function handleTestEmail(e: React.FormEvent) {
    e.preventDefault();
    setTestError("");
    setTestSuccess("");

    if (!testEmail || !testEmail.includes("@")) {
      setTestError("Please enter a valid email address to receive the test message.");
      return;
    }

    setTestLoading(true);

    try {
      // Save current unsaved settings first so the test executes against current inputs
      await action({ action: "save_settings", settings: s });
      const res = await postAdminAction({ action: "test_email", targetEmail: testEmail });
      if (res.ok) {
        setTestSuccess(`✓ Brevo SMTP Connection Verified! Test email successfully delivered to "${testEmail}".`);
      } else {
        setTestError(res.error || "Failed to send test email.");
      }
    } catch (err: any) {
      setTestError(err.message || "Failed to send test email. Check Brevo SMTP credentials.");
    } finally {
      setTestLoading(false);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError("");
    setEmailSuccess("");

    if (!newEmail || !emailCurrentPassword) {
      setEmailError("Both new email and current password are required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setEmailLoading(true);

    try {
      const res = await changeEmail({ newEmail: newEmail.trim(), currentPassword: emailCurrentPassword });
      if (res.ok) {
        setEmailSuccess(`Administrator login email updated to "${newEmail.trim()}" successfully.`);
        setNewEmail("");
        setEmailCurrentPassword("");
      } else {
        setEmailError(res.error || "Failed to update email.");
      }
    } catch {
      setEmailError("An error occurred while updating email.");
    } finally {
      setEmailLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdError("All password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 10) {
      setPwdError("New password must be at least 10 characters.");
      return;
    }

    setPwdLoading(true);

    try {
      const res = await changePassword({ currentPassword, newPassword });
      if (res.ok) {
        setPwdSuccess("Administrator password updated successfully. All other sessions have been revoked.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPwdError(res.error || "Failed to update password.");
      }
    } catch {
      setPwdError("An error occurred while updating password.");
    } finally {
      setPwdLoading(false);
    }
  }

  return (
    <>
      <section className="admin-card settings-card">
        <div className="card-head">
          <div>
            <span>WEBSITE CONTROL</span>
            <h2>Basic details & SEO</h2>
          </div>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setSaveLoading(true);
            try {
              await action({ action: "save_settings", settings: s });
            } finally {
              setSaveLoading(false);
            }
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
              Email (Public Contact)
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
          <button className="admin-primary" disabled={saveLoading} style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            {saveLoading ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
            <span>{saveLoading ? "Saving details…" : "Save website details"}</span>
          </button>
        </form>
      </section>

      {/* Email & Notifications (Brevo SMTP) Section */}
      <section className="admin-card settings-card" style={{ marginTop: "24px" }}>
        <div className="card-head">
          <div>
            <span>EMAIL & NOTIFICATIONS</span>
            <h2>Brevo (Sendinblue) SMTP Service</h2>
          </div>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setEmailSaveLoading(true);
            try {
              await action({ action: "save_settings", settings: s });
            } finally {
              setEmailSaveLoading(false);
            }
          }}
        >
          {/* Enable Notifications Switch */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 18px",
              background: s.email_notifications_enabled === "true" ? "rgba(34, 197, 94, 0.08)" : "rgba(255, 255, 255, 0.03)",
              border: s.email_notifications_enabled === "true" ? "1px solid rgba(34, 197, 94, 0.25)" : "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <div>
              <strong style={{ display: "block", fontSize: "14px", color: "var(--text-main)" }}>
                Enable Automatic Quote Request Email Alerts
              </strong>
              <small style={{ color: "var(--text-dim)", fontSize: "12px" }}>
                When enabled, incoming BOQ quotation requests on the website will automatically dispatch an instant notification email.
              </small>
            </div>
            <label className="check-label" style={{ margin: 0 }}>
              <input
                type="checkbox"
                checked={s.email_notifications_enabled === "true"}
                onChange={(e) =>
                  setS({
                    ...s,
                    email_notifications_enabled: e.target.checked ? "true" : "false",
                  })
                }
              />
              <span style={{ fontWeight: 600 }}>Active</span>
            </label>
          </div>

          <div className="form-row">
            <label>
              Brevo SMTP Server Host
              <input
                value={s.brevo_smtp_host || "smtp-relay.brevo.com"}
                onChange={(e) => setS({ ...s, brevo_smtp_host: e.target.value })}
                placeholder="smtp-relay.brevo.com"
              />
            </label>
            <label>
              SMTP Port <small>(587 for TLS, 465 for SSL)</small>
              <input
                value={s.brevo_smtp_port || "587"}
                onChange={(e) => setS({ ...s, brevo_smtp_port: e.target.value })}
                placeholder="587"
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Brevo SMTP User / Login <small>(Registered Brevo account email)</small>
              <input
                value={s.brevo_smtp_user || ""}
                onChange={(e) => setS({ ...s, brevo_smtp_user: e.target.value })}
                placeholder="e.g. 7b34a1001@smtp-brevo.com or registered email"
              />
            </label>
            <label>
              Brevo Master Key <small>(API Key <code>xkeysib-...</code> for HTTPS or SMTP Key <code>xsmtpsib-...</code>)</small>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  type={showKey ? "text" : "password"}
                  value={s.brevo_smtp_key || ""}
                  onChange={(e) => setS({ ...s, brevo_smtp_key: e.target.value })}
                  placeholder={(data.settings as any)?.has_brevo_smtp_key ? "•••••••••••• (Configured — enter new to replace)" : "Enter API Key (xkeysib-...) or SMTP Key (xsmtpsib-...)"}
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    background: "transparent",
                    border: "none",
                    color: "var(--text-dim)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title={showKey ? "Hide key" : "Show key"}
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>
          </div>

          <div className="form-row">
            <label>
              Sender Email Address <small>(Verified Sender in Brevo)</small>
              <input
                type="email"
                value={s.email_from_address || ""}
                onChange={(e) => setS({ ...s, email_from_address: e.target.value })}
                placeholder="sales@dezoryn.com"
              />
            </label>
            <label>
              Sender Display Name
              <input
                value={s.email_from_name || ""}
                onChange={(e) => setS({ ...s, email_from_name: e.target.value })}
                placeholder="Dezoryn Contractor Commercial Desk"
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Admin Lead Notification Email(s) <small>(Where incoming quote requests are delivered)</small>
              <input
                type="email"
                value={s.email_admin_recipient || ""}
                onChange={(e) => setS({ ...s, email_admin_recipient: e.target.value })}
                placeholder="sales@dezoryn.com, admin@dezoryn.com"
              />
            </label>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <label className="check-label" style={{ marginTop: "16px" }}>
                <input
                  type="checkbox"
                  checked={s.email_customer_autoresponder === "true"}
                  onChange={(e) =>
                    setS({
                      ...s,
                      email_customer_autoresponder: e.target.checked ? "true" : "false",
                    })
                  }
                />
                Send confirmation auto-responder to client
              </label>
            </div>
          </div>

          <button className="admin-primary" disabled={emailSaveLoading} style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            {emailSaveLoading ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
            <span>{emailSaveLoading ? "Saving configuration…" : "Save email configuration"}</span>
          </button>
        </form>

        <hr style={{ borderColor: "rgba(255, 255, 255, 0.08)", margin: "28px 0" }} />

        {/* Send Test Email Sub-Section */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Server size={18} style={{ color: "var(--brand, #38bdf8)" }} />
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>Test Brevo SMTP Connection</h3>
          </div>
          <p style={{ color: "var(--text-dim)", fontSize: "13px", margin: "0 0 16px 0" }}>
            Send a test verification email through your Brevo SMTP relay to confirm credentials and inbox deliverability.
          </p>

          {testError && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#fca5a5",
                padding: "10px 14px",
                borderRadius: "6px",
                marginBottom: "16px",
                fontSize: "13px",
              }}
            >
              <AlertCircle size={16} />
              <span>{testError}</span>
            </div>
          )}

          {testSuccess && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(34, 197, 94, 0.1)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                color: "#86efac",
                padding: "10px 14px",
                borderRadius: "6px",
                marginBottom: "16px",
                fontSize: "13px",
              }}
            >
              <CheckCircle2 size={16} />
              <span>{testSuccess}</span>
            </div>
          )}

          <form onSubmit={handleTestEmail} style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
            <label style={{ flexGrow: 1, margin: 0 }}>
              Test Recipient Email
              <input
                type="email"
                required
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="your-email@example.com"
              />
            </label>
            <button
              type="submit"
              className="admin-primary"
              disabled={testLoading}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "42px", padding: "0 18px" }}
            >
              {testLoading ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
              <span>{testLoading ? "Testing connection…" : "Test Brevo Connection"}</span>
            </button>
          </form>
        </div>
      </section>

      {/* Security & Credentials Section */}
      <section className="admin-card settings-card" style={{ marginTop: "24px" }}>
        <div className="card-head">
          <div>
            <span>SECURITY CONTROL</span>
            <h2>Administrator credentials</h2>
          </div>
        </div>

        {/* --- 1. Change Admin Login Email --- */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Mail size={18} style={{ color: "var(--brand, #38bdf8)" }} />
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>Login Email Address</h3>
          </div>

          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "13px",
            }}
          >
            <span style={{ color: "var(--text-dim, #94a3b8)" }}>Current Active Login Email:</span>
            <span style={{ fontFamily: "monospace", color: "#38bdf8", fontWeight: 600 }}>
              {user?.email || "havenblue83@gmail.com"}
            </span>
          </div>

          {emailError && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#fca5a5",
                padding: "10px 14px",
                borderRadius: "6px",
                marginBottom: "16px",
                fontSize: "13px",
              }}
            >
              <AlertCircle size={16} />
              <span>{emailError}</span>
            </div>
          )}

          {emailSuccess && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(34, 197, 94, 0.1)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                color: "#86efac",
                padding: "10px 14px",
                borderRadius: "6px",
                marginBottom: "16px",
                fontSize: "13px",
              }}
            >
              <CheckCircle2 size={16} />
              <span>{emailSuccess}</span>
            </div>
          )}

          <form onSubmit={handleEmailSubmit}>
            <div className="form-row">
              <label>
                New Login Email
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="admin@example.com"
                />
              </label>
              <label>
                Current Password <small style={{ color: "var(--text-dim, #94a3b8)" }}>(to verify identity)</small>
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={emailCurrentPassword}
                  onChange={(e) => setEmailCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                />
              </label>
            </div>
            <button
              type="submit"
              className="admin-primary"
              disabled={emailLoading}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              {emailLoading ? <Loader2 size={16} className="spin" /> : <Mail size={16} />}
              <span>{emailLoading ? "Updating email…" : "Update login email"}</span>
            </button>
          </form>
        </div>

        <hr style={{ borderColor: "rgba(255, 255, 255, 0.08)", margin: "28px 0" }} />

        {/* --- 2. Change Admin Password --- */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <KeyRound size={18} style={{ color: "var(--brand, #38bdf8)" }} />
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>Change Password</h3>
          </div>

          {pwdError && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#fca5a5",
                padding: "10px 14px",
                borderRadius: "6px",
                marginBottom: "16px",
                fontSize: "13px",
              }}
            >
              <AlertCircle size={16} />
              <span>{pwdError}</span>
            </div>
          )}

          {pwdSuccess && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(34, 197, 94, 0.1)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                color: "#86efac",
                padding: "10px 14px",
                borderRadius: "6px",
                marginBottom: "16px",
                fontSize: "13px",
              }}
            >
              <CheckCircle2 size={16} />
              <span>{pwdSuccess}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <label>
              Current Password
              <input
                type="password"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
              />
            </label>
            <div className="form-row">
              <label>
                New Password <small style={{ color: "var(--text-dim, #94a3b8)" }}>(min 10 chars, upper, lower, num, symbol)</small>
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                />
              </label>
              <label>
                Confirm New Password
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                />
              </label>
            </div>
            <button
              type="submit"
              className="admin-primary"
              disabled={pwdLoading}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              {pwdLoading ? <Loader2 size={16} className="spin" /> : <KeyRound size={16} />}
              <span>{pwdLoading ? "Updating password…" : "Update administrator password"}</span>
            </button>
          </form>
        </div>
      </section>
    </>
  );
}


