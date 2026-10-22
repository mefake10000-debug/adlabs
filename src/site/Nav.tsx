"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, ArrowRight } from "lucide-react"
import { useScroll, useSpring, motion, AnimatePresence } from "framer-motion"
import { BRAND, CYCLE_NAV } from "../data/site"
import { Logo } from "../components/Logo"

/** Section ids in home scroll order — must match mounted SitePage sections. */
const HOME_SECTION_IDS = CYCLE_NAV.filter((l) => l.href.startsWith("#")).map((l) => l.href.slice(1))

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
      const probe = window.scrollY + 160
      let cur = ""
      for (const id of HOME_SECTION_IDS) {
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

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled || open
          ? "border-b border-white/10 bg-[#05050a]/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
      style={{ color: "#f5f5f7" }}
    >
      <div className="absolute inset-x-0 top-0 h-[3px] origin-left">
        <motion.div className="h-full w-full origin-left" style={{ scaleX: progress, background: "#8B7CF6" }} />
      </div>

      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-4 px-6">
        <Link href="/" onClick={goHome} aria-label="AD Labs home" className="shrink-0 transition-opacity hover:opacity-75">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          {CYCLE_NAV.map((l) => {
            const hash = l.href.startsWith("#") ? l.href.slice(1) : ""
            const isActive = onHome && hash && active === hash
            return (
              <button
                key={l.href}
                type="button"
                onClick={() => go(l.href)}
                className={`rounded-full px-3 py-2 cosmic-text-sm font-medium transition-colors duration-200 ${
                  isActive ? "text-[#8B7CF6]" : "text-[#f5f5f7]/85 hover:text-[#8B7CF6]"
                }`}
              >
                {l.label}
              </button>
            )
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {!onHome && (
            <Link
              href="/"
              onClick={closeAll}
              className="hidden rounded-full px-3 py-2 cosmic-text-sm font-medium text-[#f5f5f7] hover:text-[#8B7CF6] sm:block"
            >
              Home
            </Link>
          )}
          <Link
            href="/discover"
            onClick={closeAll}
            className="hidden items-center gap-1 rounded-full px-3 py-2 cosmic-text-sm font-medium text-[#8B7CF6] hover:bg-[#8B7CF6]/10 sm:inline-flex"
          >
            Discover
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
          <Link
            href="/dashboard"
            onClick={closeAll}
            className="hidden rounded-full border border-white/15 px-3 py-2 cosmic-text-sm font-medium text-[#f5f5f7] hover:border-[#8B7CF6]/50 hover:text-[#8B7CF6] md:inline-flex"
          >
            Dashboard
          </Link>
          <button
            type="button"
            onClick={() => {
              closeAll()
              onPilot()
            }}
            className="hidden rounded-full bg-[#8B7CF6] px-4 py-2 cosmic-text-sm font-semibold text-[#05050a] hover:bg-[#6E5CE6] active:scale-[0.98] sm:block"
          >
            Talk to us
          </button>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-[#f5f5f7] lg:hidden"
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
            className="overflow-hidden border-t border-white/10 bg-[#05050a]/95 backdrop-blur-xl lg:hidden"
          >
            <nav className="flex flex-col px-6 pb-5 pt-2" aria-label="Mobile">
              {CYCLE_NAV.map((l) => (
                <button
                  key={l.href}
                  type="button"
                  onClick={() => go(l.href)}
                  className="flex items-center justify-between border-b border-white/10 py-3 text-left cosmic-text-base font-medium text-[#f5f5f7]"
                >
                  {l.label}
                  <ArrowRight size={14} className="text-[#86868b]" />
                </button>
              ))}
              <Link
                href="/dashboard"
                onClick={closeAll}
                className="flex items-center justify-between border-b border-white/10 py-3 cosmic-text-base font-medium text-[#f5f5f7]"
              >
                Dashboard
                <ArrowRight size={14} className="text-[#86868b]" />
              </Link>
              <Link
                href="/discover"
                onClick={closeAll}
                className="flex items-center justify-between border-b border-white/10 py-3 cosmic-text-base font-medium text-[#8B7CF6]"
              >
                Discover
                <ArrowRight size={14} className="text-[#86868b]" />
              </Link>
              <Link
                href="/about"
                onClick={closeAll}
                className="flex items-center justify-between border-b border-white/10 py-3 cosmic-text-base font-medium text-[#f5f5f7]"
              >
                About
                <ArrowRight size={14} className="text-[#86868b]" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  closeAll()
                  onPilot()
                }}
                className="mt-4 w-full rounded-full bg-[#8B7CF6] px-7 py-3 cosmic-text-base font-semibold text-[#05050a]"
              >
                Talk to us
              </button>
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
