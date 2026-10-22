import { Reveal } from "../components/Reveal"
import { INTELLIGENCE } from "../data/site"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const CHIP: Record<string, string> = {
  live: "text-[#6effb0]/90",
  next: "text-[#c4b5fd]/90",
  learns: "text-amber-200/80",
}

export function Intelligence() {
  const d = INTELLIGENCE

  return (
    <section id="intelligence" className="relative scroll-mt-24 bg-[#05050a] py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        <Reveal>
          <div className="max-w-xl">
            <p className="font-mono cosmic-text-2xs font-semibold uppercase tracking-[0.18em] text-[#8B7CF6]">
              {d.kicker}
            </p>
            <h2 className="mt-3 visual-headline text-[#f5f5f7]">{d.h2}</h2>
            <p className="mt-3 cosmic-text-base leading-relaxed text-[#a1a1aa]">{d.sub}</p>
          </div>
        </Reveal>

        <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {d.pillars.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.04}>
              <article className="flex h-full flex-col rounded-2xl border border-white/[0.08] bg-[#0a0a12] px-5 py-5">
                <span className="font-mono cosmic-text-2xs font-semibold tracking-[0.14em] text-[#8B7CF6]">
                  {p.num}
                </span>
                <h3 className="mt-2 cosmic-text-base font-semibold tracking-[-0.01em] text-[#f5f5f7]">
                  {p.title}
                </h3>
                <p className="mt-2 flex-1 cosmic-text-sm leading-relaxed text-[#a1a1aa]">{p.desc}</p>
                <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1 border-t border-white/[0.07] pt-3 font-mono cosmic-text-2xs tracking-[0.04em]">
                  {p.chips.map((c) => (
                    <span key={c.label} className={CHIP[c.maturity]}>
                      {c.label}
                    </span>
                  ))}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.12}>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {d.depth.map((block) => (
              <div
                key={block.title}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-2xl border border-white/[0.08] bg-[#0a0a12] px-5 py-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="cosmic-text-sm font-semibold text-[#f5f5f7]">{block.title}</h3>
                    <span className={`font-mono cosmic-text-2xs tracking-[0.06em] ${CHIP[block.maturity]}`}>
                      {block.maturityLabel}
                    </span>
                  </div>
                  <p className="mt-1.5 cosmic-text-sm leading-relaxed text-[#a1a1aa]">{block.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.16}>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-[#0a0a12] px-5 py-3.5">
            <p className="cosmic-text-sm text-[#a1a1aa]">{d.footer}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-[#8B7CF6] px-4 py-2 cosmic-text-sm font-semibold text-white transition-colors hover:bg-[#6E5CE6]"
              >
                {d.cta}
                <ArrowRight size={15} strokeWidth={2.4} />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 cosmic-text-sm font-semibold text-[#c4b5fd] transition-colors hover:border-[#8B7CF6]/50 hover:text-white"
              >
                Models & EdgeSight
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
