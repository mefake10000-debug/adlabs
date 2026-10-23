"use client"

import {
  Activity,
  Cpu,
  Download,
  ExternalLink,
  Layers,
  RefreshCw,
  Server,
  Video,
} from "lucide-react"
import { Panel, Label, Chip, ScreenHeader } from "../ui"
import { useEdgeSight } from "../../hooks/useEdgeSight"
import {
  EDGE_SIGHT_PORTAL_DOCS,
  EDGE_SIGHT_PORTAL_LIVE,
  formatDwell,
} from "../../lib/edgesight"
import {
  DUAL_DEPLOYMENT,
  FULL_SCOPE_MATRIX,
  HONESTY_BARS,
  MODEL_STATUS_LEGEND,
  MODELS_EXISTING,
  MODELS_NEXT,
  PACK_FOLDERS,
  PACK_RUN_HINTS,
  PIPELINE_STAGES,
  type ModelStatus,
} from "../../data/models-pack"

const STATUS_COLOR: Record<ModelStatus, string> = {
  live: "var(--app-pos)",
  partial: "var(--app-gold)",
  proxy: "#5ac8fa",
  next: "var(--app-accent)",
  learns: "#AF52DE",
  future: "#AF52DE",
  "no-cv": "var(--app-faint)",
}

const MATURITY_TONE: Record<string, string> = {
  Live: "var(--app-pos)",
  Demo: "var(--app-gold)",
  Partial: "var(--app-gold)",
  "Integrate next": "var(--app-accent)",
  Learns: "#AF52DE",
  Future: "#AF52DE",
  "Not CV": "var(--app-faint)",
  Blocked: "#FF3B30",
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
        eyebrow="Models pack · EdgeSight"
        title="Models & EdgeSight"
        sub="Live CV via portal proxy when Docker is up · full planned scope matrix below · pack weights segregated · Calibration / ops on Live ops."
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
          <Label>Infer FPS · mode</Label>
          <p className="mt-2 font-num cosmic-text-xl font-bold text-[var(--app-text)]">
            {live?.infer_fps ?? device?.pipeline_fps ?? "—"}
          </p>
          <p className="mt-1 font-inter cosmic-text-xs text-[var(--app-faint)]">
            {live?.models?.perf_mode
              ? `${live.models.perf_mode} · ${live.models.person_detector ?? "detect"} · decode ${live.decode_fps ?? "—"}`
              : device?.inference_engine ?? "Start Docker for live FPS"}
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
            <ExtLink href={EDGE_SIGHT_PORTAL_LIVE}>Calibration / Live ops</ExtLink>
            <ExtLink href={`${EDGE_SIGHT_PORTAL_LIVE}?panel=video`}>Live video + KPIs</ExtLink>
            <ExtLink href={`${EDGE_SIGHT_PORTAL_LIVE}?panel=calib`}>Calibration Studio</ExtLink>
            <ExtLink href={`${EDGE_SIGHT_PORTAL_LIVE}?panel=ops`}>Ops UI</ExtLink>
            <ExtLink href={EDGE_SIGHT_PORTAL_DOCS}>API docs</ExtLink>
          </div>
          {(status?.cameras?.length ?? 0) > 0 && (
            <p className="mt-3 font-inter cosmic-text-xs text-[var(--app-faint)]">
              Cameras from EdgeSight:{" "}
              <span className="font-mono text-[var(--app-sub)]">{(status?.cameras ?? []).join(", ")}</span>
              {" · "}
              Multi-cam ReID / occupancy dedup still <span className="text-[var(--app-gold)]">Future</span>.
            </p>
          )}
        </Panel>

        <Panel title="Pipeline stages" sub="Detect → track → zones → enrichment → metrics">
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

      <Panel
        title="Dual deployment"
        sub="Edge AI and Cloud are peers — same storefront signals"
        verified="DPDP · GDPR"
      >
        <ul className="flex flex-col gap-2 font-inter cosmic-text-xs leading-relaxed text-[var(--app-sub)]">
          <li>· {DUAL_DEPLOYMENT.edge}</li>
          <li>· {DUAL_DEPLOYMENT.cloud}</li>
          <li>· {DUAL_DEPLOYMENT.shared}</li>
        </ul>
      </Panel>

      <Panel
        title="Segregated pack · download & Docker"
        sub="Next-integrate weights under models/pack/ — not mixed into production models/*.pt until wired."
        action={<Label>{PACK_RUN_HINTS.branch}</Label>}
        verified="Friend-readable"
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {PACK_FOLDERS.map((f) => (
            <div key={f.id} className="rounded-xl border border-[var(--app-line)] p-3">
              <p className="font-mono cosmic-text-2xs text-[var(--app-accent)]">{f.folder}</p>
              <p className="mt-1 font-inter cosmic-text-xs font-semibold text-[var(--app-text)]">{f.role}</p>
              <p className="mt-0.5 font-mono cosmic-text-2xs text-[var(--app-faint)]">{f.weight}</p>
              <p className="mt-2 font-inter cosmic-text-2xs text-[var(--app-sub)]">{f.status}</p>
              {f.url ? (
                <a
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block font-mono cosmic-text-2xs text-[var(--app-accent)] underline"
                >
                  download URL
                </a>
              ) : null}
            </div>
          ))}
        </div>
        <pre className="mt-4 overflow-x-auto rounded-2xl border border-[var(--app-line)] bg-[var(--app-raise)] p-4 font-mono cosmic-text-xs leading-relaxed text-[var(--app-sub)]">
{`# ADLabs-dev · mefake/integration
cd ~/Desktop/ad-labs-project/repos/ADLabs-dev
${PACK_RUN_HINTS.downloadProd}
${PACK_RUN_HINTS.download}
${PACK_RUN_HINTS.docker}
# mount: ${PACK_RUN_HINTS.mount}`}
        </pre>
        <p className="mt-3 flex items-start gap-2 font-inter cosmic-text-xs text-[var(--app-faint)]">
          <Download size={12} className="mt-0.5 shrink-0" />
          Weights are gitignored. Re-run download scripts on any machine; OSNet stays default-off (no face ReID).
        </p>
      </Panel>

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

      <Panel
        title="Full scope matrix"
        sub="Every planned model/capability from the models pack — Live · Demo · Partial · Next · Future · Not CV"
        action={<Label>{FULL_SCOPE_MATRIX.length} rows</Label>}
        verified="Anti-hallucination"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-[var(--app-line)] font-inter cosmic-text-2xs uppercase tracking-[0.08em] text-[var(--app-faint)]">
                <th className="pb-2 pr-3 font-semibold">Capability</th>
                <th className="pb-2 pr-3 font-semibold">Maturity</th>
                <th className="pb-2 pr-3 font-semibold">Weight / code</th>
                <th className="pb-2 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {FULL_SCOPE_MATRIX.map((row) => (
                <tr key={row.id} className="border-b border-[var(--app-line)]/60 align-top">
                  <td className="py-2.5 pr-3 font-inter cosmic-text-xs font-semibold text-[var(--app-text)]">
                    {row.capability}
                    <div className="mt-0.5 font-normal text-[var(--app-faint)]">{row.planned}</div>
                  </td>
                  <td className="py-2.5 pr-3">
                    <span
                      className="inline-flex rounded-full px-2 py-0.5 font-inter cosmic-text-2xs font-semibold"
                      style={{
                        color: MATURITY_TONE[row.maturity] ?? "var(--app-sub)",
                        background: `color-mix(in srgb, ${MATURITY_TONE[row.maturity] ?? "var(--app-faint)"} 14%, transparent)`,
                      }}
                    >
                      {row.maturity}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 font-mono cosmic-text-2xs text-[var(--app-sub)]">{row.weightOrCode}</td>
                  <td className="py-2.5 font-inter cosmic-text-xs text-[var(--app-faint)]">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
