"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { motion } from "framer-motion"
import {
  Crosshair, Radio, RefreshCw, CheckCircle2, AlertCircle, Activity, Layers, Video,
} from "lucide-react"
import { Panel, Chip, ScreenHeader, Label } from "../ui"
import { useEdgeSight } from "../../hooks/useEdgeSight"
import { DataBadge } from "../../components/DataBadge"
import { DUAL_DEPLOYMENT, FULL_SCOPE_MATRIX } from "../../data/models-pack"
import {
  EDGE_SIGHT_OPS_EMBED,
  EDGE_SIGHT_PORTAL_CALIB,
  EDGE_SIGHT_PORTAL_DOCS,
} from "../../lib/edgesight"
import { LiveVision } from "../../components/LiveVision"
import { IntelligenceParityPanel } from "../../components/IntelligenceParityPanel"

const LIVE_COUNT = FULL_SCOPE_MATRIX.filter((r) => r.maturity === "Live").length
const FUTURE_COUNT = FULL_SCOPE_MATRIX.filter((r) => r.maturity === "Future" || r.maturity === "Blocked").length
const NEXT_COUNT = FULL_SCOPE_MATRIX.filter((r) => r.maturity === "Integrate next" || r.maturity === "Partial").length

type PanelId = "video" | "calib" | "ops"

function readPanelFromUrl(): PanelId {
  if (typeof window === "undefined") return "video"
  const q = new URLSearchParams(window.location.search).get("panel")
  if (q === "calib" || q === "ops" || q === "video") return q
  const path = window.location.pathname
  if (path.endsWith("/calibrate")) return "calib"
  if (path.endsWith("/ops")) return "ops"
  return "video"
}

function OpsFrame({
  title,
  eyebrow,
  live,
  children,
}: {
  title: string
  eyebrow: string
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
        <Chip tone={live ? "live" : "neutral"}>{live ? "EdgeSight reachable" : "Offline · start Docker"}</Chip>
      </header>
      <div className="relative bg-[var(--app-raise)]" style={{ minHeight: 420 }}>
        {children}
      </div>
    </Panel>
  )
}

export function LiveOps() {
  const edge = useEdgeSight()
  const live = edge.online
  const detail = live
    ? edge.status?.health?.service ?? "EdgeSight API"
    : edge.status?.error ?? "Start ADLabs-dev: docker compose up -d"
  const refresh = edge.refresh
  const [tab, setTab] = useState<PanelId>("video")
  const cams = edge.status?.cameras ?? []
  const device = edge.status?.device
  const state: "checking" | "live" | "down" = edge.loading && !edge.status ? "checking" : live ? "live" : "down"
  const badges = edge.sectionBadges

  const streamCam = useMemo(() => {
    const fromLive = edge.status?.live?.camera_id
    if (fromLive) return fromLive
    return cams[0] ?? "cam_entrance_01"
  }, [cams, edge.status?.live?.camera_id])

  useEffect(() => {
    setTab(readPanelFromUrl())
  }, [])

  const selectTab = (id: PanelId) => {
    setTab(id)
    if (typeof window === "undefined") return
    const url = new URL(window.location.href)
    url.pathname = "/dashboard/live"
    url.searchParams.set("panel", id)
    window.history.replaceState({}, "", url.toString())
  }

  return (
    <div className="flex flex-col gap-6">
      <ScreenHeader
        icon={Radio}
        eyebrow="Calibration / Live ops"
        title="EdgeSight live tools"
        sub="All tools stay on localhost:3000 — Calibration Studio and Streamlit run as Docker backends, proxied into this dashboard."
      >
        <DataBadge badge={badges.connectivity} />
        <DataBadge badge={badges.camera_wall} />
        <Chip tone={live ? "live" : "gold"}>{live ? "API healthy" : state === "checking" ? "Checking…" : "API down"}</Chip>
        {edge.connectivityAgeSeconds != null && (
          <Chip tone="neutral" title="live/state updated_epoch">
            age {edge.connectivityAgeSeconds}s
          </Chip>
        )}
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
          Portal routes: <code className="font-mono text-[var(--app-text)]">/dashboard/live/calibrate</code>
          {" · "}
          <code className="font-mono text-[var(--app-text)]">/dashboard/live/ops</code>
          {" · "}
          YOLO MJPEG + KPIs below. {DUAL_DEPLOYMENT.shared}
        </p>
        <a href={EDGE_SIGHT_PORTAL_DOCS} className="font-inter cosmic-text-xs font-semibold text-[var(--app-accent)]">
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

      <IntelligenceParityPanel sectionBadges={badges} />

      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "video" as const, label: "Live video + KPIs", icon: Video },
            { id: "calib" as const, label: "Calibration Studio", icon: Crosshair },
            { id: "ops" as const, label: "Ops UI (Streamlit)", icon: Activity },
          ]
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => selectTab(t.id)}
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

      {tab === "video" ? (
        <LiveVision cameraId={streamCam} />
      ) : tab === "calib" ? (
        <OpsFrame
          eyebrow="/dashboard/live/calibrate → :8000"
          title="Calibration Studio"
          live={live}
        >
          {live ? (
            <iframe
              title="EdgeSight Calibration Studio"
              src={EDGE_SIGHT_PORTAL_CALIB}
              className="h-[min(72vh,720px)] w-full border-0"
              allow="clipboard-read; clipboard-write"
            />
          ) : (
            <OfflineHint name="Calibration Studio" />
          )}
        </OpsFrame>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-end">
            <DataBadge badge={badges.legacy_ops} />
          </div>
          <OpsFrame
            eyebrow="/dashboard/live/ops → :8501"
            title="Streamlit operations UI"
            live={live}
          >
            {live ? (
              <iframe
                title="EdgeSight Streamlit ops"
                src={EDGE_SIGHT_OPS_EMBED}
                className="h-[min(72vh,720px)] w-full border-0"
              />
            ) : (
              <OfflineHint name="Streamlit ops" />
            )}
          </OpsFrame>
        </div>
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

# Portal (only URL you need):
#   http://localhost:3000/dashboard
#   http://localhost:3000/dashboard/live
# Backends (Docker only — proxied into the portal):
#   Calibration  → /dashboard/live/calibrate  (:8000)
#   Streamlit    → /dashboard/live/ops        (:8501)`}
        </pre>
        <p className="mt-3 font-inter cosmic-text-xs text-[var(--app-faint)]">
          Edge: {DUAL_DEPLOYMENT.edge} Cloud: {DUAL_DEPLOYMENT.cloud}
        </p>
      </Panel>
    </div>
  )
}

function OfflineHint({ name }: { name: string }) {
  return (
    <div className="flex h-[420px] flex-col items-center justify-center gap-3 px-6 text-center">
      <Radio size={28} className="text-[var(--app-faint)]" />
      <p className="font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">{name} is offline</p>
      <p className="max-w-md font-inter cosmic-text-xs text-[var(--app-faint)]">
        Start ADLabs-dev with Docker Compose, then refresh this page. Stay on{" "}
        <span className="font-mono text-[var(--app-sub)]">localhost:3000/dashboard/live</span> — backends are proxied in.
      </p>
    </div>
  )
}
