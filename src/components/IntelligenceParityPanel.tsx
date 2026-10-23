"use client"

import { Compass } from "lucide-react"
import { Panel } from "../app/ui"
import { DataBadge } from "./DataBadge"
import {
  INTELLIGENCE_PARITY_CARDS,
  type ParityCard,
  type ParityMaturity,
} from "../data/intelligence-parity"
import type { DataBadge as DataBadgeModel, SectionId } from "../lib/data-freshness"

const FUTURE_STYLE = {
  color: "var(--app-faint)",
  background: "var(--app-raise)",
  border: "1px solid var(--app-line)",
} as const

const BLOCKED_STYLE = {
  color: "#7a1f1f",
  background: "color-mix(in srgb, #c45c5c 18%, transparent)",
  border: "1px solid color-mix(in srgb, #c45c5c 35%, transparent)",
} as const

function resolveBadge(
  card: ParityCard,
  sectionBadges: Record<SectionId, DataBadgeModel>,
): { kind: "section"; badge: DataBadgeModel } | { kind: "fixed"; label: ParityMaturity; title: string } {
  if (card.fixedMaturity) {
    return {
      kind: "fixed",
      label: card.fixedMaturity,
      title: card.note,
    }
  }
  if (card.sectionId) {
    const badge = sectionBadges[card.sectionId]
    // NO-DATA from live wiring still means "not inventing metrics" → show as PARTIAL for parity UX
    if (badge.tone === "no-data") {
      return {
        kind: "fixed",
        label: "PARTIAL",
        title: `${badge.title} · empty/null live fields — not fabricated`,
      }
    }
    return { kind: "section", badge }
  }
  return { kind: "fixed", label: "FUTURE", title: card.note }
}

function FixedMaturityPill({ label, title }: { label: ParityMaturity; title: string }) {
  if (label === "LIVE" || label === "PARTIAL") {
    return (
      <DataBadge
        badge={{
          tone: label === "LIVE" ? "live" : "partial",
          label,
          title,
        }}
      />
    )
  }
  const style = label === "BLOCKED" ? BLOCKED_STYLE : FUTURE_STYLE
  return (
    <span
      title={title}
      aria-label={`${label}: ${title}`}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-inter cosmic-text-xs font-semibold tracking-[0.04em]"
      style={style}
    >
      <span
        className="rounded-full"
        style={{
          width: 6,
          height: 6,
          background: label === "BLOCKED" ? "#7a1f1f" : "var(--app-faint)",
        }}
      />
      {label}
    </span>
  )
}

/**
 * Competitor-inspired capability grid. Badges track real /api/v1/live section state
 * where wired; FUTURE/BLOCKED cards never show fake metrics.
 */
export function IntelligenceParityPanel({
  sectionBadges,
}: {
  sectionBadges: Record<SectionId, DataBadgeModel>
}) {
  return (
    <Panel
      title="Intelligence parity"
      sub="Capability cards inspired by Cactus · Shire · Neurospot — open models only. Badges follow live EdgeSight fields; empty stays PARTIAL/FUTURE."
      action={
        <span className="inline-flex items-center gap-1.5 font-inter cosmic-text-xs font-semibold text-[var(--app-faint)]">
          <Compass size={12} /> docs/competitor-parity-auki-shire-neurospot.md
        </span>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {INTELLIGENCE_PARITY_CARDS.map((card) => {
          const resolved = resolveBadge(card, sectionBadges)
          return (
            <article
              key={card.id}
              className="flex flex-col gap-2 rounded-2xl border border-[var(--app-line)] bg-[var(--app-raise)] px-4 py-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-inter cosmic-text-2xs font-bold uppercase tracking-[0.14em] text-[var(--app-faint)]">
                    {card.inspiredBy} · {card.portalSection}
                  </p>
                  <h4 className="mt-0.5 font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">
                    {card.title}
                  </h4>
                </div>
                {resolved.kind === "section" ? (
                  <DataBadge badge={resolved.badge} />
                ) : (
                  <FixedMaturityPill label={resolved.label} title={resolved.title} />
                )}
              </div>
              <p className="font-inter cosmic-text-xs text-[var(--app-sub)]">{card.note}</p>
              <p className="font-mono cosmic-text-2xs text-[var(--app-faint)]">
                {card.liveFields.length
                  ? card.liveFields.join(" · ")
                  : "no live fields yet"}
              </p>
              <p className="font-inter cosmic-text-2xs text-[var(--app-faint)]">{card.openModels}</p>
            </article>
          )
        })}
      </div>
    </Panel>
  )
}
