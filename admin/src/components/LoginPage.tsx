import React, { useState } from "react";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const result = await login({ email, password });
      if (!result.ok) {
        setError(result.error || "Authentication failed. Invalid credentials.");
      }
    } catch {
      setError("An unexpected error occurred. Please check network connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#090d16",
        backgroundImage: "radial-gradient(ellipse 80% 80% at 50% -20%, rgba(201, 163, 93, 0.15), rgba(9, 13, 22, 0))",
        padding: "24px",
        fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "linear-gradient(180deg, #131b2e 0%, #0e1626 100%)",
          border: "1px solid rgba(201, 163, 93, 0.25)",
          borderRadius: "12px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 24px rgba(201, 163, 93, 0.08)",
          overflow: "hidden",
        }}
      >
        {/* Card Header */}
        <div
          style={{
            padding: "32px 28px 24px",
            textAlign: "center",
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              margin: "0 auto 16px",
              background: "linear-gradient(135deg, #c9a35d 0%, #967432 100%)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(201, 163, 93, 0.35)",
            }}
          >
            <ShieldCheck size={26} color="#090d16" strokeWidth={2.2} />
          </div>
          <span
            style={{
              display: "inline-block",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "#c9a35d",
              textTransform: "uppercase",
              marginBottom: "4px",
            }}
          >
            Owner Control Portal
          </span>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#f8fafc",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Dezoryn Contractor
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "#94a3b8",
              marginTop: "6px",
              marginBottom: 0,
            }}
          >
            Sign in with administrator credentials to manage catalog, media & leads.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "28px" }}>
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.35)",
                borderRadius: "8px",
                padding: "12px 14px",
                marginBottom: "20px",
                color: "#fca5a5",
                fontSize: "13px",
                lineHeight: "1.4",
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "1px" }} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ marginBottom: "18px" }}>
            <label
              htmlFor="admin-email"
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "#cbd5e1",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "8px",
              }}
            >
              Admin Email
            </label>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Mail
                size={16}
                color="#64748b"
                style={{ position: "absolute", left: "14px", pointerEvents: "none" }}
              />
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@dezoryn.com"
                style={{
                  width: "100%",
                  padding: "12px 14px 12px 40px",
                  background: "#080d1a",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "8px",
                  color: "#f8fafc",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#c9a35d";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(201, 163, 93, 0.2)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              htmlFor="admin-password"
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "#cbd5e1",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "8px",
              }}
            >
              Password
            </label>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Lock
                size={16}
                color="#64748b"
                style={{ position: "absolute", left: "14px", pointerEvents: "none" }}
              />
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: "100%",
                  padding: "12px 42px 12px 40px",
                  background: "#080d1a",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "8px",
                  color: "#f8fafc",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#c9a35d";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(201, 163, 93, 0.2)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: "12px",
                  background: "transparent",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px 20px",
              background: loading
                ? "#8c723e"
                : "linear-gradient(135deg, #c9a35d 0%, #b38c43 100%)",
              color: "#090d16",
              fontWeight: 700,
              fontSize: "14px",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 4px 14px rgba(201, 163, 93, 0.25)",
              transition: "transform 0.1s ease, box-shadow 0.15s ease",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin" />
                <span>Authenticating…</span>
              </>
            ) : (
              <>
                <Lock size={15} />
                <span>Authenticate & Enter</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Security Badge */}
        <div
          style={{
            padding: "16px 28px",
            background: "#080c16",
            borderTop: "1px solid rgba(255, 255, 255, 0.04)",
            textAlign: "center",
            fontSize: "11px",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          <ShieldCheck size={13} color="#c9a35d" />
          <span>Protected Infrastructure · Short-Lived Access JWT & Token Rotation</span>
        </div>
      </div>
    </div>
  );
}
