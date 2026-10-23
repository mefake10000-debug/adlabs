"use client"

import { Panel } from "../app/ui"
import { buildStoreBrief, type JourneyBlock } from "../lib/store-brief"
import type { EdgeSightLive } from "../lib/edgesight"

type Props = {
  online: boolean
  live: EdgeSightLive | null | undefined
  journey?: JourneyBlock | null
  error?: string | null
}

/** Plain-text store brief from real live fields — ≤4 lines, no status chip. */
export function LiveStoreBrief({ online, live, journey, error }: Props) {
  const bullets = buildStoreBrief({
    online,
    live,
    journey: journey ?? live?.journey,
    error,
  }).slice(0, 4)

  return (
    <Panel title="Store brief" sub="One glance from the live camera — never invented.">
      {bullets.length === 0 ? (
        <p className="font-inter cosmic-text-sm text-[var(--app-faint)]">—</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {bullets.map((line) => (
            <li
              key={line}
              className="border-l-2 border-[var(--app-line)] pl-3 font-inter cosmic-text-sm leading-relaxed text-[var(--app-text)]"
            >
              {line}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}
