/**
 * Live hero numbers come from the camera frame only.
 * Present = active track ids (people boxes). In/Out = session tripwire crossings.
 * Day rollups and enrichment-off zeros are not KPIs.
 */

import type { EdgeSightLive } from "./edgesight"

export type LiveTripwire = {
  id?: string
  name?: string
  in_count?: number | null
  out_count?: number | null
  camera_id?: string
}

export type LiveCv = EdgeSightLive & {
  track_ids?: Array<number | string> | null
  active_tracks?: number | null
  tripwires?: LiveTripwire[] | null
  session_in?: number | null
  session_out?: number | null
  present_binding?: string | null
  inout_binding?: string | null
  products_top_withheld?: string | null
}

function isSnapshot(live: LiveCv | null | undefined): live is LiveCv {
  return Boolean(live && live.source === "live_snapshot")
}

/** People boxes on this frame. Null when the payload is a day rollup or missing. */
export function presentFromTracks(live: LiveCv | null | undefined): number | null {
  if (!isSnapshot(live)) return null
  if (Array.isArray(live.track_ids)) return live.track_ids.length
  if (typeof live.active_tracks === "number" && Number.isFinite(live.active_tracks)) {
    return live.active_tracks
  }
  if (typeof live.people_now === "number" && Number.isFinite(live.people_now)) return live.people_now
  return null
}

/** Entrance crossings this session. Refuses telemetry_rollups day SUM. */
export function sessionCrossing(
  live: LiveCv | null | undefined,
  cam?: { inn?: number | null; out?: number | null } | null,
): { inn: number | null; out: number | null } {
  if (!isSnapshot(live)) return { inn: null, out: null }
  const tw = live.tripwires
  if (Array.isArray(tw) && tw.length) {
    return {
      inn: tw.reduce((n, t) => n + (Number(t.in_count) || 0), 0),
      out: tw.reduce((n, t) => n + (Number(t.out_count) || 0), 0),
    }
  }
  if (cam && (cam.inn != null || cam.out != null)) {
    return { inn: cam.inn ?? null, out: cam.out ?? null }
  }
  if (live.inout_binding === "session_tripwire" || live.occupancy_mode === "active_tracks") {
    const inn = live.session_in ?? live.total_visitors
    const out = live.session_out ?? live.total_exits
    return {
      inn: typeof inn === "number" ? inn : null,
      out: typeof out === "number" ? out : null,
    }
  }
  return { inn: null, out: null }
}

export function coachLine(
  present: number | null,
  inn: number | null,
  out: number | null,
  needsEntrance: boolean,
): string {
  if (present != null && present > 0 && (needsEntrance || ((inn ?? 0) === 0 && (out ?? 0) === 0))) {
    return `Present is ${present} — the same people boxes on the video. In and Out stay 0 until someone crosses the entrance line.`
  }
  if (present != null && present > 0) {
    return `Present is ${present}, matching the people boxes on this frame. In and Out are entrance crossings this session.`
  }
  if (present === 0) {
    return "No people boxes on this frame. Present stays 0 until the camera sees someone."
  }
  return "Present appears when the camera reports active tracks. No stand-in numbers."
}

/** Hide 0.00 attention ratios when enrichment is off — those zeros are not a measurement. */
export function engagementRatio(live: LiveCv | null | undefined): number | null {
  if (!live || live.models?.enrichment === false) return null
  const ratio = live.engagement?.engaged_ratio
  if (ratio == null || !Number.isFinite(Number(ratio))) return null
  return Number(ratio)
}

function productCountIsLifetime(viewers: number, detections: number, people: number): boolean {
  const cap = Math.max(people, 1) * 50
  return viewers > Math.max(cap, 200) || detections > Math.max(cap * 4, 800)
}

/** Drop all-time product sums so the shelf tile cannot show 10^4–10^5 fake viewers. */
export function liveProducts(live: LiveCv | null | undefined): NonNullable<EdgeSightLive["products_top"]> | null {
  if (!live || live.products_top_withheld) return null
  const rows = live.products_top
  if (!rows?.length) return null
  const people = presentFromTracks(live) ?? (typeof live.people_now === "number" ? live.people_now : 0)
  const poisoned = rows.some((p) =>
    productCountIsLifetime(Number(p.viewers) || 0, Number(p.detections) || 0, people),
  )
  return poisoned ? null : rows
}
