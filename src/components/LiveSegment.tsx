"use client"

type Props = {
  title: string
  /** One-sentence brief of what the metric means. */
  brief: string
  value: string | number | null | undefined
  /** JSON path or API source shown under the value. */
  sourcePath?: string
  /** Force empty when offline / null. */
  empty?: boolean
  /** @deprecated Kept for peer call sites; badges no longer render on KPI tiles. */
  badge?: unknown
  /** @deprecated Maturity pills removed from default KPI tiles — quiet — / 0 only. */
  maturity?: string | null
  className?: string
}

/**
 * Quiet metric box: title + brief + value or —.
 * No LIVE / PARTIAL / EMPTY chips — header owns the single status clock.
 */
export function LiveSegment({
  title,
  brief,
  value,
  sourcePath,
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
      <p className="font-inter cosmic-text-2xs font-bold uppercase tracking-[0.14em] text-[var(--app-faint)]">
        {title}
      </p>
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
