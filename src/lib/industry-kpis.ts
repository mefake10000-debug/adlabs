/** Resolve industry KPI card values from live EdgeSight fields — never invent sample data. */

import type { EdgeSightLive } from "./edgesight"
import type { LiveState } from "./data-freshness"
import {
  type IndustryId,
  type IndustryKpiDef,
  type IndustryMaturity,
  INDUSTRY_MODES,
} from "../data/industry-modes"

type CalibratedZoneRow = {
  id: string
  name: string
  type: string
}

export type ResolvedIndustryKpi = IndustryKpiDef & {
  value: string | number | null
  maturity: IndustryMaturity
  empty: boolean
}

type ZoneLike = {
  id?: string
  name?: string
  type?: string
  occupancy?: number | null
  avg_dwell_seconds?: number | null
}

function dwellZonesFromLive(
  live: EdgeSightLive | null | undefined,
  state: LiveState | null | undefined,
  calibrated: CalibratedZoneRow[],
): ZoneLike[] {
  const fromLive = (live?.zones ?? []).filter((z) => (z.type ?? "dwell") === "dwell")
  if (fromLive.length) return fromLive

  const fromState: ZoneLike[] = []
  for (const cam of state?.cameras ?? []) {
    for (const z of cam.dwell_zones ?? []) {
      fromState.push(z)
    }
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

function nfcStatus(live: EdgeSightLive | null | undefined): IndustryMaturity {
  const s = live?.nfc?.status
  if (s === "LIVE") return "LIVE"
  if (s === "NEEDS-HARDWARE") return "NEEDS-HARDWARE"
  return "NEEDS-HARDWARE"
}

export function resolveIndustryKpis(
  industry: IndustryId,
  live: EdgeSightLive | null | undefined,
  state: LiveState | null | undefined,
  calibrated: CalibratedZoneRow[],
  online: boolean,
): ResolvedIndustryKpi[] {
  const def = INDUSTRY_MODES[industry]
  const dwell = dwellZonesFromLive(live, state, calibrated)
  const ranked = rankZones(dwell)
  const occupied = dwell.filter((z) => (z.occupancy ?? 0) > 0)
  const products = live?.products_top ?? null
  const topProduct = products && products.length ? products[0] : null
  const taps = live?.nfc?.recent_taps ?? []
  const lastTap = taps[0]
  const industryBlock = live?.industry
  const poseOn = Boolean(live?.models?.pose)

  const resolve = (kpi: IndustryKpiDef): ResolvedIndustryKpi => {
    let value: string | number | null = null
    let maturity: IndustryMaturity = kpi.defaultMaturity

    if (!online) {
      return { ...kpi, value: null, maturity: "EMPTY", empty: true }
    }

    switch (industry) {
      case "fashion": {
        if (kpi.id === "nfc_session") {
          const n = live?.nfc?.tap_count_session
          if (n != null && n > 0) {
            value = n
            maturity = "LIVE"
          } else {
            value = null
            maturity = "NEEDS-HARDWARE"
          }
        } else if (kpi.id === "nfc_last_product") {
          value = lastTap?.product_id ?? null
          maturity = value ? "LIVE" : "NEEDS-HARDWARE"
        } else if (kpi.id === "nfc_last_zone") {
          value = lastTap?.zone ?? lastTap?.zone_id ?? null
          maturity = value ? "LIVE" : "NEEDS-HARDWARE"
        } else if (kpi.id === "nfc_last_time") {
          value = lastTap?.tapped_at ?? lastTap?.received_at ?? null
          maturity = value ? "LIVE" : "NEEDS-HARDWARE"
        } else if (kpi.id === "nfc_status") {
          maturity = nfcStatus(live)
          value = maturity === "LIVE" ? "Connected" : "Connect NFC reader"
        }
        break
      }
      case "restaurant": {
        if (kpi.id === "tables_occupied") {
          if (!dwell.length) {
            value = null
            maturity = "EMPTY"
          } else if (dwell.every((z) => z.occupancy == null)) {
            value = null
            maturity = "EMPTY"
          } else {
            value = occupied.length
            maturity = "LIVE"
          }
        } else if (kpi.id === "tables_calibrated") {
          const n =
            industryBlock?.restaurant?.tables_calibrated ??
            (dwell.length || calibrated.filter((z) => z.type === "dwell").length)
          if (!n) {
            value = null
            maturity = "EMPTY"
          } else {
            value = n
            maturity = dwell.length ? "LIVE" : "PARTIAL"
          }
        } else if (kpi.id === "staff_on_floor") {
          if (live?.staff_now != null) {
            value = live.staff_now
            maturity = "LIVE"
          } else {
            value = null
            maturity = "EMPTY"
          }
        } else if (kpi.id === "service_wait") {
          const w = live?.avg_queue_wait_seconds
          if (w != null && Number.isFinite(w)) {
            value = `${w}s`
            maturity = "PARTIAL"
          } else {
            value = null
            maturity = "EMPTY"
          }
        } else if (kpi.id === "food_served") {
          value = null
          maturity = "FUTURE"
        }
        break
      }
      case "manufacturing": {
        if (kpi.id === "line_activity") {
          if (!dwell.length || dwell.every((z) => z.occupancy == null)) {
            value = null
            maturity = "EMPTY"
          } else {
            value = occupied.length
            maturity = "LIVE"
          }
        } else if (kpi.id === "boxes_detected") {
          if (!products || !products.length) {
            value = null
            maturity = live?.models?.products ? "PARTIAL" : "EMPTY"
          } else {
            value = products.reduce((n, p) => n + (p.detections ?? p.viewers ?? 0), 0)
            maturity = "LIVE"
          }
        } else if (kpi.id === "top_class") {
          value = topProduct?.category ?? null
          maturity = value ? "LIVE" : "EMPTY"
        } else if (kpi.id === "box_movement") {
          if (topProduct?.avg_dwell_seconds != null) {
            value = `${topProduct.avg_dwell_seconds}s`
            maturity = "LIVE"
          } else {
            value = null
            maturity = "EMPTY"
          }
        } else if (kpi.id === "defects") {
          value = null
          maturity = "FUTURE"
        }
        break
      }
      case "jewelry": {
        if (kpi.id === "top_zone") {
          const top = ranked[0]
          if (!top || (top.occupancy == null && top.avg_dwell_seconds == null)) {
            value = dwell.length ? null : null
            maturity = dwell.length ? "EMPTY" : "EMPTY"
          } else {
            value = top.name || top.id || "—"
            maturity = "LIVE"
          }
        } else if (kpi.id === "top_dwell") {
          const top = ranked[0]
          if (top?.avg_dwell_seconds != null) {
            value = `${top.avg_dwell_seconds}s`
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
        } else if (kpi.id === "touch_proxy") {
          value = null
          maturity = poseOn ? "PARTIAL" : dwell.length ? "PARTIAL" : "FUTURE"
        } else if (kpi.id === "people_near") {
          if (live?.people_now != null) {
            value = live.people_now
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
      maturity === "NEEDS-HARDWARE" ||
      maturity === "EMPTY"

    // FUTURE/NEEDS-HARDWARE keep null display even if we set a hint string for status
    if (kpi.id === "nfc_status" && maturity === "NEEDS-HARDWARE") {
      return { ...kpi, value: "Connect NFC reader", maturity, empty: true }
    }
    if (maturity === "FUTURE") {
      return { ...kpi, value: null, maturity, empty: true }
    }

    return { ...kpi, value: empty && maturity !== "PARTIAL" ? value : value, maturity, empty }
  }

  return def.kpis.map(resolve)
}
