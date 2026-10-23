"use client"

import { Panel, Chip } from "../app/ui"
import { buildStoreBrief, type JourneyBlock } from "../lib/store-brief"
import type { EdgeSightLive } from "../lib/edgesight"

type Props = {
  online: boolean
  live: EdgeSightLive | null | undefined
  journey?: JourneyBlock | null
  error?: string | null
}

/** Plain-text store brief from real live fields — video → text for the owner. */
export function LiveStoreBrief({ online, live, journey, error }: Props) {
  const bullets = buildStoreBrief({ online, live, journey: journey ?? live?.journey, error })

  return (
    <Panel
      title="Live store brief"
      sub="Plain text from /api/v1/live only — no demo copy."
      action={<Chip tone={online ? "live" : "neutral"}>{online ? "LIVE" : "EMPTY"}</Chip>}
    >
      <ul className="flex flex-col gap-2.5">
        {bullets.map((line) => (
          <li
            key={line}
            className="border-l-2 border-[var(--app-line)] pl-3 font-inter cosmic-text-sm leading-relaxed text-[var(--app-text)]"
          >
            {line}
          </li>
        ))}
      </ul>
      <p className="mt-4 font-mono cosmic-text-2xs text-[var(--app-faint)]">
        template · total_visitors · people_now · total_exits · queue_* · journey.summary
      </p>
    </Panel>
  )
}
