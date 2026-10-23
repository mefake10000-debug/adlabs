"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { Panel, Chip } from "../app/ui"
import type { JourneyBlock, JourneyStageRow } from "../lib/store-brief"

type Props = {
  journey: JourneyBlock | null | undefined
  online: boolean
  /** Optional action-row slot (e.g. retail deep-link chip). */
  actionSlot?: ReactNode
  /** @deprecated Use actionSlot — industry vertical UI is retired. */
  industrySlot?: ReactNode
}

const RETAIL_PLACEHOLDERS = [
  "Entrance",
  "Path",
  "Dwell",
  "Queue",
  "Staff",
  "Shelf",
]

function statusTone(status: string): "live" | "gold" | "neutral" {
  if (status === "live") return "live"
  if (status === "dead_zone") return "gold"
  return "neutral"
}

function statusLabel(s: JourneyStageRow): string {
  if (s.status === "live") return "Live"
  if (s.status === "dead_zone" || s.dead_zone) return "Dead zone"
  return "Needs setup"
}

export function JourneyHealth({ journey, online, actionSlot, industrySlot }: Props) {
  const stages = journey?.stages ?? []
  const summary = journey?.summary
  const slot = actionSlot ?? industrySlot
  const hasLiveStages = stages.length > 0

  return (
    <Panel
      title="Store journey"
      sub="Floor path from entrance to shelf. Numbers appear only after you tag matching zones."
      action={
        <div className="flex flex-wrap items-center gap-2">
          {slot}
          <Chip tone={online && hasLiveStages ? "live" : "neutral"}>
            {online ? (journey?.metaphor ?? "retail path") : "offline"}
          </Chip>
        </div>
      }
    >
      {summary ? (
        <p className="mb-4 font-inter cosmic-text-xs text-[var(--app-sub)]">
          {summary.calibrated} calibrated · {summary.live} live · {summary.dead_zone} quiet
          {summary.dead_zone === 1 ? "" : ""} · {summary.missing} still need zones
        </p>
      ) : (
        <p className="mb-4 font-inter cosmic-text-xs text-[var(--app-faint)]">
          Needs: tag dwell / queue / staff zones so each stage can fill. No placeholder visit counts.
        </p>
      )}

      <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {hasLiveStages
          ? stages.map((stage) => {
              const ready = stage.status === "live" || stage.calibrated
              return (
                <li
                  key={stage.id}
                  className="flex flex-col gap-2 rounded-2xl border border-[var(--app-line)] bg-[var(--app-raise)] px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-inter cosmic-text-sm font-bold text-[var(--app-text)]">{stage.label}</p>
                      {stage.retail_label ? (
                        <p className="font-inter cosmic-text-2xs text-[var(--app-faint)]">{stage.retail_label}</p>
                      ) : null}
                    </div>
                    <Chip tone={statusTone(stage.status)}>{statusLabel(stage)}</Chip>
                  </div>
                  {ready ? (
                    <p className="font-num cosmic-text-sm text-[var(--app-text)]">
                      visits {stage.visits} · dwell {stage.avg_dwell_seconds}s · occ {stage.occupancy}
                    </p>
                  ) : (
                    <p className="font-inter cosmic-text-sm font-semibold text-[var(--app-gold)]">
                      Needs: zone for this stage
                    </p>
                  )}
                  <p className="font-inter cosmic-text-xs leading-snug text-[var(--app-sub)]">
                    {stage.how_to_implement ??
                      "Draw a dwell zone and name it with this stage’s tag."}
                  </p>
                  <Link
                    href={stage.setup_href ?? "/dashboard/live?panel=calib"}
                    className="font-inter cosmic-text-xs font-semibold text-[var(--app-accent)]"
                  >
                    Set up zones →
                  </Link>
                </li>
              )
            })
          : RETAIL_PLACEHOLDERS.map((label) => (
              <li
                key={label}
                className="flex flex-col gap-2 rounded-2xl border border-[var(--app-line)] bg-[var(--app-raise)] px-4 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-inter cosmic-text-sm font-bold text-[var(--app-text)]">{label}</p>
                  <Chip tone="neutral">Needs setup</Chip>
                </div>
                <p className="font-inter cosmic-text-sm font-semibold text-[var(--app-gold)]">
                  Needs: zone for this stage
                </p>
                <p className="font-inter cosmic-text-xs leading-snug text-[var(--app-sub)]">
                  Draw a zone tagged “{label.toLowerCase()}” in Set up zones. No visit count until then.
                </p>
                <Link
                  href="/dashboard/live?panel=calib"
                  className="font-inter cosmic-text-xs font-semibold text-[var(--app-accent)]"
                >
                  Set up zones →
                </Link>
              </li>
            ))}
      </ol>
    </Panel>
  )
}
