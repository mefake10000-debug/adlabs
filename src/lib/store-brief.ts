/**
 * Template-based Live store brief from real /api/v1/live fields only.
 * Never invents demo KPIs, ledgers, or journey visits.
 */

import type { EdgeSightLive } from "./edgesight"

export type JourneyStageRow = {
  id: string
  label: string
  retail_label?: string | null
  calibrated: boolean
  status: "missing" | "dead_zone" | "live" | string
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
}

export type JourneyBlock = {
  metaphor?: string
  schema?: string
  stages: JourneyStageRow[]
  summary?: {
    stage_count: number
    calibrated: number
    missing: number
    dead_zone: number
    live: number
  }
  note?: string
}

export type StoreBriefInput = {
  online: boolean
  live: EdgeSightLive | null | undefined
  journey?: JourneyBlock | null
  error?: string | null
}

/** 3–6 owner-facing bullets from live fields. Empty array when nothing real to say. */
export function buildStoreBrief(input: StoreBriefInput): string[] {
  const bullets: string[] = []
  if (!input.online) {
    bullets.push(
      input.error
        ? `EdgeSight offline — ${input.error}`
        : "EdgeSight offline — start Docker, then refresh. No demo store numbers.",
    )
    return bullets.slice(0, 6)
  }

  const live = input.live
  if (!live) {
    bullets.push("API reachable but /api/v1/live has not returned yet.")
    return bullets.slice(0, 6)
  }

  const inn = live.total_visitors
  const present = live.people_now ?? live.net_occupancy
  const out = live.total_exits
  if (inn != null || present != null || out != null) {
    bullets.push(
      `In ${fmtNum(inn)} · present ${fmtNum(present)} · out ${fmtNum(out)} this session.`,
    )
  }

  const q = live.queue_length
  if (q != null) {
    const wait = live.avg_queue_wait_seconds
    const alert = live.queue_alert_active ? " · congestion alert on" : " · no congestion alert"
    const waitBit = wait != null && wait > 0 ? ` · avg wait ${fmtNum(wait)}s` : ""
    bullets.push(`Queue ${fmtNum(q)}${waitBit}${alert}.`)
  }

  const journey = input.journey ?? live.journey ?? null
  if (journey?.summary) {
    const s = journey.summary
    const deadLabels = (journey.stages || [])
      .filter((st) => st.dead_zone || st.status === "dead_zone")
      .map((st) => st.label)
      .slice(0, 3)
    const deadBit = deadLabels.length ? ` (${deadLabels.join(", ")})` : ""
    bullets.push(
      `Journey: ${s.missing} stage${s.missing === 1 ? "" : "s"} missing · ${s.dead_zone} dead zone${s.dead_zone === 1 ? "" : "s"}${deadBit} · ${s.live} live.`,
    )
  } else if (journey?.stages?.length) {
    const missing = journey.stages.filter((st) => st.status === "missing").length
    const dead = journey.stages.filter((st) => st.dead_zone || st.status === "dead_zone").length
    bullets.push(`Journey: ${missing} missing · ${dead} dead zone(s) — open Set up zones to mark stages.`)
  }

  const dwell = live.avg_dwell_seconds
  const engaged = live.engagement?.engaged_ratio
  if (dwell != null && dwell > 0) {
    const eng =
      engaged != null && Number.isFinite(engaged)
        ? ` · engaged ratio ${Number(engaged).toFixed(2)}`
        : ""
    bullets.push(`Avg dwell ${fmtNum(dwell)}s${eng}.`)
  } else if (engaged != null && Number.isFinite(engaged)) {
    bullets.push(`Engaged ratio ${Number(engaged).toFixed(2)} (dwell not yet reported).`)
  }

  if (live.source) {
    bullets.push(`Source ${live.source}${live.last_updated ? ` · updated ${live.last_updated}` : ""}.`)
  }

  // Keep 3–6; prefer operational lines over source meta if over length.
  if (bullets.length > 6) {
    const sourceIdx = bullets.findIndex((b) => b.startsWith("Source "))
    if (sourceIdx >= 0) bullets.splice(sourceIdx, 1)
  }
  return bullets.slice(0, 6)
}

function fmtNum(n: number | null | undefined): string {
  if (n == null || Number.isNaN(Number(n))) return "—"
  const v = Number(n)
  return Number.isInteger(v) ? String(v) : v.toFixed(1)
}

/** Accounting FUTURE stub — docs only, never fake ledgers. */
export const ACCOUNTING_FUTURE = {
  badge: "FUTURE" as const,
  title: "Accounting complete view",
  summary:
    "Join CV journey traction with POS/daybook sales to see layout spread vs missing stages — which buffet/retail steps sell, and which stay cold.",
  stubs: [
    {
      method: "POST",
      path: "/api/v1/accounting/link",
      purpose: "Bind a POS/daybook export id → store_id (no ledger body shipped yet).",
    },
    {
      method: "GET",
      path: "/api/v1/accounting/spread",
      purpose: "Compare category sales vs journey stage traction for a time window.",
    },
  ],
  joinNote:
    "Join key = time window + category/zone tag. Not face ID. No sample ledgers until a real connector lands.",
  docsHref: "/docs", // Edge FastAPI docs when proxied; narrative in video-to-text-store-brief.md
} as const
