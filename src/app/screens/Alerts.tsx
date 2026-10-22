"use client"

import { useState } from "react"
import { TriangleAlert, ShieldAlert } from "lucide-react"
import { Panel, Label, Chip, ScreenHeader } from "../ui"
import { SIMULATED_NOTE, type AlertCategory } from "../../data/dashboard"
import { useEdgeSight } from "../../hooks/useEdgeSight"

const CATS: { id: "all" | AlertCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ops", label: "Ops" },
  { id: "staff", label: "Staff" },
  { id: "merch", label: "Merch" },
  { id: "loss-risk", label: "Loss-risk" },
  { id: "safety", label: "Safety" },
]

export function Alerts() {
  const { alertsLive, sourceChip, online } = useEdgeSight()
  const [filter, setFilter] = useState<"all" | "critical" | "high" | "medium" | "low">("all")
  const [cat, setCat] = useState<"all" | AlertCategory>("all")

  const filtered = alertsLive.filter((a) => {
    if (filter !== "all" && a.severity !== filter) return false
    if (cat !== "all" && a.category !== cat) return false
    return true
  })
  const liveCount = alertsLive.filter((a) => a.live).length

  return (
    <div className="flex flex-col gap-5">
      <ScreenHeader
        icon={ShieldAlert}
        eyebrow="Owner actions"
        title="Alerts"
        sub={`${alertsLive.length} actionable · ${liveCount} from EdgeSight live · each row says what you can do.`}
      >
        <Chip tone={sourceChip.tone} title={sourceChip.title}>{sourceChip.label}</Chip>
        {!online && <Chip tone="neutral" title={SIMULATED_NOTE}>Demo</Chip>}
      </ScreenHeader>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Critical", count: alertsLive.filter((a) => a.severity === "critical").length, color: "var(--app-neg)" },
          { label: "High", count: alertsLive.filter((a) => a.severity === "high").length, color: "var(--app-gold)" },
          { label: "Medium", count: alertsLive.filter((a) => a.severity === "medium").length, color: "var(--app-sub)" },
          { label: "Low", count: alertsLive.filter((a) => a.severity === "low").length, color: "var(--app-faint)" },
          { label: "Total", count: alertsLive.length, color: "var(--app-text)" },
        ].map((s) => (
          <Panel key={s.label}>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
              <span className="font-inter cosmic-text-xs text-[var(--app-faint)]">{s.label}</span>
            </div>
            <p className="mt-2 font-num cosmic-text-2xl font-bold text-[var(--app-text)]">{s.count}</p>
          </Panel>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-inter cosmic-text-2xs font-bold uppercase tracking-[0.12em] text-[var(--app-faint)]">Severity</p>
        <div className="flex flex-wrap gap-2">
          {(["all", "critical", "high", "medium", "low"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 font-inter cosmic-text-xs font-semibold capitalize transition-colors ${
                filter === f ? "" : "border border-[var(--app-line)] text-[var(--app-sub)] hover:text-[var(--app-text)]"
              }`}
              style={filter === f ? { background: "var(--app-text)", color: "var(--app-card)" } : undefined}
            >
              {f}
            </button>
          ))}
        </div>
        <p className="mt-2 font-inter cosmic-text-2xs font-bold uppercase tracking-[0.12em] text-[var(--app-faint)]">Category</p>
        <div className="flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCat(c.id)}
              className={`rounded-full px-3 py-1.5 font-inter cosmic-text-xs font-semibold transition-colors ${
                cat === c.id ? "" : "border border-[var(--app-line)] text-[var(--app-sub)] hover:text-[var(--app-text)]"
              }`}
              style={cat === c.id ? { background: "var(--app-accent)", color: "#fff" } : undefined}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <Panel
        title="Action list"
        action={<Label>{filtered.length} shown</Label>}
        info="Loss-risk = heuristic (prolonged dwell / unattended high-value / after-hours) — not perfect theft detection, not face ID."
      >
        <div className="flex flex-col gap-3">
          {filtered.map((a) => (
            <div key={a.id} className="rounded-xl border border-[var(--app-line)] p-4">
              <div className="flex items-start gap-3">
                <span
                  className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full"
                  style={{
                    background:
                      a.severity === "critical"
                        ? "color-mix(in srgb, var(--app-neg) 12%, transparent)"
                        : a.severity === "high"
                          ? "color-mix(in srgb, var(--app-gold) 12%, transparent)"
                          : "var(--app-raise)",
                    color:
                      a.severity === "critical"
                        ? "var(--app-neg)"
                        : a.severity === "high"
                          ? "var(--app-gold)"
                          : "var(--app-sub)",
                  }}
                >
                  <TriangleAlert size={15} strokeWidth={2.3} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">{a.title}</span>
                    <span
                      className="rounded-full px-2 py-0.5 font-inter cosmic-text-2xs font-bold uppercase tracking-[0.08em]"
                      style={{
                        background:
                          a.severity === "critical"
                            ? "color-mix(in srgb, var(--app-neg) 12%, transparent)"
                            : a.severity === "high"
                              ? "color-mix(in srgb, var(--app-gold) 12%, transparent)"
                              : "var(--app-raise)",
                        color:
                          a.severity === "critical"
                            ? "var(--app-neg)"
                            : a.severity === "high"
                              ? "var(--app-gold)"
                              : "var(--app-sub)",
                      }}
                    >
                      {a.severity}
                    </span>
                    <span className="rounded-full border border-[var(--app-line)] px-2 py-0.5 font-mono cosmic-text-2xs text-[var(--app-faint)]">
                      {a.category}
                    </span>
                    {a.live && <Chip tone="live">EdgeSight</Chip>}
                    <span className="font-inter cosmic-text-xs text-[var(--app-faint)]">{a.time}</span>
                  </div>
                  <p className="mt-1 font-inter cosmic-text-xs text-[var(--app-faint)]">
                    {a.zone ?? a.store ?? "Store"}
                  </p>
                  <p className="mt-1.5 font-inter cosmic-text-xs leading-relaxed text-[var(--app-sub)]">{a.message}</p>
                  <p className="mt-2.5 font-inter cosmic-text-xs font-semibold text-[var(--app-accent)]">
                    What you can do: {a.action}
                  </p>
                  <p className="mt-1 font-inter cosmic-text-2xs text-[var(--app-faint)]">
                    Source: {a.source} · deep-link: {a.screen}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
