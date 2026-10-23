"use client"

import { useEffect, useMemo, useState } from "react"
import { useEdgeSightOptional } from "../hooks/useEdgeSight"

export type StackModel = {
  key: string
  name: string
  role?: string
  job?: string
  feeds_kpi?: string
  status?: string
  run_state?: "ON" | "OFF" | "WAITING" | string
  on_disk?: boolean | null
  notes?: string
}

type StackResponse = {
  models?: StackModel[]
  env?: { DETECTOR_BACKEND?: string; EDGE_PERF_MODE?: string }
}

/** Installed CV models as a distinct segmented strip — name · job · ON/OFF/WAITING · KPI. */
export function LiveModelsStrip() {
  const edge = useEdgeSightOptional()
  const [stack, setStack] = useState<StackResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/v1/models/stack", { cache: "no-store" })
        if (!res.ok) throw new Error(`stack ${res.status}`)
        const data = (await res.json()) as StackResponse
        if (!cancelled) {
          setStack(data)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "stack unavailable")
          setStack(null)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [edge?.online, edge?.status?.fetchedAt])

  const liveDetector = edge?.status?.live?.models?.person_detector ?? null
  const online = Boolean(edge?.online)

  const rows = useMemo(() => {
    const models = stack?.models ?? []
    // Primary strip: installed or runnable roles — skip SKIP/FUTURE noise unless on disk
    return models
      .filter((m) => {
        const st = (m.status || "").toUpperCase()
        if (st === "SKIP" || st === "FUTURE") return false
        return true
      })
      .map((m) => {
        let run = (m.run_state || "").toUpperCase() as string
        if (!run) {
          const st = (m.status || "").toUpperCase()
          run = st === "LIVE" ? "ON" : st === "PACKED" || st === "PARTIAL" ? "WAITING" : "OFF"
        }
        // Live snapshot detector wins for person-detect keys
        if (online && liveDetector && (m.key === "yolo26n" || m.key === "rfdetr")) {
          const hit =
            liveDetector.toLowerCase().includes(m.key.replace("yolo26n", "yolo")) ||
            liveDetector.toLowerCase().includes(m.name.split(" ")[0].toLowerCase()) ||
            (m.key === "yolo26n" && /yolo/i.test(liveDetector)) ||
            (m.key === "rfdetr" && /rf-?detr/i.test(liveDetector))
          if (hit) run = "ON"
          else if (run === "ON") run = "WAITING"
        }
        return { ...m, run_state: run }
      })
  }, [stack?.models, online, liveDetector])

  return (
    <section
      className="rounded-2xl border border-[var(--app-line)]"
      style={{ background: "var(--app-card)" }}
      aria-label="CV models"
    >
      <header className="border-b border-[var(--app-line)] px-4 py-3 sm:px-5">
        <p className="font-inter cosmic-text-2xs font-bold uppercase tracking-[0.16em] text-[var(--app-faint)]">
          Models
        </p>
        <p className="font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">
          What is watching this store
        </p>
        <p className="mt-0.5 font-inter cosmic-text-xs text-[var(--app-faint)]">
          Each row is one installed model — job in plain English, status from the edge stack, and which number it feeds.
        </p>
      </header>

      {!online && !stack ? (
        <p className="px-4 py-6 font-inter cosmic-text-sm text-[var(--app-faint)] sm:px-5">
          Start EdgeSight to list models. Nothing invented here.
        </p>
      ) : error && !rows.length ? (
        <p className="px-4 py-6 font-inter cosmic-text-sm text-[var(--app-faint)] sm:px-5">
          Model list unavailable ({error}). Live counts above still come from video when Edge is up.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--app-line)]">
          {rows.map((m) => (
            <li
              key={m.key}
              className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_5.5rem_minmax(0,1fr)] sm:items-center sm:gap-3 sm:px-5"
            >
              <p className="font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">{m.name}</p>
              <p className="font-inter cosmic-text-xs text-[var(--app-sub)]">
                {m.job || m.role || "—"}
              </p>
              <RunPill state={m.run_state || "OFF"} />
              <p className="font-inter cosmic-text-xs text-[var(--app-faint)]">
                Feeds: {m.feeds_kpi || "—"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function RunPill({ state }: { state: string }) {
  const s = state.toUpperCase()
  const tone =
    s === "ON"
      ? { color: "var(--app-pos)", bg: "color-mix(in srgb, var(--app-pos) 12%, transparent)" }
      : s === "WAITING"
        ? { color: "var(--app-gold)", bg: "color-mix(in srgb, var(--app-gold) 12%, transparent)" }
        : { color: "var(--app-faint)", bg: "var(--app-raise)" }
  return (
    <span
      className="inline-flex w-fit items-center rounded-md px-2 py-0.5 font-inter cosmic-text-2xs font-bold uppercase tracking-wide"
      style={{ color: tone.color, background: tone.bg }}
    >
      {s === "ON" || s === "OFF" || s === "WAITING" ? s : "OFF"}
    </span>
  )
}
