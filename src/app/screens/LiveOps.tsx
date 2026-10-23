"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { motion } from "framer-motion"
import {
  ChevronDown, Crosshair, Radio, RefreshCw, CheckCircle2, AlertCircle, Layers, Video,
} from "lucide-react"
import { Panel, Chip, ScreenHeader, Label } from "../ui"
import { useEdgeSight } from "../../hooks/useEdgeSight"
import { DataBadge } from "../../components/DataBadge"
import { LiveSegment } from "../../components/LiveSegment"
import { DUAL_DEPLOYMENT, FULL_SCOPE_MATRIX } from "../../data/models-pack"
import {
  EDGE_SIGHT_OPS_EMBED,
  EDGE_SIGHT_PORTAL_CALIB,
  EDGE_SIGHT_PORTAL_DOCS,
} from "../../lib/edgesight"
import { LiveVision } from "../../components/LiveVision"
import { IntelligenceParityPanel } from "../../components/IntelligenceParityPanel"
import { IndustryModesPanel } from "../../components/IndustryModesPanel"
import { JourneyHealth } from "../../components/JourneyHealth"
import { LiveStoreBrief } from "../../components/LiveStoreBrief"
import { AccountingFutureCard } from "../../components/AccountingFutureCard"
import { ModelsStatusPanel } from "./Pipeline"
import { displayMetric } from "../../lib/data-freshness"

const LIVE_COUNT = FULL_SCOPE_MATRIX.filter((r) => r.maturity === "Live").length
const FUTURE_COUNT = FULL_SCOPE_MATRIX.filter((r) => r.maturity === "Future" || r.maturity === "Blocked").length
const NEXT_COUNT = FULL_SCOPE_MATRIX.filter((r) => r.maturity === "Integrate next" || r.maturity === "Partial").length

type PanelId = "video" | "calib" | "ops" | "models"

function readPanelFromUrl(): PanelId {
  if (typeof window === "undefined") return "video"
  const q = new URLSearchParams(window.location.search).get("panel")
  if (q === "calib" || q === "ops" || q === "video" || q === "models") return q
  const path = window.location.pathname
  if (path.endsWith("/calibrate")) return "calib"
  if (path.endsWith("/ops")) return "ops"
  if (path.includes("pipeline") || path.includes("models")) return "models"
  return "video"
}

function flowHint(tab: PanelId, needsZones: boolean, live: boolean): { here: string; next: string } {
  if (tab === "calib") {
    return {
      here: "Set up zones — draw tripwires and floor polygons",
      next: "Return to Live to watch In / Present / Out",
    }
  }
  if (tab === "ops") {
    return {
      here: "Advanced — edge ops tools",
      next: "Day-to-day watching stays on Live",
    }
  }
  if (tab === "models") {
    return {
      here: "Models status — pack maturity + live node",
      next: "Return to Live to watch In / Present / Out",
    }
  }
  if (!live) {
    return {
      here: "Live — waiting for EdgeSight",
      next: "Start Docker, then refresh",
    }
  }
  if (needsZones) {
    return {
      here: "Live — video + KPIs",
      next: "Set up zones so In / Present / Out can count",
    }
  }
  return {
    here: "Live — video + KPIs",
    next: "Watch the floor; open Set up zones only to edit polygons",
  }
}

function OpsFrame({
  title,
  eyebrow,
  live,
  children,
}: {
  title: string
  eyebrow: string
  live: boolean
  children: ReactNode
}) {
  return (
    <Panel pad={false} className="overflow-hidden">
      <header className="flex flex-wrap items-center gap-3 border-b border-[var(--app-line)] px-5 py-4 sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="font-inter cosmic-text-2xs font-bold uppercase tracking-[0.18em] text-[var(--app-faint)]">
            {eyebrow}
          </p>
          <h2 className="font-inter cosmic-text-base font-bold text-[var(--app-text)]">{title}</h2>
        </div>
        <Chip tone={live ? "live" : "neutral"}>{live ? "EdgeSight reachable" : "Offline · start Docker"}</Chip>
      </header>
      <div className="relative bg-[var(--app-raise)]" style={{ minHeight: 420 }}>
        {children}
      </div>
    </Panel>
  )
}

export function LiveOps({ initialPanel }: { initialPanel?: PanelId } = {}) {
  const edge = useEdgeSight()
  const live = edge.online
  const detail = live
    ? edge.status?.health?.service ?? "EdgeSight API"
    : edge.status?.error ?? "Start ADLabs-dev: docker compose up -d"
  const refresh = edge.refresh
  const [tab, setTab] = useState<PanelId>("video")
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const cams = edge.status?.cameras ?? []
  const device = edge.status?.device
  const state: "checking" | "live" | "down" = edge.loading && !edge.status ? "checking" : live ? "live" : "down"
  const badges = edge.sectionBadges

  const needsZones = useMemo(() => {
    const noPolygons = edge.calibratedZones.length === 0 && edge.tripwireCount === 0
    const people = edge.peopleNow
    const kpisFlat =
      live &&
      (people == null || people === 0) &&
      edge.tripwireCount === 0
    return noPolygons || kpisFlat
  }, [edge.calibratedZones.length, edge.peopleNow, edge.tripwireCount, live])

  const hint = flowHint(tab, needsZones, live)

  const streamCam = useMemo(() => {
    const fromLive = edge.status?.live?.camera_id
    if (fromLive) return fromLive
    return cams[0] ?? "cam_entrance_01"
  }, [cams, edge.status?.live?.camera_id])

  useEffect(() => {
    const initial = initialPanel ?? readPanelFromUrl()
    setTab(initial)
    if (initial === "ops") setAdvancedOpen(true)
  }, [initialPanel])

  const selectTab = (id: PanelId) => {
    setTab(id)
    if (id === "ops") setAdvancedOpen(true)
    if (typeof window === "undefined") return
    const url = new URL(window.location.href)
    url.pathname = "/dashboard/live"
    url.searchParams.set("panel", id)
    window.history.replaceState({}, "", url.toString())
  }

  return (
    <div className="flex flex-col gap-6">
      <ScreenHeader
        icon={Radio}
        eyebrow="Live hub"
        title="Live hub"
        sub="Industry modes · Vision · Set up zones · Ops · Models. Values stay — / 0 / nil until /api/v1/live answers."
      >
        <DataBadge badge={badges.connectivity} />
        <DataBadge badge={badges.camera_wall} />
        <Chip tone={live ? "live" : "gold"}>{live ? "API healthy" : state === "checking" ? "Checking…" : "API down"}</Chip>
        {edge.connectivityAgeSeconds != null && (
          <Chip tone="neutral" title="live/state updated_epoch">
            age {edge.connectivityAgeSeconds}s
          </Chip>
        )}
        <button
          type="button"
          onClick={() => void refresh()}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--app-line)] px-3 py-1.5 font-inter cosmic-text-xs font-semibold text-[var(--app-sub)]"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </ScreenHeader>

      <IndustryModesPanel />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <LiveSegment
          title="Entries in"
          brief="Session tripwire IN — same path video detections use."
          value={edge.heroFlow.entriesIn}
          sourcePath={edge.heroFlow.entriesPath}
          badge={badges.entrance_tripwires}
          empty={!live || edge.heroFlow.entriesIn == null}
        />
        <LiveSegment
          title="People present"
          brief="Active customer tracks — matches YOLO HUD count."
          value={edge.heroFlow.peoplePresent}
          sourcePath={edge.heroFlow.presentPath}
          badge={badges.today}
          empty={!live || edge.heroFlow.peoplePresent == null}
        />
        <LiveSegment
          title="Exits"
          brief="Session tripwire OUT."
          value={edge.heroFlow.exitsOut}
          sourcePath={edge.heroFlow.exitsPath}
          badge={badges.entrance_tripwires}
          empty={!live || edge.heroFlow.exitsOut == null}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <LiveSegment
          title="Queue"
          brief="People in queue polygons · alert when congested."
          value={live ? `${displayMetric(edge.queueLength)}${edge.status?.live?.queue_alert_active ? " · alert" : ""}` : null}
          sourcePath="/api/v1/live · queue_length"
          badge={badges.queues}
        />
        <LiveSegment
          title="Infer FPS"
          brief="Detect+track cadence (MODEL). FEED tracks display/decode."
          value={edge.status?.live?.infer_fps ?? device?.pipeline_fps ?? null}
          sourcePath="/api/v1/live · infer_fps"
          badge={badges.camera_wall}
        />
        <LiveSegment
          title="Cameras"
          brief="Ordered from cameras.yaml / live.cameras."
          value={live ? cams.length : null}
          sourcePath={cams.length ? cams.join(", ") : "/api/v1/cameras"}
          badge={badges.camera_wall}
        />
        <LiveSegment
          title="Zones · tripwires"
          brief="Calibrated polygons that drive In / Present / Out."
          value={live ? `${edge.calibratedZones.length} · ${edge.tripwireCount} trip` : null}
          sourcePath="/api/v1/config/cameras"
          badge={badges.entrance_tripwires}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--app-line)] px-4 py-3"
        style={{ background: "var(--app-card)" }}
      >
        {live ? (
          <CheckCircle2 size={16} className="text-[var(--app-pos)]" />
        ) : (
          <AlertCircle size={16} className="text-[var(--app-gold)]" />
        )}
        <p className="min-w-0 flex-1 font-inter cosmic-text-xs text-[var(--app-sub)]">
          <span className="font-semibold text-[var(--app-text)]">{detail}</span>
          {" · "}
          Stay on <code className="font-mono text-[var(--app-text)]">localhost:3000/dashboard/live</code>
          {" — "}
          zone editor and advanced ops are embedded here. {DUAL_DEPLOYMENT.shared}
        </p>
        <a href={EDGE_SIGHT_PORTAL_DOCS} className="font-inter cosmic-text-xs font-semibold text-[var(--app-accent)]">
          API docs
        </a>
      </motion.div>

      <IntelligenceParityPanel sectionBadges={badges} />

      {/* Video → text: owner brief + journey health. industrySlot left for peer modes. */}
      <div className="grid gap-4 lg:grid-cols-2">
        <LiveStoreBrief
          online={live}
          live={edge.status?.live}
          journey={edge.status?.live?.journey}
          error={edge.status?.error}
        />
        <AccountingFutureCard />
      </div>
      <JourneyHealth online={live} journey={edge.status?.live?.journey} />

      {/* Guided flow: Live primary · Set up zones secondary · Advanced nested tertiary */}
      <div
        className="rounded-2xl border border-[var(--app-line)] px-4 py-3 sm:px-5"
        style={{ background: "var(--app-card)" }}
      >
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => selectTab("video")}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 font-inter cosmic-text-sm font-bold transition-colors"
            style={{
              borderColor: tab === "video" ? "var(--app-accent)" : "var(--app-line)",
              background: tab === "video" ? "var(--app-accent-soft)" : "transparent",
              color: tab === "video" ? "var(--app-accent)" : "var(--app-sub)",
              boxShadow: tab === "video" ? "0 0 0 1px var(--app-accent-soft)" : undefined,
            }}
            aria-current={tab === "video" ? "page" : undefined}
          >
            <Video size={16} />
            Live
          </button>

          <button
            type="button"
            onClick={() => selectTab("calib")}
            className="inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 font-inter cosmic-text-xs font-semibold transition-colors"
            style={{
              borderColor:
                tab === "calib"
                  ? "var(--app-accent)"
                  : needsZones
                    ? "var(--app-gold)"
                    : "var(--app-line)",
              background:
                tab === "calib"
                  ? "var(--app-accent-soft)"
                  : needsZones
                    ? "color-mix(in srgb, var(--app-gold) 12%, transparent)"
                    : "transparent",
              color:
                tab === "calib"
                  ? "var(--app-accent)"
                  : needsZones
                    ? "var(--app-gold)"
                    : "var(--app-sub)",
            }}
            aria-current={tab === "calib" ? "page" : undefined}
          >
            <Crosshair size={14} />
            Set up zones
            {needsZones && tab !== "calib" ? (
              <span className="font-inter cosmic-text-2xs font-bold uppercase tracking-wide opacity-80">
                needed
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => selectTab("models")}
            className="inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 font-inter cosmic-text-xs font-semibold transition-colors"
            style={{
              borderColor: tab === "models" ? "var(--app-accent)" : "var(--app-line)",
              background: tab === "models" ? "var(--app-accent-soft)" : "transparent",
              color: tab === "models" ? "var(--app-accent)" : "var(--app-sub)",
            }}
            aria-current={tab === "models" ? "page" : undefined}
          >
            <Layers size={14} />
            Models status
          </button>

          <div className="ml-auto flex flex-col items-stretch gap-1 sm:items-end">
            <button
              type="button"
              onClick={() => {
                if (tab === "ops") {
                  setAdvancedOpen((o) => !o)
                } else {
                  setAdvancedOpen(true)
                  selectTab("ops")
                }
              }}
              className="inline-flex items-center gap-1.5 self-end rounded-lg px-2.5 py-1.5 font-inter cosmic-text-xs font-semibold text-[var(--app-faint)] transition-colors hover:text-[var(--app-sub)]"
              style={{
                color: tab === "ops" ? "var(--app-sub)" : undefined,
                background: tab === "ops" ? "var(--app-raise)" : "transparent",
              }}
              aria-expanded={advancedOpen || tab === "ops"}
            >
              Advanced
              <ChevronDown
                size={14}
                className="transition-transform"
                style={{ transform: advancedOpen || tab === "ops" ? "rotate(180deg)" : undefined }}
              />
            </button>
            {(advancedOpen || tab === "ops") && (
              <button
                type="button"
                onClick={() => selectTab("ops")}
                className="inline-flex items-center justify-end gap-1.5 rounded-lg border border-[var(--app-line)] px-2.5 py-1.5 font-inter cosmic-text-2xs font-semibold transition-colors"
                style={{
                  borderColor: tab === "ops" ? "var(--app-line)" : "var(--app-line)",
                  background: tab === "ops" ? "var(--app-raise)" : "transparent",
                  color: tab === "ops" ? "var(--app-text)" : "var(--app-faint)",
                }}
                aria-current={tab === "ops" ? "page" : undefined}
              >
                Ops tools
              </button>
            )}
          </div>
        </div>

        <p className="mt-3 border-t border-[var(--app-line)] pt-3 font-inter cosmic-text-xs leading-relaxed text-[var(--app-sub)]">
          <span className="font-semibold text-[var(--app-text)]">You are here:</span> {hint.here}
          <span className="text-[var(--app-faint)]"> · </span>
          <span className="font-semibold text-[var(--app-text)]">Next:</span> {hint.next}
        </p>
      </div>

      {tab === "video" ? (
        <LiveVision cameraId={streamCam} />
      ) : tab === "calib" ? (
        <OpsFrame
          eyebrow="/dashboard/live/calibrate → zone editor"
          title="Set up zones"
          live={live}
        >
          {live ? (
            <iframe
              title="Set up zones — EdgeSight calibrate"
              src={EDGE_SIGHT_PORTAL_CALIB}
              className="h-[min(72vh,720px)] w-full border-0"
              allow="clipboard-read; clipboard-write"
            />
          ) : (
            <OfflineHint name="Zone editor" />
          )}
        </OpsFrame>
      ) : tab === "ops" ? (
        <div className="space-y-2">
          <div className="flex justify-end">
            <DataBadge badge={badges.legacy_ops} />
          </div>
          <OpsFrame
            eyebrow="/dashboard/live/ops · Advanced"
            title="Ops tools"
            live={live}
          >
            {live ? (
              <iframe
                title="Advanced ops tools"
                src={EDGE_SIGHT_OPS_EMBED}
                className="h-[min(72vh,720px)] w-full border-0"
              />
            ) : (
              <OfflineHint name="Ops tools" />
            )}
          </OpsFrame>
        </div>
      ) : (
        <ModelsStatusPanel embedded />
      )}

      <Panel
        title="How to run EdgeSight"
        sub="Friend-reviewed mefake/integration only — never push NuclearQuince or rajendrac3 main."
        action={
          <span className="inline-flex items-center gap-1.5 font-inter cosmic-text-xs font-semibold text-[var(--app-faint)]">
            <Layers size={12} /> Sidebar → Live hub
          </span>
        }
      >
        <pre className="overflow-x-auto rounded-2xl border border-[var(--app-line)] bg-[var(--app-raise)] p-4 font-mono cosmic-text-xs leading-relaxed text-[var(--app-sub)]">
{`cd ~/Desktop/ad-labs-project/repos/ADLabs-dev
git checkout mefake/integration
python scripts/download_models.py
python scripts/download_pack_models.py
docker compose up -d

# Portal (only URL you need):
#   http://localhost:3000/dashboard
#   http://localhost:3000/dashboard/live               ← Live hub (default)
#   http://localhost:3000/dashboard/live?panel=calib   ← Set up zones
#   http://localhost:3000/dashboard/live?panel=ops     ← Advanced · Ops tools
#   http://localhost:3000/dashboard/live?panel=models  ← Models status
# Backends (Docker only — proxied into the portal):
#   Zone editor  → /dashboard/live/calibrate  (:8000)
#   Ops tools    → /dashboard/live/ops        (:8501)`}
        </pre>
        <p className="mt-3 font-inter cosmic-text-xs text-[var(--app-faint)]">
          Edge: {DUAL_DEPLOYMENT.edge} Cloud: {DUAL_DEPLOYMENT.cloud}
        </p>
      </Panel>
    </div>
  )
}

function OfflineHint({ name }: { name: string }) {
  return (
    <div className="flex h-[420px] flex-col items-center justify-center gap-3 px-6 text-center">
      <Radio size={28} className="text-[var(--app-faint)]" />
      <p className="font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">{name} is offline</p>
      <p className="max-w-md font-inter cosmic-text-xs text-[var(--app-faint)]">
        Start ADLabs-dev with Docker Compose, then refresh this page. Stay on{" "}
        <span className="font-mono text-[var(--app-sub)]">localhost:3000/dashboard/live</span> — backends are proxied in.
      </p>
    </div>
  )
}
