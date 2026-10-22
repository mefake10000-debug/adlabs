import { NextResponse } from "next/server"
import type { EdgeSightLive } from "../../../../src/lib/edgesight"
import { EDGE_SIGHT_DEFAULT_URL } from "../../../../src/lib/edgesight"
import { buildLiveState } from "../../../../src/lib/data-freshness"

export const dynamic = "force-dynamic"
export const revalidate = 0

const TIMEOUT_MS = 2000

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
 * High-frequency proxy (2s): /api/v1/live + per-cam snapshots → honest live/state.
 * Full aggregates (demographics, products 24h, history) stay on /api/edgesight/status (10s).
 */
export async function GET() {
  const baseUrl = (process.env.EDGE_SIGHT_URL || EDGE_SIGHT_DEFAULT_URL).replace(/\/$/, "")
  const fetchedAt = new Date().toISOString()

  const live = await getJson<EdgeSightLive>(baseUrl, "/api/v1/live")
  if (!live) {
    return NextResponse.json(
      { online: false, baseUrl, fetchedAt, error: "live unreachable" },
      { headers: { "Cache-Control": "no-store" } },
    )
  }

  // cameras.yaml order: prefer live.cameras, else /api/v1/cameras, else per_camera ids
  let ordered =
    (live.cameras?.length ? live.cameras : null) ??
    (await getJson<{ cameras: string[] }>(baseUrl, "/api/v1/cameras"))?.cameras ??
    live.per_camera?.map((c) => c.camera_id).filter(Boolean) ??
    []

  if (!ordered.length) {
    const cfg = await getJson<{ cameras: { id: string }[] }>(baseUrl, "/api/v1/config/cameras")
    ordered = cfg?.cameras?.map((c) => c.id) ?? []
  }

  const snaps = await Promise.all(
    ordered.map((id) =>
      getJson<Record<string, unknown>>(
        baseUrl,
        `/api/v1/live/snapshot?camera_id=${encodeURIComponent(id)}`,
      ),
    ),
  )

  const state = buildLiveState(
    ordered,
    snaps.filter(Boolean).map((s) => s as Parameters<typeof buildLiveState>[1][number]),
  )

  return NextResponse.json(
    { online: true, baseUrl, fetchedAt, live, state },
    { headers: { "Cache-Control": "no-store" } },
  )
}
