/** EdgeSight (ADLabs-dev) client types + honest formatters for the marketing dashboard. */

export type EdgeSightLive = {
  store_id: string
  camera_id: string | null
  total_visitors: number
  total_exits: number
  net_occupancy: number
  avg_dwell_seconds: number
  queue_length: number
  avg_queue_wait_seconds: number
  queue_alert_active: boolean
  last_updated: string
  /** Frame-synced active customer tracks (matches YOLO MJPEG HUD). Null ⇒ NO-DATA, never coerce to 0. */
  people_now?: number | null
  staff_now?: number | null
  infer_fps?: number
  decode_fps?: number
  /** Annotated JPEG write rate (MJPEG can track this; boxes update at infer_fps). */
  display_fps?: number
  /** Edge performance preset: fast (demo) | quality (enrichment). */
  perf_mode?: string
  source?: "live_snapshot" | "telemetry_rollups" | string
  occupancy_mode?: string
  occupancy_note?: string
  per_camera?: {
    camera_id: string
    occupancy: number
    queue_length: number
    avg_dwell_seconds?: number
    in_count?: number
    out_count?: number
    last_rollup_at?: string
    infer_fps?: number
    source?: string
  }[]
  models?: {
    person_detector?: string
    imgsz?: number | null
    tracker?: string
    perf_mode?: string
    infer_every_n?: number
    enrichment?: boolean
    pose?: boolean
    face_boxes?: boolean
    face_identity?: boolean
    products?: boolean
    note?: string
  } | null
  engagement?: {
    avg_attention_score?: number | null
    facing_ratio?: number | null
    engaged_ratio?: number | null
    group_count?: number | null
  } | null
  /** cameras.yaml order when present on store snapshot */
  cameras?: string[]
  /** Open-vocab / detector category interest when products model is on. */
  products_top?: {
    category: string
    viewers?: number
    detections?: number
    avg_dwell_seconds?: number
  }[] | null
  zones?: {
    id: string
    name: string
    type?: string
    occupancy?: number | null
    avg_dwell_seconds?: number | null
    visits?: number | null
    journey_stage?: string
    stage_tag?: string
  }[] | null
  staff_zones?: { id: string; name: string; type?: string; tagged_ids?: number }[] | null
  stop_rate?: number | null
  entrance?: {
    glass?: { stop_rate?: number | null; glass_entrants?: number; settling?: boolean; status?: string } | null
    stop_rate?: number | null
    status?: string
    badge_copy?: string | null
    settling?: boolean
  } | null
  floor?: {
    zone_traction?: { zone_id: string; name?: string; U?: number; traction_score?: number; occupancy?: number }[]
    paths_active?: unknown[]
    top_routes?: { route_key: string; count: number }[]
    status?: string
    badge_copy?: string | null
  } | null
  staff?: {
    zones?: {
      id: string
      name: string
      staff_present?: number
      expected_on_post?: number | null
      state?: string
      tagged_ids?: number
    }[]
    status?: string
  } | null
  safety?: { active?: { alert_id?: string; title?: string; recommended_action?: string }[]; note?: string } | null
  alerts?: {
    active?: {
      id: string
      title?: string
      severity?: string
      reason?: string
      recommended_action?: string
      data_status?: string
      active?: boolean
    }[]
    partial_catalog?: unknown[]
    future_catalog?: unknown[]
  } | null
  field_status?: Record<string, string> | null
  queues?: {
    id: string
    name: string
    queue_length?: number
    avg_wait_seconds?: number
    alert_active?: boolean
    now?: { length?: number; min_wait_ms?: number | null; max_wait_ms?: number | null; staff_on_post?: number }
    kpi?: {
      avg_wait_ms?: number | null
      p95_wait_ms?: number | null
      p95_available?: boolean
      completed?: number
      served?: number
      abandoned?: number
      service_rate?: number | null
      service_rate_basis?: string | null
    }
    recent_episodes?: {
      track_id: number
      join_ts: string
      leave_ts?: string | null
      wait_ms?: number
      outcome?: string
      abandon?: boolean | null
    }[]
    abandon_status?: string
    abandon_note?: string | null
  }[] | null
  /** Fashion NFC reader webhook buffer — empty until real POSTs. */
  nfc?: {
    status: "LIVE" | "NEEDS-HARDWARE" | string
    recent_taps: {
      product_id: string
      zone?: string | null
      zone_id?: string | null
      camera_id?: string | null
      tapped_at?: string
      received_at?: string
      session_index?: number
    }[]
    tap_count_session: number
    connect_hint?: string
    note?: string
  } | null
  /** Honest industry maturity map from EdgeSight (no sample KPIs). */
  industry?: {
    fashion?: { nfc_taps?: string; note?: string }
    restaurant?: {
      tables?: string
      staff?: string
      service_timestamps?: string
      food_served?: string
      tables_occupied?: number | null
      tables_calibrated?: number | null
      note?: string
    }
    manufacturing?: {
      line_activity?: string
      boxes?: string
      defects?: string
      note?: string
    }
    jewelry?: {
      high_interaction_zones?: string
      touch_proxy_zone_revisits?: string
      hand_near_shelf_pose?: string
      note?: string
    }
  } | null
  /** Buffet / retail path layout health — optional; 0 defaults when absent. */
  journey?: {
    metaphor?: string
    schema?: string
    stages: {
      id: string
      label: string
      retail_label?: string | null
      calibrated: boolean
      status: string
      dead_zone: boolean
      visits: number
      occupancy: number
      avg_dwell_seconds: number
      traction_score?: number
      zone_ids?: string[]
      zone_names?: string[]
      how_to_implement?: string
      setup_href?: string
      tags?: string[]
    }[]
    summary?: {
      stage_count: number
      calibrated: number
      missing: number
      dead_zone: number
      live: number
    }
    note?: string
  } | null
}

export type EdgeSightSummary = {
  store_id: string
  peak_period?: { hour: string; visitors: number; exits: number }
  avg_visitors_per_hour?: number
  total_visitors: number
  total_exits: number
  hourly_breakdown?: { hour: string; visitors: number; exits: number }[]
}

export type EdgeSightDevice = {
  device_id: string
  device_name: string
  cpu_usage_percent: number
  memory_usage_percent: number
  inference_engine: string
  pipeline_fps: number
  status: string
  server_time: string
  clock_sync?: {
    ntp_ok: boolean | null
    max_estimated_skew_ms: number | null
    note?: string
  }
  reid?: { cross_cam_fusion?: boolean; note?: string }
}

export type EdgeSightDemographics = {
  available: boolean
  demographics?: {
    sample_size: number
    k_anonymity: number
    age_bands: { band: string; count: number; pct: number }[]
    gender_split: { gender: string; count: number; pct: number }[]
    publishable?: boolean
    note?: string
  }
}

export type EdgeSightEngagement = {
  windows: number
  avg_attention_score: number
  avg_facing_ratio: number
  avg_phone_usage_rate: number
  avg_engaged_ratio: number
  avg_group_count: number
}

export type EdgeSightProductCategory = {
  category: string
  viewers: number
  detections: number
  avg_dwell_seconds: number
  windows: number
}

export type EdgeSightTripwire = {
  id: string
  name: string
  line: number[][]
  in_direction: string
}

export type EdgeSightZone = {
  id: string
  name: string
  polygon: number[][]
  type: "queue" | "staff" | "dwell" | string
}

export type EdgeSightCameraConfig = {
  id: string
  name: string
  source?: string
  fps_target?: number
  resolution?: number[]
  tripwires: EdgeSightTripwire[]
  zones: EdgeSightZone[]
}

export type EdgeSightEvent = {
  id: number
  store_id: string
  device_id: string
  camera_id: string
  wire_id: string
  track_id: number
  direction: "in" | "out" | string
  event_timestamp: string
  received_at: string
}

export type EdgeSightHistoryRow = {
  id: number
  store_id: string
  device_id: string
  camera_id: string
  timestamp_start: string
  timestamp_end: string
  in_count: number
  out_count: number
  current_occupancy: number
  avg_dwell_seconds: number
  queue_length: number
  avg_queue_wait_seconds: number
  queue_alert_active: number | boolean
  received_at: string
  avg_attention_score?: number
  facing_ratio?: number
  phone_usage_rate?: number
  engaged_ratio?: number
  group_count?: number
}

export type EdgeSightStatus = {
  online: boolean
  baseUrl: string
  fetchedAt: string
  error?: string
  health?: { status: string; service?: string }
  device?: EdgeSightDevice
  live?: EdgeSightLive
  summary?: EdgeSightSummary
  /** Ordered like cameras.yaml — first cam is primary until picker. */
  cameras?: string[]
  cameraConfigs?: EdgeSightCameraConfig[]
  demographics?: EdgeSightDemographics
  engagement?: EdgeSightEngagement
  products?: { categories: EdgeSightProductCategory[] }
  events?: EdgeSightEvent[]
  history?: EdgeSightHistoryRow[]
  /** Primary-cam heatmap JPEG reachable (status poll ~10s). */
  heatmapOk?: boolean | null
}

/** Server-side Docker target (proxy destination). Browser code should prefer portal paths. */
export const EDGE_SIGHT_DEFAULT_URL = "http://localhost:8000"

/**
 * Portal paths — user-facing UX stays on localhost:3000.
 * Calibrate is same-origin (Next rewrite → :8000). Ops iframe hits Streamlit
 * at :8501 with matching baseUrlPath (WebSocket-safe); /dashboard/live/ops redirects into chrome.
 */
export const EDGE_SIGHT_PORTAL_CALIB = "/dashboard/live/calibrate"
export const EDGE_SIGHT_PORTAL_OPS = "/dashboard/live/ops"
export const EDGE_SIGHT_PORTAL_DOCS = "/docs"
export const EDGE_SIGHT_PORTAL_LIVE = "/dashboard/live"
/** Streamlit embed src — Docker :8501 with baseUrlPath aligned to portal route. */
export const EDGE_SIGHT_OPS_EMBED =
  process.env.NEXT_PUBLIC_EDGE_SIGHT_OPS_EMBED || "http://localhost:8501/dashboard/live/ops/"

/** @deprecated Prefer EDGE_SIGHT_PORTAL_* */
export const EDGE_SIGHT_UI_URL = EDGE_SIGHT_PORTAL_OPS
export const EDGE_SIGHT_DOCS_URL = EDGE_SIGHT_PORTAL_DOCS
export const EDGE_SIGHT_CALIB_URL = EDGE_SIGHT_PORTAL_CALIB

/** MJPEG YOLO-overlay stream (proxied through :3000). */
export function edgeSightStreamPath(cameraId: string): string {
  return `/api/v1/stream/${encodeURIComponent(cameraId)}`
}

export function edgeSightSnapshotPath(cameraId: string): string {
  return `/api/v1/snapshot/${encodeURIComponent(cameraId)}?t=${Date.now()}`
}

export function formatDwell(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "—"
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  if (m <= 0) return `${s}s`
  return `${m}m ${String(s).padStart(2, "0")}s`
}

export function formatWait(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "—"
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export function formatPeakHour(hourIso?: string): string {
  if (!hourIso) return "—"
  const d = new Date(hourIso.replace(" ", "T"))
  if (Number.isNaN(d.getTime())) {
    const part = hourIso.split(" ")[1] ?? hourIso
    return part.slice(0, 5)
  }
  const h = d.getHours()
  return `${String(h).padStart(2, "0")}:00 – ${String(h + 1).padStart(2, "0")}:00`
}

/** Map EdgeSight age bands to coarse marketing UI bands (honest remap). */
export function mapAgeBands(
  bands: { band: string; pct: number }[],
): { band: string; pct: number }[] {
  const buckets: Record<string, number> = {
    "18–27": 0,
    "28–44": 0,
    "45–60": 0,
    "60+": 0,
  }
  for (const b of bands) {
    const id = b.band.toLowerCase()
    if (id.includes("18") || id.startsWith("0") || id.includes("teen") || id === "18_24") {
      buckets["18–27"] += b.pct
    } else if (id.includes("25") || id.includes("28") || id.includes("35") || id.includes("34") || id.includes("44")) {
      buckets["28–44"] += b.pct
    } else if (id.includes("45") || id.includes("54") || id.includes("55") || id.includes("60")) {
      buckets["45–60"] += b.pct
    } else if (id.includes("65") || id.includes("60+") || id.includes("senior")) {
      buckets["60+"] += b.pct
    } else {
      buckets["28–44"] += b.pct
    }
  }
  const total = Object.values(buckets).reduce((a, c) => a + c, 0) || 1
  return Object.entries(buckets).map(([band, pct]) => ({
    band,
    pct: Math.round((pct / total) * 1000) / 10,
  }))
}

/** Map EdgeSight hourly rollups to dashboard AreaChart `{ h, v }` points. */
export function hourlyToChart(
  breakdown?: { hour: string; visitors: number }[],
): { h: string; v: number }[] {
  if (!breakdown?.length) return []
  return breakdown.map((row) => {
    const t = row.hour.split(" ")[1] ?? row.hour
    const hh = t.slice(0, 2)
    return { h: hh, v: row.visitors }
  })
}

/** Flatten calibrated zones from camera configs (EdgeSight truth). */
export function flattenCalibratedZones(
  configs?: EdgeSightCameraConfig[],
): { cameraId: string; cameraName: string; zone: EdgeSightZone }[] {
  if (!configs?.length) return []
  return configs.flatMap((cam) =>
    (cam.zones ?? []).map((zone) => ({
      cameraId: cam.id,
      cameraName: cam.name,
      zone,
    })),
  )
}

export function countTripwires(configs?: EdgeSightCameraConfig[]): number {
  if (!configs?.length) return 0
  return configs.reduce((n, c) => n + (c.tripwires?.length ?? 0), 0)
}

/** Recent history → simple occupancy series for charts. */
export function historyToOccupancySeries(
  rows?: EdgeSightHistoryRow[],
): { h: string; v: number }[] {
  if (!rows?.length) return []
  return [...rows]
    .slice(-24)
    .map((r) => {
      const t = (r.timestamp_end || r.received_at || "").split(" ")[1] ?? ""
      return { h: t.slice(0, 5) || String(r.id), v: r.current_occupancy }
    })
}
