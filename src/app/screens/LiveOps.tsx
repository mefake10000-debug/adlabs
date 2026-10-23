"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  ChevronDown, Crosshair, Radio, RefreshCw, Layers, Video,
} from "lucide-react"
import { Panel, Chip, ScreenHeader } from "../ui"
import { useEdgeSight } from "../../hooks/useEdgeSight"
import { LiveSegment } from "../../components/LiveSegment"
import { DUAL_DEPLOYMENT } from "../../data/models-pack"
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

/** Single header status chip: connection / sync age · colored only for real alerts. */
function SyncChip({
  live,
  checking,
  ageSeconds,
  queueAlert,
}: {
  live: boolean
  checking: boolean
  ageSeconds: number | null
  queueAlert: boolean
}) {
  if (checking) return <Chip tone="neutral">Checking…</Chip>
  if (!live) return <Chip tone="gold">Offline · start Docker</Chip>
  const age =
    ageSeconds != null && Number.isFinite(ageSeconds)
      ? `Updated ${Math.max(0, Math.round(ageSeconds))}s ago`
      : "Updated just now"
  if (queueAlert) {
    return (
      <Chip tone="gold" title="queue_alert_active · same live snapshot as In/Present/Out">
        Queue alert · {age}
      </Chip>
    )
  }
  return (
    <Chip tone="neutral" title="Shared live/state snapshot age — one poll clock for all visible numbers">
      {age}
    </Chip>
  )
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
        {!live ? <Chip tone="gold">Offline</Chip> : null}
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
  const refresh = edge.refresh
  const [tab, setTab] = useState<PanelId>("video")
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const cams = edge.status?.cameras ?? []
  const state: "checking" | "live" | "down" = edge.loading && !edge.status ? "checking" : live ? "live" : "down"
  const badges = edge.sectionBadges
  const queueAlert = live && Boolean(edge.status?.live?.queue_alert_active)

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
        sub="Video · In / Present / Out · store brief. Values stay — / 0 until /api/v1/live answers."
      >
        <SyncChip
          live={live}
          checking={state === "checking"}
          ageSeconds={edge.connectivityAgeSeconds}
          queueAlert={queueAlert}
        />
        <button
          type="button"
          onClick={() => void refresh()}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--app-line)] px-3 py-1.5 font-inter cosmic-text-xs font-semibold text-[var(--app-sub)]"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </ScreenHeader>

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

          <div className="ml-auto flex flex-col items-stretch gap-1 sm:items-end">
            <button
              type="button"
              onClick={() => {
                if (tab === "ops" || tab === "models") {
                  setAdvancedOpen((o) => !o)
                } else {
                  setAdvancedOpen(true)
                  selectTab("ops")
                }
              }}
              className="inline-flex items-center gap-1.5 self-end rounded-lg px-2.5 py-1.5 font-inter cosmic-text-xs font-semibold text-[var(--app-faint)] transition-colors hover:text-[var(--app-sub)]"
              style={{
                color: tab === "ops" || tab === "models" ? "var(--app-sub)" : undefined,
                background: tab === "ops" || tab === "models" ? "var(--app-raise)" : "transparent",
              }}
              aria-expanded={advancedOpen || tab === "ops" || tab === "models"}
            >
              Advanced
              <ChevronDown
                size={14}
                className="transition-transform"
                style={{
                  transform:
                    advancedOpen || tab === "ops" || tab === "models" ? "rotate(180deg)" : undefined,
                }}
              />
            </button>
            {(advancedOpen || tab === "ops" || tab === "models") && (
              <div className="flex flex-wrap justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => selectTab("ops")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--app-line)] px-2.5 py-1.5 font-inter cosmic-text-2xs font-semibold transition-colors"
                  style={{
                    background: tab === "ops" ? "var(--app-raise)" : "transparent",
                    color: tab === "ops" ? "var(--app-text)" : "var(--app-faint)",
                  }}
                  aria-current={tab === "ops" ? "page" : undefined}
                >
                  Ops tools
                </button>
                <button
                  type="button"
                  onClick={() => selectTab("models")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--app-line)] px-2.5 py-1.5 font-inter cosmic-text-2xs font-semibold transition-colors"
                  style={{
                    background: tab === "models" ? "var(--app-raise)" : "transparent",
                    color: tab === "models" ? "var(--app-text)" : "var(--app-faint)",
                  }}
                  aria-current={tab === "models" ? "page" : undefined}
                >
                  <Layers size={12} />
                  Models status
                </button>
              </div>
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
        <>
          <LiveVision cameraId={streamCam} videoOnly />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <LiveSegment
              title="In"
              brief="Session tripwire IN."
              value={edge.heroFlow.entriesIn}
              sourcePath={edge.heroFlow.entriesPath}
              empty={!live || edge.heroFlow.entriesIn == null}
            />
            <LiveSegment
              title="Present"
              brief="Active customer tracks."
              value={edge.heroFlow.peoplePresent}
              sourcePath={edge.heroFlow.presentPath}
              empty={!live || edge.heroFlow.peoplePresent == null}
            />
            <LiveSegment
              title="Out"
              brief="Session tripwire OUT."
              value={edge.heroFlow.exitsOut}
              sourcePath={edge.heroFlow.exitsPath}
              empty={!live || edge.heroFlow.exitsOut == null}
            />
          </div>

          <LiveStoreBrief
            online={live}
            live={edge.status?.live}
            journey={edge.status?.live?.journey}
            error={edge.status?.error}
          />

          <div
            className="rounded-2xl border border-[var(--app-line)]"
            style={{ background: "var(--app-card)" }}
          >
            <button
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left sm:px-5"
              aria-expanded={moreOpen}
            >
              <div>
                <p className="font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">
                  More insights
                </p>
                <p className="font-inter cosmic-text-xs text-[var(--app-faint)]">
                  Industry modes · journey · queue/FPS · parity · playbooks
                </p>
              </div>
              <ChevronDown
                size={16}
                className="shrink-0 text-[var(--app-faint)] transition-transform"
                style={{ transform: moreOpen ? "rotate(180deg)" : undefined }}
              />
            </button>

            {moreOpen ? (
              <div className="space-y-4 border-t border-[var(--app-line)] px-4 py-4 sm:px-5">
                <IndustryModesPanel />

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <LiveSegment
                    title="Queue"
                    brief="People in queue polygons."
                    value={
                      live
                        ? `${displayMetric(edge.queueLength)}${edge.status?.live?.queue_alert_active ? " · alert" : ""}`
                        : null
                    }
                    sourcePath="/api/v1/live · queue_length"
                  />
                  <LiveSegment
                    title="Infer FPS"
                    brief="Detect+track cadence."
                    value={edge.status?.live?.infer_fps ?? edge.status?.device?.pipeline_fps ?? null}
                    sourcePath="/api/v1/live · infer_fps"
                  />
                  <LiveSegment
                    title="Cameras"
                    brief="From cameras.yaml / live.cameras."
                    value={live ? cams.length : null}
                    sourcePath={cams.length ? cams.join(", ") : "/api/v1/cameras"}
                  />
                  <LiveSegment
                    title="Zones · tripwires"
                    brief="Polygons that drive In / Present / Out."
                    value={live ? `${edge.calibratedZones.length} · ${edge.tripwireCount} trip` : null}
                    sourcePath="/api/v1/config/cameras"
                  />
                </div>

                <JourneyHealth online={live} journey={edge.status?.live?.journey} />

                <div className="grid gap-4 lg:grid-cols-2">
                  <AccountingFutureCard />
                  <IntelligenceParityPanel sectionBadges={badges} />
                </div>
              </div>
            ) : null}
          </div>
        </>
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
      ) : (
        <ModelsStatusPanel embedded />
      )}

      <Panel
        title="How to run EdgeSight"
        sub="Friend-reviewed mefake/integration only — never push NuclearQuince or rajendrac3 main."
        action={
          <a href={EDGE_SIGHT_PORTAL_DOCS} className="font-inter cosmic-text-xs font-semibold text-[var(--app-accent)]">
            API docs
          </a>
        }
      >
        <pre className="overflow-x-auto rounded-2xl border border-[var(--app-line)] bg-[var(--app-raise)] p-4 font-mono cosmic-text-xs leading-relaxed text-[var(--app-sub)]">
{`cd ~/Desktop/ad-labs-project/repos/ADLabs-dev
git checkout mefake/integration
python scripts/download_models.py
python scripts/download_pack_models.py
docker compose up -d

# Portal (only URL you need):
#   http://localhost:3000/dashboard/live
#   http://localhost:3000/dashboard/live?panel=calib
#   http://localhost:3000/dashboard/live?panel=ops
#   http://localhost:3000/dashboard/live?panel=models`}
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
