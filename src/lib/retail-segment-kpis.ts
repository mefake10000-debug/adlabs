/** Resolve floor-role KPI values from live EdgeSight fields — never invent sample data. */

import type { EdgeSightLive } from "./edgesight"
import type { LiveState } from "./data-freshness"
import {
  RETAIL_SEGMENTS,
  type RetailSegmentId,
  type SegmentKpiDef,
  type SegmentMaturity,
} from "../data/retail-segments"
import { liveProducts } from "./live-kpis"

type CalibratedZoneRow = { id: string; name: string; type: string }

export type ResolvedSegmentKpi = SegmentKpiDef & {
  value: string | number | null
  maturity: SegmentMaturity
  empty: boolean
}

type ZoneLike = {
  id?: string
  name?: string
  type?: string
  occupancy?: number | null
  avg_dwell_seconds?: number | null
}

type EntranceBlock = {
  stop_rate?: number | null
  conversion_glass_to_entry?: number | null
  glass_entrants?: number | null
  glass?: { stop_rate?: number | null; glass_entrants?: number | null } | null
}

type QueueRow = {
  kpi?: { p95_wait_ms?: number | null; p95_available?: boolean | null }
  queue_length?: number
  avg_wait_seconds?: number
}

function dwellZones(
  live: EdgeSightLive | null | undefined,
  state: LiveState | null | undefined,
  calibrated: CalibratedZoneRow[],
): ZoneLike[] {
  const fromLive = (live?.zones ?? []).filter((z) => (z.type ?? "dwell") === "dwell")
  if (fromLive.length) return fromLive
  const fromState: ZoneLike[] = []
  for (const cam of state?.cameras ?? []) {
    for (const z of cam.dwell_zones ?? []) fromState.push(z)
  }
  if (fromState.length) return fromState
  return calibrated
    .filter((z) => z.type === "dwell")
    .map((z) => ({ id: z.id, name: z.name, type: "dwell", occupancy: null, avg_dwell_seconds: null }))
}

function rankZones(zones: ZoneLike[]): ZoneLike[] {
  return [...zones].sort((a, b) => {
    const score = (z: ZoneLike) =>
      (Number(z.occupancy) || 0) * 1000 + (Number(z.avg_dwell_seconds) || 0)
    return score(b) - score(a)
  })
}

function entranceOf(live: EdgeSightLive | null | undefined): EntranceBlock | null {
  const anyLive = live as (EdgeSightLive & { entrance?: EntranceBlock | null }) | null | undefined
  return anyLive?.entrance ?? null
}

function fmtPct(n: number | null | undefined): string | null {
  if (n == null || !Number.isFinite(n)) return null
  return `${(Number(n) * 100).toFixed(1)}%`
}

function fmtSec(n: number | null | undefined): string | null {
  if (n == null || !Number.isFinite(n)) return null
  return `${n}s`
}

function fmtMsAsSec(ms: number | null | undefined): string | null {
  if (ms == null || !Number.isFinite(ms)) return null
  return `${Math.round(Number(ms) / 1000)}s`
}

export function resolveSegmentKpis(
  segment: RetailSegmentId,
  live: EdgeSightLive | null | undefined,
  state: LiveState | null | undefined,
  calibrated: CalibratedZoneRow[],
  online: boolean,
): ResolvedSegmentKpi[] {
  const def = RETAIL_SEGMENTS[segment]
  const dwell = dwellZones(live, state, calibrated)
  const ranked = rankZones(dwell)
  const occupied = dwell.filter((z) => (z.occupancy ?? 0) > 0)
  const products = liveProducts(live)
  const topProduct = products && products.length ? products[0] : null
  const journey = live?.journey
  const entrance = entranceOf(live)
  const queues = (live?.queues ?? []) as QueueRow[]

  const resolve = (kpi: SegmentKpiDef): ResolvedSegmentKpi => {
    let value: string | number | null = null
    let maturity: SegmentMaturity = kpi.defaultMaturity

    if (!online) {
      return { ...kpi, value: null, maturity: "EMPTY", empty: true }
    }

    switch (segment) {
      case "entrance": {
        if (kpi.id === "entries") {
          if (live?.total_visitors != null) {
            value = live.total_visitors
            maturity = "LIVE"
          } else {
            value = null
            maturity = "EMPTY"
          }
        } else if (kpi.id === "stop_rate") {
          const rate = entrance?.stop_rate ?? entrance?.glass?.stop_rate ?? live?.stop_rate
          if (rate != null) {
            value = fmtPct(rate)
            maturity = "LIVE"
          } else {
            value = null
            maturity = "FUTURE"
          }
        } else if (kpi.id === "glass_to_entry") {
          if (entrance && entrance.conversion_glass_to_entry != null) {
            value = fmtPct(entrance.conversion_glass_to_entry)
            maturity = "LIVE"
          } else {
            value = null
            maturity = "FUTURE"
          }
        }
        break
      }
      case "path": {
        const s = journey?.summary
        if (kpi.id === "stages_live") {
          if (s) {
            value = s.live
            maturity = "LIVE"
          } else {
            value = null
            maturity = "EMPTY"
          }
        } else if (kpi.id === "dead_aisles") {
          if (s) {
            value = s.dead_zone
            maturity = "LIVE"
          } else {
            value = null
            maturity = "EMPTY"
          }
        } else if (kpi.id === "missing_stages") {
          if (s) {
            value = s.missing
            maturity = "LIVE"
          } else {
            value = null
            maturity = "EMPTY"
          }
        }
        break
      }
      case "dwell": {
        if (kpi.id === "top_zone") {
          const top = ranked[0]
          if (top && (top.occupancy != null || top.avg_dwell_seconds != null)) {
            value = top.name || top.id || "—"
            maturity = "LIVE"
          } else {
            value = null
            maturity = dwell.length ? "EMPTY" : "EMPTY"
          }
        } else if (kpi.id === "top_dwell") {
          const top = ranked[0]
          if (top?.avg_dwell_seconds != null) {
            value = fmtSec(top.avg_dwell_seconds)
            maturity = "LIVE"
          } else {
            value = null
            maturity = "EMPTY"
          }
        } else if (kpi.id === "active_zones") {
          if (!dwell.length || dwell.every((z) => z.occupancy == null)) {
            value = null
            maturity = "EMPTY"
          } else {
            value = occupied.length
            maturity = "LIVE"
          }
        }
        break
      }
      case "queue": {
        if (kpi.id === "length") {
          if (live?.queue_length != null) {
            value = live.queue_length
            maturity = "LIVE"
          } else {
            value = null
            maturity = "EMPTY"
          }
        } else if (kpi.id === "avg_wait") {
          const w = live?.avg_queue_wait_seconds
          if (w != null && Number.isFinite(w)) {
            value = fmtSec(w)
            maturity = "LIVE"
          } else {
            value = null
            maturity = "EMPTY"
          }
        } else if (kpi.id === "p95") {
          const withP95 = queues.find((q) => q.kpi?.p95_wait_ms != null)
          if (withP95?.kpi?.p95_wait_ms != null) {
            value = fmtMsAsSec(withP95.kpi.p95_wait_ms)
            maturity = "LIVE"
          } else {
            value = null
            // Empty until sample gate — not a fake percentile
            maturity = "EMPTY"
          }
        }
        break
      }
      case "staff": {
        if (kpi.id === "staff_now") {
          if (live?.staff_now != null) {
            value = live.staff_now
            maturity = "LIVE"
          } else {
            value = null
            maturity = "EMPTY"
          }
        } else if (kpi.id === "staff_zones") {
          const n = live?.staff_zones?.length
          if (n != null && n > 0) {
            value = n
            maturity = "LIVE"
          } else {
            value = null
            maturity = "EMPTY"
          }
        } else if (kpi.id === "response") {
          const staffLive = live as EdgeSightLive & {
            staff?: { response_time_to_queue?: number | null; status?: string | null }
          }
          const rt = staffLive?.staff?.response_time_to_queue
          if (rt != null && Number.isFinite(rt)) {
            value = fmtSec(rt)
            maturity = "LIVE"
          } else {
            value = null
            maturity =
              staffLive?.staff?.status === "PARTIAL" || staffLive?.staff?.status === "EMPTY"
                ? (staffLive.staff.status as SegmentMaturity)
                : "EMPTY"
          }
        }
        break
      }
      case "shelf": {
        if (kpi.id === "top_category") {
          value = topProduct?.category ?? null
          maturity = value ? "LIVE" : live?.models?.products ? "PARTIAL" : "EMPTY"
        } else if (kpi.id === "viewers") {
          if (topProduct) {
            value = topProduct.detections ?? topProduct.viewers ?? null
            maturity = value != null ? "LIVE" : "PARTIAL"
          } else {
            value = null
            maturity = live?.models?.products ? "PARTIAL" : "EMPTY"
          }
        } else if (kpi.id === "cat_dwell") {
          if (topProduct?.avg_dwell_seconds != null) {
            value = fmtSec(topProduct.avg_dwell_seconds)
            maturity = "LIVE"
          } else {
            value = null
            maturity = "EMPTY"
          }
        }
        break
      }
    }

    const empty =
      value == null ||
      value === "" ||
      value === "—" ||
      maturity === "FUTURE" ||
      maturity === "EMPTY"

    if (maturity === "FUTURE") {
      return { ...kpi, value: null, maturity, empty: true }
    }

    return { ...kpi, value, maturity, empty }
  }

  return def.kpis.map(resolve)
}

/** One-line dead-aisle brief for Path segment — labels only, no invented visits. */
export function pathDeadAisleBrief(live: EdgeSightLive | null | undefined): string | null {
  const stages = live?.journey?.stages ?? []
  const dead = stages
    .filter((s) => s.dead_zone || s.status === "dead_zone")
    .map((s) => s.label)
    .slice(0, 3)
  if (!dead.length) return null
  return `Cold path: ${dead.join(", ")}.`
}
