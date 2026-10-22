"use client"

import { useState } from "react"
import { TriangleAlert, Map } from "lucide-react"
import { Panel, Label, ScreenHeader, Chip } from "../ui"
import { HeatGrid, HBars } from "../charts"
import { AnnotatedImage } from "../../components/AnnotatedImage"
import type { ImageCallout, ImageZone } from "../../components/AnnotatedImage"
import { ZONES, TENANT, SIMULATED_NOTE, ZONE_METRIC_NOTE } from "../../data/dashboard"
import { useEdgeSight } from "../../hooks/useEdgeSight"
import { formatWait } from "../../lib/edgesight"

const FLOOR_MARKS: Record<string, { zone: ImageZone; callout: ImageCallout }> = {
  H3: {
    zone: { code: "H3", points: "52,18 78,18 82,48 48,52", tone: "accent" },
    callout: { id: "H3", n: 1, label: "H3 · Hero", detail: "55% entered", x: 64, y: 32, tone: "accent" },
  },
  L2: {
    zone: { code: "L2", points: "22,48 48,44 52,78 18,82", tone: "pos" },
    callout: { id: "L2", n: 2, label: "L2 · Leather", detail: "68% entered", x: 34, y: 62, tone: "pos" },
  },
  A1: {
    zone: { code: "A1", points: "70,55 92,52 95,88 68,90", tone: "muted" },
    callout: { id: "A1", n: 3, label: "A1 · Apparel", detail: "41% entered", x: 82, y: 72, tone: "neutral" },
  },
  F1: {
    zone: { code: "F1", points: "4,22 22,20 26,48 6,52", tone: "warn" },
    callout: { id: "F1", n: 4, label: "F1 · West", detail: "9% · under-lit", x: 14, y: 36, tone: "warn" },
  },
}

const CARD_CODES = ["H3", "L2", "A1", "F1"] as const

export function Zones() {
  const { calibratedZones, occupancy, sourceChip, online, tripwireCount, status } = useEdgeSight()
  const [selected, setSelected] = useState<string>("H3")
  const sorted = [...ZONES].sort((a, b) => b.traffic - a.traffic).slice(0, 6)
  const flagged = ZONES.filter((z) => z.flag)
  const cardZones = CARD_CODES.map((code) => ZONES.find((z) => z.code === code)!).filter(Boolean)

  const activeZones: ImageZone[] = Object.entries(FLOOR_MARKS).map(([code, m]) => ({
    ...m.zone,
    selected: selected === code,
    tone: selected === code ? m.zone.tone : "muted",
  }))
  const activeCallouts: ImageCallout[] = Object.entries(FLOOR_MARKS).map(([code, m]) => ({
    ...m.callout,
    tone: selected === code ? m.callout.tone : "neutral",
  }))

  return (
    <div className="flex flex-col gap-5">
      <ScreenHeader
        icon={Map}
        eyebrow="Live now"
        title="Floor zones"
        sub="Entered zone + dwell — tap a card or mark to focus. Zones overlap."
      >
        <Chip tone={sourceChip.tone} title={sourceChip.title}>{sourceChip.label}</Chip>
        {!online && <Chip tone="neutral" title={SIMULATED_NOTE}>Demo</Chip>}
      </ScreenHeader>

      {online && (
        <Panel
          title="EdgeSight calibrated zones"
          sub="From cameras.yaml via /api/v1/config/cameras — not the marketing floor codes below."
          action={<Label>{calibratedZones.length} zones · {tripwireCount} tripwires</Label>}
          verified="Calibration Studio polygons"
        >
          {calibratedZones.length === 0 ? (
            <p className="font-inter cosmic-text-sm text-[var(--app-sub)]">
              No zones on live cameras. Draw queue / staff / dwell polygons in Calibration Studio (:8000).
            </p>
          ) : (
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {calibratedZones.map((z) => (
                <li
                  key={`${z.cameraId}-${z.id}`}
                  className="rounded-xl border border-[var(--app-line)] px-4 py-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono cosmic-text-2xs text-[var(--app-accent)]">{z.type}</span>
                    <span className="font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">{z.name}</span>
                  </div>
                  <p className="mt-1 font-inter cosmic-text-xs text-[var(--app-faint)]">
                    {z.cameraName} · {z.points} polygon pts
                    {z.type === "queue"
                      ? ` · live queue ${occupancy.queue} · wait ${occupancy.avgWait}`
                      : z.type === "staff"
                        ? " · sticky staff exclusion after min dwell"
                        : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 font-inter cosmic-text-2xs text-[var(--app-faint)]">
            Occupancy now {occupancy.now} · last updated {status?.live?.last_updated ?? "—"} · wait{" "}
            {formatWait(status?.live?.avg_queue_wait_seconds ?? 0)}
          </p>
        </Panel>
      )}

      <Panel pad={false} className="overflow-hidden">
        <AnnotatedImage
          src="/images/in-store-zones.jpg"
          alt={`${TENANT.store} — in-store zones`}
          aspectClass="aspect-[21/9] sm:aspect-[2.6/1]"
          badges={[
            { text: "CAM 02 · FLOOR", tone: "live", corner: "tl" },
            { text: `SELECTED · ${selected}`, tone: "after", corner: "tr" },
          ]}
          zones={activeZones}
          callouts={activeCallouts}
          selectedId={selected}
          onSelect={setSelected}
          caption={TENANT.store}
          metric={`${selected} focused · entered zone + dwell`}
          explain={ZONE_METRIC_NOTE}
          className="rounded-none border-0"
          gradient
        />

        <div className="border-t border-[var(--app-line)] px-4 py-4 sm:px-5">
          <p className="mb-3 font-inter cosmic-text-xs text-[var(--app-faint)]">{ZONE_METRIC_NOTE}</p>
          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4" role="listbox" aria-label="Floor zones">
            {cardZones.map((z) => {
              const active = selected === z.code
              const warn = Boolean(z.flag)
              return (
                <li key={z.code} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => setSelected(z.code)}
                    className={`w-full rounded-xl px-3 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)] ${
                      active
                        ? warn
                          ? "border-2 border-amber-500/50 bg-amber-500/10"
                          : "border-2 border-[var(--app-accent)] bg-[var(--app-accent-soft)]"
                        : "border border-[var(--app-line)] bg-[var(--app-card)] hover:border-[var(--app-line-strong)]"
                    }`}
                  >
                    <p className="font-mono cosmic-text-2xs text-[var(--app-accent)]">{z.code}</p>
                    <p className="mt-0.5 truncate font-inter cosmic-text-xs font-semibold text-[var(--app-text)]">
                      {z.name}
                    </p>
                    <p className="mt-2 font-num cosmic-text-lg font-bold text-[var(--app-text)]">{z.traffic}%</p>
                    <p className="mt-0.5 font-inter cosmic-text-2xs uppercase tracking-[0.06em] text-[var(--app-faint)]">
                      Entered zone
                    </p>
                    <p className="mt-1 font-num cosmic-text-xs text-[var(--app-faint)]">{z.dwell} dwell</p>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Panel
          title="Floor heat · today"
          action={<Label>{ZONES.length} zones</Label>}
          info="Each cell = floor zone · colour ≈ entered-zone intensity · red dot = flagged."
        >
          <HeatGrid zones={ZONES} />
          <div className="mt-4 flex items-center gap-3">
            <span className="font-inter cosmic-text-2xs text-[var(--app-faint)]">Cold</span>
            <div
              className="h-1.5 flex-1 rounded-full"
              style={{
                background:
                  "linear-gradient(to right, var(--app-card), color-mix(in srgb, var(--app-gold) 72%, var(--app-card)))",
              }}
            />
            <span className="font-inter cosmic-text-2xs text-[var(--app-faint)]">Hot</span>
          </div>
        </Panel>

        <div className="flex flex-col gap-5">
          <Panel title="Entered-zone rates" info="Overlapping — need not sum to 100%.">
            <HBars items={sorted.map((z) => ({ label: z.name, pct: z.traffic }))} />
          </Panel>

          {flagged.map((z) => (
            <Panel key={z.code} pad={false}>
              <div className="flex items-start gap-3 p-5">
                <span
                  className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full"
                  style={{ background: "color-mix(in srgb, var(--app-neg) 12%, transparent)", color: "var(--app-neg)" }}
                >
                  <TriangleAlert size={15} strokeWidth={2.3} />
                </span>
                <div>
                  <p className="font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">
                    Zone {z.code} — {z.name}
                  </p>
                  <p className="mt-1 font-inter cosmic-text-xs leading-relaxed text-[var(--app-sub)]">{z.flag}</p>
                  <p className="mt-2 font-inter cosmic-text-xs text-[var(--app-faint)]">
                    Suggested move: relight at 18:00 and re-measure for 7 days.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelected(z.code)}
                    className="mt-2 font-inter cosmic-text-xs font-semibold text-[var(--app-accent)] underline-offset-2 hover:underline"
                  >
                    Focus {z.code} on photo
                  </button>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      </div>
    </div>
  )
}
