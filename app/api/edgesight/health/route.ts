import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

const BASE = (process.env.EDGE_SIGHT_URL || "http://localhost:8000").replace(/\/$/, "")

/** Server-side health probe so the dashboard does not depend on browser CORS to :8000. */
export async function GET() {
  const fetchedAt = new Date().toISOString()
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 2500)
  try {
    const res = await fetch(`${BASE}/health`, {
      signal: ctrl.signal,
      cache: "no-store",
      headers: { Accept: "application/json" },
    })
    if (!res.ok) {
      return NextResponse.json(
        { online: false, baseUrl: BASE, fetchedAt, error: `HTTP ${res.status}` },
        { headers: { "Cache-Control": "no-store" } },
      )
    }
    const data = (await res.json()) as { status?: string; service?: string }
    return NextResponse.json(
      {
        online: data.status === "ok",
        baseUrl: BASE,
        fetchedAt,
        status: data.status,
        service: data.service,
      },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (e) {
    return NextResponse.json(
      {
        online: false,
        baseUrl: BASE,
        fetchedAt,
        error: e instanceof Error ? e.message : "unreachable",
      },
      { headers: { "Cache-Control": "no-store" } },
    )
  } finally {
    clearTimeout(t)
  }
}
