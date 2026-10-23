"use client"

import {
  TrendingUp, Store, Megaphone, Map, FileText, Users,
  DoorOpen, LogOut, UserRound, Timer, Layers,
} from "lucide-react"
import { Panel, Chip, ScreenHeader } from "../ui"
import { AreaChart } from "../charts"
import { useEdgeSight } from "../../hooks/useEdgeSight"
import { LiveVision } from "../../components/LiveVision"
import { LiveSegment } from "../../components/LiveSegment"
import { displayMetric } from "../../lib/data-freshness"

const QUICK = [
  { icon: TrendingUp, label: "Live hub", screen: "liveOps" as const },
  { icon: Map, label: "Floor zones", screen: "zones" as const },
  { icon: Users, label: "Queues", screen: "queues" as const },
  { icon: Megaphone, label: "Window", screen: "campaigns" as const },
  { icon: Store, label: "Stores", screen: "stores" as const },
  { icon: FileText, label: "Brief", screen: "brief" as const },
]

export function Overview({ onNavigate }: { onNavigate?: (screen: string) => void } = {}) {
  const {
    occupancy,
    trafficHours,
    sourceChip,
    liveKpis,
    status,
    queueLength,
    connectivityAgeSeconds,
    heroFlow,
    presentSpark,
    liveHistory,
  } = useEdgeSight()
  const online = Boolean(status?.online && status.live)
  const live = status?.live
  const stale = connectivityAgeSeconds != null && connectivityAgeSeconds > 15
  const storeLabel = live?.store_id ?? "—"
  const spark = presentSpark.length >= 5 ? presentSpark : trafficHours
  const needsEntrance = heroFlow.needsEntranceTripwire

  return (
    <div className="flex flex-col gap-6">
      <ScreenHeader
        eyebrow="Live now"
        title="Today"
        sub="Same three numbers as Live: In · Present · Out — from the camera, never from a demo store."
      >
        <Chip tone={sourceChip.tone} title={sourceChip.title}>{sourceChip.label}</Chip>
        {connectivityAgeSeconds != null && (
          <Chip tone={stale ? "gold" : "neutral"}>
            {stale ? "stale · " : ""}Updated {connectivityAgeSeconds}s ago
          </Chip>
        )}
      </ScreenHeader>

      <div
        className="rounded-2xl border border-[var(--app-line)] px-4 py-3 sm:px-5"
        style={{ background: "var(--app-card)" }}
      >
        <p className="font-inter cosmic-text-2xs font-bold uppercase tracking-[0.16em] text-[var(--app-faint)]">
          How to read this page
        </p>
        <ol className="mt-2 grid gap-2 sm:grid-cols-3">
          {[
            { n: "1", t: "Watch the camera", d: "Open Live for the full video plane." },
            { n: "2", t: "Check Present", d: "Should move when people appear on camera." },
            {
              n: "3",
              t: "Fix zones if In/Out stuck",
              d: "Present > 0 with In/Out at 0 → mark an entrance tripwire.",
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <LiveSegment
          title="In"
          brief="Entrance line crossings into the store (this session)."
          value={heroFlow.entriesIn}
          empty={!online || heroFlow.entriesIn == null}
          needsHint={
            needsEntrance ? "Needs: mark entrance tripwire on Live → Set up zones" : undefined
          }
        />
        <LiveSegment
          title="Present"
          brief="People on camera right now — matches the boxes."
          value={heroFlow.peoplePresent}
          empty={!online || heroFlow.peoplePresent == null}
        />
        <LiveSegment
          title="Out"
          brief="Entrance line crossings leaving (this session)."
          value={heroFlow.exitsOut}
          empty={!online || heroFlow.exitsOut == null}
          needsHint={
            needsEntrance ? "Needs: mark entrance tripwire on Live → Set up zones" : undefined
          }
        />
      </div>

      {needsEntrance ? (
        <p className="font-inter cosmic-text-sm text-[var(--app-gold)]">
          People visible — mark an entrance tripwire to count entries.{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => onNavigate?.("liveOps")}
          >
            Open Live →
          </button>
        </p>
      ) : null}

      <LiveVision compact />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <LiveSegment
          title="Queue length"
          brief="People waiting in a queue zone."
          value={online ? displayMetric(queueLength) : null}
          needsHint={online && queueLength == null ? "Needs: queue polygon in Set up zones" : undefined}
        />
        <LiveSegment
          title="Avg wait"
          brief="Mean wait across active queue zones."
          value={online && occupancy.avgWait !== "—" ? occupancy.avgWait : null}
          needsHint={online && occupancy.avgWait === "—" ? "Needs: queue activity" : undefined}
        />
        <LiveSegment
          title="Avg dwell"
          brief="How long people stay in view / zones."
          value={online && liveKpis.dwell !== "—" ? liveKpis.dwell : null}
        />
        <LiveSegment
          title="Engaged"
          brief="Facing / attention proxy — off in fast mode."
          value={liveKpis.engagedRatio}
          needsHint={
            online && liveKpis.engagedRatio == null
              ? "Needs: quality mode (enrichment on)"
              : undefined
          }
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Panel
          title="Present over time"
          sub={
            spark.length >= 5
              ? "Live people on camera — ring buffer or hourly when available."
              : "Needs a few seconds of video — never draws empty axes."
          }
        >
          {spark.length >= 5 ? (
            <AreaChart data={spark} peaks={[]} unitLabel="people" />
          ) : (
            <EmptyBlock
              title="Collecting live samples"
              brief={
                online
                  ? `Present spark fills after ~5s of video (${liveHistory.length}/5).`
                  : "Start cameras, then return here."
              }
            />
          )}
        </Panel>
        <Panel
          title="How numbers are made"
          sub="From boxes on video to dashboard digits."
          action={<Layers size={14} className="text-[var(--app-faint)]" />}
        >
          <ol className="flex flex-col gap-3">
            {[
              {
                icon: DoorOpen,
                step: "Detect + track",
                detail: "Camera finds people and keeps short IDs on the stream.",
              },
              {
                icon: UserRound,
                step: "Present",
                detail: "Count of people boxes right now.",
              },
              {
                icon: DoorOpen,
                step: "In",
                detail: "Crossing the entrance line into the store.",
              },
              {
                icon: LogOut,
                step: "Out",
                detail: "Crossing the entrance line leaving.",
              },
              {
                icon: Timer,
                step: "Queues / zones",
                detail: "Polygons you drew → queue length and zone presence.",
              },
            ].map((row) => (
              <li key={row.step} className="flex items-start gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
                  <row.icon size={14} />
                </span>
                <div className="min-w-0">
                  <p className="font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">{row.step}</p>
                  <p className="font-inter cosmic-text-xs text-[var(--app-faint)]">{row.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <LiveSegment
          title="Floor zones"
          brief="Calibrated polygons reporting occupancy."
          value={
            online && (status?.live?.zones?.length ?? 0) > 0
              ? `${status?.live?.zones?.length} zones`
              : null
          }
          empty={!online || !(status?.live?.zones?.length)}
          needsHint="Needs: dwell polygons in Set up zones"
        />
        <LiveSegment
          title="Shelf / display"
          brief="Category interest — not SKUs or sales."
          value={
            online && (status?.products?.categories?.length ?? 0) > 0
              ? `${status?.products?.categories?.length} cats`
              : null
          }
          needsHint={
            online && !(status?.products?.categories?.length)
              ? "Needs: shelf model / quality mode"
              : undefined
          }
        />
        <LiveSegment
          title="Staff present"
          brief="People in a staff zone — not face ID."
          value={online ? displayMetric(live?.staff_now ?? null) : null}
          needsHint={
            online && live?.staff_now == null ? "Needs: staff polygon" : undefined
          }
        />
        <LiveSegment
          title="Demographics"
          brief="Age/gender groups only when privacy gate allows."
          value={null}
          empty
          needsHint="Needs: demographics enabled + enough samples"
        />
      </div>

      <Panel pad={false}>
        <div className="grid grid-cols-3 gap-1 p-2 sm:grid-cols-6">
          {QUICK.map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={() => onNavigate?.(q.screen)}
              className="group flex flex-col items-center gap-2 rounded-xl px-2 py-3.5 text-center transition-colors hover:bg-[var(--app-raise)]"
            >
              <q.icon size={17} strokeWidth={2} className="text-[var(--app-sub)] transition-colors group-hover:text-[var(--app-accent)]" />
              <span className="font-inter cosmic-text-xs font-semibold text-[var(--app-text)]">{q.label}</span>
            </button>
          ))}
        </div>
      </Panel>

      <p className="font-inter cosmic-text-xs text-[var(--app-faint)]">
        Store {storeLabel}
        {" · "}
        <button
          type="button"
          className="text-[var(--app-accent)] hover:underline"
          onClick={() => onNavigate?.("liveOps")}
        >
          Open Live floor →
        </button>
      </p>
    </div>
  )
}

function EmptyBlock({ title, brief }: { title: string; brief: string }) {
  return (
    <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 px-4 text-center">
      <p className="font-num cosmic-text-2xl font-bold text-[var(--app-faint)]">—</p>
      <p className="font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">{title}</p>
      <p className="max-w-sm font-inter cosmic-text-xs text-[var(--app-faint)]">{brief}</p>
    </div>
  )
}
