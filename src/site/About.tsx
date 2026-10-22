"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, Shield, Zap, Target, Database, BadgeCheck } from "lucide-react"
import { Reveal } from "../components/Reveal"
import { FlipCard, AnswerPanel } from "../components/FlipCard"
import { Nav } from "./Nav"
import { Footer } from "./Footer"
import { PilotModal } from "./PilotModal"
import { ABOUT, FOUNDERS, type Founder } from "../data/site"

export function About() {
  const a = ABOUT
  const [pilot, setPilot] = useState(false)
  const openPilot = () => setPilot(true)

  const principles = [
    { icon: Shield, title: "Privacy by Architecture", desc: "DPDP + GDPR on both paths. No facial identity product. Edge keeps video local; Cloud runs under contract controls." },
    { icon: Zap, title: "Dual Deployment", desc: "Edge AI and Cloud are peers. Same signals, same Monday Brief. You pick where inference runs." },
    { icon: Target, title: "Verdicts, Not Dashboards", desc: "Numbers that end in a move. Physical A/B keep-or-kill. Three actions every Monday." },
    { icon: Database, title: "Store-Specific Intelligence", desc: "Baselines are yours. Anomalies surface before they cost a week." },
  ]

  const initials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("")

  const FounderCard = ({ f, index }: { f: Founder; index: number }) => (
    <article className="site-card group flex flex-col rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 sm:p-9">
      <div className="flex items-center justify-between">
        <span
          className="grid h-12 w-12 place-items-center rounded-full cosmic-text-base font-bold text-[#05050a]"
          style={{ background: f.avatar.shirt }}
          aria-hidden
        >
          {initials(f.name)}
        </span>
        <span className="font-mono cosmic-text-xs font-bold text-[#86868b]">{index + 1}/0{FOUNDERS.length}</span>
      </div>
      <h3 className="mt-6 text-[19px] font-semibold leading-tight tracking-[-0.01em] text-[#f5f5f7]">{f.name}</h3>
      <p className="mt-1.5 cosmic-text-xs font-semibold uppercase tracking-[0.12em] text-[#8B7CF6]">{f.role}</p>
      <p className="mt-4 cosmic-text-sm leading-relaxed text-[#a1a1aa]">{f.focus}</p>
    </article>
  )

  return (
    <div className="site-scope page-in">
      <Nav onPilot={openPilot} />
      <main>
        {/* 01 — Hero */}
        <section className="relative overflow-hidden cosmic-bg pb-16 pt-24 text-[#f5f5f7] sm:pt-32">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <img src="/images/hero-storefront.jpg" alt="" className="h-full w-full object-cover opacity-[0.08]" />
            <div className="absolute inset-0" style={{ background: "var(--cosmic-gradient-void)" }} />
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(rgba(29,29,31,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(29,29,31,0.5) 1px, transparent 1px)",
            backgroundSize: "80px 80px"
          }} />

          <div className="relative mx-auto max-w-[1200px] px-6">
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="font-mono cosmic-text-2xs tracking-[0.18em] text-[#6e6e73]">01</span>
                <span className="h-px w-8 bg-[#8B7CF6]/40" aria-hidden />
                <span className="section-kicker text-[#8B7CF6]">{a.hero.kicker}</span>
              </div>
              <h1 className="mt-6 max-w-4xl font-serif text-[44px] leading-[1.05] tracking-[-0.03em] text-[#f5f5f7] sm:text-[56px] lg:text-[68px]">
                {a.hero.h2a} <em className="em-accent">{a.hero.h2b}</em>
              </h1>
              <p className="mt-7 max-w-2xl text-[17px] leading-relaxed text-[rgba(245,245,247,0.62)]">{a.hero.sub}</p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full cosmic-gradient-violet px-7 py-4 cosmic-text-base font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_32px_rgba(139,124,246,0.35)]" style={{ color: "var(--cosmic-void)" }}
                >
                  Explore the live dashboard <ArrowUpRight size={16} strokeWidth={2.6} />
                </Link>
                <button
                  onClick={openPilot}
                  className="rounded-full cosmic-border px-7 py-4 cosmic-text-base font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/5" style={{ color: "rgba(245,245,247,0.8)" }}
                >
                  Request a pilot seat <ArrowRight size={16} strokeWidth={2.4} />
                </button>
              </div>
            </Reveal>

            <Reveal delay={0.25}>
              <dl className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 sm:grid-cols-3" style={{ background: "rgba(255,255,255,0.08)" }}>
                {a.hero.stats.map((s) => (
                  <div key={s.label} className="bg-[#07070c] px-7 py-6">
                    <dd className="font-mono text-[28px] font-bold leading-none text-[#f5f5f7]">{s.value}</dd>
                    <dt className="mt-3 cosmic-text-xs leading-snug text-[#86868b]">{s.label}</dt>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        {/* 02 — Vision / Mission */}
        <section className="bg-[#05050a] py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-[1200px] px-6">
            <Reveal>
              <div className="grid gap-5 lg:grid-cols-2">
                <article className="site-card rounded-3xl p-8 sm:p-10">
                  <div className="flex items-center justify-between">
                    <span className="section-kicker text-[#8B7CF6]">VISION</span>
                    <span className="font-mono cosmic-text-2xs tracking-[0.18em] text-[#6e6e73]">02.A</span>
                  </div>
                  <h2 className="mt-5 max-w-md text-[24px] font-semibold leading-tight tracking-[-0.015em] text-[#f5f5f7] sm:text-[26px]">
                    {a.vision.title}
                  </h2>
                  <p className="mt-4 cosmic-text-base leading-relaxed text-[#a1a1aa]">{a.vision.body}</p>
                </article>

                <article className="site-card-featured rounded-3xl p-8 sm:p-10">
                  <div className="flex items-center justify-between">
                    <span className="section-kicker text-[#8B7CF6]">MISSION</span>
                    <span className="font-mono cosmic-text-2xs tracking-[0.18em] text-[#6e6e73]">02.B</span>
                  </div>
                  <h2 className="mt-5 max-w-md text-[24px] font-semibold leading-tight tracking-[-0.015em] text-[#f5f5f7] sm:text-[26px]">
                    {a.mission.title}
                  </h2>
                  <p className="mt-4 cosmic-text-base leading-relaxed text-[#a1a1aa]">{a.mission.body}</p>
                </article>
              </div>
            </Reveal>

            {/* How the two paths meet */}
            <Reveal delay={0.15}>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {[
                  { img: "/images/in-store-zones.jpg", label: "Edge AI", note: "One 12W sensor on the shop's network. Video never leaves." },
                  { img: "/images/sector-fashion.jpg", label: "Cloud Path", note: "Same signals, contractual controls, zero footage stored." },
                  { img: "/images/window-after.jpg", label: "DPDP + GDPR", note: "Both paths ship with the same privacy verdicts." },
                ].map((c) => (
                  <figure key={c.label} className="cosmic-card group overflow-hidden rounded-2xl">
                    <div className="relative h-44 overflow-hidden">
                      <img src={c.img} alt={c.label} className="img-grade h-full w-full object-cover opacity-40 transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 flex items-end p-5">
                        <figcaption>
                          <span className="cosmic-text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--cosmic-text)" }}>{c.label}</span>
                          <span className="mt-2 block max-w-[85%] cosmic-text-2xs leading-relaxed text-[rgba(245,245,247,0.66)]">{c.note}</span>
                        </figcaption>
                      </div>
                    </div>
                  </figure>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* 03 — Problem / Solution */}
        <section className="cosmic-bg py-16 sm:py-20 lg:py-24">
          <div className="relative z-10 mx-auto max-w-[1200px] px-6">
            <div className="grid gap-5 lg:grid-cols-2">
              <Reveal>
                <article className="site-card h-full rounded-3xl p-8 sm:p-10">
                  <div className="flex items-center justify-between">
                    <span className="section-kicker text-[#8B7CF6]">THE PROBLEM</span>
                    <span className="font-mono cosmic-text-2xs tracking-[0.18em] text-[#6e6e73]">03.A</span>
                  </div>
                  <h2 className="mt-5 text-[22px] font-semibold leading-tight tracking-[-0.015em] text-[#f5f5f7] sm:text-[26px]">
                    {a.problem.title} — {a.problem.lead}
                  </h2>
                  <ul className="mt-6 flex flex-col gap-4">
                    {a.problem.points.map((pt) => (
                      <li key={pt.num} className="flex items-start gap-3">
                        <span className="mt-0.5 shrink-0 font-mono cosmic-text-xs font-bold text-[#8B7CF6]">{pt.num}</span>
                        <p className="cosmic-text-base leading-relaxed" style={{ color: "var(--cosmic-text-dim)" }}>{pt.text}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 border-t border-white/10 pt-6">
                    <p className="font-mono text-[40px] font-bold leading-none sm:text-[52px]" style={{ color: "var(--cosmic-violet)" }}>{a.problem.stat.value}</p>
                    <p className="mt-2 cosmic-text-xs leading-snug" style={{ color: "var(--cosmic-text-muted)" }}>{a.problem.stat.label}</p>
                  </div>
                </article>
              </Reveal>

              <Reveal delay={0.1}>
                <article className="site-card h-full rounded-3xl border-[rgba(139,124,246,0.35)] p-8 sm:p-10">
                  <div className="flex items-center justify-between">
                    <span className="section-kicker text-[#8B7CF6]">THE SOLUTION</span>
                    <span className="font-mono cosmic-text-2xs tracking-[0.18em] text-[#6e6e73]">03.B</span>
                  </div>
                  <h2 className="mt-5 text-[22px] font-semibold leading-tight tracking-[-0.015em] text-[#f5f5f7] sm:text-[26px]">
                    {a.solution.title}
                  </h2>
                  <p className="mt-3 cosmic-text-base leading-relaxed" style={{ color: "var(--cosmic-text-dim)" }}>{a.solution.sub}</p>
                  <ul className="mt-6 flex flex-col gap-4">
                    {a.solution.points.map((pt) => (
                      <li key={pt.num} className="flex items-start gap-3">
                        <span className="mt-0.5 shrink-0 font-mono cosmic-text-xs font-bold text-[#8B7CF6]">{pt.num}</span>
                        <p className="cosmic-text-base leading-relaxed" style={{ color: "var(--cosmic-text-secondary)" }}>{pt.text}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 border-t border-white/10 pt-6">
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-2 font-mono cosmic-text-xs font-bold tracking-[0.08em] transition-colors hover:text-[#a89bff]" style={{ color: "var(--cosmic-violet)" }}
                    >
                      SEE IT LIVE IN THE DASHBOARD <ArrowUpRight size={15} />
                    </Link>
                  </div>
                </article>
              </Reveal>
            </div>
          </div>
        </section>

        {/* 04 — Why it's different */}
        <section className="cosmic-bg py-16 sm:py-20 lg:py-24">
          <div className="relative z-10 mx-auto max-w-[1200px] px-6">
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="font-mono cosmic-text-2xs tracking-[0.18em] text-[#6e6e73]">04</span>
                <span className="h-px w-8 bg-[#8B7CF6]/40" aria-hidden />
                <span className="section-kicker text-[#8B7CF6]">{a.usp.kicker}</span>
              </div>
              <h2 className="mt-5 max-w-2xl text-[28px] font-semibold tracking-[-0.02em] text-[#f5f5f7] sm:text-[36px]">{a.usp.title}</h2>
              <p className="mt-4 max-w-xl text-[17px] leading-relaxed" style={{ color: "var(--cosmic-text-dim)" }}>{a.usp.sub}</p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {a.usp.cards.map((c, i) => (
                  <Reveal key={c.num} delay={i * 0.08} fade>
                    <FlipCard
                      back={<AnswerPanel eyebrow="THE BASIS" note={c.answer} />}
                      front={
                        <article className="site-card h-full rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono cosmic-text-xs font-bold text-[#8B7CF6]">{c.num}</span>
                            <span className="cosmic-text-2xs font-medium uppercase tracking-[0.14em] text-[#86868b]">Flip</span>
                          </div>
                          <h3 className="mt-5 text-[19px] font-semibold leading-tight text-[#f5f5f7]">{c.title}</h3>
                          <p className="mt-3 cosmic-text-sm leading-relaxed text-[#a1a1aa]">{c.desc}</p>
                        </article>
                      }
                    />
                  </Reveal>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* 05 — Constraints we design in */}
        <section className="bg-[#0c0c14] py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-[1200px] px-6">
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="font-mono cosmic-text-2xs tracking-[0.18em] text-[#6e6e73]">05</span>
                <span className="h-px w-8 bg-[#8B7CF6]/40" aria-hidden />
                <span className="section-kicker text-[#8B7CF6]">HOW WE BUILD</span>
              </div>
              <h2 className="mt-5 text-[28px] font-semibold tracking-[-0.02em] text-[#f5f5f7] sm:text-[36px]">Constraints We Design Into the Product</h2>
              <p className="mt-4 max-w-xl cosmic-text-base leading-relaxed text-[#a1a1aa]">Not values on a wall. Constraints we engineer into the system.</p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {principles.map((item, i) => (
                  <Reveal key={item.title} delay={i * 0.05}>
                    <div className="site-card h-full rounded-2xl p-7 transition-all duration-300">
                      <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[rgba(139,124,246,0.12)] text-[#8B7CF6]">
                        <item.icon size={20} strokeWidth={2} />
                      </span>
                      <h3 className="mb-3 text-[18px] font-semibold leading-tight text-[#f5f5f7]">{item.title}</h3>
                      <p className="cosmic-text-sm leading-relaxed text-[#a1a1aa]">{item.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* 06 — Where we are / 07 — Team */}
        <section className="bg-[#12121a] py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <Reveal>
                <article className="site-card-featured h-full rounded-3xl p-8 sm:p-10">
                  <div className="flex items-center gap-3">
                    <span className="font-mono cosmic-text-2xs tracking-[0.18em] text-[#6e6e73]">06</span>
                    <span className="h-px w-8 bg-[#8B7CF6]/40" aria-hidden />
                    <span className="section-kicker text-[#8B7CF6]">{a.status.kicker}</span>
                  </div>
                  <h2 className="mt-5 text-[26px] font-semibold leading-tight tracking-[-0.015em] text-[#f5f5f7] sm:text-[30px]">
                    {a.status.title}
                  </h2>
                  <p className="mt-4 max-w-xl cosmic-text-base leading-relaxed text-[#c4c4cc]">{a.status.body}</p>

                  <ul className="mt-6 flex flex-col gap-3">
                    {a.status.points.map((pt) => (
                      <li key={pt.num} className="flex items-center gap-3">
                        <BadgeCheck size={16} strokeWidth={2} className="shrink-0 text-[#8B7CF6]" />
                        <span className="cosmic-text-sm font-medium text-[#e4e4e7]">{pt.text}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <button
                      onClick={openPilot}
                      className="inline-flex items-center gap-2 rounded-full bg-[#8B7CF6] px-7 py-3.5 cosmic-text-base font-semibold text-[#05050a] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(139,124,246,0.35)] active:scale-[0.98]"
                    >
                      {a.status.cta} <ArrowRight size={16} strokeWidth={2.4} />
                    </button>
                  </div>
                </article>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="site-card flex h-full flex-col rounded-3xl p-8 sm:p-10">
                  <div className="flex items-center justify-between">
                    <span className="section-kicker text-[#8B7CF6]">{a.team.kicker}</span>
                    <span className="font-mono cosmic-text-2xs tracking-[0.18em] text-[#6e6e73]">07</span>
                  </div>
                  <h2 className="mt-5 text-[26px] font-semibold leading-tight tracking-[-0.015em] text-[#f5f5f7] sm:text-[30px]">
                    {a.team.title}
                  </h2>
                  <p className="mt-3 cosmic-text-sm leading-relaxed text-[#a1a1aa]">{a.team.sub}</p>
                  <div className="mt-auto pt-8">
                    <button
                      type="button"
                      onClick={openPilot}
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3.5 cosmic-text-sm font-semibold text-[#f5f5f7] transition-all duration-300 hover:border-white/40 hover:bg-white/5 hover:-translate-y-0.5"
                    >
                      Talk to the lab <ArrowRight size={16} strokeWidth={2.4} />
                    </button>
                    <p className="mt-4 cosmic-text-xs leading-relaxed text-[#86868b]">{a.demoNote}</p>
                  </div>
                </div>
              </Reveal>
            </div>

            <Reveal>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {FOUNDERS.map((f, i) => (
                  <FounderCard key={f.name} f={f} index={i} />
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
      <PilotModal open={pilot} onClose={() => setPilot(false)} />
    </div>
  )
}
