import { Users } from "lucide-react"
import { Panel, Label, ScreenHeader, Chip } from "../ui"
import { DonutChart, HBars, DayHourHeatmap } from "../charts"
import { DEMOGRAPHICS, DAY_HOUR_HEATMAP, PEER_NOTE } from "../../data/dashboard"
import { useEdgeSight } from "../../hooks/useEdgeSight"

export function Demographics() {
  const { demographicsLive, sourceChip } = useEdgeSight()
  const g = demographicsLive ?? DEMOGRAPHICS
  return (
    <div className="flex flex-col gap-5">
      <ScreenHeader
        icon={Users}
        eyebrow="People"
        title="Age & groups"
        sub="k-anonymous aggregates only (age/gender ViT + proximity groups). Never identity."
      >
        <Chip tone={sourceChip.tone} title={sourceChip.title}>{sourceChip.label}</Chip>
      </ScreenHeader>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel
          title="Gender split"
          action={<Label>today</Label>}
          sub="YuNet + age/gender ViT · withheld if cohort &lt; 10"
          info="Anonymised gender inference — aggregates only, no identity."
        >
          <DonutChart
            data={[
              { label: "Female", pct: g.gender.female },
              { label: "Male", pct: g.gender.male },
            ]}
            size={160}
          />
        </Panel>

        <Panel
          title="Individual vs group"
          sub="Proximity grouping — geometry only, no faces"
          info="Sustained proximity between tracks (groups.py)."
        >
          <DonutChart
            data={[
              { label: "Individual", pct: g.party.individual },
              { label: "Group", pct: g.party.group },
            ]}
            size={160}
          />
        </Panel>

        <Panel
          title="Group composition"
          sub="Solo vs pair within groups"
          info="Same proximity stack — useful for staffing pairs vs solos."
        >
          <DonutChart
            data={[
              { label: "Solo", pct: g.dynamics.solo },
              { label: "Pair", pct: g.dynamics.pair },
            ]}
            size={160}
          />
          <p className="mt-4 font-inter cosmic-text-xs text-[var(--app-faint)]">Peak window: {g.peak}</p>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.4fr]">
        <Panel
          title="Age bands"
          action={<Label>18–60+</Label>}
          sub="Coarse UI bands mapped from model age buckets"
          info="Aggregated age cohorts — k-anonymous."
        >
          <HBars items={g.ages.map((a) => ({ label: a.band, pct: a.pct }))} />
          <p className="mt-4 font-inter cosmic-text-2xs text-[var(--app-faint)]">{g.note}</p>
        </Panel>

        <Panel
          title="Day × hour traffic heat"
          sub="Relative intensity from hourly rollups — not a forecast model"
          info="Darker = busier. Use for staffing, not POS prediction."
        >
          <div className="overflow-x-auto">
            <DayHourHeatmap data={DAY_HOUR_HEATMAP} />
          </div>
        </Panel>
      </div>

      <p className="font-inter cosmic-text-xs text-[var(--app-faint)]">{sourceChip.title} · {PEER_NOTE}</p>
    </div>
  )
}
