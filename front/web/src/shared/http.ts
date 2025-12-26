import { env } from "./env"
import type { ApiResponse } from "./types/api"

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE"

type ReqCfg = {
  method: HttpMethod
  path: string
  body?: unknown
  signal?: AbortSignal
  headers?: Record<string, string>
}

export async function apiFetch<T>(cfg: ReqCfg): Promise<ApiResponse<T>> {
  const url = `${env.apiBaseUrl}${cfg.path}`
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(cfg.headers || {}),
  }

  console.log("[apiFetch] request", { url, method: cfg.method, body: cfg.body })

  try {
    const res = await fetch(url, {
      method: cfg.method,
      headers,
      body: cfg.body ? JSON.stringify(cfg.body) : undefined,
      signal: cfg.signal,
    })

    const text = await res.text()
    let json: any = null

    try {
      json = text ? JSON.parse(text) : null
    } catch (e) {
      console.warn("[apiFetch] json parse failed", { url, text })
    }

    console.log("[apiFetch] response", { url, status: res.status, ok: res.ok, json })

    if (!res.ok) {
      const message = json?.error?.message || json?.message || `HTTP ${res.status}`
      const code = json?.error?.code || "HTTP_ERROR"
      return { ok: false, error: { code, message, details: json } }
    }

    return { ok: true, data: (json ?? null) as T }
  } catch (e: any) {
    console.error("[apiFetch] network error", { url, error: e?.message || e })
    return { ok: false, error: { code: "NETWORK_ERROR", message: e?.message || "Network error", details: e } }
  }
}
