"use client"

import { Panel } from "../app/ui"
import { ACCOUNTING_FUTURE } from "../lib/store-brief"

/** CV + accounting join — FUTURE stub interface docs only. No fake ledgers. */
export function AccountingFutureCard() {
  const a = ACCOUNTING_FUTURE
  return (
    <Panel
      title={a.title}
      sub={a.summary}
      action={
        <span className="font-inter cosmic-text-2xs font-semibold uppercase tracking-[0.12em] text-[var(--app-faint)]">
          {a.badge}
        </span>
      }
    >
      <ul className="flex flex-col gap-3">
        {a.stubs.map((s) => (
          <li
            key={s.path}
            className="rounded-2xl border border-[var(--app-line)] bg-[var(--app-raise)] px-4 py-3"
          >
            <p className="font-mono cosmic-text-xs font-semibold text-[var(--app-text)]">
              {s.method} {s.path}
            </p>
            <p className="mt-1 font-inter cosmic-text-xs text-[var(--app-sub)]">{s.purpose}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 font-inter cosmic-text-xs leading-relaxed text-[var(--app-faint)]">{a.joinNote}</p>
      <p className="mt-2 font-mono cosmic-text-2xs text-[var(--app-faint)]">
        docs/video-to-text-store-brief.md · no sample daybook rows
      </p>
    </Panel>
  )
}
