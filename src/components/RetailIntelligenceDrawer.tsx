"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ChevronDown,
  DoorOpen,
  Footprints,
  MapPinned,
  MonitorSmartphone,
  Timer,
  Users,
} from "lucide-react"
import { LiveSegment } from "./LiveSegment"
import { AccountingFutureCard } from "./AccountingFutureCard"
import { useEdgeSight } from "../hooks/useEdgeSight"
import {
  RETAIL_SEGMENT_IDS,
  RETAIL_SEGMENT_STORAGE_KEY,
  RETAIL_SEGMENTS,
  isRetailSegmentId,
  type RetailSegmentId,
} from "../data/retail-segments"
import { pathDeadAisleBrief, resolveSegmentKpis } from "../lib/retail-segment-kpis"

const ICONS: Record<RetailSegmentId, typeof DoorOpen> = {
  entrance: DoorOpen,
  path: Footprints,
  dwell: MapPinned,
  queue: Timer,
  staff: Users,
  shelf: MonitorSmartphone,
}

function readSegment(): RetailSegmentId {
  if (typeof window === "undefined") return "entrance"
  const q = new URLSearchParams(window.location.search).get("segment")
  if (isRetailSegmentId(q)) return q
  // Legacy industry= query → soft-map into closest floor role (never show industry UI).
  const legacy = new URLSearchParams(window.location.search).get("industry")
  if (legacy === "restaurant" || legacy === "jewelry") return "dwell"
  if (legacy === "manufacturing") return "shelf"
  if (legacy === "fashion") return "shelf"
  try {
    const stored = window.localStorage.getItem(RETAIL_SEGMENT_STORAGE_KEY)
    if (isRetailSegmentId(stored)) return stored
  } catch {
    /* ignore */
  }
  return "entrance"
}

function persistSegment(id: RetailSegmentId) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(RETAIL_SEGMENT_STORAGE_KEY, id)
  } catch {
    /* ignore */
  }
  const url = new URL(window.location.href)
  url.searchParams.set("segment", id)
  url.searchParams.delete("industry")
  window.history.replaceState({}, "", url.toString())
}

function SegmentBody({
  segment,
  onSelect,
  edge,
}: {
  segment: RetailSegmentId
  onSelect: (id: RetailSegmentId) => void
  edge: ReturnType<typeof useEdgeSight>
}) {
  const mode = RETAIL_SEGMENTS[segment]
  const kpis = useMemo(
    () =>
      resolveSegmentKpis(
        segment,
        edge.status?.live ?? null,
        edge.liveState,
        edge.calibratedZones,
        edge.online,
      ),
    [segment, edge.status?.live, edge.liveState, edge.calibratedZones, edge.online],
  )
  const deadBrief = segment === "path" ? pathDeadAisleBrief(edge.status?.live) : null

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Retail floor role"
        className="flex flex-wrap gap-1 rounded-xl border border-[var(--app-line)] bg-[var(--app-raise)] p-1"
      >
        {RETAIL_SEGMENT_IDS.map((id) => {
          const Icon = ICONS[id]
          const active = segment === id
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(id)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 font-inter cosmic-text-xs font-semibold transition-colors sm:px-3"
              style={{
                background: active ? "var(--app-card)" : "transparent",
                color: active ? "var(--app-accent)" : "var(--app-sub)",
                boxShadow: active ? "0 0 0 1px var(--app-line)" : undefined,
              }}
            >
              <Icon size={13} />
              {RETAIL_SEGMENTS[id].label}
            </button>
          )
        })}
      </div>

      <div>
        <p className="font-inter cosmic-text-base font-semibold text-[var(--app-text)]">{mode.title}</p>
        <p className="mt-1 max-w-2xl font-inter cosmic-text-xs leading-relaxed text-[var(--app-sub)]">
          {mode.promise}
        </p>
        {deadBrief ? (
          <p className="mt-2 font-inter cosmic-text-xs text-[var(--app-faint)]">{deadBrief}</p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {kpis.map((kpi) => (
          <LiveSegment
            key={kpi.id}
            title={kpi.title}
            brief={kpi.brief}
            value={kpi.empty ? null : kpi.value}
            sourcePath={kpi.sourcePath}
            empty={kpi.empty}
          />
        ))}
      </div>

      {mode.futures.length ? (
        <div className="flex flex-col gap-2">
          <p className="font-inter cosmic-text-2xs font-bold uppercase tracking-[0.14em] text-[var(--app-faint)]">
            What we can try next
          </p>
          <div className="flex flex-wrap gap-2">
            {mode.futures.map((line) => (
              <span
                key={line}
                className="inline-flex max-w-full items-start gap-2 rounded-full border border-dashed border-[var(--app-line)] bg-[var(--app-raise)] px-3 py-1.5 font-inter cosmic-text-xs text-[var(--app-sub)]"
              >
                <span className="shrink-0 font-semibold uppercase tracking-[0.08em] text-[var(--app-faint)]">
                  Future
                </span>
                <span className="min-w-0 leading-snug">{line}</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {segment === "shelf" ? (
        <div className="pt-1">
          <AccountingFutureCard />
        </div>
      ) : null}
    </div>
  )
}

/**
 * Refined Retail intelligence — floor-role segments, quiet KPIs, FUTURE chips.
 * `embedded` = body only (parent owns the accordion, e.g. lighten More insights).
 * Standalone = own collapsed drawer so Live stays video + In/Present/Out + brief.
 */
export function RetailIntelligenceDrawer({
  defaultOpen = false,
  embedded = false,
}: {
  defaultOpen?: boolean
  embedded?: boolean
}) {
  const edge = useEdgeSight()
  const [open, setOpen] = useState(defaultOpen || embedded)
  const [segment, setSegment] = useState<RetailSegmentId>("entrance")

  useEffect(() => {
    setSegment(readSegment())
    if (typeof window === "undefined") return
    const q = new URLSearchParams(window.location.search)
    if (q.get("retail") === "1" || q.get("segment")) setOpen(true)
  }, [])

  const select = useCallback((id: RetailSegmentId) => {
    setSegment(id)
    persistSegment(id)
    setOpen(true)
  }, [])

  if (embedded) {
    return <SegmentBody segment={segment} onSelect={select} edge={edge} />
  }

  return (
    <div
      className="overflow-hidden rounded-2xl border border-[var(--app-line)]"
      style={{ background: "var(--app-card)" }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:px-5"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <p className="font-inter cosmic-text-2xs font-bold uppercase tracking-[0.18em] text-[var(--app-faint)]">
            Retail intelligence
          </p>
          <p className="mt-0.5 font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">
            Floor roles · entrance → shelf
          </p>
          <p className="mt-1 max-w-2xl font-inter cosmic-text-xs text-[var(--app-sub)]">
            High-frequency retail analytics as path roles — not industry tabs. Values stay — until
            /api/v1/live answers.
          </p>
        </div>
        <ChevronDown
          size={18}
          className="shrink-0 text-[var(--app-faint)] transition-transform"
          style={{ transform: open ? "rotate(180deg)" : undefined }}
        />
      </button>

      {open ? (
        <div className="border-t border-[var(--app-line)] px-4 pb-5 pt-4 sm:px-5">
          <SegmentBody segment={segment} onSelect={select} edge={edge} />
        </div>
      ) : null}
    </div>
  )
}
