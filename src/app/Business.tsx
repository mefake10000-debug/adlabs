import { Wallet, ShoppingBag, Percent, Megaphone, IndianRupee, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"
import { useEdgeSightOptional } from "../hooks/useEdgeSight"
import { Panel, Label } from "./ui"

const ICONS: Record<string, typeof Wallet> = {
  yield: Wallet,
  basket: ShoppingBag,
  pos: Percent,
  megaphone: Megaphone,
  currency: IndianRupee,
}

/** Camera signals — live EdgeSight only. Never fall back to showcase KPI fixtures. */
export function BusinessKpis() {
  const edge = useEdgeSightOptional()
  const online = Boolean(edge?.online)
  const kpis = online ? edge!.businessLive : null
  return (
    <Panel
      title="Camera signals today"
      action={<Label>{online ? "Live cameras" : "Waiting"}</Label>}
      verified={online ? "Tripwire · zones · queue from cameras" : "No demo numbers — waiting for cameras"}
    >
      {!kpis ? (
        <p className="font-inter cosmic-text-sm text-[var(--app-faint)]">
          — Start EdgeSight to fill these. Showcase store numbers are never shown here.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {kpis.map((k) => {
            const Icon = ICONS[k.iconHint] ?? Wallet
            const up = k.tone === "pos"
            const flat = k.tone === "flat"
            return (
              <div
                key={k.label}
                className="relative overflow-hidden rounded-xl border border-[var(--app-line)] p-3.5"
                style={{ background: "color-mix(in srgb, var(--app-bg) 55%, transparent)" }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="grid h-7 w-7 place-items-center rounded-lg"
                    style={{ background: "var(--app-gold-soft)", color: "var(--app-gold)" }}
                  >
                    <Icon size={14} strokeWidth={2.2} />
                  </span>
                </div>
                <p className="mt-3 font-num cosmic-text-xl font-bold leading-none tracking-[-0.01em] text-[var(--app-text)]">
                  {k.value}
                </p>
                <p className="mt-1.5 font-inter cosmic-text-xs font-semibold text-[var(--app-text)]">{k.label}</p>
                <p
                  className="mt-1 flex items-center gap-1 font-inter cosmic-text-2xs"
                  style={{ color: up ? "var(--app-pos)" : flat ? "var(--app-faint)" : "var(--app-neg)" }}
                >
                  {up ? <ArrowUpRight size={11} /> : flat ? <Minus size={11} /> : <ArrowDownRight size={11} />}
                  <span className="font-num">{k.delta}</span>
                  <span className="font-normal text-[var(--app-faint)]">{k.note}</span>
                </p>
              </div>
            )
          })}
        </div>
      )}
    </Panel>
  )
}

type OccupancyShape = {
  now: number
  capacity: number
  level: number
  queue: number
  avgWait: string
  peakWindow: string
  trend: number[]
}

const EMPTY_OCC: OccupancyShape = {
  now: 0,
  capacity: 0,
  level: 0,
  queue: 0,
  avgWait: "—",
  peakWindow: "—",
  trend: [],
}

export function OccupancyGauge({
  compact = false,
  occupancy,
}: {
  compact?: boolean
  occupancy?: OccupancyShape
}) {
  const edge = useEdgeSightOptional()
  const online = Boolean(edge?.online)
  // Never fall back to showcase OCCUPANCY (34/60 etc.)
  const o: OccupancyShape = occupancy ?? (online ? edge!.occupancy : EMPTY_OCC)
  const hasCapacity = o.capacity > 0
  const pct = hasCapacity ? Math.min((o.now / o.capacity) * 100, 100) : 0
  const r = 42
  const c = 2 * Math.PI * r
  const filled = (pct / 100) * c
  const tone = o.level >= 80 ? "var(--app-neg)" : o.level >= 55 ? "var(--app-gold)" : "var(--app-pos)"

  if (!online && !occupancy) {
    if (compact) {
      return (
        <div className="flex items-center gap-3 rounded-xl border border-[var(--app-line)] p-3.5">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--app-raise)] text-[var(--app-faint)]">
            <span className="font-num cosmic-text-sm font-bold">—</span>
          </div>
          <div className="min-w-0">
            <p className="font-inter cosmic-text-xs font-semibold text-[var(--app-text)]">Occupancy</p>
            <p className="font-inter cosmic-text-2xs text-[var(--app-faint)]">Needs live cameras</p>
          </div>
        </div>
      )
    }
    return (
      <Panel title="Live occupancy" action={<Label>—</Label>}>
        <p className="py-8 text-center font-inter cosmic-text-sm text-[var(--app-faint)]">
          Waiting for cameras — no demo occupancy.
        </p>
      </Panel>
    )
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-[var(--app-line)] p-3.5">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--app-gold-soft)] text-[var(--app-gold)]">
          <span className="font-num cosmic-text-sm font-bold">{o.now}</span>
        </div>
        <div className="min-w-0">
          <p className="font-inter cosmic-text-xs font-semibold text-[var(--app-text)]">Occupancy</p>
          <p className="font-inter cosmic-text-2xs text-[var(--app-faint)]">
            {hasCapacity ? `${o.now} of ${o.capacity} capacity` : `${o.now} people now`}
          </p>
        </div>
      </div>
    )
  }

  return (
    <Panel title="Live occupancy" action={<Label>{hasCapacity ? `${o.level}%` : "people"}</Label>}>
      <div className="flex flex-col items-center py-2">
        <svg width="120" height="120" viewBox="0 0 100 100" className="-rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--app-grid)" strokeWidth="9" />
          {hasCapacity ? (
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={tone}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${filled} ${c}`}
              style={{ transition: "stroke-dasharray 0.6s cubic-bezier(0.16,1,0.3,1)" }}
            />
          ) : null}
        </svg>
        <div className="-mt-[84px] text-center">
          <p className="font-num cosmic-text-2xl font-bold text-[var(--app-text)]">
            {o.now}
            {hasCapacity ? (
              <span className="text-[var(--app-faint)] cosmic-text-sm">/{o.capacity}</span>
            ) : null}
          </p>
          <p className="font-inter cosmic-text-2xs font-bold uppercase tracking-[0.1em]" style={{ color: tone }}>
            In store
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-[var(--app-line)] p-2 text-center">
          <p className="font-num cosmic-text-sm font-bold text-[var(--app-text)]">{o.queue}</p>
          <p className="font-inter cosmic-text-2xs font-bold uppercase tracking-[0.08em] text-[var(--app-faint)]">Queue</p>
        </div>
        <div className="rounded-lg border border-[var(--app-line)] p-2 text-center">
          <p className="font-num cosmic-text-sm font-bold text-[var(--app-text)]">{o.avgWait}</p>
          <p className="font-inter cosmic-text-2xs font-bold uppercase tracking-[0.08em] text-[var(--app-faint)]">Wait ∅</p>
        </div>
        <div className="rounded-lg border border-[var(--app-line)] p-2 text-center">
          <p className="font-num cosmic-text-xs font-bold text-[var(--app-gold)]">{o.peakWindow}</p>
          <p className="font-inter cosmic-text-2xs font-bold uppercase tracking-[0.08em] text-[var(--app-faint)]">Peak</p>
        </div>
      </div>
      {o.trend.length > 0 ? (
        <label className="mt-3 flex items-center justify-between font-inter cosmic-text-2xs text-[var(--app-faint)]">
          <span>Present spark</span>
          <span className="font-num">{o.trend[o.trend.length - 1]}</span>
        </label>
      ) : (
        <p className="mt-3 font-inter cosmic-text-2xs text-[var(--app-faint)]">
          Trend fills from live Present samples — never a demo curve.
        </p>
      )}
    </Panel>
  )
}
