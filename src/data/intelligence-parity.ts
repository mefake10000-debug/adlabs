/**
 * Competitor-inspired capability cards for UX parity (not IP clones).
 * Badges must resolve from real EdgeSight /api/v1/live fields or stay FUTURE / PARTIAL.
 * Sources: docs/competitor-parity-auki-shire-neurospot.md
 */

import type { SectionId } from "../lib/data-freshness"

export type ParityMaturity = "LIVE" | "PARTIAL" | "FUTURE" | "BLOCKED"

export type ParityCard = {
  id: string
  title: string
  portalSection: string
  inspiredBy: "Cactus" | "Shire" | "Neurospot" | "All"
  /** When set, panel copies the live section badge (LIVE/PARTIAL/NO-DATA→PARTIAL). */
  sectionId?: SectionId
  /** Used when sectionId is absent, or to force FUTURE/BLOCKED. */
  fixedMaturity?: ParityMaturity
  liveFields: string[]
  openModels: string
  note: string
}

export const INTELLIGENCE_PARITY_CARDS: ParityCard[] = [
  {
    id: "entrance-stop",
    title: "Entrance / glass / stop-rate",
    portalSection: "Live vision · Storefront",
    inspiredBy: "Neurospot",
    sectionId: "entrance_tripwires",
    liveFields: [
      "total_visitors",
      "counts.tripwire_in_cumulative",
      "engagement.engaged_ratio",
    ],
    openModels: "YOLO26/11 · ByteTrack · tripwires · pose engagement",
    note: "Stop/engaged uses pose dwell — never invent glass conversion %.",
  },
  {
    id: "floor-traction",
    title: "Floor paths / traction",
    portalSection: "Zones · Heatmap",
    inspiredBy: "Neurospot",
    sectionId: "floor_zones",
    liveFields: ["dwell_zones[]", "GET /api/v1/heatmap/{cam}"],
    openModels: "ByteTrack · zone polygons · heatmap writer",
    note: "Empty zone list is honest LIVE empty — not fabricated traffic share.",
  },
  {
    id: "queue-timestamps",
    title: "Queue timestamps",
    portalSection: "Queues",
    inspiredBy: "Shire",
    sectionId: "queues",
    liveFields: [
      "queues[]",
      "queue_length",
      "avg_queue_wait_seconds",
      "queue_alert_active",
    ],
    openModels: "QueueAnalyzer · join/leave episodes (handoff)",
    note: "Length/wait LIVE; per-person join_ts/leave_ts still PARTIAL until upgrade ships.",
  },
  {
    id: "staffing",
    title: "Staffing",
    portalSection: "Staff",
    inspiredBy: "Shire",
    sectionId: "staffing",
    liveFields: ["staff_now", "counts.staff_visible", "staff_zones"],
    openModels: "Staff polygons + dwell tag · OSNet session ReID (quality)",
    note: "Geometry presence only — no facial identity.",
  },
  {
    id: "safety",
    title: "Safety / cautions",
    portalSection: "Alerts",
    inspiredBy: "Neurospot",
    fixedMaturity: "PARTIAL",
    liveFields: ["queue_alert_active", "alerts catalog (handoff)"],
    openModels: "Heuristic occupancy / under-lit / after-hours — not certified fire/weapons",
    note: "Suspicious dwell ≠ theft. ScanX-style FR / weapons = BLOCKED.",
  },
  {
    id: "retail-intel",
    title: "Retail intelligence (shelf)",
    portalSection: "Shelf",
    inspiredBy: "Cactus",
    sectionId: "shelf",
    liveFields: ["products_top[]", "/api/v1/analytics/products"],
    openModels: "YOLO-World / YOLOE · CLIP text prompts",
    note: "Open-vocab categories — never claimed as POS SKUs or planogram compliance.",
  },
  {
    id: "store-compare",
    title: "Store compare",
    portalSection: "Stores",
    inspiredBy: "All",
    fixedMaturity: "FUTURE",
    liveFields: [],
    openModels: "Multi-store rollups (tenant analytics)",
    note: "No live cross-store twin in EdgeSight yet.",
  },
  {
    id: "display-interest",
    title: "Display interest",
    portalSection: "Shelf · Engagement",
    inspiredBy: "Cactus",
    sectionId: "engagement",
    liveFields: ["products_top", "engagement.facing_ratio", "engagement.engaged_ratio"],
    openModels: "Pose facing · YOLO-World interest radius",
    note: "Attention ≠ footfall heatmap. Quality/enrichment may leave PARTIAL.",
  },
  {
    id: "alerts",
    title: "Actionable alerts",
    portalSection: "Alerts · Live ops",
    inspiredBy: "Shire",
    fixedMaturity: "PARTIAL",
    liveFields: ["queue_alert_active", "events feed"],
    openModels: "alerts-catalog-retail-grocery + role-routed inbox (next)",
    note: "Shire-style role routing is UX; we route to owner actions, not their closed stack.",
  },
  {
    id: "spatial-twin",
    title: "Spatial twin / AR nav",
    portalSection: "—",
    inspiredBy: "Cactus",
    fixedMaturity: "FUTURE",
    liveFields: [],
    openModels: "Optional Auki posemesh eval only — partner required",
    note: "Public Cactus search API exists; no ADLabs partnership claimed.",
  },
  {
    id: "facial-id",
    title: "Facial identity / repeat offender",
    portalSection: "—",
    inspiredBy: "Neurospot",
    fixedMaturity: "BLOCKED",
    liveFields: [],
    openModels: "YuNet redaction only",
    note: "Explicitly out of product scope.",
  },
]

export const PARITY_DOC_PATH = "docs/competitor-parity-auki-shire-neurospot.md"
