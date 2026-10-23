"use client"

import { DataBadge } from "./DataBadge"
import type { DataBadge as DataBadgeModel } from "../lib/data-freshness"

type Props = {
  title: string
  /** One-sentence brief of what the metric means. */
  brief: string
  value: string | number | null | undefined
  /** JSON path or API source shown under the value. */
  sourcePath?: string
  badge?: DataBadgeModel | null
  /** Force EMPTY when offline / null even if badge missing. */
  empty?: boolean
  className?: string
}

/** Honest metric box: title + brief + value or — · LIVE|EMPTY badge. Never invents numbers. */
export function LiveSegment({
  title,
  brief,
  value,
  sourcePath,
  badge,
  empty,
  className = "",
}: Props) {
  const isEmpty =
    empty === true ||
    value == null ||
    value === "" ||
    value === "—" ||
    value === "nil"
  const shown = isEmpty ? "—" : value

  return (
    <div
      className={`flex flex-col gap-2 rounded-2xl border border-[var(--app-line)] bg-[var(--app-card)] px-4 py-3.5 ${className}`}
      style={{ boxShadow: "var(--app-shadow)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-inter cosmic-text-2xs font-bold uppercase tracking-[0.14em] text-[var(--app-faint)]">
          {title}
        </p>
        {badge ? (
          <DataBadge badge={badge} />
        ) : (
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 font-inter cosmic-text-2xs font-semibold tracking-[0.04em]"
            style={{
              color: isEmpty ? "var(--app-faint)" : "var(--app-pos)",
              background: isEmpty
                ? "var(--app-raise)"
                : "color-mix(in srgb, var(--app-pos) 14%, transparent)",
            }}
          >
            {isEmpty ? "EMPTY" : "LIVE"}
          </span>
        )}
      </div>
      <p className="font-num cosmic-text-2xl font-bold leading-none text-[var(--app-text)]">{shown}</p>
      <p className="font-inter cosmic-text-xs leading-snug text-[var(--app-sub)]">{brief}</p>
      {sourcePath ? (
        <p className="truncate font-mono cosmic-text-2xs text-[var(--app-faint)]" title={sourcePath}>
          {sourcePath}
        </p>
      ) : null}
    </div>
  )
}
