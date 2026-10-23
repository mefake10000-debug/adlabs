import { fmtCompact, fmtInt } from "./format"

export function Sparkline({ data, tone = "gold" }: { data: number[]; tone?: "gold" | "pos" | "neg" }) {
  const w = 120
  const h = 34
  if (!data.length) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const pts = data.map((d, i) => {
    const x = data.length === 1 ? w / 2 : (i / (data.length - 1)) * w
    const y = h - 3 - ((d - min) / span) * (h - 6)
    return { x: +x.toFixed(1), y: +y.toFixed(1) }
  })
  const color = tone === "pos" ? "var(--app-pos)" : tone === "neg" ? "var(--app-neg)" : "var(--app-gold)"
  const gradId = `spark-${tone}-${data.length}-${data[0]}-${data[data.length - 1]}`
  const last = pts[pts.length - 1]
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d={`M ${pts.map((p) => `${p.x},${p.y}`).join(" L ")} L ${last.x},${h} L ${pts[0].x},${h} Z`}
        fill={`url(#${gradId})`}
      />
      <polyline
        points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={last.x} cy={last.y} r={2.6} fill={color} />
    </svg>
  )
}

export function AreaChart({
  data,
  peaks,
  height = 210,
  unitLabel = "entries",
}: {
  data: { h: string; v: number }[]
  peaks?: { from: string; to: string }[]
  height?: number
  unitLabel?: string
}) {
  const w = 660
  const h = height
  const padB = 28
  const padL = 40
  const padR = 8
  const plotW = w - padL - padR
  // Never draw broken axes from an empty series — caller should hide, but guard anyway.
  if (!data.length) {
    return (
      <div
        className="flex items-center justify-center font-inter cosmic-text-xs text-[var(--app-faint)]"
        style={{ height }}
        role="img"
        aria-label={`No ${unitLabel} samples yet`}
      >
        Waiting for ≥5 live samples…
      </div>
    )
  }
  const max = Math.max(...data.map((d) => d.v), 1) * 1.12
  const x = (i: number) => padL + (data.length <= 1 ? plotW / 2 : (i / (data.length - 1)) * plotW)
  const y = (v: number) => h - padB - (v / max) * (h - padB - 14)

  const pts = data.map((d, i) => [x(i), y(d.v)] as const)
  let path = `M ${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i]
    const [x1, y1] = pts[i + 1]
    const mx = (x0 + x1) / 2
    path += ` C ${mx},${y0} ${mx},${y1} ${x1},${y1}`
  }
  const area = `${path} L ${x(data.length - 1)},${h - padB} L ${padL},${h - padB} Z`
  const yTicks = [0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f))

  const peakRects = (peaks ?? []).map((p) => {
    const i0 = data.findIndex((d) => d.h === p.from)
    const i1 = data.findIndex((d) => d.h === p.to)
    if (i0 < 0 || i1 < 0) return null
    return (
      <rect
        key={p.from + p.to}
        x={x(i0)}
        y={12}
        width={Math.max(x(i1) - x(i0), 4)}
        height={h - padB - 12}
        fill="var(--app-gold-soft)"
      />
    )
  })

  const labelIdx =
    data.length <= 5
      ? data.map((_, i) => i)
      : [0, Math.floor((data.length - 1) / 3), Math.floor(((data.length - 1) * 2) / 3), data.length - 1]

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label={`${unitLabel} by hour`}>
      <defs>
        <linearGradient id="areaGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--app-accent)" stopOpacity={0.28} />
          <stop offset="85%" stopColor="var(--app-accent)" stopOpacity={0.04} />
          <stop offset="100%" stopColor="var(--app-accent)" stopOpacity={0} />
        </linearGradient>
      </defs>
      {yTicks.map((val) => (
        <g key={val}>
          <line
            x1={padL}
            x2={w - padR}
            y1={y(val)}
            y2={y(val)}
            stroke="var(--app-grid)"
            strokeWidth={0.8}
            vectorEffect="non-scaling-stroke"
          />
          <text x={padL - 6} y={y(val) + 3} textAnchor="end" fontSize={9} fill="var(--app-faint)" className="font-mono">
            {fmtCompact(val)}
          </text>
        </g>
      ))}
      {peakRects}
      <path d={area} fill="url(#areaGold)" />
      <path
        d={path}
        fill="none"
        stroke="var(--app-accent)"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {data.map((d, i) => (
        <g key={d.h}>
          <circle cx={x(i)} cy={y(d.v)} r={8} fill="transparent">
            <title>{`${d.h}:00 — ${fmtInt(d.v)} ${unitLabel}`}</title>
          </circle>
          <circle cx={x(i)} cy={y(d.v)} r={2.5} fill="var(--app-card)" stroke="var(--app-accent)" strokeWidth={1.5} />
        </g>
      ))}
      {labelIdx.map((i) => (
        <text
          key={data[i].h}
          x={x(i)}
          y={h - 8}
          textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
          fontSize={10}
          fill="var(--app-faint)"
          className="font-inter"
        >
          {data[i].h}:00
        </text>
      ))}
    </svg>
  )
}

export function LineChart({
  data,
  height = 200,
  peaks,
  prediction,
  showConfidence = true,
  valueSuffix = "%",
}: {
  data: { week: string; value: number }[]
  height?: number
  peaks?: { week: string; label: string }[]
  prediction?: { startIdx: number; points: { week: string; value: number }[] }
  showConfidence?: boolean
  valueSuffix?: string
}) {
  const w = 660
  const h = height
  const padB = 28
  const padL = 44
  const padR = 16
  const plotW = w - padL - padR
  const predPts = prediction?.points ?? []
  const total = data.length + predPts.length
  const allVals = [...data.map((d) => d.value), ...predPts.map((p) => p.value)]
  const max = Math.max(...allVals) * 1.08
  const min = Math.min(...allVals) * 0.92
  const range = max - min || 1
  const x = (i: number) => padL + (total <= 1 ? plotW / 2 : (i / (total - 1)) * plotW)
  const y = (v: number) => h - padB - ((v - min) / range) * (h - padB - 12)

  const measuredPts = data.map((d, i) => `${x(i).toFixed(1)},${y(d.value).toFixed(1)}`)
  const path = `M ${measuredPts.join(" L ")}`
  const area = `${path} L ${x(data.length - 1).toFixed(1)},${h - padB} L ${padL},${h - padB} Z`

  const predPath =
    predPts.length > 0
      ? `M ${x(data.length - 1).toFixed(1)},${y(data[data.length - 1].value).toFixed(1)} L ${predPts
          .map((p, i) => `${x(data.length + i).toFixed(1)},${y(p.value).toFixed(1)}`)
          .join(" L ")}`
      : ""

  const band =
    showConfidence && predPts.length
      ? [
          ...predPts.map((p, i) => {
            const spread = range * 0.06 * (1 + i / predPts.length)
            return `${x(data.length + i).toFixed(1)},${y(p.value + spread).toFixed(1)}`
          }),
          ...[...predPts].reverse().map((p, i) => {
            const idx = predPts.length - 1 - i
            const spread = range * 0.06 * (1 + idx / predPts.length)
            return `${x(data.length + idx).toFixed(1)},${y(p.value - spread).toFixed(1)}`
          }),
        ].join(" ")
      : ""

  const yTickVals = [0, 0.5, 1].map((f) => min + f * range)

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label="Trend line chart">
      {yTickVals.map((val) => (
        <g key={val}>
          <line
            x1={padL}
            x2={w - padR}
            y1={y(val)}
            y2={y(val)}
            stroke="var(--app-grid)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          <text x={padL - 6} y={y(val) + 3} textAnchor="end" fontSize={9} fill="var(--app-faint)" className="font-mono">
            {val.toFixed(1)}
            {valueSuffix}
          </text>
        </g>
      ))}
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--app-accent)" stopOpacity={0.16} />
          <stop offset="100%" stopColor="var(--app-accent)" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#lineGrad)" />
      <path d={path} fill="none" stroke="var(--app-accent)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      {predPath && (
        <>
          {band && <polygon points={band} fill="var(--app-accent)" opacity={0.08} />}
          <path
            d={predPath}
            fill="none"
            stroke="var(--app-accent)"
            strokeWidth={2}
            strokeDasharray="5 4"
            strokeLinecap="round"
            opacity={0.75}
          />
          {predPts.map((p, i) => (
            <circle key={p.week} cx={x(data.length + i)} cy={y(p.value)} r={2.8} fill="var(--app-accent)" opacity={0.55}>
              <title>{`${p.week}: ${p.value.toFixed(1)}${valueSuffix} (projected)`}</title>
            </circle>
          ))}
        </>
      )}
      {data.map((d, i) => (
        <g key={d.week}>
          <circle cx={x(i)} cy={y(d.value)} r={2.8} fill="var(--app-card)" stroke="var(--app-accent)" strokeWidth={1.5}>
            <title>{`${d.week}: ${d.value.toFixed(1)}${valueSuffix}`}</title>
          </circle>
          {(i === 0 || i === data.length - 1 || i % 2 === 0) && (
            <text x={x(i)} y={h - 8} textAnchor="middle" fontSize={9} fill="var(--app-faint)" className="font-mono">
              {d.week.replace("Wk ", "W")}
            </text>
          )}
        </g>
      ))}
      {peaks?.map((p) => {
        const idx = data.findIndex((d) => d.week === p.week)
        if (idx < 0) return null
        return (
          <g key={p.week}>
            <line
              x1={x(idx)}
              x2={x(idx)}
              y1={10}
              y2={h - padB}
              stroke="var(--app-line-strong)"
              strokeDasharray="3 4"
              vectorEffect="non-scaling-stroke"
            />
            <rect x={x(idx) - 22} y={4} width={44} height={14} rx={7} fill="var(--app-gold-soft)" />
            <text x={x(idx)} y={14.5} textAnchor="middle" fontSize={8} fill="var(--app-accent)" className="font-mono" fontWeight={700}>
              {p.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function DonutChart({
  data,
  size = 160,
  showCenter = true,
}: {
  data: { label: string; pct: number; color?: string }[]
  size?: number
  showCenter?: boolean
}) {
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 16
  const inner = r * 0.62
  const total = data.reduce((s, d) => s + d.pct, 0) || 1
  const colors = ["var(--app-accent)", "var(--app-pos)", "var(--app-sub)", "var(--app-faint)", "#8B7CF6", "#6E5CE6"]

  const slices = data.reduce<{ el: React.ReactNode; angle: number }[]>((acc, d, i) => {
    const prevAngle = i === 0 ? -90 : acc[i - 1].angle
    const sweep = (d.pct / total) * 360
    const startAngle = prevAngle
    const endAngle = prevAngle + sweep
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180
    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy + r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy + r * Math.sin(endRad)
    const ix1 = cx + inner * Math.cos(startRad)
    const iy1 = cy + inner * Math.sin(startRad)
    const ix2 = cx + inner * Math.cos(endRad)
    const iy2 = cy + inner * Math.sin(endRad)
    const large = sweep > 180 ? 1 : 0
    const path = `M ${ix1} ${iy1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${inner} ${inner} 0 ${large} 0 ${ix1} ${iy1} Z`
    acc.push({
      el: (
        <path
          key={d.label}
          d={path}
          fill={d.color ?? colors[i % colors.length]}
          stroke="var(--app-card)"
          strokeWidth={2}
        >
          <title>{`${d.label}: ${d.pct}%`}</title>
        </path>
      ),
      angle: endAngle,
    })
    return acc
  }, []).map((s) => s.el)

  return (
    <div className="inline-flex flex-wrap items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0" role="img" aria-label="Donut chart">
        {slices}
        {showCenter && (
          <>
            <circle cx={cx} cy={cy} r={inner - 2} fill="var(--app-card)" />
            <text x={cx} y={cy - 2} textAnchor="middle" fontSize={size * 0.16} fontWeight={700} fill="var(--app-text)" className="font-mono font-num">
              {Math.round(total)}%
            </text>
            <text x={cx} y={cy + size * 0.09} textAnchor="middle" fontSize={size * 0.075} fill="var(--app-faint)" className="font-inter">
              total
            </text>
          </>
        )}
      </svg>
      <div className="flex min-w-0 flex-col gap-2">
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color ?? colors[i % colors.length] }} />
            <span className="min-w-0 flex-1 truncate font-inter cosmic-text-xs text-[var(--app-text)]">{d.label}</span>
            <span className="font-inter cosmic-text-xs font-semibold font-num text-[var(--app-text)]">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function BarChart({
  data,
  height = 180,
  horizontal = false,
}: {
  data: { label: string; value: number; compare?: number }[]
  height?: number
  horizontal?: boolean
  group?: boolean
  prediction?: boolean
}) {
  const w = 660
  const h = height
  const padB = 28
  const padL = horizontal ? 110 : 40
  const padR = 48
  const plotW = w - padL - padR
  const plotH = h - padB - 12
  const max = Math.max(...data.map((d) => Math.max(d.value, d.compare ?? 0)), 0.01) * 1.15

  if (horizontal) {
    const gap = 10
    const barH = Math.min(22, Math.max(12, (plotH - gap * (data.length - 1)) / data.length))
    const totalH = data.length * barH + (data.length - 1) * gap
    const offset = Math.max(12, (plotH - totalH) / 2 + 8)
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label="Horizontal bar chart">
        {data.map((d, i) => {
          const cy = offset + i * (barH + gap)
          const bw = Math.max((d.value / max) * plotW, 2)
          return (
            <g key={d.label}>
              <text
                x={padL - 8}
                y={cy + barH / 2 + 3.5}
                textAnchor="end"
                fontSize={10}
                fill="var(--app-sub)"
                className="font-inter"
              >
                {d.label.length > 16 ? `${d.label.slice(0, 15)}…` : d.label}
              </text>
              <rect x={padL} y={cy} width={plotW} height={barH} rx={4} fill="var(--app-grid)" opacity={0.45} />
              <rect x={padL} y={cy} width={bw} height={barH} rx={4} fill="var(--app-accent)" opacity={0.9} />
              <text
                x={padL + bw + 6}
                y={cy + barH / 2 + 3.5}
                fontSize={10}
                fill="var(--app-text)"
                className="font-mono font-num font-semibold"
              >
                {Number.isInteger(d.value) ? fmtInt(d.value) : d.value.toFixed(1)}
                {!Number.isInteger(d.value) && d.value < 100 ? "%" : ""}
              </text>
              <title>{`${d.label}: ${d.value}`}</title>
            </g>
          )
        })}
      </svg>
    )
  }

  const slot = plotW / data.length
  const barW = slot * 0.55
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label="Bar chart">
      {data.map((d, i) => {
        const bx = padL + i * slot + (slot - barW) / 2
        const bh = Math.max((d.value / max) * plotH, 2)
        const by = h - padB - bh
        return (
          <g key={d.label}>
            <rect x={bx} y={by} width={barW} height={bh} rx={4} fill="var(--app-accent)" opacity={0.88} />
            <text x={bx + barW / 2} y={by - 6} textAnchor="middle" fontSize={10} fill="var(--app-text)" className="font-mono font-num font-semibold">
              {Number.isInteger(d.value) ? fmtCompact(d.value) : d.value.toFixed(1)}
            </text>
            <text x={bx + barW / 2} y={h - 8} textAnchor="middle" fontSize={9} fill="var(--app-faint)" className="font-inter">
              {d.label}
            </text>
            <title>{`${d.label}: ${d.value}`}</title>
          </g>
        )
      })}
    </svg>
  )
}

export function DayHourHeatmap({
  data,
  days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  hours = ["09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"],
}: {
  data: number[][]
  days?: string[]
  hours?: string[]
}) {
  const w = 660
  const h = 210
  const padL = 44
  const padB = 26
  const padR = 8
  const padT = 10
  const cellW = (w - padL - padR) / hours.length
  const cellH = (h - padT - padB) / days.length
  const flat = data.flat()
  const maxVal = Math.max(...flat, 1)
  const minVal = Math.min(...flat, 0)
  const range = maxVal - minVal || 1

  const opacity = (v: number) => 0.08 + ((v - minVal) / range) * 0.82

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full min-w-[480px]" role="img" aria-label="Day-hour heatmap">
        {days.map((d, i) => (
          <text key={d} x={padL - 6} y={padT + i * cellH + cellH / 2 + 3} textAnchor="end" fontSize={10} fill="var(--app-faint)" className="font-inter">
            {d}
          </text>
        ))}
        {hours.map((hr, i) => (
          <text key={hr} x={padL + i * cellW + cellW / 2} y={h - 6} textAnchor="middle" fontSize={9} fill="var(--app-faint)" className="font-mono">
            {hr}
          </text>
        ))}
        {data.map((row, di) =>
          row.map((val, hi) => (
            <g key={`${di}-${hi}`}>
              <rect
                x={padL + hi * cellW + 1.5}
                y={padT + di * cellH + 1.5}
                width={cellW - 3}
                height={cellH - 3}
                rx={3}
                fill="var(--app-accent)"
                opacity={opacity(val)}
              />
              <title>{`${days[di]} ${hours[hi]}:00 — intensity ${val}`}</title>
            </g>
          )),
        )}
      </svg>
      <div className="mt-3 flex items-center gap-2">
        <span className="font-inter cosmic-text-2xs text-[var(--app-faint)]">Quiet</span>
        <div
          className="h-1.5 flex-1 max-w-[140px] rounded-full"
          style={{
            background: "linear-gradient(to right, color-mix(in srgb, var(--app-accent) 8%, var(--app-card)), var(--app-accent))",
          }}
        />
        <span className="font-inter cosmic-text-2xs text-[var(--app-faint)]">Busy</span>
      </div>
    </div>
  )
}

export function FunnelBars({
  stages,
}: {
  stages: { stage: string; value: number; rate: string; label: string }[]
}) {
  const max = Math.max(stages[0]?.value ?? 1, 1)
  return (
    <div className="flex flex-col gap-3">
      {stages.map((s, i) => {
        const w = Math.max((s.value / max) * 100, 4)
        return (
          <div key={s.stage}>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <div className="min-w-0">
                <span className="font-inter cosmic-text-xs font-semibold text-[var(--app-text)]">{s.stage}</span>
                {s.label && (
                  <span className="ml-2 font-inter cosmic-text-2xs text-[var(--app-faint)]">{s.label}</span>
                )}
              </div>
              <span className="shrink-0 font-inter cosmic-text-xs font-semibold font-num text-[var(--app-text)]">
                {fmtInt(s.value)}
                {s.rate ? <span className="ml-1.5 text-[var(--app-faint)]">{s.rate}</span> : null}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--app-grid)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${w}%`,
                  background: `color-mix(in srgb, var(--app-accent) ${Math.max(92 - i * 12, 40)}%, var(--app-card))`,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function HBars({
  items,
}: {
  items: { label: string; pct: number; sub?: string }[]
}) {
  const max = Math.max(...items.map((i) => i.pct), 1)
  return (
    <div className="flex flex-col gap-3.5">
      {items.map((i) => (
        <div key={i.label}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <div className="min-w-0">
              <span className="font-inter cosmic-text-xs font-medium text-[var(--app-text)]">{i.label}</span>
              {i.sub && <span className="ml-2 font-inter cosmic-text-2xs text-[var(--app-faint)]">{i.sub}</span>}
            </div>
            <span className="shrink-0 font-inter cosmic-text-xs font-semibold font-num text-[var(--app-text)]">{i.pct}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--app-grid)" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${(i.pct / max) * 100}%`,
                background: "var(--app-accent)",
                opacity: 0.85,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export function HeatGrid({
  zones,
}: {
  zones: { code: string; name: string; traffic: number; dwell: string; heat: number; note?: string; flag?: string }[]
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
      {zones.map((z) => {
        const intensity = Math.round(z.heat * 70)
        return (
          <div
            key={z.code}
            title={`${z.name} — ${z.traffic}% entered zone · dwell ${z.dwell}${z.note ? ` · ${z.note}` : ""}${
              z.flag ? ` · ⚠ ${z.flag}` : ""
            }`}
            className={`relative flex min-h-[88px] flex-col rounded-xl border p-2.5 ${
              z.flag ? "border-[var(--app-neg)]/45" : "border-[var(--app-line)]"
            }`}
            style={{
              background: `color-mix(in srgb, var(--app-accent) ${intensity}%, var(--app-card))`,
            }}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="font-mono cosmic-text-2xs tracking-[0.06em] text-[var(--app-sub)]">{z.code}</span>
              {z.flag && (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--app-neg)" }} />
              )}
            </div>
            <p className="mt-1 line-clamp-2 font-inter cosmic-text-2xs font-semibold leading-snug text-[var(--app-text)]">
              {z.name}
            </p>
            <div className="mt-auto pt-2">
              <p className="font-inter cosmic-text-base font-bold font-num leading-none text-[var(--app-text)]">{z.traffic}%</p>
              <p className="mt-0.5 font-inter cosmic-text-2xs text-[var(--app-faint)]">entered · dwell {z.dwell}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
