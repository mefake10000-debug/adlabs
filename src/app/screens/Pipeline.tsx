"use client"

import {
  Activity,
  Cpu,
  ExternalLink,
  Layers,
  RefreshCw,
  Server,
  Video,
} from "lucide-react"
import { Panel, Label, Chip, ScreenHeader } from "../ui"
import { useEdgeSight } from "../../hooks/useEdgeSight"
import {
  EDGE_SIGHT_CALIB_URL,
  EDGE_SIGHT_DOCS_URL,
  EDGE_SIGHT_UI_URL,
  formatDwell,
} from "../../lib/edgesight"
import {
  HONESTY_BARS,
  MODEL_STATUS_LEGEND,
  MODELS_EXISTING,
  MODELS_NEXT,
  PIPELINE_STAGES,
  type ModelStatus,
} from "../../data/models-pack"

const STATUS_COLOR: Record<ModelStatus, string> = {
  live: "var(--app-pos)",
  partial: "var(--app-gold)",
  proxy: "#5ac8fa",
  next: "var(--app-accent)",
  learns: "#AF52DE",
  "no-cv": "var(--app-faint)",
}

export function Pipeline() {
  const { status, loading, refresh, occupancy, liveKpis, sourceChip } = useEdgeSight()
  const online = Boolean(status?.online)
  const device = status?.device
  const live = status?.live
  const products = status?.products?.categories ?? []

  return (
    <div className="flex flex-col gap-5">
      <ScreenHeader
        icon={Layers}
        eyebrow="Integration"
        title="Models & EdgeSight"
        sub="Live CV from localhost:8000 when Docker is up · otherwise showcase fixtures. Honest labels only."
      >
        <Chip tone={sourceChip.tone} title={sourceChip.title}>
          {sourceChip.label}
        </Chip>
        <button
          type="button"
          onClick={refresh}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--app-line)] px-3 py-1.5 font-inter cosmic-text-xs font-semibold text-[var(--app-sub)] hover:text-[var(--app-text)]"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : undefined} />
          Refresh
        </button>
      </ScreenHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Panel>
          <Label>EdgeSight API</Label>
          <p className="mt-2 font-num cosmic-text-xl font-bold text-[var(--app-text)]">
            {online ? "Online" : "Offline"}
          </p>
          <p className="mt-1 font-inter cosmic-text-xs text-[var(--app-faint)]">
            {status?.baseUrl ?? "http://localhost:8000"}
          </p>
        </Panel>
        <Panel>
          <Label>Pipeline FPS</Label>
          <p className="mt-2 font-num cosmic-text-xl font-bold text-[var(--app-text)]">
            {device?.pipeline_fps ?? "—"}
          </p>
          <p className="mt-1 font-inter cosmic-text-xs text-[var(--app-faint)]">
            {device?.inference_engine ?? "Start Docker for live FPS"}
          </p>
        </Panel>
        <Panel>
          <Label>Entries (tripwire)</Label>
          <p className="mt-2 font-num cosmic-text-xl font-bold text-[var(--app-text)]">{liveKpis.entries}</p>
          <p className="mt-1 font-inter cosmic-text-xs text-[var(--app-faint)]">
            Exits {live?.total_exits?.toLocaleString("en-IN") ?? "—"} · dwell {liveKpis.dwell}
          </p>
        </Panel>
        <Panel>
          <Label>Queue · occupancy</Label>
          <p className="mt-2 font-num cosmic-text-xl font-bold text-[var(--app-text)]">
            {occupancy.queue} · {occupancy.now}/{occupancy.capacity}
          </p>
          <p className="mt-1 font-inter cosmic-text-xs text-[var(--app-faint)]">
            Wait {occupancy.avgWait}
            {live?.queue_alert_active ? " · alert on" : ""}
          </p>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <Panel
          title="Edge node"
          action={<Label>{device?.status ?? (online ? "ok" : "n/a")}</Label>}
          verified="ADLabs-dev Docker"
        >
          {device ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Meta icon={Server} label="Device" value={device.device_name} />
              <Meta icon={Cpu} label="CPU / mem" value={`${device.cpu_usage_percent}% · ${device.memory_usage_percent}%`} />
              <Meta icon={Video} label="Cameras" value={(status?.cameras ?? []).join(", ") || "—"} />
              <Meta
                icon={Activity}
                label="Engaged / facing"
                value={
                  liveKpis.engagedRatio && liveKpis.facingRatio
                    ? `${liveKpis.engagedRatio} engaged · ${liveKpis.facingRatio} facing`
                    : "—"
                }
              />
            </div>
          ) : (
            <p className="font-inter cosmic-text-sm text-[var(--app-faint)]">
              {status?.error ??
                "EdgeSight is offline. From ADLabs-dev: docker compose up -d — then refresh."}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--app-line)] pt-3">
            <ExtLink href={EDGE_SIGHT_UI_URL}>Ops UI :8501</ExtLink>
            <ExtLink href={EDGE_SIGHT_CALIB_URL}>Calibration Studio :8000</ExtLink>
            <ExtLink href={EDGE_SIGHT_DOCS_URL}>API docs</ExtLink>
          </div>
        </Panel>

        <Panel title="Pipeline stages" sub="Detect → track → zones → attributes → metrics">
          <ol className="flex flex-col gap-2.5">
            {PIPELINE_STAGES.map((s) => (
              <li
                key={s.step}
                className="flex items-start gap-3 rounded-xl border border-[var(--app-line)] px-3.5 py-2.5"
              >
                <span
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full font-inter cosmic-text-2xs font-bold"
                  style={{ background: "var(--app-accent-soft)", color: "var(--app-accent)" }}
                >
                  {s.step}
                </span>
                <div>
                  <p className="font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">{s.title}</p>
                  <p className="font-inter cosmic-text-xs text-[var(--app-faint)]">{s.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      {products.length > 0 && (
        <Panel
          title="Near-display interest (live)"
          action={<Label>YOLO-World</Label>}
          sub="Category proximity + dwell from EdgeSight — not SKU OCR / POS"
        >
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 8).map((p) => (
              <div key={p.category} className="rounded-xl border border-[var(--app-line)] p-3">
                <p className="truncate font-inter cosmic-text-sm font-semibold capitalize text-[var(--app-text)]">
                  {p.category}
                </p>
                <p className="mt-1 font-num cosmic-text-xs text-[var(--app-faint)]">
                  {p.viewers.toLocaleString("en-IN")} viewers · avg {formatDwell(p.avg_dwell_seconds)}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <Panel title="Models in EdgeSight today" action={<Label>{MODELS_EXISTING.length}</Label>}>
        <ModelGrid cards={MODELS_EXISTING} />
      </Panel>

      <Panel title="Next integrates & honesty" action={<Label>models pack</Label>}>
        <ModelGrid cards={MODELS_NEXT} />
        <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--app-line)] pt-3">
          {MODEL_STATUS_LEGEND.map((l) => (
            <span
              key={l.status}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--app-line)] px-2.5 py-1 font-inter cosmic-text-2xs"
              title={l.hint}
              style={{ color: STATUS_COLOR[l.status] }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COLOR[l.status] }} />
              {l.label}
            </span>
          ))}
        </div>
      </Panel>

      <Panel title="Honesty bars" pad>
        <ul className="flex flex-col gap-2">
          {HONESTY_BARS.map((line) => (
            <li key={line} className="font-inter cosmic-text-xs leading-relaxed text-[var(--app-sub)]">
              · {line}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}

function ModelGrid({ cards }: { cards: typeof MODELS_EXISTING }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {cards.map((m) => (
        <article
          key={m.id}
          className="rounded-xl border border-[var(--app-line)] px-3.5 py-3"
          style={{ background: "color-mix(in srgb, var(--app-bg) 40%, transparent)" }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">{m.name}</p>
              <p className="mt-0.5 font-inter cosmic-text-2xs uppercase tracking-[0.08em] text-[var(--app-faint)]">
                {m.role}
              </p>
            </div>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 font-inter cosmic-text-2xs font-semibold"
              style={{
                color: STATUS_COLOR[m.status],
                background: `color-mix(in srgb, ${STATUS_COLOR[m.status]} 14%, transparent)`,
              }}
            >
              {m.statusLabel}
            </span>
          </div>
          <p className="mt-2 font-inter cosmic-text-xs leading-relaxed text-[var(--app-sub)]">{m.unlocks}</p>
        </article>
      ))}
    </div>
  )
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Server
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-[var(--app-line)] p-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
        <Icon size={14} />
      </span>
      <div className="min-w-0">
        <p className="font-inter cosmic-text-2xs text-[var(--app-faint)]">{label}</p>
        <p className="truncate font-inter cosmic-text-xs font-semibold text-[var(--app-text)]">{value}</p>
      </div>
    </div>
  )
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--app-line)] px-3 py-1.5 font-inter cosmic-text-xs font-semibold text-[var(--app-sub)] hover:text-[var(--app-text)]"
    >
      {children}
      <ExternalLink size={11} />
    </a>
  )
}
