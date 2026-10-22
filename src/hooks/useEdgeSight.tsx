"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { EdgeSightCameraConfig, EdgeSightEvent, EdgeSightHistoryRow, EdgeSightStatus } from "../lib/edgesight"
import {
  countTripwires,
  flattenCalibratedZones,
  formatDwell,
  formatPeakHour,
  formatWait,
  historyToOccupancySeries,
  hourlyToChart,
  mapAgeBands,
} from "../lib/edgesight"
import {
  evaluateAllSectionBadges,
  displayMetric,
  type DataBadge,
  type LiveState,
  type LiveStateCamera,
  type SectionId,
  SECTION_CADENCE_MS,
} from "../lib/data-freshness"
import {
  ALERTS,
  BUSINESS_KPIS,
  DEMOGRAPHICS,
  OCCUPANCY,
  STAFF_INTEL,
  TRAFFIC_HOURS,
  type OwnerAlert,
} from "../data/dashboard"

/** Heavy aggregate poll (summary, demographics, products, heatmap check…). Matrix: Today/heatmap 10s. */
const POLL_MS = 10_000
/** Fast live/state poll — tripwires, zones, queues, staffing, engagement. */
const LIVE_POLL_MS = 2_000
// Keep matrix cadences referenced so drift is obvious in review.
void SECTION_CADENCE_MS

export type LiveAlert = OwnerAlert & { live: boolean }

export type CalibratedZoneRow = {
  cameraId: string
  cameraName: string
  id: string
  name: string
  type: string
  points: number
}

export type EdgeSightContextValue = {
  status: EdgeSightStatus | null
  liveState: LiveState | null
  loading: boolean
  online: boolean
  refresh: () => void
  occupancy: typeof OCCUPANCY
  /** Null when live people_now is null — never invent zero. */
  peopleNow: number | null
  queueLength: number | null
  trafficHours: typeof TRAFFIC_HOURS
  demographicsLive: typeof DEMOGRAPHICS | null
  sourceChip: { tone: "live" | "neutral"; label: string; title: string }
  liveKpis: {
    entries: string
    exits: string
    dwell: string
    engagedRatio: string | null
    facingRatio: string | null
  }
  /** Calibrated polygons from /api/v1/config/cameras — EdgeSight truth. */
  calibratedZones: CalibratedZoneRow[]
  tripwireCount: number
  cameraConfigs: EdgeSightCameraConfig[]
  /** First cameras.yaml cam until picker. */
  primaryCameraId: string | null
  primaryCameraState: LiveStateCamera | null
  events: EdgeSightEvent[]
  history: EdgeSightHistoryRow[]
  historyOccupancy: { h: string; v: number }[]
  /** Demo alerts + live queue alert when EdgeSight flags congestion. */
  alertsLive: LiveAlert[]
  staffLive: typeof STAFF_INTEL
  businessLive: typeof BUSINESS_KPIS
  sectionBadges: Record<SectionId, DataBadge>
  connectivityAgeSeconds: number | null
}

export const EdgeSightContext = createContext<EdgeSightContextValue | null>(null)

export function useEdgeSight(): EdgeSightContextValue {
  const ctx = useContext(EdgeSightContext)
  if (!ctx) {
    throw new Error("useEdgeSight must be used within EdgeSightProvider")
  }
  return ctx
}

export function useEdgeSightOptional(): EdgeSightContextValue | null {
  return useContext(EdgeSightContext)
}

function buildValue(
  status: EdgeSightStatus | null,
  liveState: LiveState | null,
  loading: boolean,
  refresh: () => void,
): EdgeSightContextValue {
  const online = Boolean(status?.online && status.live)
  const live = status?.live
  const summary = status?.summary
  const eng = status?.engagement
  const configs = status?.cameraConfigs ?? []
  const primaryCameraId =
    liveState?.primary_camera_id ??
    status?.cameras?.[0] ??
    configs[0]?.id ??
    null
  const primaryCameraState =
    liveState?.cameras.find((c) => c.camera_id === primaryCameraId) ??
    liveState?.cameras[0] ??
    null

  // Null-safe occupancy: when online, never fall back to demo OCCUPANCY.now
  const peopleNow: number | null = online
    ? (live?.people_now ?? live?.net_occupancy ?? primaryCameraState?.counts.people_now ?? null)
    : OCCUPANCY.now
  const queueLength: number | null = online
    ? (primaryCameraState?.queues?.[0]?.queue_length ?? live?.queue_length ?? null)
    : OCCUPANCY.queue

  const occupancy: typeof OCCUPANCY =
    online
      ? {
          now: peopleNow ?? 0, // gauge needs a number; UI should prefer peopleNow/displayMetric
          capacity: OCCUPANCY.capacity,
          level:
            peopleNow == null
              ? 0
              : Math.min(100, Math.round((peopleNow / OCCUPANCY.capacity) * 100)),
          queue: queueLength ?? 0,
          avgWait:
            live?.avg_queue_wait_seconds != null
              ? formatWait(live.avg_queue_wait_seconds)
              : primaryCameraState?.queues?.[0]?.avg_wait_seconds != null
                ? formatWait(primaryCameraState.queues[0].avg_wait_seconds)
                : "—",
          peakWindow: formatPeakHour(summary?.peak_period?.hour) || OCCUPANCY.peakWindow,
          trend: OCCUPANCY.trend,
        }
      : OCCUPANCY

  const fromApi = online ? hourlyToChart(summary?.hourly_breakdown) : []
  const trafficHours = fromApi.length > 0 ? fromApi : TRAFFIC_HOURS

  let demographicsLive: typeof DEMOGRAPHICS | null = null
  const demo = status?.demographics?.demographics
  if (
    online &&
    demo &&
    demo.publishable !== false &&
    demo.age_bands &&
    demo.age_bands.length > 0
  ) {
    const female = demo.gender_split?.find((g) => g.gender === "female")?.pct
    const male = demo.gender_split?.find((g) => g.gender === "male")?.pct
    demographicsLive = {
      ...DEMOGRAPHICS,
      ages: mapAgeBands(demo.age_bands),
      gender: {
        female: female != null ? Math.round(female) : DEMOGRAPHICS.gender.female,
        male: male != null ? Math.round(male) : DEMOGRAPHICS.gender.male,
      },
      note: demo.note ?? `k ≥ ${demo.k_anonymity} · sample ${demo.sample_size} · EdgeSight live`,
      peak: occupancy.peakWindow,
    }
  } else if (online && demo && demo.gender_split?.length) {
    const female = demo.gender_split.find((g) => g.gender === "female")?.pct
    const male = demo.gender_split.find((g) => g.gender === "male")?.pct
    demographicsLive = {
      ...DEMOGRAPHICS,
      gender: {
        female: female != null ? Math.round(female) : DEMOGRAPHICS.gender.female,
        male: male != null ? Math.round(male) : DEMOGRAPHICS.gender.male,
      },
      note:
        demo.note ??
        `k ≥ ${demo.k_anonymity} · sample ${demo.sample_size} · age bands withheld · EdgeSight live`,
      peak: occupancy.peakWindow,
    }
  }
  // When online but demographics key null → demographicsLive stays null (NO-DATA), not demo fixtures.

  const liveSource = live?.source === "live_snapshot" ? "YOLO snapshot" : "rollups"
  const age = liveState?.age_seconds
  const sourceChip = online
    ? {
        tone: "live" as const,
        label: live?.source === "live_snapshot" ? "YOLO live" : "EdgeSight live",
        title: `Wired to ${status?.baseUrl} · ${liveSource} · FPS ${live?.infer_fps ?? status?.device?.pipeline_fps ?? "—"} · state age ${age ?? "—"}s · live poll ${LIVE_POLL_MS / 1000}s`,
      }
    : {
        tone: "neutral" as const,
        label: "Demo",
        title: status?.error
          ? `Showcase fixtures · ${status.error}`
          : "Simulated showcase · Organic Clothing Co. · Bandra (start EdgeSight on :8000 for live)",
      }

  const snapEng = primaryCameraState?.engagement ?? live?.engagement
  const liveKpis = {
    entries: live
      ? live.total_visitors.toLocaleString("en-IN")
      : summary
        ? summary.total_visitors.toLocaleString("en-IN")
        : "—",
    exits: live
      ? live.total_exits.toLocaleString("en-IN")
      : summary
        ? summary.total_exits.toLocaleString("en-IN")
        : "—",
    dwell:
      live && live.avg_dwell_seconds != null
        ? formatDwell(live.avg_dwell_seconds)
        : online
          ? "—"
          : "6m 12s",
    engagedRatio: eng
      ? `${Math.round(eng.avg_engaged_ratio * 100)}%`
      : snapEng?.engaged_ratio != null
        ? `${Math.round(snapEng.engaged_ratio * 100)}%`
        : null,
    facingRatio: eng
      ? `${Math.round(eng.avg_facing_ratio * 100)}%`
      : snapEng?.facing_ratio != null
        ? `${Math.round(snapEng.facing_ratio * 100)}%`
        : null,
  }

  const calibratedZones: CalibratedZoneRow[] = flattenCalibratedZones(configs).map((row) => ({
    cameraId: row.cameraId,
    cameraName: row.cameraName,
    id: row.zone.id,
    name: row.zone.name,
    type: row.zone.type,
    points: row.zone.polygon?.length ?? 0,
  }))

  const staffZones = calibratedZones.filter((z) => z.type === "staff")
  const queueZones = calibratedZones.filter((z) => z.type === "queue")
  const staffVisible = primaryCameraState?.counts.staff_visible ?? live?.staff_now ?? null
  const staffTagged = primaryCameraState?.counts.staff_tagged ?? null

  const staffLive: typeof STAFF_INTEL = online
    ? {
        ...STAFF_INTEL,
        visitorsNow: peopleNow ?? STAFF_INTEL.visitorsNow,
        staffShare:
          staffVisible != null && peopleNow != null && peopleNow > 0
            ? `${Math.round((staffVisible / (peopleNow + staffVisible)) * 100)}%`
            : "—",
        // Keep numeric field for layout; Staff screen renders displayMetric(staffVisible) for honesty.
        onFloor: staffVisible ?? 0,
        method:
          staffVisible != null || staffTagged != null
            ? `staff_visible ${displayMetric(staffVisible)} · tagged ${displayMetric(staffTagged)} · sticky staff polygons`
            : staffZones.length > 0
              ? `Staff polygon calibrated (${staffZones.map((z) => z.name).join(", ")}) · counts null on live/state`
              : "No staff zone in cameras.yaml — draw one in Calibration Studio",
        zones:
          staffZones.length > 0
            ? staffZones.map((z) => ({
                code: z.id.slice(-4).toUpperCase(),
                name: z.name,
                staffMin: "1+",
                present: staffTagged != null ? staffTagged > 0 : staffVisible != null ? staffVisible > 0 : false,
                note: `${z.cameraName} · polygon ${z.points} pts · sticky staff tag after min dwell`,
              }))
            : STAFF_INTEL.zones.map((z) => ({ ...z, note: `${z.note} · demo (no staff zone live)` })),
        doNext:
          live?.queue_alert_active
            ? ["Open second till — EdgeSight queue alert active", ...STAFF_INTEL.doNext.slice(1)]
            : STAFF_INTEL.doNext,
      }
    : STAFF_INTEL

  const queueAlert: LiveAlert | null =
    online && live?.queue_alert_active
      ? {
          id: "live-queue",
          severity: "critical",
          category: "ops",
          zone: queueZones[0]?.name ?? "Checkout",
          title: "Queue congestion (live)",
          message: `Length ${displayMetric(queueLength)}, wait ${occupancy.avgWait} — EdgeSight queue_alert_active.`,
          time: "now",
          action: "Open second till or pull floor staff to checkout",
          screen: "queues",
          source: "QueueAnalyzer · /api/v1/live",
          live: true,
        }
      : null

  const alertsLive: LiveAlert[] = online
    ? [
        ...(queueAlert ? [queueAlert] : []),
        ...ALERTS.filter((a) => a.id !== "0").map((a) => ({
          ...a,
          live: false,
          source: a.source.includes("demo") ? a.source : `${a.source} · demo fixture`,
        })),
      ]
    : ALERTS.map((a) => ({ ...a, live: false }))

  const businessLive: typeof BUSINESS_KPIS = online && live
    ? [
        {
          label: "Entries today",
          value: liveKpis.entries,
          delta: `exits ${liveKpis.exits}`,
          tone: "pos",
          note: "Tripwire IN · EdgeSight live",
          iconHint: "yield",
        },
        {
          label: "People in store",
          value: displayMetric(peopleNow),
          delta: peopleNow != null ? `${occupancy.level}% of capacity` : "NO-DATA",
          tone: "flat",
          note: "Active tracks (sum of per-cam) — null stays —",
          iconHint: "basket",
        },
        {
          label: "Avg dwell",
          value: liveKpis.dwell,
          delta: "zone / time-in-frame",
          tone: "pos",
          note: "EdgeSight avg_dwell_seconds",
          iconHint: "pos",
        },
        {
          label: "Queue length",
          value: displayMetric(queueLength),
          delta: `wait ${occupancy.avgWait}`,
          tone: live.queue_alert_active ? "neg" : "flat",
          note: queueZones[0] ? `${queueZones[0].name} · ≥5s dwell` : "Queue zone",
          iconHint: "megaphone",
        },
        {
          label: "Peak hour",
          value: occupancy.peakWindow,
          delta: summary?.peak_period
            ? `${summary.peak_period.visitors} entries`
            : "rollup",
          tone: "pos",
          note: "Analytics summary peak_period",
          iconHint: "currency",
        },
      ]
    : BUSINESS_KPIS

  const sectionBadges = evaluateAllSectionBadges({
    online,
    state: liveState,
    live: live
      ? {
          people_now: live.people_now,
          net_occupancy: live.net_occupancy,
          total_visitors: live.total_visitors,
          queue_length: live.queue_length,
          source: live.source,
          models: live.models ?? null,
          engagement: live.engagement ?? null,
        }
      : null,
    heatmapOk: status?.heatmapOk ?? null,
    productsAnalytics: status?.products,
    demographics: status?.demographics,
    opsReachable: online,
  })

  return {
    status,
    liveState,
    loading,
    online,
    refresh,
    occupancy,
    peopleNow: online ? peopleNow : OCCUPANCY.now,
    queueLength: online ? queueLength : OCCUPANCY.queue,
    trafficHours,
    demographicsLive: online ? demographicsLive : DEMOGRAPHICS,
    sourceChip,
    liveKpis,
    calibratedZones,
    tripwireCount: countTripwires(configs),
    cameraConfigs: configs,
    primaryCameraId,
    primaryCameraState,
    events: status?.events ?? [],
    history: status?.history ?? [],
    historyOccupancy: historyToOccupancySeries(status?.history),
    alertsLive,
    staffLive,
    businessLive,
    sectionBadges,
    connectivityAgeSeconds: liveState?.age_seconds ?? null,
  }
}

export function EdgeSightProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<EdgeSightStatus | null>(null)
  const [liveState, setLiveState] = useState<LiveState | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/edgesight/status", { cache: "no-store" })
        const data = (await res.json()) as EdgeSightStatus
        if (!cancelled) setStatus(data)
      } catch (err) {
        if (!cancelled) {
          setStatus({
            online: false,
            baseUrl: "http://localhost:8000",
            fetchedAt: new Date().toISOString(),
            error: err instanceof Error ? err.message : "Fetch failed",
          })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  /** High-frequency patch: /api/v1/live + live/state (per-cam snapshots). */
  const refreshLive = useCallback(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/edgesight/live", { cache: "no-store" })
        if (!res.ok) return
        const data = (await res.json()) as {
          online?: boolean
          live?: EdgeSightStatus["live"]
          state?: LiveState
          fetchedAt?: string
        }
        if (cancelled || !data.live) return
        if (data.state) setLiveState(data.state)
        setStatus((prev) => {
          if (!prev?.online && !data.online) return prev
          return {
            ...(prev ?? {
              online: true,
              baseUrl: "http://localhost:8000",
              fetchedAt: data.fetchedAt ?? new Date().toISOString(),
            }),
            online: data.online ?? prev?.online ?? true,
            fetchedAt: data.fetchedAt ?? new Date().toISOString(),
            live: data.live,
            cameras: data.state?.cameras.map((c) => c.camera_id) ?? prev?.cameras,
          }
        })
      } catch {
        /* keep last good snapshot */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const cancel = refresh()
    const heavy = setInterval(() => {
      refresh()
    }, POLL_MS)
    const liveCancel = refreshLive()
    const live = setInterval(() => {
      refreshLive()
    }, LIVE_POLL_MS)
    return () => {
      cancel()
      liveCancel()
      clearInterval(heavy)
      clearInterval(live)
    }
  }, [refresh, refreshLive])

  const value = useMemo(
    () => buildValue(status, liveState, loading, () => { refresh() }),
    [status, liveState, loading, refresh],
  )

  return <EdgeSightContext.Provider value={value}>{children}</EdgeSightContext.Provider>
}
