"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ChevronDown, Factory, Gem, Shirt, UtensilsCrossed } from "lucide-react"
import { Panel } from "../app/ui"
import { LiveSegment } from "./LiveSegment"
import { useEdgeSight } from "../hooks/useEdgeSight"
import {
  CROSS_INDUSTRY_PLAYBOOK,
  INDUSTRY_IDS,
  INDUSTRY_MODES,
  INDUSTRY_STORAGE_KEY,
  isIndustryId,
  type IndustryId,
  type IndustryMaturity,
} from "../data/industry-modes"
import { resolveIndustryKpis } from "../lib/industry-kpis"

const ICONS: Record<IndustryId, typeof Shirt> = {
  fashion: Shirt,
  restaurant: UtensilsCrossed,
  manufacturing: Factory,
  jewelry: Gem,
}

function maturityStyle(m: IndustryMaturity): { color: string; background: string } {
  if (m === "LIVE") {
    return {
      color: "var(--app-pos)",
      background: "color-mix(in srgb, var(--app-pos) 14%, transparent)",
    }
  }
  if (m === "PARTIAL") {
    return {
      color: "var(--app-gold)",
      background: "color-mix(in srgb, var(--app-gold) 14%, transparent)",
    }
  }
  if (m === "NEEDS-HARDWARE") {
    return {
      color: "var(--app-accent)",
      background: "var(--app-accent-soft)",
    }
  }
  return {
    color: "var(--app-faint)",
    background: "var(--app-raise)",
  }
}

function readIndustry(): IndustryId {
  if (typeof window === "undefined") return "fashion"
  const q = new URLSearchParams(window.location.search).get("industry")
  if (isIndustryId(q)) return q
  try {
    const stored = window.localStorage.getItem(INDUSTRY_STORAGE_KEY)
    if (isIndustryId(stored)) return stored
  } catch {
    /* ignore */
  }
  return "fashion"
}

function persistIndustry(id: IndustryId) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(INDUSTRY_STORAGE_KEY, id)
  } catch {
    /* ignore */
  }
  const url = new URL(window.location.href)
  url.searchParams.set("industry", id)
  window.history.replaceState({}, "", url.toString())
}

/**
 * Industry use-case modes on Live hub.
 * Selector switches which KPI grid shows — does not invent sample data.
 */
export function IndustryModesPanel() {
  const edge = useEdgeSight()
  const [industry, setIndustry] = useState<IndustryId>("fashion")
  const [playbookOpen, setPlaybookOpen] = useState(false)

  useEffect(() => {
    setIndustry(readIndustry())
  }, [])

  const select = useCallback((id: IndustryId) => {
    setIndustry(id)
    persistIndustry(id)
  }, [])

  const mode = INDUSTRY_MODES[industry]
  const kpis = useMemo(
    () =>
      resolveIndustryKpis(
        industry,
        edge.status?.live ?? null,
        edge.liveState,
        edge.calibratedZones,
        edge.online,
      ),
    [industry, edge.status?.live, edge.liveState, edge.calibratedZones, edge.online],
  )

  const nfcHint = edge.status?.live?.nfc?.connect_hint
  const nfcNote = edge.status?.live?.nfc?.note

  return (
    <div className="flex flex-col gap-3">
      <div
        className="rounded-2xl border border-[var(--app-line)] px-4 py-3 sm:px-5"
        style={{ background: "var(--app-card)" }}
      >
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="font-inter cosmic-text-2xs font-bold uppercase tracking-[0.18em] text-[var(--app-faint)]">
              Industry mode
            </p>
            <p className="mt-0.5 font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">
              {mode.headline}
            </p>
            <p className="mt-1 max-w-2xl font-inter cosmic-text-xs text-[var(--app-sub)]">{mode.emphasis}</p>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Industry use-case"
          className="flex flex-wrap gap-1.5 rounded-xl border border-[var(--app-line)] bg-[var(--app-raise)] p-1"
        >
          {INDUSTRY_IDS.map((id) => {
            const Icon = ICONS[id]
            const active = industry === id
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => select(id)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 font-inter cosmic-text-xs font-semibold transition-colors sm:flex-none"
                style={{
                  background: active ? "var(--app-card)" : "transparent",
                  color: active ? "var(--app-accent)" : "var(--app-sub)",
                  boxShadow: active ? "0 0 0 1px var(--app-line)" : undefined,
                }}
              >
                <Icon size={14} />
                {INDUSTRY_MODES[id].label}
              </button>
            )
          })}
        </div>

        {industry === "fashion" && (nfcHint || nfcNote) ? (
          <p className="mt-3 rounded-xl border border-dashed border-[var(--app-line)] bg-[var(--app-raise)] px-3 py-2 font-inter cosmic-text-xs text-[var(--app-sub)]">
            <span className="font-semibold text-[var(--app-text)]">Connect NFC reader:</span>{" "}
            {nfcNote ?? "No taps yet."}
            {nfcHint ? (
              <>
                {" "}
                <code className="font-mono text-[var(--app-text)]">{nfcHint}</code>
              </>
            ) : null}
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((kpi) => (
          <LiveSegment
            key={kpi.id}
            title={kpi.title}
            brief={kpi.brief}
            value={
              kpi.maturity === "NEEDS-HARDWARE" && typeof kpi.value === "string"
                ? kpi.value
                : kpi.empty
                  ? null
                  : kpi.value
            }
            sourcePath={kpi.sourcePath}
            empty={kpi.maturity !== "NEEDS-HARDWARE" && kpi.empty}
            maturity={kpi.maturity}
          />
        ))}
      </div>

      {industry === "fashion" && (edge.status?.live?.nfc?.recent_taps?.length ?? 0) > 0 ? (
        <Panel title="Recent NFC taps" sub="From POST /api/v1/nfc/tap — real events only.">
          <ul className="divide-y divide-[var(--app-line)]">
            {(edge.status?.live?.nfc?.recent_taps ?? []).slice(0, 8).map((t, i) => (
              <li
                key={`${t.product_id}-${t.tapped_at ?? t.received_at ?? i}`}
                className="flex flex-wrap items-baseline justify-between gap-2 py-2 font-inter cosmic-text-xs"
              >
                <span className="font-semibold text-[var(--app-text)]">{t.product_id}</span>
                <span className="text-[var(--app-sub)]">
                  {t.zone ?? t.zone_id ?? "—"} · {t.tapped_at ?? t.received_at ?? "—"}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      <div
        className="rounded-2xl border border-[var(--app-line)]"
        style={{ background: "var(--app-card)" }}
      >
        <button
          type="button"
          onClick={() => setPlaybookOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:px-5"
          aria-expanded={playbookOpen}
        >
          <div>
            <p className="font-inter cosmic-text-2xs font-bold uppercase tracking-[0.18em] text-[var(--app-faint)]">
              Cross-industry playbook
            </p>
            <p className="mt-0.5 font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">
              How each vertical is helped · what to calibrate · models · maturity
            </p>
          </div>
          <ChevronDown
            size={18}
            className="shrink-0 text-[var(--app-faint)] transition-transform"
            style={{ transform: playbookOpen ? "rotate(180deg)" : undefined }}
          />
        </button>
        {playbookOpen ? (
          <div className="border-t border-[var(--app-line)] px-4 pb-4 pt-2 sm:px-5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="font-inter cosmic-text-2xs font-bold uppercase tracking-[0.12em] text-[var(--app-faint)]">
                    <th className="py-2 pr-3">Industry</th>
                    <th className="py-2 pr-3">Helped by</th>
                    <th className="py-2 pr-3">Calibrate</th>
                    <th className="py-2 pr-3">Models</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {CROSS_INDUSTRY_PLAYBOOK.map((row) => {
                    const style = maturityStyle(row.maturity)
                    return (
                      <tr key={row.id} className="border-t border-[var(--app-line)] align-top">
                        <td className="py-3 pr-3 font-inter cosmic-text-xs font-semibold text-[var(--app-text)]">
                          {row.label}
                        </td>
                        <td className="py-3 pr-3 font-inter cosmic-text-xs text-[var(--app-sub)]">
                          {row.helped}
                        </td>
                        <td className="py-3 pr-3 font-inter cosmic-text-xs text-[var(--app-sub)]">
                          {row.calibrate}
                        </td>
                        <td className="py-3 pr-3 font-inter cosmic-text-xs text-[var(--app-sub)]">
                          {row.models}
                        </td>
                        <td className="py-3">
                          <span
                            className="inline-flex items-center rounded-full px-2 py-0.5 font-inter cosmic-text-2xs font-semibold tracking-[0.04em]"
                            style={style}
                          >
                            {row.maturity}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 font-inter cosmic-text-2xs text-[var(--app-faint)]">
              LIVE = real signals · PARTIAL = producer exists but incomplete · EMPTY = no calibrated
              data · FUTURE = no producer · NEEDS-HARDWARE = connect NFC / reader. Selector never
              invents sample KPIs.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
