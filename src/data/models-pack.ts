/**
 * Honest mirror of ~/Desktop/ad-labs-project/models pack for the dashboard Pipeline screen.
 * No hallucinated capabilities — status tags match EdgeSight + models README.
 */

export type ModelStatus = "live" | "partial" | "proxy" | "next" | "learns" | "no-cv"

export type ModelCard = {
  id: string
  name: string
  role: string
  unlocks: string
  status: ModelStatus
  statusLabel: string
}

export const MODEL_STATUS_LEGEND: { status: ModelStatus; label: string; hint: string }[] = [
  { status: "live", label: "Live in EdgeSight", hint: "Wired in ADLabs-dev pipeline today" },
  { status: "partial", label: "Partial", hint: "Pieces exist; needs calibration or small glue" },
  { status: "proxy", label: "Proxy", hint: "Related signal — not biometric truth" },
  { status: "next", label: "Integrate next", hint: "Documented in models/to-integrate" },
  { status: "learns", label: "Learns over time", hint: "Useful after weeks–months of rollups" },
  { status: "no-cv", label: "Not CV", hint: "Needs POS, fleet analytics, or non-camera infra" },
]

export const MODELS_EXISTING: ModelCard[] = [
  {
    id: "yolo26s",
    name: "YOLO26s person detector",
    role: "Detection",
    unlocks: "Passes, entries, occupancy base counts, heatmaps",
    status: "live",
    statusLabel: "Live in EdgeSight",
  },
  {
    id: "bytetrack",
    name: "ByteTrack",
    role: "Tracking",
    unlocks: "Track IDs for all counting and dwell",
    status: "live",
    statusLabel: "Live in EdgeSight",
  },
  {
    id: "yolo26m-pose",
    name: "YOLO26m pose",
    role: "Behaviour",
    unlocks: "Phone / posture proxies; ankle foot-points (wire next)",
    status: "live",
    statusLabel: "Live · ankles deepen zones",
  },
  {
    id: "yunet",
    name: "YuNet face detector",
    role: "Face box only",
    unlocks: "Boxes + landmarks for age/gender — never identity product",
    status: "live",
    statusLabel: "Live · aggregates only",
  },
  {
    id: "age-gender",
    name: "Age / gender ViT",
    role: "Demographics",
    unlocks: "k-anonymous age & gender cohorts",
    status: "live",
    statusLabel: "Live · k ≥ 10",
  },
  {
    id: "head-pose",
    name: "Head pose SolvePnP",
    role: "Attention proxy",
    unlocks: "Facing / engaged dwell — not pupil gaze",
    status: "proxy",
    statusLabel: "Proxy · not gaze",
  },
  {
    id: "yolo-world",
    name: "YOLOv8s-Worldv2 products",
    role: "Category interest",
    unlocks: "Near-display interest by category vocabulary",
    status: "live",
    statusLabel: "Live · not SKU OCR",
  },
]

export const MODELS_NEXT: ModelCard[] = [
  {
    id: "window-stop",
    name: "Window stop velocity",
    role: "Stop rate",
    unlocks: "True ≥4s window stop + pass→stop→enter funnel",
    status: "partial",
    statusLabel: "Partial · top priority",
  },
  {
    id: "oc-sort",
    name: "OC-SORT / BoT-SORT",
    role: "Tracking upgrade",
    unlocks: "Fewer ID switches → cleaner footfall & dwell",
    status: "next",
    statusLabel: "Integrate next",
  },
  {
    id: "ntp-sync",
    name: "NTP + frame timestamps",
    role: "Multi-cam sync",
    unlocks: "Prerequisite for cross-cam handoff",
    status: "next",
    statusLabel: "Integrate next",
  },
  {
    id: "homography",
    name: "Floor homography",
    role: "Calibration",
    unlocks: "Overlap gates for fusion & metric velocity",
    status: "next",
    statusLabel: "Integrate next",
  },
  {
    id: "osnet",
    name: "OSNet cross-camera ReID",
    role: "Handoff",
    unlocks: "Cam A→B follow without face gallery",
    status: "next",
    statusLabel: "Gap today",
  },
  {
    id: "patterns",
    name: "Weekly / seasonal motifs",
    role: "Patterns",
    unlocks: "Anonymous rollup motifs after 4–12+ weeks",
    status: "learns",
    statusLabel: "Learns over time",
  },
  {
    id: "forecast",
    name: "Footfall / queue forecast",
    role: "Predictions",
    unlocks: "Seasonal-naive → Prophet-class; UI stays illustrative until trained",
    status: "learns",
    statusLabel: "Demo until history",
  },
  {
    id: "pos",
    name: "Sales conversion / basket / ROI",
    role: "Commerce",
    unlocks: "Needs POS join — not a camera model",
    status: "no-cv",
    statusLabel: "Not CV",
  },
]

export const PIPELINE_STAGES = [
  { step: "1", title: "Detect", detail: "YOLO26s person boxes on each camera" },
  { step: "2", title: "Track", detail: "ByteTrack IDs · dwell & crossings" },
  { step: "3", title: "Zones / queues", detail: "Polygons · tripwires · heatmap cells" },
  { step: "4", title: "Attributes", detail: "Pose · head facing · age/gender k-anon · YOLO-World" },
  { step: "5", title: "Metrics API", detail: "EdgeSight :8000 → this dashboard when online" },
]

export const HONESTY_BARS = [
  "Marketing /dashboard mixes EdgeSight live signals (when Docker is up) with showcase fixtures for storefront storytelling.",
  "Window stop rate remains Partial until the ≥4s velocity rule ships — demo % stays labeled.",
  "Loss-risk alerts are heuristics, not perfect theft detection. No facial identity product.",
  "Forecasts and long-horizon patterns are illustrative until enough rollup history exists.",
]

/** Segregated next-integrate weights — ADLabs-dev `models/pack/` (mefake/integration). */
export const PACK_FOLDERS: {
  id: string
  folder: string
  role: string
  weight: string
  status: string
}[] = [
  {
    id: "det-n",
    folder: "01-detection/yolo26n/",
    role: "Doorway fast detector",
    weight: "yolo26n.pt",
    status: "Downloaded · not prod-wired",
  },
  {
    id: "track",
    folder: "02-tracking/",
    role: "OC-SORT / BoT-SORT",
    weight: "(code deps)",
    status: "README only",
  },
  {
    id: "reid",
    folder: "03-reid/osnet-x0_25/",
    role: "Soft ReID (privacy-gated)",
    weight: "osnet_x0_25_msmt17.pt",
    status: "Downloaded · default-off",
  },
  {
    id: "attr",
    folder: "04-attributes/",
    role: "Demographics",
    weight: "use models/onnx/",
    status: "Already in EdgeSight",
  },
  {
    id: "seg",
    folder: "05-seg/",
    role: "Foot-mask salvage",
    weight: "yolo26m-seg.pt",
    status: "Use production weight",
  },
]

export const PACK_RUN_HINTS = {
  download: "python scripts/download_pack_models.py",
  docker: "docker compose -f docker-compose.yml -f docker-compose.pack.yml up -d",
  mount: "models/pack → /app/models/pack (read-only)",
  branch: "ADLabs-dev · mefake/integration (or integration)",
}
