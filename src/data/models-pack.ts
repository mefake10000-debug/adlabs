/**
 * Honest mirror of ~/Desktop/ad-labs-project/models pack for the dashboard Pipeline screen.
 * No hallucinated capabilities — status tags match EdgeSight + models README + full-scope checklist.
 */

export type ModelStatus = "live" | "partial" | "proxy" | "next" | "learns" | "no-cv" | "future"

export type ModelCard = {
  id: string
  name: string
  role: string
  unlocks: string
  status: ModelStatus
  statusLabel: string
}

/** Full planned → maturity row for anti-hallucination UI + checklist parity. */
export type ScopeRow = {
  id: string
  capability: string
  planned: string
  maturity: "Live" | "Demo" | "Partial" | "Integrate next" | "Learns" | "Future" | "Not CV" | "Blocked"
  weightOrCode: string
  notes: string
}

export const MODEL_STATUS_LEGEND: { status: ModelStatus; label: string; hint: string }[] = [
  { status: "live", label: "Live in EdgeSight", hint: "Wired in ADLabs-dev pipeline today" },
  { status: "partial", label: "Partial", hint: "Pieces exist; needs calibration or small glue" },
  { status: "proxy", label: "Proxy", hint: "Related signal — not biometric truth" },
  { status: "next", label: "Integrate next", hint: "Documented in models/to-integrate" },
  { status: "learns", label: "Learns over time", hint: "Useful after weeks–months of rollups" },
  { status: "future", label: "Future / research", hint: "Not scheduled; do not claim live" },
  { status: "no-cv", label: "Not CV", hint: "Needs POS, fleet analytics, or non-camera infra" },
]

export const MODELS_EXISTING: ModelCard[] = [
  {
    id: "yolo26n",
    name: "YOLO26n person detector",
    role: "Detection · fast",
    unlocks: "Docker demo default (EDGE_PERF_MODE=fast · DETECTOR_BACKEND=yolo26)",
    status: "live",
    statusLabel: "Live · fast tier",
  },
  {
    id: "yolo26s",
    name: "YOLO26s person detector",
    role: "Detection · YOLO quality",
    unlocks: "DETECTOR_BACKEND=yolo26 + EDGE_PERF_MODE=quality · higher accuracy",
    status: "live",
    statusLabel: "Live · YOLO quality",
  },
  {
    id: "rfdetr",
    name: "RF-DETR-N/S (Roboflow)",
    role: "Detection · SOTA Apache",
    unlocks: "DETECTOR_BACKEND=rfdetr · quality default · xyxy→ByteTrack",
    status: "next",
    statusLabel: "PACKED · LIVE when selected+loaded",
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
    status: "partial",
    statusLabel: "Gated · EDGE_PERF_MODE=quality",
  },
  {
    id: "yunet",
    name: "YuNet face detector",
    role: "Face box only",
    unlocks: "Boxes + landmarks for age/gender — never identity product",
    status: "partial",
    statusLabel: "Gated · quality mode",
  },
  {
    id: "age-gender",
    name: "Age / gender ViT",
    role: "Demographics",
    unlocks: "k-anonymous cohorts only — never raw LIVE age/gender",
    status: "future",
    statusLabel: "GATED · ENABLE_DEMOGRAPHICS=0 default",
  },
  {
    id: "head-pose",
    name: "Head pose SolvePnP",
    role: "Attention proxy",
    unlocks: "Facing / engaged dwell — not pupil gaze",
    status: "proxy",
    statusLabel: "Proxy · gated / not gaze",
  },
  {
    id: "yolo-world",
    name: "YOLOv8s-Worldv2 products",
    role: "Category interest",
    unlocks: "Near-display interest by category vocabulary",
    status: "partial",
    statusLabel: "Gated · needs openai-clip + quality",
  },
]

export const MODELS_NEXT: ModelCard[] = [
  {
    id: "rtmpose",
    name: "RTMPose-t/s ONNX (rtmlib)",
    role: "Ankle / foot pose",
    unlocks: "Red foot mark · skeleton · tripwire/dwell ground point (LIVE when ONNX + edge load)",
    status: "partial",
    statusLabel: "LIVE when packed · ENABLE_RTMPOSE",
  },
  {
    id: "shelf-gap-geometry",
    name: "Shelf gap / OSA geometry",
    role: "Planogram gaps",
    unlocks: "Gap candidates from existing boxes — zero new weights",
    status: "partial",
    statusLabel: "PARTIAL stub · no SKU-110K",
  },
  {
    id: "mivolo-v2",
    name: "MiVOLO v2 age/gender",
    role: "Demographics (body-only OK)",
    unlocks: "Apache-2.0 — DPIA + k≥10 only; UI never shows raw LIVE",
    status: "future",
    statusLabel: "GATED · ENABLE_DEMOGRAPHICS",
  },
  {
    id: "moondream",
    name: "Moondream lean VLM",
    role: "Nightly shelf-photo QA",
    unlocks: "Not every-frame; on-prem Apache path",
    status: "future",
    statusLabel: "FUTURE · nightly only",
  },
  {
    id: "p2pnet",
    name: "P2PNet crowd density",
    role: "Crush scenes",
    unlocks: "Academic-research license — skip commercial; prefer max_det",
    status: "future",
    statusLabel: "SKIP commercial",
  },
  {
    id: "locateanything-3b",
    name: "LocateAnything-3B",
    role: "Open-vocab grounding",
    unlocks: "NVIDIA non-commercial — do not download",
    status: "future",
    statusLabel: "FUTURE · no download",
  },
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
    statusLabel: "Top 5 · integrate next",
  },
  {
    id: "pose-ankles",
    name: "Pose ankle foot-points",
    role: "Zone grounding",
    unlocks: "RTMPose ankles (preferred) or YOLO pose → track.foot_point; bbox bottom-center fallback",
    status: "partial",
    statusLabel: "Wired · OVERLAY_BOX_STYLE=foot",
  },
  {
    id: "ntp-sync",
    name: "NTP + frame timestamps",
    role: "Multi-cam sync",
    unlocks: "Prerequisite for cross-cam handoff",
    status: "next",
    statusLabel: "Top 5 · integrate next",
  },
  {
    id: "homography",
    name: "Floor homography",
    role: "Calibration",
    unlocks: "Overlap gates for fusion & metric velocity",
    status: "next",
    statusLabel: "Top 5 · integrate next",
  },
  {
    id: "osnet",
    name: "OSNet cross-camera ReID",
    role: "Handoff",
    unlocks: "Cam A→B follow without face gallery — weight present, default-off",
    status: "next",
    statusLabel: "Weight ready · not wired",
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

/** Every planned capability from models pack + intelligence briefs — nothing silent. */
export const FULL_SCOPE_MATRIX: ScopeRow[] = [
  {
    id: "det-n",
    capability: "Person detect (YOLO26n)",
    planned: "Docker fast-tier boxes",
    maturity: "Live",
    weightOrCode: "models/yolo26n.pt",
    notes: "EDGE_PERF_MODE=fast default",
  },
  {
    id: "det-s",
    capability: "Person detect (YOLO26s)",
    planned: "Quality when DETECTOR_BACKEND=yolo26",
    maturity: "Live",
    weightOrCode: "models/yolo26s.pt",
    notes: "AGPL YOLO quality alternate",
  },
  {
    id: "det-rfdetr",
    capability: "Person detect (RF-DETR-N/S)",
    planned: "Apache SOTA via DETECTOR_BACKEND=rfdetr",
    maturity: "Partial",
    weightOrCode: "rfdetr · rf-detr-nano.pth",
    notes: "LIVE when selected+loaded; else PACKED/OFF · quality default",
  },
  {
    id: "track",
    capability: "ByteTrack IDs",
    planned: "All counting / dwell",
    maturity: "Live",
    weightOrCode: "src/perception/tracker.py",
    notes: "ID switches inflate uniques",
  },
  {
    id: "tripwire",
    capability: "Tripwire entries/exits",
    planned: "Footfall",
    maturity: "Live",
    weightOrCode: "Calibration Studio",
    notes: "Needs line per cam",
  },
  {
    id: "zones",
    capability: "Dwell / queue / staff zones",
    planned: "Polygons",
    maturity: "Live",
    weightOrCode: "Calibration Studio",
    notes: "Staff sticky tags",
  },
  {
    id: "heat",
    capability: "Floor heatmap",
    planned: "Person-seconds",
    maturity: "Live",
    weightOrCode: "/api/v1/heatmap",
    notes: "Per camera",
  },
  {
    id: "pose",
    capability: "YOLO26m pose",
    planned: "Phone / posture",
    maturity: "Partial",
    weightOrCode: "models/yolo26m-pose.pt",
    notes: "Gated · quality mode; ankles still Partial glue",
  },
  {
    id: "yunet",
    capability: "YuNet face boxes",
    planned: "Demographics crop",
    maturity: "Partial",
    weightOrCode: "models/onnx/yunet…",
    notes: "Gated · quality; never identity product",
  },
  {
    id: "age",
    capability: "Age/gender ViT (+INT8)",
    planned: "k-anon cohorts",
    maturity: "Partial",
    weightOrCode: "models/onnx/age_gender_vit*.onnx",
    notes: "Gated · quality; k ≥ 10",
  },
  {
    id: "head",
    capability: "Head-pose facing",
    planned: "Engaged dwell proxy",
    maturity: "Partial",
    weightOrCode: "SolvePnP code",
    notes: "Gated with face tier · not pupil gaze",
  },
  {
    id: "world",
    capability: "YOLO-World products",
    planned: "Near-display interest",
    maturity: "Partial",
    weightOrCode: "yolov8s-worldv2.pt + openai-clip",
    notes: "Gated · quality; category not SKU OCR",
  },
  {
    id: "groups",
    capability: "Solo vs group",
    planned: "Proximity geometry",
    maturity: "Partial",
    weightOrCode: "src/analytics/groups.py",
    notes: "Gated with enrichment · no faces",
  },
  {
    id: "win-stop",
    capability: "Window stop ≥4s",
    planned: "Stop rate / funnel",
    maturity: "Partial",
    weightOrCode: "to-integrate/window-stop-velocity",
    notes: "Demo % labeled",
  },
  {
    id: "ocsort",
    capability: "OC-SORT / BoT-SORT",
    planned: "Fewer ID switches",
    maturity: "Integrate next",
    weightOrCode: "pack/02-tracking README",
    notes: "Code deps; no weight yet",
  },
  {
    id: "ankles",
    capability: "Pose ankle foot-points",
    planned: "Better zone grounding",
    maturity: "Partial",
    weightOrCode: "Existing pose weight",
    notes: "Wire into foot_point",
  },
  {
    id: "ntp",
    capability: "NTP + capture_ts",
    planned: "Multi-cam time gate",
    maturity: "Integrate next",
    weightOrCode: "Infra + StreamReader",
    notes: "Blocks honest fusion",
  },
  {
    id: "homo",
    capability: "Floor homography",
    planned: "Overlap / velocity",
    maturity: "Integrate next",
    weightOrCode: "Calibration Studio UX",
    notes: "Not in API yet",
  },
  {
    id: "yolo-n-pack",
    capability: "Pack YOLO26n doorway A/B",
    planned: "Pack path switch",
    maturity: "Live",
    weightOrCode: "pack/01-detection/yolo26n.pt",
    notes: "Same family as fast default",
  },
  {
    id: "osnet-i",
    capability: "OSNet intra-cam repair",
    planned: "ID-switch soft fix",
    maturity: "Integrate next",
    weightOrCode: "pack/03-reid/osnet…",
    notes: "Default-off · privacy",
  },
  {
    id: "osnet-x",
    capability: "OSNet cross-cam ReID",
    planned: "Cam A→B handoff",
    maturity: "Integrate next",
    weightOrCode: "Same pack weight",
    notes: "Needs NTP + overlaps first",
  },
  {
    id: "fusion",
    capability: "Adjacent-cam handoff fusion",
    planned: "global_person_id",
    maturity: "Future",
    weightOrCode: "to-integrate dossier",
    notes: "After OSNet stack",
  },
  {
    id: "consensus",
    capability: "Storewide occupancy consensus",
    planned: "Deduped headcount",
    maturity: "Future",
    weightOrCode: "API change",
    notes: "Today sums cameras",
  },
  {
    id: "journey",
    capability: "Multi-cam journey graph",
    planned: "Path stitch",
    maturity: "Future",
    weightOrCode: "multicam-journey-graph",
    notes: "After fusion",
  },
  {
    id: "clahe",
    capability: "CLAHE low-light",
    planned: "Doorway lighting",
    maturity: "Integrate next",
    weightOrCode: "OpenCV preprocess",
    notes: "No weight",
  },
  {
    id: "paths",
    capability: "Zone path transition graph",
    planned: "Path popularity",
    maturity: "Integrate next",
    weightOrCode: "Analytics + API",
    notes: "Single-cam first",
  },
  {
    id: "drift",
    capability: "Occupancy drift resync",
    planned: "Long-session trust",
    maturity: "Integrate next",
    weightOrCode: "Dual estimator",
    notes: "Tripwire + tracks",
  },
  {
    id: "lanes",
    capability: "Queue service lanes",
    planned: "ETA / abandon",
    maturity: "Integrate next",
    weightOrCode: "Queue polygons",
    notes: "Config deepen",
  },
  {
    id: "seg",
    capability: "Seg foot-mask salvage",
    planned: "Sparse feet",
    maturity: "Integrate next",
    weightOrCode: "models/yolo26m-seg.pt",
    notes: "On disk · optional",
  },
  {
    id: "staff-app",
    capability: "Appearance staff exclusion",
    planned: "Beyond staff polygon",
    maturity: "Integrate next",
    weightOrCode: "Badge YOLO or OSNet",
    notes: "No face gallery",
  },
  {
    id: "shelf",
    capability: "Shelf display engagement upgrade",
    planned: "Fixture polys + vocab",
    maturity: "Integrate next",
    weightOrCode: "YOLO-World packs",
    notes: "Not barcode POS",
  },
  {
    id: "patterns",
    capability: "Weekly / seasonal motifs",
    planned: "Pattern mining",
    maturity: "Learns",
    weightOrCode: "Rollup job",
    notes: "Demo UI · 4–12w+",
  },
  {
    id: "forecast",
    capability: "Footfall / queue forecast",
    planned: "Predictions",
    maturity: "Demo",
    weightOrCode: "Dashboard fixtures",
    notes: "Illustrative bands",
  },
  {
    id: "alerts",
    capability: "Owner-action alerts",
    planned: "Ops / loss-risk / safety",
    maturity: "Demo",
    weightOrCode: "Dashboard heuristics",
    notes: "Not perfect theft / FR",
  },
  {
    id: "pos",
    capability: "Conversion / basket / ROI",
    planned: "Commerce KPIs",
    maturity: "Not CV",
    weightOrCode: "POS join",
    notes: "Never claim from CCTV alone",
  },
  {
    id: "e2e",
    capability: "End-to-end multi-cam transformer",
    planned: "Research",
    maturity: "Future",
    weightOrCode: "to-integrate/future/",
    notes: "Not scheduled",
  },
  {
    id: "face-reid",
    capability: "Face ReID / CRM identity",
    planned: "Product forbid",
    maturity: "Blocked",
    weightOrCode: "—",
    notes: "DPDP biometric · out of scope",
  },
]

export const PIPELINE_STAGES = [
  { step: "1", title: "Detect", detail: "YOLO26 person detect → foot / skeleton overlay" },
  { step: "2", title: "Track", detail: "ByteTrack IDs · dwell & crossings" },
  { step: "3", title: "Zones / queues", detail: "Polygons · tripwires · heatmap cells · staff tags" },
  { step: "4", title: "Enrichment", detail: "Pose · YuNet · age/gender k-anon · head facing · YOLO-World · groups" },
  { step: "5", title: "Metrics API", detail: "EdgeSight :8000 → this dashboard when online" },
]

export const DUAL_DEPLOYMENT = {
  edge: "Edge AI — frames stay on-prem; anonymised events leave; works when the line drops.",
  cloud: "Cloud processing — same pass/stop/enter signals; faster multi-store; contract retention.",
  shared: "Both paths DPDP (India) + GDPR aligned. No facial identity product on either path.",
}

export const HONESTY_BARS = [
  "Marketing /dashboard mixes EdgeSight live signals (when Docker is up) with showcase fixtures for storefront storytelling.",
  "Window stop rate remains Partial until the ≥4s velocity rule ships — demo % stays labeled.",
  "Multi-cam occupancy today sums cameras — ReID / fusion / consensus are Future (weights may be on disk, not wired).",
  "Loss-risk alerts are heuristics, not perfect theft detection. No facial identity product.",
  "Forecasts and long-horizon patterns are illustrative until enough rollup history exists.",
  "Deploy Edge or Cloud — same product language; privacy controls on both.",
]

/** Segregated next-integrate weights — ADLabs-dev `models/pack/` (mefake/integration). */
export const PACK_FOLDERS: {
  id: string
  folder: string
  role: string
  weight: string
  status: string
  url?: string
}[] = [
  {
    id: "det-n",
    folder: "01-detection/yolo26n/",
    role: "Doorway fast detector",
    weight: "yolo26n.pt",
    status: "Present · not prod-wired",
    url: "https://github.com/ultralytics/assets/releases/download/v8.4.0/yolo26n.pt",
  },
  {
    id: "track",
    folder: "02-tracking/",
    role: "OC-SORT / BoT-SORT",
    weight: "(code deps)",
    status: "README only · missing weight N/A",
  },
  {
    id: "reid",
    folder: "03-reid/osnet-x0_25/",
    role: "Soft ReID (privacy-gated)",
    weight: "osnet_x0_25_msmt17.pt",
    status: "Present · default-off",
    url: "https://huggingface.co/paulosantiago/osnet_x0_25_msmt17/resolve/main/osnet_x0_25_msmt17.pt",
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
    url: "https://github.com/ultralytics/assets/releases/download/v8.4.0/yolo26m-seg.pt",
  },
]

export const PACK_RUN_HINTS = {
  downloadProd: "python scripts/download_models.py",
  download: "python scripts/download_pack_models.py",
  docker: "docker compose -f docker-compose.yml -f docker-compose.pack.yml up -d",
  mount: "models/pack → /app/models/pack (read-only)",
  branch: "ADLabs-dev · mefake/integration",
}
