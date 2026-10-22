import { UserCog } from "lucide-react"
import { Panel, Chip, ScreenHeader, Label } from "../ui"
import { STAFF_INTEL, SIMULATED_NOTE, STAFFING_INTEL } from "../../data/dashboard"
import { useEdgeSight } from "../../hooks/useEdgeSight"
import { DataBadge } from "../../components/DataBadge"
import { displayMetric } from "../../lib/data-freshness"

const TONE: Record<string, string> = {
  ok: "var(--app-pos)",
  warn: "var(--app-gold)",
  crit: "var(--app-neg)",
}

export function Staff() {
  const { staffLive, sourceChip, online, calibratedZones, sectionBadges, primaryCameraState, peopleNow } =
    useEdgeSight()
  const s = staffLive
  const staffZoneCount = calibratedZones.filter((z) => z.type === "staff").length
  const staffVisible = primaryCameraState?.counts.staff_visible ?? null
  const staffTagged = primaryCameraState?.counts.staff_tagged ?? null

  return (
    <div className="flex flex-col gap-5">
      <ScreenHeader icon={UserCog} eyebrow="Owner actions" title={s.title} sub={s.sub}>
        <DataBadge badge={sectionBadges.staffing} />
        <Chip tone={sourceChip.tone} title={sourceChip.title}>{sourceChip.label}</Chip>
        {!online && <Chip tone="neutral" title={SIMULATED_NOTE}>Demo</Chip>}
      </ScreenHeader>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Staff visible",
            value: online ? displayMetric(staffVisible) : String(s.onFloor),
            hint: online
              ? "counts.staff_visible · live/state @ 2s"
              : "What you can do: match to peaks below",
          },
          {
            label: "Staff tagged",
            value: online ? displayMetric(staffTagged) : "—",
            hint: "counts.staff_tagged · sticky polygon tags",
          },
          {
            label: "Visitors now",
            value: online ? displayMetric(peopleNow) : String(s.visitorsNow),
            hint: online ? "EdgeSight people_now" : "Occupancy · tripwire / tracks",
          },
          { label: "Staff share", value: s.staffShare, hint: `Zones ${staffZoneCount} · ${s.method}` },
        ].map((k) => (
          <Panel key={k.label}>
            <Label>{k.label}</Label>
            <p className="mt-2 font-num cosmic-text-xl font-bold text-[var(--app-text)]">{k.value}</p>
            <p className="mt-2 font-inter cosmic-text-xs leading-snug text-[var(--app-faint)]">{k.hint}</p>
          </Panel>
        ))}
      </div>

      <Panel title="Staffing windows" sub="Need vs on floor — from entry peaks + roster" action={<Label>Act now</Label>}>
        <ul className="space-y-2.5">
          {s.windows.map((w) => (
            <li
              key={w.window}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--app-line)] px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-num cosmic-text-sm font-semibold text-[var(--app-text)]">{w.window}</p>
                <p className="mt-0.5 font-inter cosmic-text-xs text-[var(--app-faint)]">{w.note}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-inter cosmic-text-xs text-[var(--app-faint)]">
                  need <span className="font-num font-bold text-[var(--app-text)]">{w.need}</span>
                </span>
                <span className="font-inter cosmic-text-xs text-[var(--app-faint)]">
                  on <span className="font-num font-bold" style={{ color: TONE[w.tone] }}>{w.on}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Staff by zone" sub="Presence via staff polygon / appearance tag — no faces">
          <ul className="space-y-2.5">
            {s.zones.map((z) => (
              <li key={z.code} className="flex items-start justify-between gap-3 rounded-xl border border-[var(--app-line)] px-4 py-3">
                <div>
                  <p className="font-mono cosmic-text-2xs text-[var(--app-accent)]">{z.code}</p>
                  <p className="mt-0.5 font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">{z.name}</p>
                  <p className="mt-1 font-inter cosmic-text-xs text-[var(--app-faint)]">{z.note}</p>
                </div>
                <div className="text-right">
                  <p className="font-inter cosmic-text-2xs text-[var(--app-faint)]">min {z.staffMin}</p>
                  <p
                    className="mt-1 font-inter cosmic-text-xs font-bold"
                    style={{ color: z.present ? "var(--app-pos)" : "var(--app-neg)" }}
                  >
                    {z.present ? "Staff tagged" : "Unattended"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="What you can do next" action={<Chip tone="gold">Owner</Chip>}>
          <ol className="space-y-3">
            {s.doNext.map((d, i) => (
              <li key={d} className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--app-accent-soft)] font-mono cosmic-text-2xs font-bold text-[var(--app-accent)]">
                  {i + 1}
                </span>
                <p className="font-inter cosmic-text-sm leading-snug text-[var(--app-text)]">{d}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 font-inter cosmic-text-xs leading-relaxed text-[var(--app-faint)]">
            {STAFFING_INTEL.rule}
          </p>
        </Panel>
      </div>
    </div>
  )
}
