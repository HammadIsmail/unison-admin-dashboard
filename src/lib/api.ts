const API_BASE_URL = import.meta.env.VITE_NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export const getAuthToken = (): string | null => {
  return localStorage.getItem("unison_token");
};

export const setAuthToken = (token: string) => {
  localStorage.setItem("unison_token", token);
};

export const removeAuthToken = () => {
  localStorage.removeItem("unison_token");
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeAuthToken();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (response.status === 403) {
    const errorData = await response.json().catch(() => ({}));
    if (errorData?.message?.includes("suspended")) {
      removeAuthToken();
      window.location.href = "/login?error=suspended";
      throw new Error("This university's access has been suspended.");
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message || `API Error: ${response.status}`);
  }

  return response.json();
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  del: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};

