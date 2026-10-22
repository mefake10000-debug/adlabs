import { Package } from "lucide-react"
import { Panel, Chip, ScreenHeader, Label } from "../ui"
import { AnnotatedImage } from "../../components/AnnotatedImage"
import { SHELF_INTEL, SIMULATED_NOTE, CAMPAIGNS } from "../../data/dashboard"
import { useEdgeSight } from "../../hooks/useEdgeSight"
import { DataBadge, NoDataState } from "../../components/DataBadge"
import { formatDwell } from "../../lib/edgesight"

export function Shelf() {
  const { sectionBadges, status, online, sourceChip, primaryCameraState } = useEdgeSight()
  const productsTop = primaryCameraState?.products_top
  const categories = status?.products?.categories ?? []

  return (
    <div className="flex flex-col gap-5">
      <ScreenHeader icon={Package} eyebrow="Intelligence" title={SHELF_INTEL.title} sub={SHELF_INTEL.sub}>
        <DataBadge badge={sectionBadges.shelf} />
        <Chip tone={sourceChip.tone} title={sourceChip.title}>{sourceChip.label}</Chip>
        {!online && <Chip tone="neutral" title={SIMULATED_NOTE}>Demo</Chip>}
      </ScreenHeader>

      <AnnotatedImage
        src={CAMPAIGNS[1]?.imageBefore ?? "/images/in-store-zones.jpg"}
        alt="In-store display — near-shelf attention"
        aspectClass="aspect-[21/9] sm:aspect-[2.4/1]"
        className="overflow-hidden rounded-3xl border border-[var(--app-line)]"
        badges={[
          { text: "DISPLAY INTEREST", tone: "after", corner: "tl" },
          { text: "CATEGORY · NOT SKU OCR", tone: "neutral", corner: "tr" },
        ]}
        callouts={[
          { n: 1, label: "Hero vitrine", detail: "Near-shelf attention", x: 58, y: 40, tone: "accent" },
          { n: 2, label: "Proximity dwell", detail: "YOLO-World + head-pose", x: 32, y: 62, tone: "pos" },
        ]}
        caption="Near-display interest"
        metric="Category-level · not barcode POS"
        explain={SHELF_INTEL.honesty}
      />

      {online && (
        <Panel
          title="products_top · live/state"
          sub="2s cadence when edge writes products_top — else NO-DATA"
          action={<DataBadge badge={sectionBadges.shelf} />}
        >
          {productsTop == null ? (
            <NoDataState
              label="products_top null"
              detail="Edge snapshot does not emit products_top yet — showing 24h analytics below as PARTIAL."
            />
          ) : productsTop.length === 0 ? (
            <NoDataState label="No product hits" detail="Empty products_top list." />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {productsTop.map((p) => (
                <li key={p.category} className="rounded-xl border border-[var(--app-line)] px-4 py-3.5">
                  <p className="font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">{p.category}</p>
                  <p className="mt-2 font-num cosmic-text-xl font-bold text-[var(--app-accent)]">{p.viewers}</p>
                  <p className="mt-0.5 font-inter cosmic-text-2xs uppercase tracking-[0.06em] text-[var(--app-faint)]">
                    Viewers
                  </p>
                  <p className="mt-2 font-inter cosmic-text-xs text-[var(--app-sub)]">
                    {formatDwell(p.avg_dwell_seconds)} avg dwell
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}

      <Panel
        title={online && categories.length ? "Category interest · 24h analytics" : "Fixtures · near interest"}
        action={online ? <Label>/api/v1/analytics/products</Label> : undefined}
        sub={online ? "PARTIAL — rollup / YOLO-World text prompts — not closed-set SKUs" : undefined}
      >
        {online && categories.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {categories.map((f) => (
              <li key={f.category} className="rounded-xl border border-[var(--app-line)] px-4 py-3.5">
                <p className="font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">{f.category}</p>
                <p className="mt-2 font-num cosmic-text-xl font-bold text-[var(--app-accent)]">{f.viewers}</p>
                <p className="mt-0.5 font-inter cosmic-text-2xs uppercase tracking-[0.06em] text-[var(--app-faint)]">
                  Viewers · {f.detections} detections
                </p>
                <p className="mt-2 font-inter cosmic-text-xs text-[var(--app-sub)]">
                  {formatDwell(f.avg_dwell_seconds)} avg · {f.windows} windows
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {SHELF_INTEL.fixtures.map((f) => (
              <li key={f.name} className="rounded-xl border border-[var(--app-line)] px-4 py-3.5">
                <p className="font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">{f.name}</p>
                <p className="mt-2 font-num cosmic-text-xl font-bold text-[var(--app-accent)]">{f.interest}</p>
                <p className="mt-0.5 font-inter cosmic-text-2xs uppercase tracking-[0.06em] text-[var(--app-faint)]">
                  Near interest
                </p>
                <p className="mt-2 font-inter cosmic-text-xs text-[var(--app-sub)]">
                  {f.dwell} · {f.note}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}
