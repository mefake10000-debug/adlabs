"use client"

import { useEffect, useState, type ReactNode } from "react"
import { motion } from "framer-motion"
import {
  Crosshair, Radio, ExternalLink, RefreshCw, CheckCircle2, AlertCircle, Activity, Layers,
} from "lucide-react"
import { Panel, Chip, ScreenHeader, Label } from "../ui"
import { useEdgeSightOptional } from "../../hooks/useEdgeSight"
import { DUAL_DEPLOYMENT, FULL_SCOPE_MATRIX } from "../../data/models-pack"

const CALIB_URL = "http://localhost:8000/"
const OPS_URL = "http://localhost:8501/"
const HEALTH_URL = "/api/edgesight/health"
const DOCS_URL = "http://localhost:8000/docs"

const LIVE_COUNT = FULL_SCOPE_MATRIX.filter((r) => r.maturity === "Live").length
const FUTURE_COUNT = FULL_SCOPE_MATRIX.filter((r) => r.maturity === "Future" || r.maturity === "Blocked").length
const NEXT_COUNT = FULL_SCOPE_MATRIX.filter((r) => r.maturity === "Integrate next" || r.maturity === "Partial").length

type HealthState = "checking" | "live" | "down"

function useEdgeHealth(pollMs = 6000) {
  const [state, setState] = useState<HealthState>("checking")
  const [detail, setDetail] = useState<string>("")

  const probe = async () => {
    try {
      const res = await fetch(HEALTH_URL, { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as { online?: boolean; service?: string; error?: string }
      setState(data.online ? "live" : "down")
      setDetail(data.online ? (data.service ?? "EdgeSight API") : (data.error ?? "EdgeSight offline"))
    } catch {
      setState("down")
      setDetail("Start ADLabs-dev: docker compose up -d")
    }
  }

  useEffect(() => {
    void probe()
    const t = setInterval(() => void probe(), pollMs)
    return () => clearInterval(t)
  }, [pollMs])

  return { state, detail, refresh: probe }
}

function OpsFrame({
  title,
  eyebrow,
  href,
  live,
  children,
}: {
  title: string
  eyebrow: string
  href: string
  live: boolean
  children: ReactNode
}) {
  return (
    <Panel pad={false} className="overflow-hidden">
      <header className="flex flex-wrap items-center gap-3 border-b border-[var(--app-line)] px-5 py-4 sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="font-inter cosmic-text-2xs font-bold uppercase tracking-[0.18em] text-[var(--app-faint)]">
            {eyebrow}
          </p>
          <h2 className="font-inter cosmic-text-base font-bold text-[var(--app-text)]">{title}</h2>
        </div>
        <Chip tone={live ? "live" : "neutral"}>{live ? "EdgeSight reachable" : "Offline · open when Docker is up"}</Chip>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--app-line)] px-3 py-1.5 font-inter cosmic-text-xs font-semibold text-[var(--app-sub)] transition-colors hover:text-[var(--app-text)]"
        >
          Open tab <ExternalLink size={12} />
        </a>
      </header>
      <div className="relative bg-[var(--app-raise)]" style={{ minHeight: 420 }}>
        {children}
      </div>
    </Panel>
  )
}

export function LiveOps() {
  const { state, detail, refresh } = useEdgeHealth()
  const edge = useEdgeSightOptional()
  const live = state === "live"
  const [tab, setTab] = useState<"calib" | "ops">("calib")
  const cams = edge?.status?.cameras ?? []
  const device = edge?.status?.device

  return (
    <div className="flex flex-col gap-6">
      <ScreenHeader
        icon={Radio}
        eyebrow="Calibration / Live ops"
        title="EdgeSight live tools"
        sub="Calibration Studio (:8000) + Streamlit ops (:8501). Same layout family as Models & EdgeSight — multi-cam switcher and draw tools are live APIs only."
      >
        <Chip tone={live ? "live" : "gold"}>{live ? "API healthy" : state === "checking" ? "Checking…" : "API down"}</Chip>
        <button
          type="button"
          onClick={() => void refresh()}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--app-line)] px-3 py-1.5 font-inter cosmic-text-xs font-semibold text-[var(--app-sub)]"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </ScreenHeader>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--app-line)] px-4 py-3"
        style={{ background: "var(--app-card)" }}
      >
        {live ? (
          <CheckCircle2 size={16} className="text-[var(--app-pos)]" />
        ) : (
          <AlertCircle size={16} className="text-[var(--app-gold)]" />
        )}
        <p className="min-w-0 flex-1 font-inter cosmic-text-xs text-[var(--app-sub)]">
          <span className="font-semibold text-[var(--app-text)]">{detail}</span>
          {" · "}
          Embeds are <strong className="font-semibold">live</strong> EdgeSight when Docker is up.
          KPI tiles elsewhere blend live tripwire / queue / demographics with Organic Clothing Co. fixtures — maturity badges on Models screen.
          {" · "}
          {DUAL_DEPLOYMENT.shared}
        </p>
        <a href={DOCS_URL} target="_blank" rel="noreferrer" className="font-inter cosmic-text-xs font-semibold text-[var(--app-accent)]">
          API docs
        </a>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Panel>
          <Label>Cameras (API)</Label>
          <p className="mt-2 font-num cosmic-text-xl font-bold text-[var(--app-text)]">{cams.length || (live ? "—" : "0")}</p>
          <p className="mt-1 truncate font-mono cosmic-text-2xs text-[var(--app-faint)]">
            {cams.length ? cams.join(", ") : "Start Docker · switch cams in Calibration Studio"}
          </p>
        </Panel>
        <Panel>
          <Label>Pipeline FPS</Label>
          <p className="mt-2 font-num cosmic-text-xl font-bold text-[var(--app-text)]">{device?.pipeline_fps ?? "—"}</p>
          <p className="mt-1 font-inter cosmic-text-xs text-[var(--app-faint)]">{device?.inference_engine ?? "EdgeSight device health"}</p>
        </Panel>
        <Panel>
          <Label>Scope · Live / next / future</Label>
          <p className="mt-2 font-num cosmic-text-xl font-bold text-[var(--app-text)]">
            {LIVE_COUNT} · {NEXT_COUNT} · {FUTURE_COUNT}
          </p>
          <p className="mt-1 font-inter cosmic-text-xs text-[var(--app-faint)]">From full-scope matrix · Models screen</p>
        </Panel>
        <Panel>
          <Label>Advanced draw tools</Label>
          <p className="mt-2 font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">Tripwire · dwell · queue · staff</p>
          <p className="mt-1 font-inter cosmic-text-xs text-[var(--app-faint)]">Homography / ReID calib = Future</p>
        </Panel>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "calib" as const, label: "Calibration Studio", icon: Crosshair },
            { id: "ops" as const, label: "Ops UI (Streamlit)", icon: Activity },
          ]
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="inline-flex items-center gap-2 rounded-full border px-3.5 py-2 font-inter cosmic-text-xs font-semibold transition-colors"
            style={{
              borderColor: tab === t.id ? "var(--app-accent)" : "var(--app-line)",
              background: tab === t.id ? "var(--app-accent-soft)" : "var(--app-card)",
              color: tab === t.id ? "var(--app-accent)" : "var(--app-sub)",
            }}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "calib" ? (
        <OpsFrame
          eyebrow="localhost:8000"
          title="Calibration Studio"
          href={CALIB_URL}
          live={live}
        >
          {live ? (
            <iframe
              title="EdgeSight Calibration Studio"
              src={CALIB_URL}
              className="h-[min(72vh,720px)] w-full border-0"
              allow="clipboard-read; clipboard-write"
            />
          ) : (
            <OfflineHint url={CALIB_URL} name="Calibration Studio" />
          )}
        </OpsFrame>
      ) : (
        <OpsFrame
          eyebrow="localhost:8501"
          title="Streamlit operations UI"
          href={OPS_URL}
          live={live}
        >
          {live ? (
            <iframe
              title="EdgeSight Streamlit ops"
              src={OPS_URL}
              className="h-[min(72vh,720px)] w-full border-0"
            />
          ) : (
            <OfflineHint url={OPS_URL} name="Streamlit ops" />
          )}
        </OpsFrame>
      )}

      <Panel
        title="How to run EdgeSight"
        sub="Friend-reviewed mefake/integration only — never push NuclearQuince or rajendrac3 main."
        action={
          <span className="inline-flex items-center gap-1.5 font-inter cosmic-text-xs font-semibold text-[var(--app-faint)]">
            <Layers size={12} /> Sidebar → Models & EdgeSight
          </span>
        }
      >
        <pre className="overflow-x-auto rounded-2xl border border-[var(--app-line)] bg-[var(--app-raise)] p-4 font-mono cosmic-text-xs leading-relaxed text-[var(--app-sub)]">
{`cd ~/Desktop/ad-labs-project/repos/ADLabs-dev
git checkout mefake/integration
python scripts/download_models.py
python scripts/download_pack_models.py
docker compose up -d
# optional pack mount:
docker compose -f docker-compose.yml -f docker-compose.pack.yml up -d

# Calibration  http://localhost:8000/
# Streamlit    http://localhost:8501/
# Website      http://localhost:3000/dashboard/live`}
        </pre>
        <p className="mt-3 font-inter cosmic-text-xs text-[var(--app-faint)]">
          Edge: {DUAL_DEPLOYMENT.edge} Cloud: {DUAL_DEPLOYMENT.cloud}
        </p>
      </Panel>
    </div>
  )
}

function OfflineHint({ url, name }: { url: string; name: string }) {
  return (
    <div className="flex h-[420px] flex-col items-center justify-center gap-3 px-6 text-center">
      <Radio size={28} className="text-[var(--app-faint)]" />
      <p className="font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">{name} is offline</p>
      <p className="max-w-md font-inter cosmic-text-xs text-[var(--app-faint)]">
        Start ADLabs-dev with Docker Compose, then refresh. You can also open{" "}
        <a className="text-[var(--app-accent)] underline" href={url} target="_blank" rel="noreferrer">{url}</a>{" "}
        directly once the stack is healthy.
      </p>
    </div>
  )
}
