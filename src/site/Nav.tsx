"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, ArrowRight } from "lucide-react"
import { useScroll, useSpring, motion, AnimatePresence } from "framer-motion"
import { BRAND } from "../data/site"
import { Logo } from "../components/Logo"

/** Pruned headline anchors — everything else lives in the footer / pages. */
const HEADER_NAV = [
  { label: "Problem", href: "#blindspot" },
  { label: "Intelligence", href: "#intelligence" },
  { label: "Plans", href: "#plans" },
  { label: "Privacy", href: "#privacy" },
]

const HEADER_SECTION_IDS = HEADER_NAV.map((l) => l.href.slice(1))

const PAGE_LINKS = [
  { label: "Discover", href: "/discover" },
  { label: "About", href: "/about" },
]

export function Nav({ onPilot }: { onPilot: () => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const headerRef = useRef<HTMLElement | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState("")
  const [onHome, setOnHome] = useState(true)

  useEffect(() => {
    const clean = (pathname || "/").replace(/\/(index\.html)?\/?$/, "")
    // oxlint-disable-next-line react/set-state-in-effect
    setOnHome(clean === "" || clean === "/")
  }, [pathname])

  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 130, damping: 28, restDelta: 0.001 })

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (typeof window === "undefined") return
    const hash = window.location.hash.slice(1)
    if (hash) {
      requestAnimationFrame(() => {
        const el = document.getElementById(hash)
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
        else window.scrollTo({ top: 0 })
      })
    } else if (!onHome) {
      window.scrollTo({ top: 0 })
    }
  }, [pathname, onHome])

  useEffect(() => {
    if (!onHome) {
      // oxlint-disable-next-line react/set-state-in-effect
      setActive("")
      return
    }
    const fn = () => {
      const probe = window.scrollY + 180
      let cur = ""
      for (const id of HEADER_SECTION_IDS) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= probe) cur = id
      }
      setActive(cur)
    }
    fn()
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [onHome])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12)
    fn()
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [])

  const scrollToHash = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const sm = window.getComputedStyle(el).scrollMarginTop
      const offset = sm ? parseFloat(sm) || 0 : 96
      window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset), behavior: "smooth" })
      history.replaceState(null, "", `#${id}`)
    }
  }

  const closeAll = () => setOpen(false)

  const go = (href: string) => {
    closeAll()
    if (href.startsWith("#")) {
      if (!onHome) router.push("/" + href)
      else scrollToHash(href.slice(1))
    } else {
      router.push(href)
    }
  }

  const goHome = () => {
    closeAll()
    if (onHome) {
      history.replaceState(null, "", window.location.pathname)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      router.push("/")
    }
  }

  const cta = (onPilotClick: React.MouseEventHandler) => (
    <button
      type="button"
      onClick={onPilotClick}
      className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 cosmic-text-sm font-semibold text-[#05050a] transition-all duration-200 hover:shadow-[0_0_28px_rgba(139,124,246,0.35)] active:scale-[0.98]"
      style={{ background: "linear-gradient(135deg, #8B7CF6 0%, #6E5CE6 100%)" }}
    >
      Talk to us
      <ArrowRight size={14} strokeWidth={2.6} className="transition-transform duration-200 group-hover:translate-x-0.5" />
    </button>
  )

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled || open
          ? "border-b border-white/[0.08] bg-[#05050a]/80 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
          : "border-b border-transparent bg-transparent"
      }`}
      style={{ color: "#f5f5f7" }}
    >
      <div className="absolute inset-x-0 top-0 h-[2px] origin-left">
        <motion.div
          className="h-full w-full origin-left"
          style={{ scaleX: progress, background: "linear-gradient(90deg, #8B7CF6, #5ac8fa)" }}
        />
      </div>

      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-6">
        <Link href="/" onClick={goHome} aria-label="AD Labs home" className="shrink-0 transition-opacity hover:opacity-75">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {HEADER_NAV.map((l) => {
            const hash = l.href.slice(1)
            const isActive = onHome && active === hash
            return (
              <button
                key={l.href}
                type="button"
                onClick={() => go(l.href)}
                className={`rounded-full px-3.5 py-1.5 cosmic-text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#8B7CF6]/[0.14] text-[#a89bff]"
                    : "text-[#f5f5f7]/85 hover:bg-white/5 hover:text-[#f5f5f7]"
                }`}
              >
                {l.label}
              </button>
            )
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5">
          <span aria-hidden className="mx-1 hidden h-5 w-px bg-white/10 lg:block" />
          {PAGE_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={closeAll}
              className="hidden rounded-full px-3 py-1.5 cosmic-text-sm font-medium text-[#f5f5f7]/85 transition-colors hover:bg-white/5 hover:text-[#8B7CF6] sm:block"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            onClick={closeAll}
            className="hidden rounded-full border border-white/15 px-4 py-1.5 cosmic-text-sm font-medium text-[#f5f5f7] transition-all duration-200 hover:border-[#8B7CF6]/50 hover:text-[#a89bff] md:block"
          >
            Dashboard
          </Link>
          {cta(() => {
            closeAll()
            onPilot()
          })}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-[#f5f5f7] transition-colors hover:bg-white/5 lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/[0.08] bg-[#05050a]/95 backdrop-blur-2xl lg:hidden"
          >
            <nav className="flex flex-col px-6 pb-6 pt-3" aria-label="Mobile">
              <span className="pb-2 pt-3 font-mono cosmic-text-2xs tracking-[0.16em] text-[#86868b]">EXPLORE</span>
              {HEADER_NAV.map((l) => {
                const hash = l.href.slice(1)
                const isActive = onHome && active === hash
                return (
                  <button
                    key={l.href}
                    type="button"
                    onClick={() => go(l.href)}
                    className={`flex items-center justify-between border-b border-white/[0.08] py-3.5 text-left cosmic-text-base font-medium ${
                      isActive ? "text-[#a89bff]" : "text-[#f5f5f7]"
                    }`}
                  >
                    {l.label}
                    <ArrowRight size={14} className="text-[#86868b]" />
                  </button>
                )
              })}
              <span className="pb-2 pt-5 font-mono cosmic-text-2xs tracking-[0.16em] text-[#86868b]">PAGES</span>
              {PAGE_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={closeAll}
                  className="flex items-center justify-between border-b border-white/[0.08] py-3.5 text-left cosmic-text-base font-medium text-[#f5f5f7]"
                >
                  {l.label}
                  <ArrowRight size={14} className="text-[#86868b]" />
                </Link>
              ))}
              <Link
                href="/dashboard"
                onClick={closeAll}
                className="flex items-center justify-between border-b border-white/[0.08] py-3.5 text-left cosmic-text-base font-medium text-[#f5f5f7]"
              >
                Dashboard
                <ArrowRight size={14} className="text-[#86868b]" />
              </Link>
              <div className="pt-5">
                {cta(() => {
                  closeAll()
                  onPilot()
                })}
              </div>
              <p className="pt-4 text-center cosmic-text-xs text-[#86868b]">
                {BRAND.city} · {BRAND.email}
              </p>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
