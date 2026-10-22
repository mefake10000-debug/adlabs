"use client"

import type { DataBadge as DataBadgeModel, DataBadgeTone } from "../lib/data-freshness"

const TONE_STYLE: Record<DataBadgeTone, { color: string; background: string; border?: string }> = {
  live: {
    color: "#0a1f12",
    background: "color-mix(in srgb, var(--app-pos) 78%, #c8f5d4)",
  },
  partial: {
    color: "var(--app-gold)",
    background: "var(--app-gold-soft)",
  },
  "no-data": {
    color: "var(--app-sub)",
    background: "var(--app-raise)",
    border: "1px solid var(--app-line)",
  },
}

/**
 * Honest LIVE / PARTIAL / NO-DATA pill for dashboard sections.
 * LIVE requires present non-null data + loaded:true models — never decorate demo fixtures as live.
 */
export function DataBadge({
  badge,
  className = "",
}: {
  badge: DataBadgeModel
  className?: string
}) {
  const style = TONE_STYLE[badge.tone]
  return (
    <span
      title={badge.title}
      aria-label={`${badge.label}: ${badge.title}`}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-inter cosmic-text-xs font-semibold tracking-[0.04em] ${className}`}
      style={style}
    >
      {badge.tone === "live" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#0a1f12] opacity-50 animate-pulse-ring" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#0a1f12]" />
        </span>
      )}
      {badge.tone === "partial" && (
        <span className="rounded-full" style={{ background: "var(--app-gold)", width: 6, height: 6 }} />
      )}
      {badge.tone === "no-data" && (
        <span
          className="rounded-full"
          style={{ width: 6, height: 6, border: "1.5px solid var(--app-faint)" }}
        />
      )}
      {badge.label}
    </span>
  )
}

/** Empty-state copy when a section is NO-DATA — never invent zeros. */
export function NoDataState({
  label,
  detail,
}: {
  label?: string
  detail?: string
}) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--app-line)] px-4 py-6 text-center">
      <p className="font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">
        {label ?? "No data"}
      </p>
      {detail && (
        <p className="mt-1 font-inter cosmic-text-xs text-[var(--app-faint)]">{detail}</p>
      )}
    </div>
  )
}
