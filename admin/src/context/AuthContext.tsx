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
  const [user, setUser] = useState<AdminUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Silent session restoration via HttpOnly refresh cookie on initial mount
  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.accessToken && data.user) {
            setInMemoryToken(data.accessToken);
            setUser(data.user);
          }
        } else {
          setInMemoryToken(null);
          if (isMounted) setUser(null);
        }
      } catch {
        setInMemoryToken(null);
        if (isMounted) setUser(null);
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
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!res.ok) {
        return { ok: false, error: data.error || "Login failed" };
      }

      setInMemoryToken(data.accessToken);
      setUser(data.user);
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
      });
    } catch {
      // Ignore network errors during logout
    } finally {
      setInMemoryToken(null);
      setUser(null);
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

