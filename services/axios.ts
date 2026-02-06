import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios"

// ── Axios instance ───────────────────────────────────────────

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  withCredentials: true, // send httpOnly cookies automatically
  headers: { "Content-Type": "application/json" },
})

// ── CSRF token (persisted in localStorage so it survives page refresh) ──

const CSRF_KEY = "csrf-token"

function readCsrf(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(CSRF_KEY)
}

export const setCsrfToken = (token: string) => {
  if (typeof window !== "undefined") localStorage.setItem(CSRF_KEY, token)
}
export const getCsrfToken = () => readCsrf()
export const clearCsrfToken = () => {
  if (typeof window !== "undefined") localStorage.removeItem(CSRF_KEY)
}

// ── Request interceptor ──────────────────────────────────────

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = readCsrf()
  if (token) {
    config.headers["X-CSRF-Token"] = token
  }
  return config
})

// ── Response interceptor (auto-refresh on 401) ───────────────

let isRefreshing = false
let pendingQueue: Array<{
  resolve: (v?: unknown) => void
  reject: (e?: unknown) => void
}> = []

const processQueue = (error: unknown = null) => {
  pendingQueue.forEach((p) => (error ? p.reject(error) : p.resolve()))
  pendingQueue = []
}

api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Capture CSRF token from response header if present
    const newToken = response.headers["x-csrf-token"]
    if (newToken) setCsrfToken(newToken)
    return response
  },

  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // ── 401 → try refreshing the access token ───────────────
    if (error.response?.status === 401 && !original._retry) {
      // Don't try to refresh the refresh call itself
      if (original.url?.includes("/auth/refresh")) {
        clearCsrfToken()
        if (typeof window !== "undefined" && window.location.pathname !== "/") {
          window.location.href = "/"
        }
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject })
        }).then(() => api(original))
      }

      original._retry = true
      isRefreshing = true

      try {
        const res = await api.post("/auth/refresh")
        // The backend sets new cookies; capture new CSRF token
        if (res.data?.csrfToken) setCsrfToken(res.data.csrfToken)
        processQueue()
        return api(original) // retry original request
      } catch (refreshErr) {
        processQueue(refreshErr)
        clearCsrfToken()
        if (typeof window !== "undefined" && window.location.pathname !== "/") {
          window.location.href = "/"
        }
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    // ── 403 CSRF mismatch → clear token ─────────────────────
    if (error.response?.status === 403) {
      const msg = (error.response.data as any)?.error ?? ""
      if (msg.toLowerCase().includes("csrf")) {
        clearCsrfToken()
      }
    }

    return Promise.reject(error)
  },
)

export default api
