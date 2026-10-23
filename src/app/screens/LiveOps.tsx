"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  ChevronDown, Crosshair, Radio, RefreshCw, Layers, Video,
} from "lucide-react"
import { Panel, Chip, ScreenHeader } from "../ui"
import { AreaChart } from "../charts"
import { useEdgeSight } from "../../hooks/useEdgeSight"
import { LiveSegment } from "../../components/LiveSegment"
import {
  EDGE_SIGHT_OPS_EMBED,
  EDGE_SIGHT_PORTAL_CALIB,
} from "../../lib/edgesight"
import { LiveVision } from "../../components/LiveVision"
import { LiveStoreBrief } from "../../components/LiveStoreBrief"
import { LiveModelsStrip } from "../../components/LiveModelsStrip"
import { RetailIntelligenceDrawer } from "../../components/RetailIntelligenceDrawer"
import { JourneyHealth } from "../../components/JourneyHealth"
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
  if (!live) return <Chip tone="gold">Offline · start cameras</Chip>
  const age =
    ageSeconds != null && Number.isFinite(ageSeconds)
      ? `Updated ${Math.max(0, Math.round(ageSeconds))}s ago`
      : "Updated just now"
  if (queueAlert) {
    return <Chip tone="gold" title="Queue alert from live camera">Queue alert · {age}</Chip>
  }
  return <Chip tone="neutral" title="Shared live clock for every number on this page">{age}</Chip>
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

function coachLine(present: number | null, inn: number | null, out: number | null, needsEntrance: boolean): string {
  if (present != null && present > 0 && needsEntrance) {
    return "People visible — mark an entrance tripwire to count entries."
  }
  if (present != null && present > 0 && (inn ?? 0) === 0 && (out ?? 0) === 0) {
    return "People visible — mark an entrance tripwire to count entries."
  }
  if (present != null && present === 0 && (inn ?? 0) === 0) {
    return "Floor looks empty right now — watch the video; Present should rise when someone walks in."
  }
  if ((inn ?? 0) > 0 || (out ?? 0) > 0) {
    return "In and Out move only when someone crosses the entrance line you drew."
  }
  return "Present is who is on camera now. In / Out need an entrance line."
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
  const queueAlert = live && Boolean(edge.status?.live?.queue_alert_active)

  const needsEntrance = edge.heroFlow.needsEntranceTripwire
  const needsZones = useMemo(() => {
    const noPolygons = edge.calibratedZones.length === 0 && edge.tripwireCount === 0
    const people = edge.peopleNow
    const kpisFlat =
      live &&
      (people == null || people === 0) &&
      edge.tripwireCount === 0
    return noPolygons || kpisFlat || needsEntrance
  }, [edge.calibratedZones.length, edge.peopleNow, edge.tripwireCount, live, needsEntrance])

  const streamCam = useMemo(() => {
    const fromLive = edge.status?.live?.camera_id
    if (fromLive) return fromLive
    return cams[0] ?? "cam_entrance_01"
  }, [cams, edge.status?.live?.camera_id])

  const detectorName = edge.status?.live?.models?.person_detector ?? "Person detector"
  const inferFps = edge.status?.live?.infer_fps
  const displayFps =
    edge.status?.live?.display_fps ?? edge.status?.live?.decode_fps ?? null

  const coach = coachLine(
    edge.heroFlow.peoplePresent,
    edge.heroFlow.entriesIn,
    edge.heroFlow.exitsOut,
    needsEntrance,
  )

  useEffect(() => {
    const initial = initialPanel ?? readPanelFromUrl()
    setTab(initial)
    if (initial === "ops") setAdvancedOpen(true)
    if (typeof window === "undefined") return
    const url = new URL(window.location.href)
    if (url.searchParams.has("industry")) {
      url.searchParams.delete("industry")
      window.history.replaceState({}, "", url.toString())
    }
    try {
      window.localStorage.removeItem("adlabs.live.industry")
    } catch {
      /* ignore */
    }
    const q = url.searchParams
    if (q.get("segment") || q.get("retail") === "1") {
      setMoreOpen(true)
    }
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

  const queueLen = edge.queueLength
  const staffNow = edge.status?.live?.staff_now ?? null
  const hasQueueZone = edge.calibratedZones.some((z) => z.type === "queue")
  const hasStaffZone = edge.calibratedZones.some((z) => z.type === "staff")

  return (
    <div className="flex flex-col gap-6">
      <ScreenHeader
        icon={Radio}
        eyebrow="Live"
        title="Live floor"
        sub="Watch the camera, check who is Present, then fix zones if counts stall."
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

      {/* Start here — new-user flow */}
      {tab === "video" ? (
        <div
          className="rounded-2xl border border-[var(--app-line)] px-4 py-3 sm:px-5"
          style={{ background: "var(--app-card)" }}
        >
          <p className="font-inter cosmic-text-2xs font-bold uppercase tracking-[0.16em] text-[var(--app-faint)]">
            Start here
          </p>
          <ol className="mt-2 grid gap-2 sm:grid-cols-3">
            {[
              { n: "1", t: "Watch video", d: "Boxes should follow people on the stream." },
              { n: "2", t: "Check Present", d: "Present rises when someone is on camera — no line needed." },
              {
                n: "3",
                t: "Set up zones if stuck",
                d: "If Present > 0 but In/Out stay 0, mark an entrance tripwire.",
              },
            ].map((s) => (
              <li key={s.n} className="flex gap-2.5">
                <span
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full font-num cosmic-text-xs font-bold"
                  style={{ background: "var(--app-accent-soft)", color: "var(--app-accent)" }}
                >
                  {s.n}
                </span>
                <div>
                  <p className="font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">{s.t}</p>
                  <p className="font-inter cosmic-text-xs text-[var(--app-faint)]">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {/* Guided tabs: Live · Set up zones · Advanced */}
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
                >
                  <Layers size={12} />
                  Full model catalog
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {tab === "video" ? (
        <>
          {/* A. Watch */}
          <section className="space-y-2" aria-label="Watch">
            <div className="flex flex-wrap items-end justify-between gap-2 px-0.5">
              <div>
                <p className="font-inter cosmic-text-2xs font-bold uppercase tracking-[0.16em] text-[var(--app-faint)]">
                  A · Watch
                </p>
                <p className="font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">
                  Camera feed with people boxes
                </p>
              </div>
              <p className="font-inter cosmic-text-xs text-[var(--app-sub)]">
                {live
                  ? `${detectorName} · infer ${inferFps != null ? `${inferFps}` : "—"} fps · display ${displayFps != null ? `${displayFps}` : "—"} fps`
                  : "Waiting for camera…"}
              </p>
            </div>
            <LiveVision cameraId={streamCam} videoOnly />
          </section>

          {/* B. Now */}
          <section className="space-y-3" aria-label="Now">
            <div className="px-0.5">
              <p className="font-inter cosmic-text-2xs font-bold uppercase tracking-[0.16em] text-[var(--app-faint)]">
                B · Now
              </p>
              <p className="font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">
                In · Present · Out
              </p>
              <p className="mt-1 font-inter cosmic-text-xs leading-relaxed text-[var(--app-sub)]">
                {coach}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <LiveSegment
                title="In"
                brief="People who crossed the entrance line into the store (this session)."
                value={edge.heroFlow.entriesIn}
                empty={!live || edge.heroFlow.entriesIn == null}
              />
              <LiveSegment
                title="Present"
                brief="People on camera right now — should move with the boxes."
                value={edge.heroFlow.peoplePresent}
                empty={!live || edge.heroFlow.peoplePresent == null}
              />
              <LiveSegment
                title="Out"
                brief="People who crossed the entrance line leaving (this session)."
                value={edge.heroFlow.exitsOut}
                empty={!live || edge.heroFlow.exitsOut == null}
              />
            </div>

            {needsEntrance ? (
              <div
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3"
                style={{
                  borderColor: "var(--app-gold)",
                  background: "color-mix(in srgb, var(--app-gold) 10%, transparent)",
                }}
              >
                <p className="font-inter cosmic-text-sm text-[var(--app-text)]">
                  People are on camera, but In/Out stay at 0 until you mark an entrance line.
                </p>
                <button
                  type="button"
                  onClick={() => selectTab("calib")}
                  className="inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 font-inter cosmic-text-xs font-bold"
                  style={{
                    borderColor: "var(--app-gold)",
                    color: "var(--app-gold)",
                    background: "var(--app-card)",
                  }}
                >
                  <Crosshair size={14} />
                  Mark entrance tripwire
                </button>
              </div>
            ) : null}

            {edge.presentSpark.length >= 5 ? (
              <Panel
                title="Present over time"
                sub="From the live camera only — fills after a few seconds."
              >
                <AreaChart data={edge.presentSpark} peaks={[]} height={140} unitLabel="people" />
              </Panel>
            ) : live ? (
              <Panel title="Present over time" sub="Chart appears after a few seconds of video — never empty axes.">
                <p className="font-inter cosmic-text-xs text-[var(--app-faint)]">
                  Collecting… {edge.liveHistory.length}/5
                </p>
              </Panel>
            ) : null}
          </section>

          {/* C. Models */}
          <section className="space-y-2" aria-label="Models">
            <div className="px-0.5">
              <p className="font-inter cosmic-text-2xs font-bold uppercase tracking-[0.16em] text-[var(--app-faint)]">
                C · Models
              </p>
            </div>
            <LiveModelsStrip />
          </section>

          <LiveStoreBrief
            online={live}
            live={edge.status?.live}
            journey={edge.status?.live?.journey}
            error={edge.status?.error}
          />

          {/* More insights — collapsed; Needs… never fake digits */}
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
                  Queue · staff · journey · retail floor roles — open when you need them
                </p>
              </div>
              <ChevronDown
                size={16}
                className="shrink-0 text-[var(--app-faint)] transition-transform"
                style={{ transform: moreOpen ? "rotate(180deg)" : undefined }}
              />
            </button>

            {moreOpen ? (
              <div className="space-y-5 border-t border-[var(--app-line)] px-4 py-4 sm:px-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <LiveSegment
                    title="Queue"
                    brief="How many people are waiting in a queue zone."
                    value={
                      !live
                        ? null
                        : hasQueueZone
                          ? displayMetric(queueLen)
                          : null
                    }
                    empty={!live || !hasQueueZone || queueLen == null}
                    needsHint={
                      live && !hasQueueZone
                        ? "Needs: draw a queue polygon in Set up zones"
                        : undefined
                    }
                  />
                  <LiveSegment
                    title="Staff on floor"
                    brief="People standing in a staff zone (not face ID)."
                    value={
                      !live
                        ? null
                        : hasStaffZone
                          ? displayMetric(staffNow)
                          : null
                    }
                    empty={!live || !hasStaffZone || staffNow == null}
                    needsHint={
                      live && !hasStaffZone
                        ? "Needs: draw a staff polygon in Set up zones"
                        : undefined
                    }
                  />
                  <LiveSegment
                    title="Retail roles"
                    brief="Entrance → path → dwell → queue → staff → shelf."
                    value={null}
                    empty
                    needsHint="Open the floor-role panel below for each role’s live value or Needs…"
                  />
                </div>

                <JourneyHealth
                  journey={edge.status?.live?.journey}
                  online={live}
                />

                <RetailIntelligenceDrawer embedded />
              </div>
            ) : null}
          </div>
        </>
      ) : tab === "calib" ? (
        <OpsFrame
          eyebrow="Zone editor"
          title="Set up zones"
          live={live}
        >
          {live ? (
            <iframe
              title="Set up zones"
              src={EDGE_SIGHT_PORTAL_CALIB}
              className="h-[min(72vh,720px)] w-full border-0"
              allow="clipboard-read; clipboard-write"
            />
          ) : (
            <OfflineHint name="Zone editor" />
          )}
        </OpsFrame>
      ) : tab === "ops" ? (
        <OpsFrame eyebrow="Advanced" title="Ops tools" live={live}>
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
    </div>
  )
}

function OfflineHint({ name }: { name: string }) {
  return (
    <div className="flex h-[420px] flex-col items-center justify-center gap-3 px-6 text-center">
      <Radio size={28} className="text-[var(--app-faint)]" />
      <p className="font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">{name} is offline</p>
      <p className="max-w-md font-inter cosmic-text-xs text-[var(--app-faint)]">
        Start the EdgeSight cameras (Docker on this machine), then refresh. Stay on this portal — video and numbers arrive here.
      </p>
    </div>
  )
}
