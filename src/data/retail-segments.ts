/** Floor-role retail intelligence segments — high-frequency retail analytics, not vertical tabs. */

export type RetailSegmentId =
  | "entrance"
  | "path"
  | "dwell"
  | "queue"
  | "staff"
  | "shelf"

export type SegmentMaturity = "LIVE" | "PARTIAL" | "EMPTY" | "FUTURE"

export type SegmentKpiDef = {
  id: string
  title: string
  brief: string
  /** Documentation path into /api/v1/live (not a runtime parser). */
  sourcePath: string
  defaultMaturity: SegmentMaturity
}

export type RetailSegmentDef = {
  id: RetailSegmentId
  label: string
  title: string
  /** One-line promise under the switcher. */
  promise: string
  kpis: SegmentKpiDef[]
  /** Subtle “what we can try next” chips — suggestions, never fake numbers. */
  futures: string[]
}

export const RETAIL_SEGMENT_STORAGE_KEY = "adlabs.live.retailSegment"

export const RETAIL_SEGMENT_IDS: RetailSegmentId[] = [
  "entrance",
  "path",
  "dwell",
  "queue",
  "staff",
  "shelf",
]

export function isRetailSegmentId(v: string | null | undefined): v is RetailSegmentId {
  return (
    v === "entrance" ||
    v === "path" ||
    v === "dwell" ||
    v === "queue" ||
    v === "staff" ||
    v === "shelf"
  )
}

export const RETAIL_SEGMENTS: Record<RetailSegmentId, RetailSegmentDef> = {
  entrance: {
    id: "entrance",
    label: "Entrance",
    title: "Entrance conversion",
    promise: "Pass → stop → enter from tripwires and glass ROI — never invent stop-rate.",
    kpis: [
      {
        id: "entries",
        title: "Entries in",
        brief: "Session tripwire IN crossings.",
        sourcePath: "live.total_visitors · per_camera[].in_count",
        defaultMaturity: "EMPTY",
      },
      {
        id: "stop_rate",
        title: "Glass stop-rate",
        brief: "Stops at facade glass ÷ glass entrants when ROI is calibrated.",
        sourcePath: "live.entrance.stop_rate",
        defaultMaturity: "FUTURE",
      },
      {
        id: "glass_to_entry",
        title: "Glass → entry",
        brief: "Share of glass episodes that later cross IN.",
        sourcePath: "live.entrance.conversion_glass_to_entry",
        defaultMaturity: "FUTURE",
      },
    ],
    futures: [
      "Draw a glass ROI in Set up zones to unlock stop-rate (Moondream not required).",
      "Pair facade cam + door tripwire for honest glass→entry conversion.",
    ],
  },
  path: {
    id: "path",
    label: "Path",
    title: "Path & discovery",
    promise: "Journey stage traction and dead-aisle text from calibrated stage tags.",
    kpis: [
      {
        id: "stages_live",
        title: "Live stages",
        brief: "Journey stages with real occupancy or visits this session.",
        sourcePath: "live.journey.summary.live",
        defaultMaturity: "EMPTY",
      },
      {
        id: "dead_aisles",
        title: "Dead aisles",
        brief: "Marked stages with zero traction (cold path).",
        sourcePath: "live.journey.summary.dead_zone",
        defaultMaturity: "EMPTY",
      },
      {
        id: "missing_stages",
        title: "Missing stages",
        brief: "Schema stages not yet mapped to floor polygons.",
        sourcePath: "live.journey.summary.missing",
        defaultMaturity: "EMPTY",
      },
    ],
    futures: [
      "Tag dwell zones with journey_stage in Set up zones to fill path traction.",
      "Nightly path brief: cold stages → layout try-next (text only).",
    ],
  },
  dwell: {
    id: "dwell",
    label: "Dwell",
    title: "Dwell hotspots",
    promise: "Which floor polygons hold attention — ranked by occupancy × dwell.",
    kpis: [
      {
        id: "top_zone",
        title: "Top hotspot",
        brief: "Highest occupancy × dwell dwell-zone right now.",
        sourcePath: "live.zones[] ranked",
        defaultMaturity: "EMPTY",
      },
      {
        id: "top_dwell",
        title: "Top dwell",
        brief: "Average dwell seconds in the hotspot zone.",
        sourcePath: "live.zones[].avg_dwell_seconds",
        defaultMaturity: "EMPTY",
      },
      {
        id: "active_zones",
        title: "Active zones",
        brief: "Dwell polygons with someone present.",
        sourcePath: "live.zones[] occupancy>0",
        defaultMaturity: "EMPTY",
      },
    ],
    futures: [
      "Tighten polygons per bay so hotspots map to fixtures, not whole aisles.",
    ],
  },
  queue: {
    id: "queue",
    label: "Queue",
    title: "Queue health",
    promise: "Length, wait, and p95 from queue polygons — null until sample size unlocks.",
    kpis: [
      {
        id: "length",
        title: "Queue length",
        brief: "People in queue polygons now.",
        sourcePath: "live.queue_length · queues[].queue_length",
        defaultMaturity: "EMPTY",
      },
      {
        id: "avg_wait",
        title: "Avg wait",
        brief: "Mean wait across active queues.",
        sourcePath: "live.avg_queue_wait_seconds",
        defaultMaturity: "EMPTY",
      },
      {
        id: "p95",
        title: "p95 wait",
        brief: "Unlocks after enough settled queue episodes (never a fake percentile).",
        sourcePath: "live.queues[].kpi.p95_wait_ms · /api/v1/live.queue",
        defaultMaturity: "PARTIAL",
      },
    ],
    futures: [
      "Link a service_point zone so abandon + service-rate leave PARTIAL.",
    ],
  },
  staff: {
    id: "staff",
    label: "Staff",
    title: "Staff coverage",
    promise: "Geometry staff tags only — no facial identity, ever.",
    kpis: [
      {
        id: "staff_now",
        title: "Staff on floor",
        brief: "Tracks tagged in staff polygons.",
        sourcePath: "live.staff_now · /api/v1/live.staff",
        defaultMaturity: "EMPTY",
      },
      {
        id: "staff_zones",
        title: "Staff zones",
        brief: "Calibrated staff polygons reporting tagged_ids.",
        sourcePath: "live.staff_zones[]",
        defaultMaturity: "EMPTY",
      },
      {
        id: "response",
        title: "Queue response",
        brief: "Time from queue alert → staff seen in linked zone.",
        sourcePath: "live.staff.response_time_to_queue",
        defaultMaturity: "PARTIAL",
      },
    ],
    futures: [
      "Link staff_zone_id on each queue to settle response_time episodes.",
    ],
  },
  shelf: {
    id: "shelf",
    label: "Shelf",
    title: "Shelf / display attention",
    promise: "Open-vocab category interest when the products model is on — never SKUs or revenue.",
    kpis: [
      {
        id: "top_category",
        title: "Top interest",
        brief: "Highest open-vocab category this window.",
        sourcePath: "live.products_top[0].category",
        defaultMaturity: "EMPTY",
      },
      {
        id: "viewers",
        title: "Viewers / detections",
        brief: "Category hits from products / YOLO-World when loaded.",
        sourcePath: "live.products_top[0].viewers|detections",
        defaultMaturity: "EMPTY",
      },
      {
        id: "cat_dwell",
        title: "Category dwell",
        brief: "Avg dwell on the top interest class.",
        sourcePath: "live.products_top[0].avg_dwell_seconds",
        defaultMaturity: "EMPTY",
      },
    ],
    futures: [
      "Nightly shelf QA with Moondream — gap / facing text, not LIVE counts.",
      "Accounting join (one card): POS category ↔ display interest for the same window.",
    ],
  },
}
