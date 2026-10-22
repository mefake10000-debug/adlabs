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
  ALERTS,
  BUSINESS_KPIS,
  DEMOGRAPHICS,
  OCCUPANCY,
  STAFF_INTEL,
  TRAFFIC_HOURS,
  type OwnerAlert,
} from "../data/dashboard"

const POLL_MS = 5000

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
  loading: boolean
  online: boolean
  refresh: () => void
  occupancy: typeof OCCUPANCY
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
  events: EdgeSightEvent[]
  history: EdgeSightHistoryRow[]
  historyOccupancy: { h: string; v: number }[]
  /** Demo alerts + live queue alert when EdgeSight flags congestion. */
  alertsLive: LiveAlert[]
  staffLive: typeof STAFF_INTEL
  businessLive: typeof BUSINESS_KPIS
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
  loading: boolean,
  refresh: () => void,
): EdgeSightContextValue {
  const online = Boolean(status?.online && status.live)
  const live = status?.live
  const summary = status?.summary
  const eng = status?.engagement
  const configs = status?.cameraConfigs ?? []

  const occupancy: typeof OCCUPANCY =
    online && live
      ? {
          now: Math.max(0, live.net_occupancy),
          capacity: OCCUPANCY.capacity,
          level: Math.min(
            100,
            Math.round((Math.max(0, live.net_occupancy) / OCCUPANCY.capacity) * 100),
          ),
          queue: live.queue_length,
          avgWait: formatWait(live.avg_queue_wait_seconds),
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
    const female =
      demo.gender_split?.find((g) => g.gender === "female")?.pct ?? DEMOGRAPHICS.gender.female
    const male =
      demo.gender_split?.find((g) => g.gender === "male")?.pct ?? DEMOGRAPHICS.gender.male
    demographicsLive = {
      ...DEMOGRAPHICS,
      ages: mapAgeBands(demo.age_bands),
      gender: { female: Math.round(female), male: Math.round(male) },
      note: demo.note ?? `k ≥ ${demo.k_anonymity} · sample ${demo.sample_size} · EdgeSight live`,
      peak: occupancy.peakWindow,
    }
  } else if (online && demo && demo.gender_split?.length) {
    // Age bands may be k-suppressed; still surface gender when publishable.
    const female =
      demo.gender_split.find((g) => g.gender === "female")?.pct ?? DEMOGRAPHICS.gender.female
    const male =
      demo.gender_split.find((g) => g.gender === "male")?.pct ?? DEMOGRAPHICS.gender.male
    demographicsLive = {
      ...DEMOGRAPHICS,
      gender: { female: Math.round(female), male: Math.round(male) },
      note:
        demo.note ??
        `k ≥ ${demo.k_anonymity} · sample ${demo.sample_size} · age bands withheld · EdgeSight live`,
      peak: occupancy.peakWindow,
    }
  }

  const sourceChip = online
    ? {
        tone: "live" as const,
        label: "EdgeSight live",
        title: `Wired to ${status?.baseUrl} · ${status?.device?.status ?? "online"} · FPS ${status?.device?.pipeline_fps ?? "—"} · poll ${POLL_MS / 1000}s`,
      }
    : {
        tone: "neutral" as const,
        label: "Demo",
        title: status?.error
          ? `Showcase fixtures · ${status.error}`
          : "Simulated showcase · Organic Clothing Co. · Bandra (start EdgeSight on :8000 for live)",
      }

  const liveKpis = {
    entries: live
      ? live.total_visitors.toLocaleString("en-IN")
      : summary
        ? summary.total_visitors.toLocaleString("en-IN")
        : "39",
    exits: live
      ? live.total_exits.toLocaleString("en-IN")
      : summary
        ? summary.total_exits.toLocaleString("en-IN")
        : "—",
    dwell: live ? formatDwell(live.avg_dwell_seconds) : "6m 12s",
    engagedRatio: eng ? `${Math.round(eng.avg_engaged_ratio * 100)}%` : null,
    facingRatio: eng ? `${Math.round(eng.avg_facing_ratio * 100)}%` : null,
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

  const staffLive: typeof STAFF_INTEL = online
    ? {
        ...STAFF_INTEL,
        visitorsNow: occupancy.now,
        staffShare: "—",
        onFloor: staffZones.length > 0 ? STAFF_INTEL.onFloor : 0,
        method:
          staffZones.length > 0
            ? `Staff polygon calibrated (${staffZones.map((z) => z.name).join(", ")}) · headcount API not exposed — tagging excludes staff from customer metrics`
            : "No staff zone in cameras.yaml — draw one in Calibration Studio",
        zones:
          staffZones.length > 0
            ? staffZones.map((z) => ({
                code: z.id.slice(-4).toUpperCase(),
                name: z.name,
                staffMin: "1+",
                present: true,
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
          message: `Length ${live.queue_length}, wait ${formatWait(live.avg_queue_wait_seconds)} — EdgeSight queue_alert_active.`,
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
          value: String(occupancy.now),
          delta: `${occupancy.level}% of capacity`,
          tone: "flat",
          note: "Net occupancy (sum of per-cam rollups)",
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
          value: String(occupancy.queue),
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

  return {
    status,
    loading,
    online,
    refresh,
    occupancy,
    trafficHours,
    demographicsLive,
    sourceChip,
    liveKpis,
    calibratedZones,
    tripwireCount: countTripwires(configs),
    cameraConfigs: configs,
    events: status?.events ?? [],
    history: status?.history ?? [],
    historyOccupancy: historyToOccupancySeries(status?.history),
    alertsLive,
    staffLive,
    businessLive,
  }
}

export function EdgeSightProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<EdgeSightStatus | null>(null)
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

  useEffect(() => {
    const cancel = refresh()
    const id = setInterval(() => {
      refresh()
    }, POLL_MS)
    return () => {
      cancel()
      clearInterval(id)
    }
  }, [refresh])

  const value = useMemo(
    () => buildValue(status, loading, () => { refresh() }),
    [status, loading, refresh],
  )

  return <EdgeSightContext.Provider value={value}>{children}</EdgeSightContext.Provider>
}
