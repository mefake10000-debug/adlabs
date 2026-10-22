"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Store, Megaphone, Map, FileText, ClipboardList,
  Sun, Moon, Play, Presentation, ArrowLeft, ShieldCheck,
  BarChart3, Users, Package, Sparkles, History as HistoryIcon, Search,
  Eye, Timer, ShoppingBag, Building2, Repeat, LineChart as LineIcon,
  UserCog, ShieldAlert, Layers,
} from "lucide-react"
import Link from "next/link"
import { Logo } from "../components/Logo"
import { Chip, Segmented } from "./ui"
import { TENANT, ALERTS } from "../data/dashboard"
import { EdgeSightProvider, useEdgeSight } from "../hooks/useEdgeSight"
import { Overview } from "./screens/Overview"
import { Stores, StoreDetail } from "./screens/Stores"
import { Campaigns } from "./screens/Campaigns"
import { Zones } from "./screens/Zones"
import { Queues } from "./screens/Queues"
import { Brief } from "./screens/Brief"
import { Manager } from "./screens/Manager"
import { Storefront } from "./screens/Storefront"
import { Compare } from "./screens/Compare"
import { History } from "./screens/History"
import { Demographics } from "./screens/Demographics"
import { Product } from "./screens/Product"
import { Alerts } from "./screens/Alerts"
import { Tour } from "./screens/Tour"
import { Ads } from "./screens/Ads"
import { Retail } from "./screens/Retail"
import { Visitor } from "./screens/Visitor"
import { StoreIntel } from "./screens/StoreIntel"
import { Shelf } from "./screens/Shelf"
import { Patterns } from "./screens/Patterns"
import { Forecasts } from "./screens/Forecasts"
import { Staff } from "./screens/Staff"
import { Safety } from "./screens/Safety"
import { Pipeline } from "./screens/Pipeline"
import { PresentMode } from "./PresentMode"
import { VoiceAssistant } from "./VoiceAssistant"
import { CmdPalette } from "./CmdPalette"

type Screen =
  | "overview"
  | "storefront"
  | "stores"
  | "store"
  | "campaigns"
  | "zones"
  | "queues"
  | "brief"
  | "manager"
  | "compare"
  | "history"
  | "demographics"
  | "product"
  | "alerts"
  | "tour"
  | "ads"
  | "retail"
  | "visitor"
  | "storeIntel"
  | "shelf"
  | "patterns"
  | "forecasts"
  | "staff"
  | "safety"
  | "pipeline"

type Role = "Brand" | "Store"
type Theme = "light" | "dark"

const OWNER_NAME = "Priya"
const OWNER_ROLE = "Brand owner · Organic Clothing Co."
const ALERT_COUNT = ALERTS.length

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

type NavItem = { id: Screen; label: string; icon: typeof LayoutDashboard; badge?: number; color?: string }

const NAV_SECTIONS_BRAND: { label: string; items: NavItem[] }[] = [
  {
    label: "Live now",
    items: [
      { id: "overview", label: "Today", icon: LayoutDashboard, color: "#8B7CF6" },
      { id: "storefront", label: "Entrances", icon: Eye, color: "#3ECF8E" },
      { id: "zones", label: "Floor zones", icon: Map, color: "#FF9500" },
      { id: "queues", label: "Queues", icon: Timer, color: "#5ac8fa" },
      { id: "alerts", label: "Alerts", icon: ShieldCheck, badge: ALERT_COUNT, color: "#FF3B30" },
      { id: "pipeline", label: "Models & EdgeSight", icon: Layers, color: "#3ECF8E" },
    ],
  },
  {
    label: "Owner actions",
    items: [
      { id: "staff", label: "Staff", icon: UserCog, color: "#34C759" },
      { id: "safety", label: "Safety · cautions", icon: ShieldAlert, color: "#FF9500" },
      { id: "campaigns", label: "Window performance", icon: Megaphone, color: "#AF52DE" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { id: "retail", label: "Retail", icon: ShoppingBag, color: "#8B7CF6" },
      { id: "visitor", label: "Visitor", icon: Users, color: "#FF9500" },
      { id: "storeIntel", label: "Store", icon: Building2, color: "#5ac8fa" },
      { id: "shelf", label: "Shelf / display", icon: Package, color: "#34C759" },
      { id: "patterns", label: "Patterns", icon: Repeat, color: "#AF52DE" },
      { id: "forecasts", label: "Forecasts", icon: LineIcon, color: "#007AFF" },
    ],
  },
  {
    label: "Performance",
    items: [
      { id: "stores", label: "All stores", icon: Store, color: "#5ac8fa" },
      { id: "compare", label: "Compare stores", icon: BarChart3, color: "#5856D6" },
      { id: "history", label: "History", icon: HistoryIcon, color: "#007AFF" },
      { id: "brief", label: "Monday brief", icon: FileText, badge: 3, color: "#FF3B30" },
      { id: "demographics", label: "Age & groups", icon: Users, color: "#FF9500" },
      { id: "product", label: "Display interest", icon: Package, color: "#34C759" },
      { id: "tour", label: "How to read this", icon: Sparkles, color: "#8B7CF6" },
    ],
  },
]

const NAV_SECTIONS_STORE: { label: string; items: NavItem[] }[] = [
  {
    label: "Live now",
    items: [
      { id: "manager", label: "Manager today", icon: ClipboardList, color: "#3ECF8E" },
      { id: "queues", label: "Queues", icon: Timer, color: "#5ac8fa" },
      { id: "zones", label: "Floor zones", icon: Map, color: "#FF9500" },
      { id: "alerts", label: "Alerts", icon: ShieldCheck, badge: ALERT_COUNT, color: "#FF3B30" },
      { id: "staff", label: "Staff", icon: UserCog, color: "#34C759" },
      { id: "safety", label: "Safety · cautions", icon: ShieldAlert, color: "#FF9500" },
      { id: "pipeline", label: "Models & EdgeSight", icon: Layers, color: "#3ECF8E" },
    ],
  },
  {
    label: "Reference",
    items: [
      { id: "stores", label: "All stores", icon: Store, color: "#5ac8fa" },
      { id: "tour", label: "How to read this", icon: Sparkles, color: "#8B7CF6" },
    ],
  },
]

const PAGE_TITLES: Record<Screen, string> = {
  overview: "Today",
  storefront: "Entrances",
  stores: "All stores",
  store: "Store detail",
  campaigns: "Window performance",
  zones: "Floor zones",
  queues: "Queues",
  brief: "Monday brief",
  manager: "Manager today",
  compare: "Compare stores",
  history: "History",
  demographics: "Age & groups",
  product: "Display interest",
  alerts: "Alerts",
  tour: "How to read this",
  ads: "Out-of-home",
  retail: "Retail intelligence",
  visitor: "Visitor intelligence",
  storeIntel: "Store intelligence",
  shelf: "Shelf / display",
  patterns: "Patterns",
  forecasts: "Forecasts",
  staff: "Staff",
  safety: "Safety · cautions",
  pipeline: "Models & EdgeSight",
}

export function DashboardPage() {
  return (
    <EdgeSightProvider>
      <DashboardShell />
    </EdgeSightProvider>
  )
}

function DashboardShell() {
  const { sourceChip } = useEdgeSight()
  const [theme, setTheme] = useState<Theme>("dark")
  const [role, setRole] = useState<Role>("Brand")
  const [screen, setScreen] = useState<Screen>("overview")
  const [present, setPresent] = useState(false)
  const [selectedStore, setSelectedStore] = useState("madison")
  const [cmd, setCmd] = useState(false)
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("adlabs-theme")
    if (saved === "light" || saved === "dark") setTheme(saved)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setCmd((c) => !c)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    const tick = () => setNow(new Date())
    // oxlint-disable-next-line react/set-state-in-effect
    tick()
    const t = setInterval(tick, 1000 * 30)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    localStorage.setItem("adlabs-theme", theme)
  }, [theme])

  const changeRole = (r: Role) => {
    setRole(r)
    const storeOk: Screen[] = [
      "stores", "store", "manager", "queues", "zones", "alerts", "tour", "staff", "safety", "pipeline",
    ]
    if (r === "Store" && !storeOk.includes(screen)) {
      setScreen("manager")
    }
    if (r === "Brand" && screen === "manager") {
      setScreen("overview")
    }
  }

  const navSections = role === "Brand" ? NAV_SECTIONS_BRAND : NAV_SECTIONS_STORE

  const renderScreen = () => {
    switch (screen) {
      case "overview": return <Overview onNavigate={(s) => setScreen(s as Screen)} />
      case "storefront": return <Storefront />
      case "stores": return <Stores onOpen={(id) => { setSelectedStore(id); setScreen("store") }} />
      case "store": return <StoreDetail storeId={selectedStore} />
      case "campaigns": return <Campaigns />
      case "zones": return <Zones />
      case "queues": return <Queues />
      case "brief": return <Brief />
      case "manager": return <Manager />
      case "compare": return <Compare />
      case "history": return <History />
      case "demographics": return <Demographics />
      case "product": return <Product />
      case "alerts": return <Alerts />
      case "tour": return <Tour />
      case "ads": return <Ads />
      case "retail": return <Retail />
      case "visitor": return <Visitor />
      case "storeIntel": return <StoreIntel />
      case "shelf": return <Shelf />
      case "patterns": return <Patterns />
      case "forecasts": return <Forecasts />
      case "staff": return <Staff />
      case "safety": return <Safety />
      case "pipeline": return <Pipeline />
      default: return <Overview />
    }
  }

  return (
    <div className="app-scope page-in relative min-h-screen" data-theme={theme} style={{ background: "var(--app-bg)" }}>
      <div aria-hidden className="app-glow" />
      <div className="relative mx-auto flex max-w-[1400px]">
        <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-r border-[var(--app-line)] px-4 py-6 lg:flex">
          <Link href="/" aria-label="Back to AD Labs website" className="px-2">
            <Logo dark={theme === "dark"} />
          </Link>

          <div className="mt-7 flex-1 overflow-y-auto" style={{ scrollBehavior: "smooth" }}>
            {navSections.map((sec) => (
              <div key={sec.label} className="mb-6">
                <p className="px-3 pb-2 font-inter cosmic-text-2xs font-bold uppercase tracking-[0.16em] text-[var(--app-faint)]">
                  {sec.label}
                </p>
                <div className="flex flex-col gap-1">
                  {sec.items.map((n) => {
                    const active = screen === n.id || (n.id === "stores" && screen === "store")
                    return (
                      <button
                        key={n.id}
                        onClick={() => setScreen(n.id)}
                        aria-current={active}
                        className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-left font-inter cosmic-text-sm font-medium transition-all duration-200 hover:bg-[var(--app-card)] hover:shadow-sm"
                        style={{ color: active ? "var(--app-text)" : "var(--app-sub)" }}
                      >
                        {active && (
                          <motion.span
                            layoutId="nav-active"
                            className="absolute inset-0 rounded-xl"
                            style={{ background: "var(--app-card)", boxShadow: "var(--app-shadow)" }}
                            transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          />
                        )}
                        <span
                          className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-all duration-200"
                          style={{
                            background: active ? `${n.color}20` : "var(--app-raise)",
                            color: active ? n.color : "var(--app-faint)",
                          }}
                        >
                          <n.icon size={16} strokeWidth={2.2} />
                        </span>
                        <span className="relative z-10 flex-1 truncate">{n.label}</span>
                        {n.badge != null && (
                          <span
                            className="relative z-10 grid h-5 min-w-5 place-items-center rounded-full px-1.5 font-inter cosmic-text-2xs font-bold"
                            style={{ background: `${n.color}20`, color: n.color }}
                          >
                            {n.badge}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <div
              className="flex items-start gap-2.5 rounded-xl border border-[var(--app-line)] p-3.5"
              style={{ background: "var(--app-card)" }}
            >
              <ShieldCheck size={15} className="mt-0.5 shrink-0 text-[var(--app-gold)]" strokeWidth={2.2} />
              <p className="font-inter cosmic-text-xs leading-snug text-[var(--app-sub)]">
                Faces never leave the device. Aggregates only.
              </p>
            </div>
            <button
              onClick={() => setPresent(true)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-inter cosmic-text-sm font-semibold text-[var(--app-sub)] transition-colors hover:text-[var(--app-text)]"
            >
              <Presentation size={16} strokeWidth={2.1} />
              Present mode
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-[var(--app-line)] backdrop-blur-xl" style={{ background: "color-mix(in srgb, var(--app-bg) 82%, transparent)" }}>
            <div className="flex flex-wrap items-center gap-3 px-5 py-3.5 sm:px-7">
              <Link
                href="/"
                className="grid h-9 w-9 place-items-center rounded-full border border-[var(--app-line)] text-[var(--app-sub)] transition-colors hover:text-[var(--app-text)] lg:hidden"
                aria-label="Back to website"
              >
                <ArrowLeft size={16} />
              </Link>
              <div className="min-w-0">
                <p className="truncate font-inter cosmic-text-sm font-semibold text-[var(--app-text)]">{TENANT.name}</p>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={screen}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="truncate font-inter cosmic-text-xs font-medium text-[var(--app-gold)]"
                  >
                    {PAGE_TITLES[screen]}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="ml-auto flex flex-wrap items-center gap-2">
                <Segmented options={["Brand", "Store"] as const} value={role} onChange={changeRole} />
                <button
                  type="button"
                  onClick={() => setCmd(true)}
                  className="hidden items-center gap-2 rounded-full border border-[var(--app-line)] px-3 py-1.5 font-inter cosmic-text-xs text-[var(--app-faint)] sm:inline-flex"
                >
                  <Search size={13} />
                  ⌘K
                </button>
                <button
                  type="button"
                  onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                  className="grid h-9 w-9 place-items-center rounded-full border border-[var(--app-line)] text-[var(--app-sub)]"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                </button>
                <Chip tone={sourceChip.tone} title={sourceChip.title}>{sourceChip.label}</Chip>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-[var(--app-line)] px-5 py-2 sm:px-7">
              <p className="truncate font-inter cosmic-text-xs text-[var(--app-faint)]">
                {greeting()}, {OWNER_NAME} · {OWNER_ROLE}
                {now ? ` · ${now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : ""}
              </p>
              <button
                type="button"
                onClick={() => setPresent(true)}
                className="inline-flex items-center gap-1.5 font-inter cosmic-text-xs font-semibold text-[var(--app-sub)] lg:hidden"
              >
                <Play size={12} /> Present
              </button>
            </div>
          </header>

          <main className="px-5 py-6 sm:px-7 sm:py-8">{renderScreen()}</main>
        </div>
      </div>

      {present && <PresentMode theme={theme} onClose={() => setPresent(false)} />}
      <VoiceAssistant
        onNavigate={(s, storeId) => {
          if (s === "store" && storeId) {
            setSelectedStore(storeId)
            setScreen("store")
          } else {
            setScreen(s as Screen)
          }
        }}
      />
      <CmdPalette open={cmd} onClose={() => setCmd(false)} onNavigate={(id) => setScreen(id as Screen)} />
    </div>
  )
}
