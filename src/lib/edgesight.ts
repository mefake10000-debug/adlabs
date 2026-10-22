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

export type EdgeSightStatus = {
  online: boolean
  baseUrl: string
  fetchedAt: string
  error?: string
  health?: { status: string; service?: string }
  device?: EdgeSightDevice
  live?: EdgeSightLive
  summary?: EdgeSightSummary
  cameras?: string[]
  demographics?: EdgeSightDemographics
  engagement?: EdgeSightEngagement
  products?: { categories: EdgeSightProductCategory[] }
}

export const EDGE_SIGHT_DEFAULT_URL = "http://localhost:8000"
export const EDGE_SIGHT_UI_URL = "http://localhost:8501"
export const EDGE_SIGHT_DOCS_URL = "http://localhost:8000/docs"

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
