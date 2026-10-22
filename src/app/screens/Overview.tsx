import { useState } from "react"
import { motion } from "framer-motion"
import { CountUp } from "../../components/CountUp"
import { OccupancyGauge } from "../Business"
import { Skeleton } from "../../components/Skeleton"
import { useMountLoader } from "../../utils/useMountLoader"
import {
  TrendingUp, Store, Megaphone, Map, FileText, Users,
  Eye, DoorOpen, Timer, Footprints, Clock, Clock3,
} from "lucide-react"
import { Panel, Label, DeltaPill, PeerDot, Segmented, Chip, ScreenHeader, MetricLabel } from "../ui"
import { AreaChart, FunnelBars, Sparkline } from "../charts"
import {
  KPIS, FUNNEL, TENANT,
  STORES, BRIEF, CAMPAIGNS, ZONES,
} from "../../data/dashboard"
import { useEdgeSight } from "../../hooks/useEdgeSight"
import { LiveVision } from "../../components/LiveVision"

const AFT_CAMPAIGN = CAMPAIGNS[0]

const KPI_ICONS: Record<string, { icon: typeof Eye; tint: string }> = {
  footfall: { icon: Footprints, tint: "var(--app-accent)" },
  stop: { icon: Eye, tint: "var(--app-gold)" },
  walkins: { icon: DoorOpen, tint: "var(--app-pos)" },
  dwell: { icon: Timer, tint: "var(--app-accent)" },
}

const QUICK = [
  { icon: TrendingUp, label: "Entrances", screen: "storefront" as const },
  { icon: Map, label: "Floor zones", screen: "zones" as const },
  { icon: Users, label: "Queues", screen: "queues" as const },
  { icon: Megaphone, label: "Window performance", screen: "campaigns" as const },
  { icon: Store, label: "All stores", screen: "stores" as const },
  { icon: FileText, label: "Monday brief", screen: "brief" as const },
]

const TOP_ZONES = [...ZONES].sort((a, b) => b.traffic - a.traffic).slice(0, 4)

export function Overview({ onNavigate }: { onNavigate?: (screen: string) => void }) {
  const [period, setPeriod] = useState<"Today" | "This week">("Today")
  const loading = useMountLoader()
  const { occupancy, trafficHours, sourceChip, liveKpis, status } = useEdgeSight()
  const online = Boolean(status?.online && status.live)
  const baseKpis = period === "Today" ? KPIS.today : KPIS.week
  const kpis =
    period === "Today" && online
      ? baseKpis.map((k) => {
          if (k.id === "walkins") {
            return {
              ...k,
              value: liveKpis.entries,
              deltaNote: "EdgeSight tripwire IN",
              hint: "Entrance tripwire · live via portal → EdgeSight",
            }
          }
          if (k.id === "dwell") {
            return {
              ...k,
              value: liveKpis.dwell,
              deltaNote: "EdgeSight avg dwell",
              hint: "Zone / time-in-frame dwell · live",
            }
          }
          return k
        })
      : baseKpis
  const funnel = period === "Today" ? FUNNEL.today : FUNNEL.week
  const liveStrip = [
    {
      icon: Eye,
      label: "Stop rate",
      value: online && liveKpis.engagedRatio ? liveKpis.engagedRatio : "7.5%",
      sub: online && liveKpis.engagedRatio
        ? "engaged ratio · Partial (not window-stop)"
        : "window ≥4s · demo (rule not shipped)",
    },
    {
      icon: Users,
      label: "In store",
      value: `${occupancy.now}`,
      sub: online && status?.live?.source === "live_snapshot"
        ? "active tracks · YOLO"
        : `of ${occupancy.capacity}`,
    },
    { icon: Clock, label: "Queue", value: `${occupancy.queue} · ${occupancy.avgWait}`, sub: "checkout wait" },
    {
      icon: Clock3,
      label: "Peak",
      value: occupancy.peakWindow.split("–")[0]?.trim() || "—",
      sub: occupancy.peakWindow.includes("–")
        ? `– ${occupancy.peakWindow.split("–")[1]?.trim()}`
        : "rollup",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <ScreenHeader
        eyebrow="Live now"
        title="Today"
        sub={`${TENANT.name} · ${TENANT.store} — entries, stop rate, dwell, queue.`}
      >
        <Chip tone="live">Live</Chip>
        <Chip tone={sourceChip.tone} title={sourceChip.title}>{sourceChip.label}</Chip>
        <Segmented options={["Today", "This week"] as const} value={period} onChange={setPeriod} />
      </ScreenHeader>

      {/* Live YOLO stream — detections drive the strip KPIs below */}
      <LiveVision compact />

      {/* What’s happening now */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {liveStrip.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="flex items-center gap-3 rounded-2xl border border-[var(--app-line)] bg-[var(--app-card)] px-4 py-3.5"
              style={{ boxShadow: "var(--app-shadow)" }}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
                <Icon size={16} strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="font-num cosmic-text-lg font-bold leading-none text-[var(--app-text)]">{s.value}</p>
                <p className="mt-1 truncate font-inter cosmic-text-2xs text-[var(--app-faint)]">
                  {s.label} · {s.sub}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Period KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4" aria-busy={loading}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Panel key={i} className="h-full">
                <Skeleton className="h-[11px] w-16" />
                <Skeleton className="mt-3 h-[26px] w-24" />
                <Skeleton className="mt-3 h-[20px] w-28" />
              </Panel>
            ))
          : kpis.map((k, i) => (
              <motion.div
                key={k.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04, ease: "easeOut" }}
              >
                <Panel className="h-full">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-2">
                      {(() => {
                        const meta = KPI_ICONS[k.id]
                        const Icon = meta ? meta.icon : TrendingUp
                        return (
                          <span
                            className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg"
                            style={{ background: "var(--app-accent-soft)", color: meta ? meta.tint : "var(--app-accent)" }}
                          >
                            <Icon size={14} strokeWidth={2.1} />
                          </span>
                        )
                      })()}
                      <MetricLabel label={k.label} hint={k.hint} />
                    </div>
                    {k.peer && <PeerDot peer={k.peer} />}
                  </div>
                  <p className="mt-2.5 font-num cosmic-text-2xl font-bold leading-none tracking-[-0.01em] text-[var(--app-text)]">
                    <MagicNumber value={k.value} />
                  </p>
                  <div className="mt-2.5">
                    <DeltaPill delta={k.delta} tone={k.deltaTone} note={k.deltaNote} />
                  </div>
                </Panel>
              </motion.div>
            ))}
      </div>

      {/* Where — floor + occupancy */}
      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <section
          className="app-panel overflow-hidden rounded-3xl border border-[var(--app-line)] bg-[var(--app-card)]"
          style={{ boxShadow: "var(--app-shadow)" }}
        >
          <header className="flex items-center justify-between gap-3 px-6 pt-5 sm:px-7">
            <h3 className="card-title text-[var(--app-text)]">Floor zones</h3>
            <button
              type="button"
              onClick={() => onNavigate?.("zones")}
              className="font-inter cosmic-text-xs font-semibold text-[var(--app-accent)] hover:underline"
            >
              Open map →
            </button>
          </header>
          <div className="relative mt-4">
            <img
              src="/images/in-store-zones.jpg"
              alt={`${TENANT.store} floor zones`}
              loading="lazy"
              className="aspect-[16/9] w-full object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[var(--app-card)] via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 grid grid-cols-2 gap-2 p-4 sm:grid-cols-4">
              {TOP_ZONES.map((z) => (
                <div
                  key={z.code}
                  className="rounded-lg border border-[var(--app-line)] bg-[var(--app-card)]/90 px-2.5 py-2 backdrop-blur-sm"
                >
                  <p className="truncate font-inter cosmic-text-2xs font-semibold text-[var(--app-text)]">{z.name}</p>
                  <p className="mt-0.5 font-num cosmic-text-xs text-[var(--app-faint)]">
                    {z.traffic}% entered · {z.dwell}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <OccupancyGauge occupancy={occupancy} />
      </div>

      {/* Traffic + funnel */}
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Panel
          title="Hourly traffic"
          action={<Label>{period}</Label>}
          verified={online ? "EdgeSight rollups" : "Camera rollups · demo"}
        >
          <AreaChart data={trafficHours} peaks={[{ from: "15", to: "17" }]} />
        </Panel>
        <Panel title="Pass → stop → enter" action={<Label>{period}</Label>}>
          <FunnelBars stages={funnel} />
        </Panel>
      </div>

      {/* Proof — A/B + stores */}
      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <Panel title="Window performance" action={<Label>{AFT_CAMPAIGN.window}</Label>} verified="14-day A/B">
          <div className="flex flex-col gap-4">
            <div className="mb-0.5 flex items-baseline justify-between gap-3">
              <span className="font-inter cosmic-text-xs text-[var(--app-text)]">{AFT_CAMPAIGN.metricLabel}</span>
              <span className="font-inter cosmic-text-xs font-semibold font-num text-[var(--app-text)]">
                {AFT_CAMPAIGN.before} <span className="text-[var(--app-faint)]">→</span> {AFT_CAMPAIGN.after}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--app-grid)" }}>
                <div className="h-full rounded-full" style={{ width: "72%", background: "var(--app-faint)" }} />
              </div>
              <span className="w-12 shrink-0 text-right font-num cosmic-text-xs text-[var(--app-faint)]">{AFT_CAMPAIGN.before}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--app-grid)" }}>
                <div className="h-full rounded-full" style={{ width: "88%", background: "var(--app-gold)" }} />
              </div>
              <span className="w-12 shrink-0 text-right font-num cosmic-text-xs text-[var(--app-text)]">{AFT_CAMPAIGN.after}</span>
            </div>
            <p className="font-inter cosmic-text-lg font-bold font-num" style={{ color: "var(--app-pos)" }}>
              {AFT_CAMPAIGN.uplift}
            </p>
          </div>
        </Panel>

        <Panel title="Stores" action={<Label>{STORES.length}</Label>}>
          <div className="flex flex-col gap-3">
            {STORES.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--app-line)] p-3.5">
                <div className="min-w-0">
                  <p className="truncate font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">{s.name}</p>
                  <p className="font-inter cosmic-text-xs text-[var(--app-faint)]">
                    {s.footfallToday.toLocaleString("en-IN")} passes · stop {s.stopRate}
                  </p>
                </div>
                <Sparkline data={s.spark} tone={s.trend === "up" ? "pos" : s.trend === "down" ? "neg" : "gold"} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Decisions */}
      <Panel title="This week · decisions" action={<Label>{BRIEF.week}</Label>}>
        <ol className="grid gap-3 sm:grid-cols-3">
          {BRIEF.actions.map((a, i) => (
            <li key={a.title} className="flex items-start gap-3 rounded-xl border border-[var(--app-line)] p-4">
              <span
                className="grid h-6 w-6 shrink-0 place-items-center rounded-full font-inter cosmic-text-xs font-bold"
                style={{ background: "var(--app-gold-soft)", color: "var(--app-gold)" }}
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="font-inter cosmic-text-sm font-medium leading-snug text-[var(--app-text)]">{a.title}</p>
                <p className="mt-1 font-inter cosmic-text-xs text-[var(--app-faint)]">{a.tag} · {a.priority}</p>
              </div>
            </li>
          ))}
        </ol>
      </Panel>

      <Panel pad={false}>
        <div className="grid grid-cols-3 gap-1 p-2 sm:grid-cols-6">
          {QUICK.map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={() => onNavigate?.(q.screen)}
              className="group flex flex-col items-center gap-2 rounded-xl px-2 py-3.5 text-center transition-colors hover:bg-[var(--app-raise)]"
            >
              <q.icon size={17} strokeWidth={2} className="text-[var(--app-sub)] transition-colors group-hover:text-[var(--app-accent)]" />
              <span className="font-inter cosmic-text-xs font-semibold text-[var(--app-text)]">{q.label}</span>
            </button>
          ))}
        </div>
      </Panel>

      <p className="font-inter cosmic-text-xs text-[var(--app-faint)]">
        {TENANT.name} · {TENANT.store} · {sourceChip.title}
        {" · "}
        <button
          type="button"
          className="text-[var(--app-accent)] hover:underline"
          onClick={() => onNavigate?.("pipeline")}
        >
          Models & EdgeSight →
        </button>
      </p>
    </div>
  )
}

function MagicNumber({ value }: { value: string }) {
  const isNumeric = /^-?[\d][\d,]*\.?\d*%?$/.test(value.trim())
  if (!isNumeric) return <>{value}</>
  const hasPct = value.includes("%")
  const num = parseFloat(value.replace(/[^0-9.]/g, ""))
  if (!Number.isFinite(num)) return <>{value}</>
  const decimals = hasPct ? 1 : value.includes(".") ? 1 : 0
  return (
    <>
      <CountUp to={num} decimals={decimals} />
      {hasPct ? "%" : ""}
    </>
  )
}
