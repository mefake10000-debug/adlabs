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

function statusTone(status: string): "live" | "gold" | "neutral" {
  if (status === "live") return "live"
  if (status === "dead_zone") return "gold"
  return "neutral"
}

function statusLabel(s: JourneyStageRow): string {
  if (s.status === "live") return "Live"
  if (s.status === "dead_zone" || s.dead_zone) return "Dead zone"
  return "Missing"
}

export function JourneyHealth({ journey, online, actionSlot, industrySlot }: Props) {
  const stages = journey?.stages ?? []
  const summary = journey?.summary
  const slot = actionSlot ?? industrySlot

  return (
    <Panel
      title="Service journey layout"
      sub="Path stages from zone tags. Values stay 0 until zones match stage tags."
      action={
        <div className="flex flex-wrap items-center gap-2">
          {slot}
          <Chip tone={online && stages.length ? "live" : "neutral"}>
            {online ? (journey?.metaphor ?? "retail path") : "offline"}
          </Chip>
        </div>
      }
    >
      {summary ? (
        <p className="mb-4 font-inter cosmic-text-xs text-[var(--app-sub)]">
          {summary.calibrated} calibrated · {summary.live} live · {summary.dead_zone} dead zone
          {summary.dead_zone === 1 ? "" : "s"} · {summary.missing} missing
        </p>
      ) : (
        <p className="mb-4 font-inter cosmic-text-xs text-[var(--app-faint)]">
          Waiting for <code className="font-mono">/api/v1/live.journey</code>
          {" — "}
          defaults to missing stages with 0 visits.
        </p>
      )}

      <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {(stages.length
          ? stages
          : ([
              "Welcome drink",
              "Starter",
              "Appetizer",
              "Main",
              "Dessert",
              "Fruit",
            ].map((label, i) => ({
              id: `placeholder_${i}`,
              label,
              retail_label: null,
              calibrated: false,
              status: "missing",
              dead_zone: false,
              visits: 0,
              occupancy: 0,
              avg_dwell_seconds: 0,
              how_to_implement: "Open Set up zones and name a dwell polygon with this stage tag.",
              setup_href: "/dashboard/live?panel=calib",
            })) as JourneyStageRow[])
        ).map((stage) => (
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
            <p className="font-num cosmic-text-sm text-[var(--app-text)]">
              visits {stage.visits ?? 0} · dwell {stage.avg_dwell_seconds ?? 0}s · occ {stage.occupancy ?? 0}
            </p>
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
        ))}
      </ol>
    </Panel>
  )
}
