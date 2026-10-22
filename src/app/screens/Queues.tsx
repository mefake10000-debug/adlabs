import { Users, Clock, Timer, TriangleAlert } from "lucide-react"
import { Panel, Label, Chip, ScreenHeader, DeltaPill } from "../ui"
import { OccupancyGauge } from "../Business"
import { AreaChart } from "../charts"
import { TENANT } from "../../data/dashboard"
import { useEdgeSight } from "../../hooks/useEdgeSight"
import { DataBadge, NoDataState } from "../../components/DataBadge"
import { displayMetric } from "../../lib/data-freshness"

export function Queues() {
  const {
    occupancy,
    trafficHours,
    sourceChip,
    online,
    status,
    events,
    alertsLive,
    businessLive,
    sectionBadges,
    primaryCameraState,
    queueLength,
  } = useEdgeSight()
  const liveQueues = primaryCameraState?.queues
  const queueKpi = businessLive.find((k) => k.label === "Queue length")
  const queueAlerts = alertsLive
    .filter(
      (a) =>
        a.live ||
        /queue|wait|checkout|congestion|staff/i.test(a.message) ||
        a.severity === "critical" ||
        a.severity === "high",
    )
    .slice(0, 4)
  const recentCrossings = [...events].slice(-8).reverse()

  return (
    <div className="flex flex-col gap-5">
      <ScreenHeader
        icon={Users}
        eyebrow="Live now"
        title="Queues"
        sub={`${TENANT.store} · length, wait, and congestion from the checkout zone.`}
      >
        <DataBadge badge={sectionBadges.queues} />
        <Chip tone={sourceChip.tone} title={sourceChip.title}>
          {sourceChip.label}
        </Chip>
      </ScreenHeader>

      {online && (
        <Panel
          title="Queues · live/state"
          sub="cameras[].queues[] @ 2s"
          action={<DataBadge badge={sectionBadges.queues} />}
        >
          {liveQueues == null ? (
            <NoDataState label="queues null" detail="No queues key on live/state — empty, not zero." />
          ) : liveQueues.length === 0 ? (
            <NoDataState label="No queue zones" detail="Draw a queue polygon in Calibration Studio." />
          ) : (
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {liveQueues.map((q) => (
                <li key={q.id} className="rounded-xl border border-[var(--app-line)] px-4 py-3">
                  <p className="font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">{q.name}</p>
                  <p className="mt-1 font-num cosmic-text-xl font-bold text-[var(--app-text)]">
                    {displayMetric(q.queue_length)}
                  </p>
                  <p className="mt-1 font-inter cosmic-text-xs text-[var(--app-faint)]">
                    wait {q.avg_wait_seconds != null ? `${Math.round(q.avg_wait_seconds)}s` : "—"}
                    {q.alert_active ? " · alert" : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Panel>
          <Label>Queue length</Label>
          <p className="mt-2 font-num cosmic-text-2xl font-bold text-[var(--app-text)]">
            {online ? displayMetric(queueLength) : occupancy.queue}
          </p>
          <div className="mt-2">
            <DeltaPill
              delta={queueKpi?.delta ?? "stable"}
              tone={status?.live?.queue_alert_active ? "neg" : "flat"}
              note={queueKpi?.note}
            />
          </div>
        </Panel>
        <Panel>
          <Label>Avg wait</Label>
          <p className="mt-2 font-num cosmic-text-xl font-bold text-[var(--app-text)]">{occupancy.avgWait}</p>
          <p className="mt-2 font-inter cosmic-text-xs text-[var(--app-faint)]">Mean dwell in queue zone</p>
        </Panel>
        <Panel>
          <Label>People in store</Label>
          <p className="mt-2 font-num cosmic-text-2xl font-bold text-[var(--app-text)]">
            {online ? displayMetric(status?.live?.people_now ?? status?.live?.net_occupancy) : occupancy.now}
            <span className="cosmic-text-sm text-[var(--app-faint)]">/{occupancy.capacity}</span>
          </p>
          <p className="mt-2 font-inter cosmic-text-xs text-[var(--app-faint)]">{occupancy.level}% of capacity</p>
        </Panel>
        <Panel>
          <Label>Peak window</Label>
          <p className="mt-2 font-num cosmic-text-xl font-bold text-[var(--app-text)]">{occupancy.peakWindow}</p>
          <p className="mt-2 font-inter cosmic-text-xs text-[var(--app-faint)]">Staff to this curve</p>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.4fr]">
        <OccupancyGauge occupancy={occupancy} />
        <Panel
          title="Hourly entries"
          action={<Label>today</Label>}
          verified={online ? "EdgeSight tripwire" : "Tripwire · demo"}
        >
          <AreaChart data={trafficHours} peaks={[{ from: "15", to: "17" }]} height={190} />
          <p className="mt-3 font-inter cosmic-text-xs text-[var(--app-faint)]">
            Queue pressure tracks entry peaks — staff to the live peak window above.
          </p>
        </Panel>
      </div>

      {online && recentCrossings.length > 0 && (
        <Panel
          title="Recent tripwire crossings"
          action={<Label>{recentCrossings.length}</Label>}
          verified="/api/v1/events"
        >
          <ul className="grid gap-2 sm:grid-cols-2">
            {recentCrossings.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-[var(--app-line)] px-3 py-2"
              >
                <span className="font-mono cosmic-text-2xs text-[var(--app-faint)]">
                  track {e.track_id} · {e.camera_id}
                </span>
                <span
                  className="font-num cosmic-text-xs font-bold uppercase"
                  style={{ color: e.direction === "in" ? "var(--app-pos)" : "var(--app-neg)" }}
                >
                  {e.direction}
                </span>
                <span className="font-mono cosmic-text-2xs text-[var(--app-faint)]">
                  {(e.event_timestamp || "").split(" ")[1] ?? e.event_timestamp}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel title="What needs attention" action={<Label>{queueAlerts.length}</Label>}>
        <div className="flex flex-col gap-3">
          {queueAlerts.map((a) => (
            <div key={a.id} className="flex items-start gap-3 rounded-xl border border-[var(--app-line)] p-4">
              <span
                className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full"
                style={{
                  background: "color-mix(in srgb, var(--app-neg) 12%, transparent)",
                  color: "var(--app-neg)",
                }}
              >
                <TriangleAlert size={14} strokeWidth={2.3} />
              </span>
              <div className="min-w-0">
                <p className="font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">
                  {a.zone ?? a.store} · {a.message}
                  {a.live ? " · live" : ""}
                </p>
                <p className="mt-1 font-inter cosmic-text-xs text-[var(--app-faint)]">
                  {a.action} · {a.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Timer, label: "Threshold", value: "≥5s in queue zone", note: "Track counted as waiting" },
          { icon: Clock, label: "Congestion", value: "Length or wait over limit", note: "Raises an alert" },
          { icon: Users, label: "Staff excluded", value: "Staff zone tags", note: "Customer metrics stay clean" },
        ].map((r) => (
          <div key={r.label} className="rounded-xl border border-[var(--app-line)] bg-[var(--app-raise)] p-4">
            <r.icon size={15} className="text-[var(--app-accent)]" strokeWidth={2.1} />
            <p className="mt-3 font-inter cosmic-text-xs font-bold uppercase tracking-[0.1em] text-[var(--app-faint)]">
              {r.label}
            </p>
            <p className="mt-1 font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">{r.value}</p>
            <p className="mt-1 font-inter cosmic-text-xs text-[var(--app-faint)]">{r.note}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
