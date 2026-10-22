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
import type { EdgeSightStatus } from "../lib/edgesight"
import {
  formatDwell,
  formatPeakHour,
  formatWait,
  hourlyToChart,
  mapAgeBands,
} from "../lib/edgesight"
import { DEMOGRAPHICS, OCCUPANCY, TRAFFIC_HOURS } from "../data/dashboard"

const POLL_MS = 8000

export type EdgeSightContextValue = {
  status: EdgeSightStatus | null
  loading: boolean
  refresh: () => void
  occupancy: typeof OCCUPANCY
  trafficHours: typeof TRAFFIC_HOURS
  demographicsLive: typeof DEMOGRAPHICS | null
  sourceChip: { tone: "live" | "neutral"; label: string; title: string }
  liveKpis: {
    entries: string
    dwell: string
    engagedRatio: string | null
    facingRatio: string | null
  }
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
  }

  const sourceChip = online
    ? {
        tone: "live" as const,
        label: "EdgeSight live",
        title: `Wired to ${status?.baseUrl} · ${status?.device?.status ?? "online"} · FPS ${status?.device?.pipeline_fps ?? "—"}`,
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
    dwell: live ? formatDwell(live.avg_dwell_seconds) : "6m 12s",
    engagedRatio: eng ? `${Math.round(eng.avg_engaged_ratio * 100)}%` : null,
    facingRatio: eng ? `${Math.round(eng.avg_facing_ratio * 100)}%` : null,
  }

  return {
    status,
    loading,
    refresh,
    occupancy,
    trafficHours,
    demographicsLive,
    sourceChip,
    liveKpis,
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
