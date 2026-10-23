"use client"

import {
  TrendingUp, Store, Megaphone, Map, FileText, Users,
  DoorOpen, LogOut, UserRound, Timer, Layers,
} from "lucide-react"
import { Panel, Chip, ScreenHeader } from "../ui"
import { AreaChart } from "../charts"
import { useEdgeSight } from "../../hooks/useEdgeSight"
import { LiveVision } from "../../components/LiveVision"
import { DataBadge } from "../../components/DataBadge"
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

export function Overview({ onNavigate }: { onNavigate?: (screen: string) => void }) {
  const {
    occupancy,
    trafficHours,
    sourceChip,
    liveKpis,
    status,
    queueLength,
    sectionBadges,
    connectivityAgeSeconds,
    heroFlow,
  } = useEdgeSight()
  const online = Boolean(status?.online && status.live)
  const live = status?.live
  const stale = connectivityAgeSeconds != null && connectivityAgeSeconds > 15
  const storeLabel = live?.store_id ?? "—"

  return (
    <div className="flex flex-col gap-6">
      <ScreenHeader
        eyebrow="Live now"
        title="Today"
        sub="Entries in · people present · exits — bound to /api/v1/live. Empty until EdgeSight reports real values."
      >
        <DataBadge badge={sectionBadges.today} />
        <DataBadge badge={sectionBadges.connectivity} />
        <Chip tone={sourceChip.tone} title={sourceChip.title}>{sourceChip.label}</Chip>
        {connectivityAgeSeconds != null && (
          <Chip tone={stale ? "gold" : "neutral"} title="live/state updated_epoch age">
            {stale ? "stale · " : ""}age {connectivityAgeSeconds}s
          </Chip>
        )}
      </ScreenHeader>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <LiveSegment
          title="Entries in"
          brief="Cumulative tripwire IN crossings for this session."
          value={heroFlow.entriesIn}
          sourcePath={heroFlow.entriesPath}
          badge={sectionBadges.entrance_tripwires}
          empty={!online || heroFlow.entriesIn == null}
        />
        <LiveSegment
          title="People present"
          brief="Active customer tracks now — matches YOLO overlay boxes."
          value={heroFlow.peoplePresent}
          sourcePath={heroFlow.presentPath}
          badge={sectionBadges.today}
          empty={!online || heroFlow.peoplePresent == null}
        />
        <LiveSegment
          title="Exits"
          brief="Cumulative tripwire OUT crossings for this session."
          value={heroFlow.exitsOut}
          sourcePath={heroFlow.exitsPath}
          badge={sectionBadges.entrance_tripwires}
          empty={!online || heroFlow.exitsOut == null}
        />
      </div>

      <LiveVision compact />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <LiveSegment
          title="Queue length"
          brief="People in calibrated queue zones (≥5s dwell)."
          value={online ? displayMetric(queueLength) : null}
          sourcePath="/api/v1/live · queue_length"
          badge={sectionBadges.queues}
        />
        <LiveSegment
          title="Avg wait"
          brief="Mean wait across active queue zones."
          value={online && occupancy.avgWait !== "—" ? occupancy.avgWait : null}
          sourcePath="/api/v1/live · avg_queue_wait_seconds"
          badge={sectionBadges.queues}
        />
        <LiveSegment
          title="Avg dwell"
          brief="Zone / time-in-frame dwell from live snapshot."
          value={online && liveKpis.dwell !== "—" ? liveKpis.dwell : null}
          sourcePath="/api/v1/live · avg_dwell_seconds"
          badge={sectionBadges.today}
        />
        <LiveSegment
          title="Engaged ratio"
          brief="Head-facing / pose proxy — null when enrichment off (fast mode)."
          value={liveKpis.engagedRatio}
          sourcePath="/api/v1/live · engagement.engaged_ratio"
          badge={sectionBadges.engagement}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Panel
          title="Hourly traffic"
          sub="From analytics summary rollups — empty until EdgeSight has history."
          action={<DataBadge badge={sectionBadges.today} />}
        >
          {trafficHours.length > 0 ? (
            <AreaChart data={trafficHours} peaks={[]} />
          ) : (
            <EmptyBlock
              title="No hourly rollups yet"
              brief="Appears after telemetry_rollups accumulate. Value stays — until then."
            />
          )}
        </Panel>
        <Panel
          title="Flow clarity"
          sub="How detections become dashboard numbers."
          action={<Layers size={14} className="text-[var(--app-faint)]" />}
        >
          <ol className="flex flex-col gap-3">
            {[
              {
                icon: DoorOpen,
                step: "Detect + track",
                detail: "YOLO person boxes → ByteTrack IDs on the MJPEG stream.",
              },
              {
                icon: UserRound,
                step: "People present",
                detail: "people_now = active customer tracks (same count as HUD).",
              },
              {
                icon: DoorOpen,
                step: "Entries in",
                detail: "Tripwire line crossings → total_visitors (session IN).",
              },
              {
                icon: LogOut,
                step: "Exits",
                detail: "Opposite tripwire direction → total_exits (session OUT).",
              },
              {
                icon: Timer,
                step: "Queues / zones",
                detail: "Polygon membership + dwell → queue_length, zone occupancy.",
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
          brief="Occupancy per calibrated dwell polygon."
          value={online ? "—" : null}
          sourcePath="/api/v1/live/snapshot · zones[]"
          badge={sectionBadges.floor_zones}
          empty
        />
        <LiveSegment
          title="Shelf / display"
          brief="Open-vocab category interest — never SKUs or revenue."
          value={
            online && (status?.products?.categories?.length ?? 0) > 0
              ? `${status?.products?.categories?.length} cats`
              : null
          }
          sourcePath="/api/v1/live · products_top · analytics/products"
          badge={sectionBadges.shelf}
        />
        <LiveSegment
          title="Staff present"
          brief="Geometry staff-zone tag — no facial identity."
          value={online ? displayMetric(live?.staff_now ?? null) : null}
          sourcePath="/api/v1/live · staff_now"
          badge={sectionBadges.staffing}
        />
        <LiveSegment
          title="Demographics"
          brief="k-anon age/gender only when publishable; never invent cohorts."
          value={null}
          sourcePath="/api/v1/analytics/demographics"
          badge={sectionBadges.demographics}
          empty
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
        {sourceChip.title}
        {" · "}
        <button
          type="button"
          className="text-[var(--app-accent)] hover:underline"
          onClick={() => onNavigate?.("liveOps")}
        >
          Live hub →
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
