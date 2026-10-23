/** Industry use-case modes for the Live hub — field maps + playbook only. Never invents sample KPIs. */

export type IndustryId = "fashion" | "restaurant" | "manufacturing" | "jewelry"

export type IndustryMaturity = "LIVE" | "PARTIAL" | "EMPTY" | "FUTURE" | "NEEDS-HARDWARE"

export type IndustryKpiDef = {
  id: string
  title: string
  brief: string
  /** JSON path shown under the value (documentation, not a parser). */
  sourcePath: string
  /** Default maturity when signals are absent. */
  defaultMaturity: IndustryMaturity
}

export type IndustryModeDef = {
  id: IndustryId
  label: string
  headline: string
  /** One line under the selector when this industry is active. */
  emphasis: string
  kpis: IndustryKpiDef[]
  playbook: {
    helped: string
    calibrate: string
    models: string
    maturity: IndustryMaturity
  }
}

export const INDUSTRY_STORAGE_KEY = "adlabs.live.industry"

export const INDUSTRY_IDS: IndustryId[] = [
  "fashion",
  "restaurant",
  "manufacturing",
  "jewelry",
]

export function isIndustryId(v: string | null | undefined): v is IndustryId {
  return v === "fashion" || v === "restaurant" || v === "manufacturing" || v === "jewelry"
}

export const INDUSTRY_MODES: Record<IndustryId, IndustryModeDef> = {
  fashion: {
    id: "fashion",
    label: "Fashion",
    headline: "NFC product taps",
    emphasis: "Global In / Present / Out stay; NFC fills only after a reader POSTs.",
    kpis: [
      {
        id: "nfc_session",
        title: "NFC taps (session)",
        brief: "Count of real reader events this EdgeSight session.",
        sourcePath: "live.nfc.tap_count_session",
        defaultMaturity: "NEEDS-HARDWARE",
      },
      {
        id: "nfc_last_product",
        title: "Last product id",
        brief: "Most recent tagged SKU / NFC id from the webhook.",
        sourcePath: "live.nfc.recent_taps[0].product_id",
        defaultMaturity: "NEEDS-HARDWARE",
      },
      {
        id: "nfc_last_zone",
        title: "Last tap zone",
        brief: "Zone name or id sent with the tap (fitting wall, rail, …).",
        sourcePath: "live.nfc.recent_taps[0].zone",
        defaultMaturity: "NEEDS-HARDWARE",
      },
      {
        id: "nfc_last_time",
        title: "Last tap time",
        brief: "Reader or server timestamp of the latest tap.",
        sourcePath: "live.nfc.recent_taps[0].tapped_at",
        defaultMaturity: "NEEDS-HARDWARE",
      },
      {
        id: "nfc_status",
        title: "NFC link",
        brief: "LIVE after first real tap; otherwise connect the reader.",
        sourcePath: "live.nfc.status · connect_hint",
        defaultMaturity: "NEEDS-HARDWARE",
      },
    ],
    playbook: {
      helped:
        "Know which tagged garments shoppers physically engage — tap → product id · time · zone on Live.",
      calibrate:
        "Map NFC zone ids to floor polygons in Set up zones; keep fitting / rail polygons for dwell context.",
      models: "Person detect+track (YOLO/RF-DETR) + NFC webhook. No CV substitute for tag taps.",
      maturity: "NEEDS-HARDWARE",
    },
  },
  restaurant: {
    id: "restaurant",
    label: "Restaurants",
    headline: "Tables · staff · service wait",
    emphasis: "Dwell polygons = table proxies; staff zone + queue wait when calibrated.",
    kpis: [
      {
        id: "tables_occupied",
        title: "Tables occupied",
        brief: "Dwell zones with occupancy > 0 (table proxy).",
        sourcePath: "live.zones[] · type=dwell · occupancy>0",
        defaultMaturity: "EMPTY",
      },
      {
        id: "tables_calibrated",
        title: "Tables calibrated",
        brief: "Count of dwell polygons treated as tables.",
        sourcePath: "live.zones[] · type=dwell | config cameras.zones",
        defaultMaturity: "EMPTY",
      },
      {
        id: "staff_on_floor",
        title: "Staff on floor",
        brief: "Tracks tagged in staff polygons (geometry role, not biometrics).",
        sourcePath: "live.staff_now · staff_zones[].tagged_ids",
        defaultMaturity: "EMPTY",
      },
      {
        id: "service_wait",
        title: "Service wait",
        brief: "Queue / service-point average wait from tracks when wired.",
        sourcePath: "live.avg_queue_wait_seconds · queues[].avg_wait_seconds",
        defaultMaturity: "EMPTY",
      },
      {
        id: "food_served",
        title: "Food served",
        brief: "POS / pass-through served count — not inferred from video.",
        sourcePath: "— (POS link)",
        defaultMaturity: "FUTURE",
      },
    ],
    playbook: {
      helped:
        "Shire-style floor awareness: which tables are occupied, whether staff are on post, and service wait from track timestamps.",
      calibrate:
        "One dwell polygon per table (or booth cluster); staff polygon for the pass / waiter station; optional queue for bar pickup.",
      models: "Person detect+track + zone membership. Food-served needs POS — FUTURE.",
      maturity: "PARTIAL",
    },
  },
  manufacturing: {
    id: "manufacturing",
    label: "Manufacturing",
    headline: "Line activity · boxes · defects",
    emphasis: "Line = zone occupancy; boxes = object classes when model loaded; defects stay FUTURE.",
    kpis: [
      {
        id: "line_activity",
        title: "Line activity",
        brief: "People / motion in line / conveyor dwell zones.",
        sourcePath: "live.zones[] occupancy (line polygons)",
        defaultMaturity: "EMPTY",
      },
      {
        id: "boxes_detected",
        title: "Boxes / objects",
        brief: "Open-vocab or detector category hits (not inventing SKUs).",
        sourcePath: "live.products_top[] · models.products",
        defaultMaturity: "EMPTY",
      },
      {
        id: "top_class",
        title: "Top object class",
        brief: "Highest-detection category this window when products model is on.",
        sourcePath: "live.products_top[0].category",
        defaultMaturity: "EMPTY",
      },
      {
        id: "box_movement",
        title: "Object dwell",
        brief: "Avg dwell seconds on the top detected class (proxy for movement presence).",
        sourcePath: "live.products_top[0].avg_dwell_seconds",
        defaultMaturity: "EMPTY",
      },
      {
        id: "defects",
        title: "Defect flags",
        brief: "Requires a defect model — never show a fake defect rate.",
        sourcePath: "industry.manufacturing.defects",
        defaultMaturity: "FUTURE",
      },
    ],
    playbook: {
      helped:
        "See conveyor / line presence and box/object movement from detector classes; keep quality metrics honest until a defect model ships.",
      calibrate:
        "Draw line / belt polygons; aim camera so boxes are resolvable; enable products / RF-DETR object classes in quality mode.",
      models: "YOLO or RF-DETR person + open-vocab/products for boxes. Defect model = FUTURE.",
      maturity: "PARTIAL",
    },
  },
  jewelry: {
    id: "jewelry",
    label: "Jewelry",
    headline: "High-interaction zones",
    emphasis: "Rank shelves by dwell/occupancy; hand-near-shelf needs pose.",
    kpis: [
      {
        id: "top_zone",
        title: "Top interaction zone",
        brief: "Dwell zone with highest occupancy × dwell proxy.",
        sourcePath: "live.zones[] ranked by occupancy · avg_dwell_seconds",
        defaultMaturity: "EMPTY",
      },
      {
        id: "top_dwell",
        title: "Top zone dwell",
        brief: "Average dwell seconds in the highest-ranked zone.",
        sourcePath: "live.zones[].avg_dwell_seconds",
        defaultMaturity: "EMPTY",
      },
      {
        id: "active_zones",
        title: "Active shelf zones",
        brief: "Dwell polygons with someone present now.",
        sourcePath: "live.zones[] occupancy>0",
        defaultMaturity: "EMPTY",
      },
      {
        id: "touch_proxy",
        title: "Touch proxy",
        brief: "Zone revisits / hand-near-shelf — PARTIAL from occupancy; pose = better.",
        sourcePath: "zones revisits (PARTIAL) · pose hand-near (FUTURE/PARTIAL)",
        defaultMaturity: "PARTIAL",
      },
      {
        id: "people_near",
        title: "People present",
        brief: "Active customer tracks (same as global Present).",
        sourcePath: "live.people_now",
        defaultMaturity: "EMPTY",
      },
    ],
    playbook: {
      helped:
        "Surface max-touch / high-dwell cases and counters so staff can restock or attend hot SKUs/zones.",
      calibrate:
        "Tight dwell polygons per case / shelf bay; optional staff zone behind the counter.",
      models:
        "Person detect+track + zones. Pose enrichment for hand-near-shelf proxy; no fabricated touch counts.",
      maturity: "PARTIAL",
    },
  },
}

/** Cross-industry playbook rows for the accordion summary table. */
export const CROSS_INDUSTRY_PLAYBOOK = INDUSTRY_IDS.map((id) => {
  const m = INDUSTRY_MODES[id]
  return {
    id,
    label: m.label,
    helped: m.playbook.helped,
    calibrate: m.playbook.calibrate,
    models: m.playbook.models,
    maturity: m.playbook.maturity,
  }
})
