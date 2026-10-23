"use client"

import { useEffect, useMemo, useState } from "react"
import { Video } from "lucide-react"
import { edgeSightStreamPath } from "../lib/edgesight"
import { displayMetric } from "../lib/data-freshness"
import { useEdgeSightOptional } from "../hooks/useEdgeSight"
import { DataBadge } from "./DataBadge"
import { Chip, Label } from "../app/ui"

type Props = {
  /** Override camera; defaults to first EdgeSight camera / cameras.yaml primary */
  cameraId?: string
  className?: string
  /** Compact strip for Today; full for Live ops */
  compact?: boolean
}

/**
 * Classic YOLO-demo pane: MJPEG with person/staff/zone/tripwire overlays from EdgeSight.
 * Numbers beside it come from the shared EdgeSightProvider (live_snapshot / live/state).
 */
export function LiveVision({ cameraId, className = "", compact = false }: Props) {
  const edge = useEdgeSightOptional()
  const cams = edge?.status?.cameras ?? []
  const fallback = edge?.primaryCameraId ?? cams[0] ?? "cam_entrance_01"
  const [cam, setCam] = useState(cameraId ?? fallback)

  useEffect(() => {
    if (cameraId) setCam(cameraId)
    else if (fallback) setCam(fallback)
  }, [cameraId, fallback])

  const online = Boolean(edge?.online)
  const live = edge?.status?.live
  const camState = edge?.liveState?.cameras.find((c) => c.camera_id === cam)
  const streamSrc = useMemo(() => edgeSightStreamPath(cam), [cam])
  const wallBadge = edge?.sectionBadges.camera_wall
  const tripBadge = edge?.sectionBadges.entrance_tripwires

  const people = camState?.counts.people_now ?? live?.people_now ?? live?.net_occupancy ?? null
  const queue =
    camState?.queues?.[0]?.queue_length ??
    live?.queue_length ??
    null
  const entriesIn = camState?.counts.tripwire_in_cumulative
  const entriesOut = camState?.counts.tripwire_out_cumulative
  const source = live?.source === "live_snapshot" ? "YOLO live" : online ? "EdgeSight" : "Offline"

  return (
    <div
      className={`overflow-hidden rounded-3xl border border-[var(--app-line)] bg-[var(--app-card)] ${className}`}
      style={{ boxShadow: "var(--app-shadow)" }}
    >
      <header className="flex flex-wrap items-center gap-2 border-b border-[var(--app-line)] px-4 py-3 sm:px-5">
        <Video size={14} className="text-[var(--app-accent)]" />
        <div className="min-w-0 flex-1">
          <p className="font-inter cosmic-text-2xs font-bold uppercase tracking-[0.16em] text-[var(--app-faint)]">
            Live inference · {cam}
          </p>
          <p className="truncate font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">
            Person detect + track + zones
          </p>
        </div>
        {wallBadge && <DataBadge badge={wallBadge} />}
        <Chip tone={online ? "live" : "neutral"}>{source}</Chip>
      </header>

      {online ? (
        <div className={`grid ${compact ? "" : "xl:grid-cols-[1.5fr_1fr]"}`}>
          <div className="bg-black">
            {cams.length > 1 && (
              <div className="flex flex-wrap gap-1.5 border-b border-white/10 px-3 py-2">
                {cams.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCam(id)}
                    className="rounded-full border px-2.5 py-0.5 font-mono cosmic-text-2xs font-semibold"
                    style={{
                      borderColor: cam === id ? "var(--app-accent)" : "rgba(255,255,255,0.2)",
                      color: cam === id ? "var(--app-accent)" : "rgba(255,255,255,0.7)",
                      background: cam === id ? "var(--app-accent-soft)" : "transparent",
                    }}
                  >
                    {id}
                  </button>
                ))}
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={cam}
              src={streamSrc}
              alt={`YOLO annotated stream ${cam}`}
              className={`w-full bg-black object-contain ${compact ? "max-h-[min(42vh,420px)]" : "max-h-[min(64vh,640px)]"}`}
            />
          </div>

          <div className={`grid gap-2 p-4 sm:grid-cols-2 ${compact ? "grid-cols-2 xl:grid-cols-4" : "xl:grid-cols-1"}`}>
            <Stat label="People now" value={displayMetric(people)} hint="Active tracks · matches boxes" />
            <Stat
              label="Queue"
              value={displayMetric(queue)}
              hint={`Wait ${edge?.occupancy.avgWait ?? "—"}`}
            />
            <Stat
              label="Tripwire IN / OUT"
              value={`${displayMetric(entriesIn)} / ${displayMetric(entriesOut)}`}
              hint="Cumulative · live/state"
            />
            <Stat
              label="Infer FPS"
              value={live?.infer_fps != null ? String(live.infer_fps) : "—"}
              hint={[
                live?.models?.perf_mode ?? live?.perf_mode,
                live?.models?.person_detector,
                live?.models?.imgsz != null ? `imgsz ${live.models.imgsz}` : null,
              ]
                .filter(Boolean)
                .join(" · ") || "person_detector"}
            />
            <Stat
              label="Display FPS"
              value={
                live?.display_fps != null
                  ? String(live.display_fps)
                  : live?.decode_fps != null
                    ? String(live.decode_fps)
                    : "—"
              }
              hint="Annotated JPEG / MJPEG · boxes update at Infer FPS"
            />
            {tripBadge && (
              <div className="sm:col-span-2 xl:col-span-1 flex items-center gap-2">
                <DataBadge badge={tripBadge} />
                <span className="font-inter cosmic-text-2xs text-[var(--app-faint)]">Entrance tripwires</span>
              </div>
            )}
            {!compact && (live?.per_camera?.length ?? 0) > 0 && (
              <div className="sm:col-span-2 xl:col-span-1 space-y-1">
                <Label>Per camera</Label>
                {live!.per_camera!.map((c) => (
                  <p key={c.camera_id} className="font-mono cosmic-text-2xs text-[var(--app-sub)]">
                    {c.camera_id}: people {c.occupancy} · q {c.queue_length}
                    {c.infer_fps != null ? ` · ${c.infer_fps} FPS` : ""}
                  </p>
                ))}
              </div>
            )}
            {!compact && (
              <p className="sm:col-span-2 xl:col-span-1 font-inter cosmic-text-2xs leading-relaxed text-[var(--app-faint)]">
                {live?.models?.note ??
                  "Face boxes (if on) feed k-anon age/gender only — no face ID. Soft ReID / cross-cam IDs = Future. Tripwire & staff zones: Set up zones."}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex h-[220px] flex-col items-center justify-center gap-2 px-6 text-center">
          <p className="font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">EdgeSight offline</p>
          <p className="font-inter cosmic-text-xs text-[var(--app-faint)]">
            Start Docker on ADLabs-dev, then refresh — MJPEG + KPIs appear here.
          </p>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-[var(--app-line)] px-3 py-2.5" style={{ background: "var(--app-raise)" }}>
      <Label>{label}</Label>
      <p className="mt-1 font-num cosmic-text-lg font-bold text-[var(--app-text)]">{value}</p>
      <p className="mt-0.5 font-inter cosmic-text-2xs text-[var(--app-faint)]">{hint}</p>
    </div>
  )
}
