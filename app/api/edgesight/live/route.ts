import { NextResponse } from "next/server"
import type { EdgeSightLive } from "../../../../src/lib/edgesight"
import { EDGE_SIGHT_DEFAULT_URL } from "../../../../src/lib/edgesight"

export const dynamic = "force-dynamic"
export const revalidate = 0

const TIMEOUT_MS = 1500

/**
 * Thin high-frequency proxy for dashboard KPIs that should tick with YOLO detections.
 * Full aggregates stay on /api/edgesight/status (5s).
 */
export async function GET() {
  const baseUrl = (process.env.EDGE_SIGHT_URL || EDGE_SIGHT_DEFAULT_URL).replace(/\/$/, "")
  const fetchedAt = new Date().toISOString()
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(`${baseUrl}/api/v1/live`, {
      signal: ctrl.signal,
      cache: "no-store",
      headers: { Accept: "application/json" },
    })
    if (!res.ok) {
      return NextResponse.json(
        { online: false, baseUrl, fetchedAt, error: `live ${res.status}` },
        { headers: { "Cache-Control": "no-store" } },
      )
    }
    const live = (await res.json()) as EdgeSightLive
    return NextResponse.json(
      { online: true, baseUrl, fetchedAt, live },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (err) {
    return NextResponse.json(
      {
        online: false,
        baseUrl,
        fetchedAt,
        error: err instanceof Error ? err.message : "live fetch failed",
      },
      { headers: { "Cache-Control": "no-store" } },
    )
  } finally {
    clearTimeout(t)
  }
}
