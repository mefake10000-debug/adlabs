/**
 * Honest data badges for EdgeSight-backed dashboard sections.
 *
 * LIVE    = data present AND non-null AND backing edge models have loaded:true
 * PARTIAL = present but heuristic / sampled / joined later
 * NO-DATA = key null → empty-state (never invent zero from nowhere)
 */

export type DataBadgeTone = "live" | "partial" | "no-data"

export type DataBadge = {
  tone: DataBadgeTone
  label: "LIVE" | "PARTIAL" | "NO-DATA"
  title: string
}

export type EdgeModelStatus = {
  id: string
  name?: string | null
  loaded: boolean
}

export type LiveStateCounts = {
  tripwire_in_cumulative: number | null
  tripwire_out_cumulative: number | null
  staff_visible: number | null
  staff_tagged: number | null
  people_now: number | null
}

export type LiveStateQueue = {
  id: string
  name: string
  queue_length: number | null
  avg_wait_seconds: number | null
  alert_active: boolean | null
  now?: { length?: number | null; min_wait_ms?: number | null; max_wait_ms?: number | null; staff_on_post?: number | null } | null
  kpi?: { avg_wait_ms?: number | null; p95_wait_ms?: number | null; p95_available?: boolean; completed?: number | null; served?: number | null; abandoned?: number | null; service_rate?: number | null; service_rate_basis?: string | null } | null
  recent_episodes?: { track_id: number; join_ts: string; leave_ts?: string | null; wait_ms?: number; outcome?: string; abandon?: boolean | null }[] | null
  abandon_status?: string | null
  abandon_note?: string | null
}

export type LiveStateZone = {
  id: string
  name: string
  type: string
  occupancy: number | null
  avg_dwell_seconds: number | null
}

export type LiveStateCamera = {
  camera_id: string
  camera_name?: string
  updated_epoch: number | null
  counts: LiveStateCounts
  dwell_zones: LiveStateZone[] | null
  queues: LiveStateQueue[] | null
  products_top: { category: string; viewers: number; avg_dwell_seconds: number }[] | null
  engagement: {
    avg_attention_score: number | null
    facing_ratio: number | null
    engaged_ratio: number | null
    group_count: number | null
  } | null
  models: EdgeModelStatus[] | null
  tripwires: { id: string; name: string; in_count: number; out_count: number }[] | null
  stop_rate?: number | null
  entrance_status?: string | null
  entrance_badge_copy?: string | null
  floor_traction?: { zone_id: string; name?: string; U?: number; traction_score?: number; occupancy?: number }[] | null
  staff_detail?: { id: string; name: string; staff_present?: number; expected_on_post?: number | null; state?: string }[] | null
  field_status?: Record<string, string> | null
}

export type LiveState = {
  updated_epoch: number | null
  age_seconds: number | null
  cameras: LiveStateCamera[]
  primary_camera_id: string | null
}

export type SectionId =
  | "camera_wall"
  | "today"
  | "entrance_tripwires"
  | "entrance_stop_rate"
  | "floor_zones"
  | "floor_paths"
  | "heatmap"
  | "queues"
  | "staffing"
  | "shelf"
  | "engagement"
  | "demographics"
  | "alerts"
  | "safety"
  | "legacy_ops"
  | "connectivity"

export const SECTION_CADENCE_MS: Record<SectionId, number | null> = {
  camera_wall: null, // continuous MJPEG
  today: 10_000,
  entrance_tripwires: 1_000,
  entrance_stop_rate: 2_000,
  floor_zones: 1_000,
  floor_paths: 2_000,
  heatmap: 10_000,
  queues: 1_000,
  staffing: 1_000,
  shelf: 1_000, // live products_top; analytics/products is 24h rollup
  engagement: 1_000,
  demographics: null, // windowed / on demand
  alerts: 2_000,
  safety: 2_000,
  legacy_ops: null,
  connectivity: null,
}

export const SECTION_SOURCE: Record<SectionId, string> = {
  camera_wall: "/api/v1/stream/{cam} MJPEG",
  today: "/api/v1/live",
  entrance_tripwires: "live/state.cameras[].counts.tripwire_in/out_cumulative",
  entrance_stop_rate: "live.entrance.stop_rate / glass ROI",
  floor_zones: "live/state.cameras[].dwell_zones[]",
  floor_paths: "live.floor.paths_active · zone_traction",
  heatmap: "/api/v1/heatmap/{cam}",
  queues: "live/state.cameras[].queues[]",
  staffing: "counts.staff_visible/tagged · models[]",
  shelf: "products_top · /api/v1/analytics/products",
  engagement: "engagement",
  demographics: "demographics",
  alerts: "live.alerts.active · catalog",
  safety: "live.safety.active",
  legacy_ops: ":3000 Streamlit proxy",
  connectivity: "state age from updated_epoch",
}

function badge(tone: DataBadgeTone, title: string): DataBadge {
  const label = tone === "live" ? "LIVE" : tone === "partial" ? "PARTIAL" : "NO-DATA"
  return { tone, label, title }
}

/** Treat null/undefined as missing; empty array is present. */
export function isPresent(value: unknown): boolean {
  return value !== null && value !== undefined
}

/** Display helper — never coerce null → 0. */
export function displayMetric(value: number | null | undefined, format?: (n: number) => string): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—"
  return format ? format(value) : String(value)
}

export function modelsLoaded(
  models: EdgeModelStatus[] | null | undefined,
  required: string[],
): boolean {
  if (!models?.length) return false
  return required.every((id) => models.some((m) => m.id === id && m.loaded === true))
}

/** Map EdgeSight snapshot `models` object → loaded[] (honest: truthy field ⇒ loaded). */
export function normalizeModels(
  raw: Record<string, unknown> | EdgeModelStatus[] | null | undefined,
): EdgeModelStatus[] | null {
  if (raw == null) return null
  if (Array.isArray(raw)) {
    return raw.map((m) => ({
      id: m.id,
      name: m.name ?? null,
      loaded: m.loaded === true,
    }))
  }
  const out: EdgeModelStatus[] = []
  if (typeof raw.person_detector === "string" && raw.person_detector) {
    out.push({ id: "person_detector", name: raw.person_detector, loaded: true })
  }
  if (typeof raw.tracker === "string" && raw.tracker) {
    out.push({ id: "tracker", name: raw.tracker, loaded: true })
  }
  if (raw.pose === true) out.push({ id: "pose", name: "pose", loaded: true })
  if (raw.pose === false) out.push({ id: "pose", name: "pose", loaded: false })
  if (raw.face_boxes === true) out.push({ id: "face_boxes", name: "face_boxes", loaded: true })
  if (raw.face_boxes === false) out.push({ id: "face_boxes", name: "face_boxes", loaded: false })
  if (raw.face_identity === true) out.push({ id: "face_identity", name: "face_identity", loaded: true })
  if (raw.face_identity === false) out.push({ id: "face_identity", name: "face_identity", loaded: false })
  return out.length ? out : null
}

type SnapshotCam = {
  camera_id?: string
  camera_name?: string
  timestamp?: string
  frame_time?: number
  people_now?: number | null
  staff_now?: number | null
  total_visitors?: number | null
  total_exits?: number | null
  tripwires?: { id: string; name: string; in_count: number; out_count: number }[] | null
  queues?: {
    id: string
    name: string
    queue_length?: number | null
    avg_wait_seconds?: number | null
    alert_active?: boolean | null
    now?: LiveStateQueue["now"]
    kpi?: LiveStateQueue["kpi"]
    recent_episodes?: LiveStateQueue["recent_episodes"]
    abandon_status?: string | null
    abandon_note?: string | null
  }[] | null
  stop_rate?: number | null
  entrance?: { status?: string; badge_copy?: string | null; stop_rate?: number | null } | null
  floor?: { zone_traction?: LiveStateCamera["floor_traction"]; status?: string; paths_active?: unknown[] } | null
  staff?: { zones?: LiveStateCamera["staff_detail"] } | null
  field_status?: Record<string, string> | null
  zones?: {
    id: string
    name: string
    type?: string
    occupancy?: number | null
    avg_dwell_seconds?: number | null
  }[] | null
  staff_zones?: { id: string; name: string; tagged_ids?: number | null }[] | null
  engagement?: Record<string, number | null> | null
  models?: Record<string, unknown> | null
  products_top?: { category: string; viewers: number; avg_dwell_seconds: number }[] | null
}

function parseTsEpoch(ts?: string, frameTime?: number): number | null {
  if (typeof frameTime === "number" && Number.isFinite(frameTime) && frameTime > 1e9) {
    // frame_time from edge may be monotonic — prefer wall timestamp when present
  }
  if (ts) {
    const ms = Date.parse(ts.replace(" ", "T") + "Z")
    if (!Number.isNaN(ms)) return Math.floor(ms / 1000)
    const local = Date.parse(ts.replace(" ", "T"))
    if (!Number.isNaN(local)) return Math.floor(local / 1000)
  }
  return null
}

export function snapshotToCameraState(snap: SnapshotCam): LiveStateCamera | null {
  const camera_id = snap.camera_id
  if (!camera_id) return null

  const tripwires = snap.tripwires ?? null
  let trip_in: number | null = null
  let trip_out: number | null = null
  if (tripwires) {
    trip_in = tripwires.reduce((n, t) => n + (t.in_count ?? 0), 0)
    trip_out = tripwires.reduce((n, t) => n + (t.out_count ?? 0), 0)
  } else if (snap.total_visitors != null || snap.total_exits != null) {
    trip_in = snap.total_visitors ?? null
    trip_out = snap.total_exits ?? null
  }

  const staff_tagged =
    snap.staff_zones == null
      ? null
      : snap.staff_zones.reduce((n, z) => n + (z.tagged_ids ?? 0), 0)

  const dwell_zones =
    snap.zones == null
      ? null
      : snap.zones
          .filter((z) => (z.type ?? "dwell") === "dwell")
          .map((z) => ({
            id: z.id,
            name: z.name,
            type: z.type ?? "dwell",
            occupancy: z.occupancy ?? null,
            avg_dwell_seconds: z.avg_dwell_seconds ?? null,
          }))

  const queues =
    snap.queues == null
      ? null
      : snap.queues.map((q) => ({
          id: q.id,
          name: q.name,
          queue_length: q.queue_length ?? null,
          avg_wait_seconds: q.avg_wait_seconds ?? null,
          alert_active: q.alert_active ?? null,
          now: q.now ?? null,
          kpi: q.kpi ?? null,
          recent_episodes: q.recent_episodes ?? null,
          abandon_status: q.abandon_status ?? null,
          abandon_note: q.abandon_note ?? null,
        }))

  const eng = snap.engagement
  const engagement =
    eng == null
      ? null
      : {
          avg_attention_score: eng.avg_attention_score ?? null,
          facing_ratio: eng.facing_ratio ?? null,
          engaged_ratio: eng.engaged_ratio ?? null,
          group_count: eng.group_count ?? null,
        }

  return {
    camera_id,
    camera_name: snap.camera_name,
    updated_epoch: parseTsEpoch(snap.timestamp, snap.frame_time),
    counts: {
      tripwire_in_cumulative: trip_in,
      tripwire_out_cumulative: trip_out,
      staff_visible: snap.staff_now ?? null,
      staff_tagged,
      people_now: snap.people_now ?? null,
    },
    dwell_zones,
    queues,
    products_top: snap.products_top ?? null,
    engagement,
    models: normalizeModels(snap.models),
    tripwires,
    stop_rate: snap.stop_rate ?? snap.entrance?.stop_rate ?? null,
    entrance_status: snap.entrance?.status ?? snap.field_status?.entrance_stop_rate ?? null,
    entrance_badge_copy: snap.entrance?.badge_copy ?? null,
    floor_traction: snap.floor?.zone_traction ?? null,
    staff_detail: snap.staff?.zones ?? null,
    field_status: snap.field_status ?? null,
  }
}

/**
 * Build live/state from per-camera snapshots.
 * Camera order must follow cameras.yaml (caller passes ordered ids).
 */
export function buildLiveState(
  orderedCameraIds: string[],
  snapshots: SnapshotCam[],
  nowEpoch = Math.floor(Date.now() / 1000),
): LiveState {
  const byId = new Map<string, SnapshotCam>()
  for (const s of snapshots) {
    if (s.camera_id) byId.set(s.camera_id, s)
  }
  const cameras: LiveStateCamera[] = []
  for (const id of orderedCameraIds) {
    const snap = byId.get(id)
    if (!snap) continue
    const row = snapshotToCameraState(snap)
    if (row) cameras.push(row)
  }
  // Append any unexpected cams after yaml order
  for (const s of snapshots) {
    if (s.camera_id && !orderedCameraIds.includes(s.camera_id)) {
      const row = snapshotToCameraState(s)
      if (row) cameras.push(row)
    }
  }

  const epochs = cameras.map((c) => c.updated_epoch).filter((e): e is number => e != null)
  const updated_epoch = epochs.length ? Math.max(...epochs) : null
  const age_seconds = updated_epoch != null ? Math.max(0, nowEpoch - updated_epoch) : null

  return {
    updated_epoch,
    age_seconds,
    cameras,
    primary_camera_id: cameras[0]?.camera_id ?? orderedCameraIds[0] ?? null,
  }
}

export type SectionBadgeInput = {
  online: boolean
  state: LiveState | null
  live: {
    people_now?: number | null
    net_occupancy?: number | null
    total_visitors?: number | null
    queue_length?: number | null
    source?: string | null
    models?: Record<string, unknown> | null
    engagement?: Record<string, number | null> | null
    stop_rate?: number | null
    entrance?: { status?: string; badge_copy?: string | null; stop_rate?: number | null } | null
    floor?: { status?: string; paths_active?: unknown[]; zone_traction?: unknown[] } | null
    alerts?: { active?: unknown[] } | null
    safety?: { active?: unknown[] } | null
    field_status?: Record<string, string> | null
  } | null
  heatmapOk: boolean | null
  productsAnalytics: { categories: unknown[] } | null | undefined
  demographics: {
    available?: boolean
    demographics?: { publishable?: boolean; sample_size?: number } | null
  } | null | undefined
  opsReachable: boolean
}

function primary(state: LiveState | null): LiveStateCamera | null {
  if (!state?.cameras.length) return null
  return state.cameras.find((c) => c.camera_id === state.primary_camera_id) ?? state.cameras[0]
}

function anyCamModels(state: LiveState | null, required: string[]): boolean {
  if (!state?.cameras.length) return false
  return state.cameras.some((c) => modelsLoaded(c.models, required))
}

export function evaluateSectionBadge(section: SectionId, input: SectionBadgeInput): DataBadge {
  const src = SECTION_SOURCE[section]
  const cadence = SECTION_CADENCE_MS[section]
  const cadenceNote = cadence == null ? "continuous / on demand" : `poll ${cadence / 1000}s`

  if (section === "legacy_ops") {
    return input.opsReachable
      ? badge("partial", `Streamlit ops embed · portal :3000 · ${src}`)
      : badge("no-data", `Ops UI unreachable · ${src}`)
  }

  if (section === "connectivity") {
    const age = input.state?.age_seconds
    if (!input.online || age == null) {
      return badge("no-data", `No updated_epoch · ${src}`)
    }
    if (age > 15) {
      return badge("partial", `State age ${age}s (stale) · ${src}`)
    }
    return badge("live", `State age ${age}s · ${src}`)
  }

  if (!input.online) {
    return badge("no-data", `EdgeSight offline · ${src} · ${cadenceNote}`)
  }

  const cam = primary(input.state)
  const personReady = anyCamModels(input.state, ["person_detector", "tracker"])
    || modelsLoaded(normalizeModels(input.live?.models), ["person_detector", "tracker"])

  switch (section) {
    case "camera_wall": {
      if (!input.state?.primary_camera_id && !(input.state?.cameras.length)) {
        return badge("no-data", `No cameras · ${src}`)
      }
      return personReady
        ? badge("live", `MJPEG annotated · ${src} · ${cadenceNote}`)
        : badge("partial", `Stream up; person models not confirmed loaded · ${src}`)
    }
    case "today": {
      const people = input.live?.people_now ?? input.live?.net_occupancy
      if (!isPresent(people) && !isPresent(input.live?.total_visitors)) {
        return badge("no-data", `live KPIs null · ${src}`)
      }
      if (!personReady) {
        return badge("partial", `KPIs present; models not loaded:true · ${src}`)
      }
      if (input.live?.source === "telemetry_rollups") {
        return badge("partial", `Rollup-joined (not frame snapshot) · ${src} · ${cadenceNote}`)
      }
      return badge("live", `YOLO live snapshot · ${src} · ${cadenceNote}`)
    }
    case "entrance_tripwires": {
      const counts = cam?.counts
      if (!counts || (!isPresent(counts.tripwire_in_cumulative) && !isPresent(counts.tripwire_out_cumulative))) {
        return badge("no-data", `tripwire counts null · ${src}`)
      }
      return personReady
        ? badge("live", `Cumulative tripwire IN/OUT · ${src} · ${cadenceNote}`)
        : badge("partial", `Counts present; models not loaded · ${src}`)
    }
    case "entrance_stop_rate": {
      const st = input.live?.entrance?.status ?? cam?.entrance_status ?? input.live?.field_status?.entrance_stop_rate
      if (st === "FUTURE" || (input.live?.stop_rate == null && cam?.stop_rate == null && st !== "LIVE")) {
        return badge(
          "partial",
          input.live?.entrance?.badge_copy
            || cam?.entrance_badge_copy
            || "Stop-rate needs glass ROI calibration — nothing invented.",
        )
      }
      if (input.live?.stop_rate != null || cam?.stop_rate != null) {
        return badge("live", `stop_rate measured · ${src} · ${cadenceNote}`)
      }
      return badge("no-data", `stop_rate null · ${src}`)
    }
    case "floor_zones": {
      if (cam?.dwell_zones == null) {
        return badge("no-data", `dwell_zones null · ${src}`)
      }
      // Empty array = calibrated dwell list absent in snapshot — still a real empty state
      return personReady
        ? badge("live", `${cam.dwell_zones.length} dwell zone(s) · ${src} · ${cadenceNote}`)
        : badge("partial", `Zones present; models not loaded · ${src}`)
    }
    case "floor_paths": {
      const traction = cam?.floor_traction
      const floor = input.live?.floor
      if (traction == null && floor == null) {
        return badge("no-data", `floor block null · ${src}`)
      }
      return personReady
        ? badge("live", `paths/traction from tracks · ${src} · ${cadenceNote}`)
        : badge("partial", `Floor present; models not loaded · ${src}`)
    }
    case "heatmap": {
      if (input.heatmapOk == null) {
        return badge("partial", `Heatmap not checked yet · ${src}`)
      }
      return input.heatmapOk
        ? badge("live", `JPEG heatmap · ${src} · ${cadenceNote}`)
        : badge("no-data", `Heatmap missing · ${src}`)
    }
    case "queues": {
      if (cam?.queues == null) {
        return badge("no-data", `queues null · ${src}`)
      }
      const abandonPartial = cam.queues.some((q) => q.abandon_status === "PARTIAL")
      if (personReady && abandonPartial) {
        return badge("partial", `${cam.queues.length} queue(s) · episodes LIVE · abandon PARTIAL · ${cadenceNote}`)
      }
      return personReady
        ? badge("live", `${cam.queues.length} queue zone(s) · ${src} · ${cadenceNote}`)
        : badge("partial", `Queues present; models not loaded · ${src}`)
    }
    case "alerts": {
      const active = input.live?.alerts?.active
      if (active == null) return badge("no-data", `alerts null · ${src}`)
      return badge("live", `${active.length} active LIVE alert(s) · catalog gated · ${cadenceNote}`)
    }
    case "safety": {
      const active = input.live?.safety?.active
      if (active == null) return badge("no-data", `safety null · ${src}`)
      return badge("live", active.length ? `${active.length} safety candidate(s) · human review` : `Safety idle · ${cadenceNote}`)
    }
    case "staffing": {
      const vis = cam?.counts.staff_visible
      const tagged = cam?.counts.staff_tagged
      if (!isPresent(vis) && !isPresent(tagged)) {
        return badge("no-data", `staff_visible/tagged null · ${src}`)
      }
      return personReady
        ? badge("live", `staff_visible ${displayMetric(vis)} · tagged ${displayMetric(tagged)} · ${cadenceNote}`)
        : badge("partial", `Staff counts present; models not loaded · ${src}`)
    }
    case "shelf": {
      const top = cam?.products_top
      const analytics = input.productsAnalytics?.categories
      if (top == null && (analytics == null || analytics.length === 0)) {
        return badge("no-data", `products_top + analytics null · ${src}`)
      }
      if (top != null && top.length > 0 && personReady) {
        return badge("live", `products_top · ${src} · ${cadenceNote}`)
      }
      // 24h analytics rollup / category interest — sampled later
      return badge("partial", `Category rollup (24h / YOLO-World) — not SKU POS · ${src}`)
    }
    case "engagement": {
      const eng = cam?.engagement ?? input.live?.engagement ?? null
      if (eng == null) {
        return badge("no-data", `engagement null · ${src}`)
      }
      const poseOk = anyCamModels(input.state, ["pose"]) || modelsLoaded(normalizeModels(input.live?.models), ["pose"])
      if (!poseOk) {
        return badge("partial", `Engagement present; pose model not loaded · ${src}`)
      }
      return badge("live", `Attention / facing proxies · ${src} · ${cadenceNote}`)
    }
    case "demographics": {
      const demo = input.demographics
      if (!demo || demo.available === false || demo.demographics == null) {
        return badge("no-data", `demographics null / unavailable · ${src}`)
      }
      const faceOk = anyCamModels(input.state, ["face_boxes"])
      if (demo.demographics.publishable === false) {
        return badge("partial", `k-anon suppressed · ${src}`)
      }
      // Aggregates are always sampled / windowed
      return faceOk
        ? badge("partial", `k-anon age/gender (sampled window) · ${src}`)
        : badge("partial", `Demographics without face_boxes loaded · ${src}`)
    }
    default:
      return badge("no-data", src)
  }
}

export function evaluateAllSectionBadges(input: SectionBadgeInput): Record<SectionId, DataBadge> {
  const sections: SectionId[] = [
    "camera_wall",
    "today",
    "entrance_tripwires",
    "entrance_stop_rate",
    "floor_zones",
    "floor_paths",
    "heatmap",
    "queues",
    "staffing",
    "shelf",
    "engagement",
    "demographics",
    "alerts",
    "safety",
    "legacy_ops",
    "connectivity",
  ]
  return Object.fromEntries(sections.map((s) => [s, evaluateSectionBadge(s, input)])) as Record<
    SectionId,
    DataBadge
  >
}
