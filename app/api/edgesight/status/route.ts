import { NextResponse } from "next/server"
import type {
  EdgeSightCameraConfig,
  EdgeSightEvent,
  EdgeSightHistoryRow,
  EdgeSightStatus,
} from "../../../../src/lib/edgesight"
import { EDGE_SIGHT_DEFAULT_URL } from "../../../../src/lib/edgesight"

export const dynamic = "force-dynamic"
export const revalidate = 0

const TIMEOUT_MS = 2800

async function getJson<T>(base: string, path: string): Promise<T | null> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(`${base}${path}`, {
      signal: ctrl.signal,
      cache: "no-store",
      headers: { Accept: "application/json" },
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

/**
 * Single live snapshot for the whole dashboard.
 * Every screen should poll this (via EdgeSightProvider) — not invent separate fetches.
 */
export async function GET() {
  const baseUrl = (process.env.EDGE_SIGHT_URL || EDGE_SIGHT_DEFAULT_URL).replace(/\/$/, "")
  const fetchedAt = new Date().toISOString()

  const health = await getJson<{ status: string; service?: string }>(baseUrl, "/health")
  if (!health || health.status !== "ok") {
    const body: EdgeSightStatus = {
      online: false,
      baseUrl,
      fetchedAt,
      error: health ? `Unexpected health: ${JSON.stringify(health)}` : "EdgeSight unreachable (is Docker up on :8000?)",
    }
    return NextResponse.json(body, {
      headers: { "Cache-Control": "no-store" },
    })
  }

  const [device, live, summary, cameras, configCams, demographics, engagement, products, events, history] =
    await Promise.all([
      getJson<EdgeSightStatus["device"]>(baseUrl, "/api/v1/device/health"),
      getJson<EdgeSightStatus["live"]>(baseUrl, "/api/v1/live"),
      getJson<EdgeSightStatus["summary"]>(baseUrl, "/api/v1/analytics/summary"),
      getJson<{ cameras: string[] }>(baseUrl, "/api/v1/cameras"),
      getJson<{ cameras: EdgeSightCameraConfig[] }>(baseUrl, "/api/v1/config/cameras"),
      getJson<EdgeSightStatus["demographics"]>(baseUrl, "/api/v1/analytics/demographics"),
      getJson<EdgeSightStatus["engagement"]>(baseUrl, "/api/v1/analytics/engagement"),
      getJson<{ categories: NonNullable<EdgeSightStatus["products"]>["categories"] }>(
        baseUrl,
        "/api/v1/analytics/products",
      ),
      getJson<{ events: EdgeSightEvent[] }>(baseUrl, "/api/v1/events?limit=24"),
      getJson<EdgeSightHistoryRow[]>(baseUrl, "/api/v1/history?limit=36"),
    ])

  const body: EdgeSightStatus = {
    online: true,
    baseUrl,
    fetchedAt,
    health,
    device: device ?? undefined,
    live: live ?? undefined,
    summary: summary ?? undefined,
    cameras: cameras?.cameras ?? [],
    cameraConfigs: configCams?.cameras ?? [],
    demographics: demographics ?? undefined,
    engagement: engagement ?? undefined,
    products: products ? { categories: (products.categories ?? []).slice(0, 8) } : undefined,
    events: events?.events ?? [],
    history: Array.isArray(history) ? history : [],
  }

  return NextResponse.json(body, {
    headers: { "Cache-Control": "no-store" },
  })
}
