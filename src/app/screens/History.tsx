import { History as HistoryIcon } from "lucide-react"
import { Panel, Label, Chip, ScreenHeader } from "../ui"
import { LineChart, FunnelBars } from "../charts"
import { WEEKLY_HISTORY, FUNNEL_HISTORY, SIMULATED_NOTE, PEER_NOTE } from "../../data/dashboard"
import { useEdgeSight } from "../../hooks/useEdgeSight"
import { formatDwell, formatWait } from "../../lib/edgesight"

export function History() {
  const { history, sourceChip, online, historyOccupancy } = useEdgeSight()
  const lineData = WEEKLY_HISTORY.map((w) => ({ week: w.week, value: w.stopRate }))
  const calcPeak = (k: "footfall" | "stopRate" | "walkins") => {
    const p = WEEKLY_HISTORY.reduce((a, b) => ((b[k] as number) > (a[k] as number) ? b : a))
    return { value: k === "stopRate" ? `${p[k]}%` : (p[k] as number).toLocaleString("en-IN"), note: p.week }
  }
  const peakFootfall = calcPeak("footfall")
  const peakStop = calcPeak("stopRate")
  const peakWalkins = calcPeak("walkins")
  const peakDwell = WEEKLY_HISTORY.reduce((a, b) => {
    const secs = (w: string) => parseInt(w.replace(/[^0-9]/g, ""), 10)
    return secs(b.dwell) > secs(a.dwell) ? b : a
  })

  const funnelStages = (key: "baseline" | "wk4" | "wk8" | "wk12") => {
    const data = FUNNEL_HISTORY[key]
    if (Array.isArray(data)) return data
    return Object.entries(data).map(([stage, value]) => ({ stage, value, rate: "", label: "" }))
  }

  const recent = [...history].slice(-12).reverse()

  return (
    <div className="flex flex-col gap-5">
      <ScreenHeader
        icon={HistoryIcon}
        eyebrow="Trends"
        title="History"
        sub="12-week trend with forward projection — stop rate, walk-ins, and dwell."
      >
        <Chip tone={sourceChip.tone} title={sourceChip.title}>{sourceChip.label}</Chip>
      </ScreenHeader>

      {online && (
        <Panel
          title="EdgeSight rollups (live)"
          sub="From /api/v1/history — 10s telemetry windows. Not the 12-week demo chart below."
          action={<Label>{history.length} rows</Label>}
          verified="SQLite telemetry_rollups"
        >
          {historyOccupancy.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 font-inter cosmic-text-2xs text-[var(--app-faint)]">Occupancy · recent windows</p>
              <LineChart
                data={historyOccupancy.map((p, i) => ({ week: p.h || `t${i}`, value: p.v }))}
                height={140}
                valueSuffix=""
                showConfidence={false}
              />
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-[var(--app-line)]">
                  {["End", "Cam", "IN", "OUT", "Occ", "Dwell", "Queue"].map((h) => (
                    <th key={h} className="px-4 py-2.5"><Label>{h}</Label></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--app-line)]">
                    <td className="px-4 py-2.5 font-mono cosmic-text-xs text-[var(--app-text)]">
                      {(r.timestamp_end || "").split(" ")[1] ?? r.timestamp_end}
                    </td>
                    <td className="px-4 py-2.5 font-mono cosmic-text-2xs text-[var(--app-faint)]">{r.camera_id}</td>
                    <td className="px-4 py-2.5 font-num cosmic-text-sm text-[var(--app-pos)]">+{r.in_count}</td>
                    <td className="px-4 py-2.5 font-num cosmic-text-sm text-[var(--app-neg)]">−{r.out_count}</td>
                    <td className="px-4 py-2.5 font-num cosmic-text-sm text-[var(--app-text)]">{r.current_occupancy}</td>
                    <td className="px-4 py-2.5 font-num cosmic-text-sm text-[var(--app-text)]">
                      {formatDwell(r.avg_dwell_seconds)}
                    </td>
                    <td className="px-4 py-2.5 font-num cosmic-text-sm text-[var(--app-text)]">
                      {r.queue_length} · {formatWait(r.avg_queue_wait_seconds)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* Weekly KPI cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Peak stop rate", value: peakStop.value, note: peakStop.note, tone: "pos" as const },
          { label: "Peak footfall", value: peakFootfall.value, note: peakFootfall.note, tone: "pos" as const },
          { label: "Peak walk-ins", value: peakWalkins.value, note: peakWalkins.note, tone: "pos" as const },
          { label: "Peak dwell", value: peakDwell.dwell, note: peakDwell.week, tone: "pos" as const },
        ].map((k) => (
          <Panel key={k.label}>
            <Label>{k.label}</Label>
            <p className="mt-2.5 font-inter cosmic-text-xl font-bold font-num leading-none text-[var(--app-text)]">{k.value}</p>
            <p className="mt-2 font-inter cosmic-text-xs font-semibold font-num" style={{ color: "var(--app-pos)" }}>{k.note}</p>
          </Panel>
        ))}
      </div>

      {/* Stop rate trend with prediction */}
      <Panel
        title="Stop rate · W1 → Wk 16 (predicted)"
        action={<Chip tone="gold">Prediction</Chip>}
        verified="12 weeks measured"
        info="Each dot = one week's average stop rate. Dashed line = 8-week forecast."
      >
        <LineChart
          data={lineData}
          prediction={{
            startIdx: 11,
            points: [
              { week: "Wk 13", value: 11.8 },
              { week: "Wk 14", value: 11.9 },
              { week: "Wk 15", value: 12.0 },
              { week: "Wk 16", value: 12.0 },
            ],
          }}
          height={220}
        />
        <p className="mt-4 font-inter cosmic-text-xs text-[var(--app-faint)]">
          Linear projection at the 8-week trend. Dashed line = forecast, shaded band = confidence.
        </p>
      </Panel>

      {/* Funnel history */}
      <Panel
        title="Funnel evolution"
        action={<Label>Baseline → Wk 12</Label>}
        info="Four snapshots of the same journey — baseline, Wk 4, Wk 8, today."
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(["baseline", "wk4", "wk8", "wk12"] as const).map((key) => (
            <div key={key}>
              <p className="font-inter cosmic-text-xs font-semibold uppercase tracking-[0.1em] text-[var(--app-faint)]">
                {key === "baseline" ? "Baseline" : key === "wk4" ? "Wk 4" : key === "wk8" ? "Wk 8" : "Wk 12"}
              </p>
              <FunnelBars stages={funnelStages(key)} />
            </div>
          ))}
        </div>
      </Panel>

      {/* Weekly data table */}
      <Panel
        pad={false}
        title="Weekly detail"
        sub="Rollups from camera history — demo sample. Dashed forecast on the chart above is illustrative, not a shipped Prophet model."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-[var(--app-line)]">
                {["Week", "Passes", "Stop rate", "Entries", "Dwell", "Event"].map((h) => (
                  <th key={h} className="px-5 py-3.5"><Label>{h}</Label></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WEEKLY_HISTORY.map((w) => (
                <tr key={w.week} className="border-b border-[var(--app-line)] transition-colors hover:bg-[var(--app-raise)]">
                  <td className="px-5 py-3.5 font-inter cosmic-text-sm font-semibold font-num text-[var(--app-text)]">{w.week}</td>
                  <td className="px-5 py-3.5 font-inter cosmic-text-sm font-num text-[var(--app-text)]">{w.footfall.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3.5 font-inter cosmic-text-sm font-num text-[var(--app-text)]">{w.stopRate}%</td>
                  <td className="px-5 py-3.5 font-inter cosmic-text-sm font-num text-[var(--app-text)]">{w.walkins.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3.5 font-inter cosmic-text-sm font-num text-[var(--app-text)]">{w.dwell}</td>
                  <td className="px-5 py-3.5 font-inter cosmic-text-xs text-[var(--app-faint)]">{w.event ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <p className="font-inter cosmic-text-xs text-[var(--app-faint)]">{SIMULATED_NOTE} · {PEER_NOTE}</p>
    </div>
  )
}
