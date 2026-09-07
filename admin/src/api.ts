let inMemoryToken: string | null = null;
let activeRefreshPromise: Promise<string> | null = null;

export function setInMemoryToken(token: string | null) {
  inMemoryToken = token;
  if (typeof window !== "undefined") {
    try {
      if (token) {
        sessionStorage.setItem("dezoryn_admin_token", token);
        localStorage.setItem("dezoryn_admin_token", token);
      } else {
        sessionStorage.removeItem("dezoryn_admin_token");
        localStorage.removeItem("dezoryn_admin_token");
      }
    } catch {}
  }
}

export function getInMemoryToken(): string | null {
  if (inMemoryToken) return inMemoryToken;
  if (typeof window !== "undefined") {
    try {
      const saved = sessionStorage.getItem("dezoryn_admin_token") || localStorage.getItem("dezoryn_admin_token");
      if (saved) {
        inMemoryToken = saved;
        return saved;
      }
    } catch {}
  }
  return null;
}

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers || {});

  const token = getInMemoryToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let res = await fetch(url, { ...options, headers, credentials: "include" });

  // Handle 401 Unauthorized by executing single-flight token refresh
  if (res.status === 401 && !url.includes("/api/auth/")) {
    if (!activeRefreshPromise) {
      activeRefreshPromise = fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })
        .then(async (refreshRes) => {
          if (!refreshRes.ok) {
            setInMemoryToken(null);
            throw new Error("Session expired");
          }
          const data = await refreshRes.json();
          setInMemoryToken(data.accessToken);
          return data.accessToken as string;
        })
        .finally(() => {
          activeRefreshPromise = null;
        });
    }

    try {
      const newToken = await activeRefreshPromise;
      headers.set("Authorization", `Bearer ${newToken}`);
      res = await fetch(url, { ...options, headers, credentials: "include" });
    } catch {
      // Refresh failed; propagate original 401 or throw session error
      return res;
    }
  }

  return res;
}

export async function fetchAdminData() {
  const res = await authenticatedFetch("/api/admin");
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to load admin data");
  }
  return res.json();
}

export async function postAdminAction(payload: any) {
  const res = await authenticatedFetch("/api/admin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Action failed");
  }
  return res.json();
}

export async function uploadAdminMedia(formData: FormData) {
  const res = await authenticatedFetch("/api/admin/media", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Upload failed");
  }
  return res.json();
}

export async function deleteAdminMedia(id: number) {
  const res = await authenticatedFetch(`/api/admin/media?id=${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Delete failed");
  }
  return res.json();
}

export async function uploadProductImage(
  formData: FormData
): Promise<{ ok: boolean; imageUrl: string; objectKey?: string }> {
  const res = await authenticatedFetch("/api/admin/products/upload-image", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to upload product image");
  }
  return res.json();
}

export async function uploadCertificateImage(
  formData: FormData
): Promise<{ ok: boolean; imageUrl: string; fileName?: string; objectKey?: string }> {
  const res = await authenticatedFetch("/api/admin/certificates/upload", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to upload certificate image");
  }
  return res.json();
}


