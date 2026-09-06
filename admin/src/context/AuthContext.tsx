import React, { createContext, useContext, useEffect, useState } from "react";
import type { AdminUserProfile, LoginInput, ChangePasswordInput, ChangeEmailInput } from "@shared/types";
import { setInMemoryToken, getInMemoryToken } from "../api";

interface AuthContextType {
  user: AdminUserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginInput) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  changePassword: (data: ChangePasswordInput) => Promise<{ ok: boolean; error?: string }>;
  changeEmail: (data: ChangeEmailInput) => Promise<{ ok: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUserProfile | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem("dezoryn_admin_user") || localStorage.getItem("dezoryn_admin_user");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Silent session restoration via HttpOnly refresh cookie on initial mount
  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.accessToken && data.user) {
            setInMemoryToken(data.accessToken);
            setUser(data.user);
            try {
              sessionStorage.setItem("dezoryn_admin_user", JSON.stringify(data.user));
              localStorage.setItem("dezoryn_admin_user", JSON.stringify(data.user));
            } catch {}
          }
        } else {
          // If refresh fails but token and user exist in storage, keep session alive
          const currentToken = getInMemoryToken();
          if (!currentToken) {
            setInMemoryToken(null);
            if (isMounted) setUser(null);
            try {
              sessionStorage.removeItem("dezoryn_admin_user");
              localStorage.removeItem("dezoryn_admin_user");
            } catch {}
          }
        }
      } catch {
        const currentToken = getInMemoryToken();
        if (!currentToken) {
          setInMemoryToken(null);
          if (isMounted) setUser(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  async function login(credentials: LoginInput): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!res.ok) {
        return { ok: false, error: data.error || "Login failed" };
      }

      setInMemoryToken(data.accessToken);
      setUser(data.user);
      try {
        sessionStorage.setItem("dezoryn_admin_user", JSON.stringify(data.user));
        localStorage.setItem("dezoryn_admin_user", JSON.stringify(data.user));
      } catch {}
      return { ok: true };
    } catch {
      return { ok: false, error: "Network error. Is the backend server running?" };
    }
  }

  async function logout(): Promise<void> {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
    } catch {
      // Ignore network errors during logout
    } finally {
      setInMemoryToken(null);
      setUser(null);
      try {
        sessionStorage.removeItem("dezoryn_admin_user");
        localStorage.removeItem("dezoryn_admin_user");
      } catch {}
    }
  }

  async function changePassword(data: ChangePasswordInput): Promise<{ ok: boolean; error?: string }> {
    const token = getInMemoryToken();
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) {
        return { ok: false, error: result.error || "Failed to update password" };
      }

      if (result.accessToken) {
        setInMemoryToken(result.accessToken);
      }

      return { ok: true };
    } catch {
      return { ok: false, error: "Network error while changing password" };
    }
  }

  async function changeEmail(data: ChangeEmailInput): Promise<{ ok: boolean; error?: string }> {
    const token = getInMemoryToken();
    try {
      const res = await fetch("/api/auth/change-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) {
        return { ok: false, error: result.error || "Failed to update email" };
      }

      if (result.accessToken) {
        setInMemoryToken(result.accessToken);
      }
      if (result.user) {
        setUser(result.user);
        try {
          sessionStorage.setItem("dezoryn_admin_user", JSON.stringify(result.user));
          localStorage.setItem("dezoryn_admin_user", JSON.stringify(result.user));
        } catch {}
      }

      return { ok: true };
    } catch {
      return { ok: false, error: "Network error while changing email" };
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        changePassword,
        changeEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

