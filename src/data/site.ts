export const BRAND = {
  name: "AD Labs",
  wordmarkA: "AD",
  wordmarkB: "Labs",
  legal: "Ad Labs Tech Pvt Ltd",
  city: "Bengaluru, India",
  founded: "2026",
  email: "sales@adlabs.in",
  domain: "adlabs.in",
  tagline: "Storefront intelligence on Edge or Cloud. DPDP + GDPR by design.",
}

export const SOCIALS = {
  linkedin: "",
  instagram: "",
  label: "Pages opening soon",
}

export type Founder = {
  name: string
  role: string
  focus: string
  avatar: {
    skin: string
    hair: string
    hairPath: "A" | "B" | "C"
    glasses: boolean
    shirt: string
  }
}

export const FOUNDERS: Founder[] = [
  {
    name: "Nishant Parihar",
    role: "Co-Founder & CEO",
    focus: "One question started the company the industry couldn't answer — did the window work? — and he stopped accepting 'sales said so' as the answer.",
    avatar: { skin: "#eab78f", hair: "#26272a", hairPath: "A", glasses: true, shirt: "#39424b" },
  },
  {
    name: "Rajendra Choudhary",
    role: "Co-Founder & CTO",
    focus: "Zero faces, sub-second counts, 12W of edge — he builds the instrument so the street is measured, never watched.",
    avatar: { skin: "#c68d59", hair: "#151619", hairPath: "B", glasses: false, shirt: "#6e4a42" },
  },
  {
    name: "Mihir Salian",
    role: "Co-Founder & CDO",
    focus: "He treats the window as the brand — the way a cover earns a shelf, the glass has to earn the street's pause.",
    avatar: { skin: "#eec39b", hair: "#5f4a33", hairPath: "C", glasses: false, shirt: "#3f5d5b" },
  },
]

/** Precise home cycle — labels match mounted sections only. No dead anchors. */
export const CYCLE_NAV: { label: string; href: string }[] = [
  { label: "Problem", href: "#blindspot" },
  { label: "Plans", href: "#plans" },
  { label: "Floor", href: "#floor" },
  { label: "Outcomes", href: "#metrics" },
  { label: "Intelligence", href: "#intelligence" },
  { label: "Privacy", href: "#privacy" },
  { label: "How", href: "#how" },
  { label: "Talk to us", href: "#contact" },
]

/** @deprecated use CYCLE_NAV — kept for Footer fallback */
export const NAV = CYCLE_NAV

export const PRIMARY_NAV = CYCLE_NAV

export type NavLinkDef = { label: string; href: string; desc?: string; new?: boolean }
export type NavGroup = { label: string; id: string; links: NavLinkDef[] }

/** Compact footer groups — every href is live. */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Cycle",
    id: "cycle",
    links: CYCLE_NAV.map((l) => ({ label: l.label, href: l.href })),
  },
  {
    label: "More",
    id: "more",
    links: [
      { label: "Live dashboard", href: "/dashboard" },
      { label: "Discover", href: "/discover" },
      { label: "About", href: "/about" },
      { label: "FAQ", href: "#faq" },
    ],
  },
]

export const HERO = {
  kicker: "Edge AI · Cloud · DPDP + GDPR",
  headlineA: "Measure the street.",
  headlineB: "Choose where it runs.",
  sub: "Pass, stop, enter — from the cameras you already own. Deploy on Edge AI or Cloud. Both paths meet DPDP and GDPR.",
  demoCta: "View dashboard",
  primaryCta: "Talk to us",
  secondaryCta: "Compare plans",
  badgeTenant: "ORGANIC CLOTHING CO. · BANDRA, MUMBAI",
  badgePrivacy: "DPDP + GDPR · Zero faces stored",
  ticker: ["PASS · 1.4m/s", "STOPPED · 4.8s", "ENTER"],
  cam: "RTSP CAM 01 · BANDRA W · 09:14:07",
  tracking: [
    { label: "PASSER 07", meta: "1.4 m/s → window", x: 62, y: 28 },
    { label: "STOP", meta: "dwell 4.8s", x: 79, y: 56 },
  ],
  live: [
    { label: "people on the street", value: 2481 },
    { label: "stopped at the glass", value: 186 },
    { label: "stop rate", value: 7.5, suffix: "%" },
  ],
  footline: ["EDGE OR CLOUD", "DPDP + GDPR · ZERO FACES STORED"],
  marquee: ["See the movement.", "Understand the attention.", "Improve the store."],
}

/* The instrument — the small edge sensor every store can afford */
export const SENSOR = {
  index: "02",
  kicker: "The Instrument",
  h2a: "One small box.",
  h2b: "One complete brain.",
  sub: "A 12-watt sensor the size of a mini PC. Plug it in behind your front counter, connect it to the cameras you already own, and it starts learning the truth about your street — in the store, never in a cloud.",
  name: "AD LABS · EDGE OBSERVER",
  aliases: ["SENSOR UNIT", "ON-PREM AI", "ZERO FACE STORAGE"],
  installTitle: "Installed in the time it takes your barista to make a coffee",
  installSteps: [
    { num: "01", title: "Unbox", desc: "A fanless 12W edge box, one cable, one wall or shelf mount. That is the entire delivery." },
    { num: "02", title: "Connect", desc: "Plug into your existing PoE camera switch — your RTSP/NVR line keeps working exactly as it did." },
    { num: "03", title: "Verify", desc: "We map your window sightlines and zones, calibrate, and verify gaze accuracy before one number counts." },
  ],
  specs: [
    { label: "Power", value: "12W · PoE" },
    { label: "Install", value: "~2 hours on site" },
    { label: "Cameras", value: "Your existing RTSP/NVR" },
    { label: "Processing", value: "On-device, sub-second" },
    { label: "Offline", value: "Keeps counting, always" },
    { label: "Faces", value: "None. Ever." },
  ],
  watch: {
    kicker: "Watch it work",
    title: "60 seconds to understand your store",
    sub: "Installation → calibration → live dashboard → Monday Brief. A 60-second look at the Sensor in a real store.",
    cta: "Play the storyboard",
    stories: [
      { t: "DAY 0 · UNBOX", d: "The box lands behind the counter. One cable in, one handshake with your cameras." },
      { t: "DAY 1 · CALIBRATE", d: "Window and zones mapped. Verified 93% gaze accuracy before the first count." },
      { t: "LIVE · DASHBOARD", d: "Street footfall, stop rate, zone attention — live on the same dashboard." },
      { t: "MONDAY · BRIEF", d: "The verdict, three actions, audited numbers. The rhythm is now weekly." },
    ],
  },
}

/* Why a brand owner picks AD Labs — the differentiation page on the home flow */
export const WHY_US = {
  index: "10",
  kicker: "Why AD Labs",
  h2a: "Not another analytics tool.",
  h2b: "A new kind of intelligence.",
  sub: "Every tool today sells you a dashboard. We sell you a verdict: a sensor that reads consumer behaviour in the physics of the store, learns it, and tells you the one thing worth doing next.",
  purpose: {
    title: "What a brand owner gets",
    subtitle: "The channel you can finally measure the way you measure your website:",
    beats: [
      { t: "Street-to-sale visibility", d: "Know the full physical funnel — pass, stop, enter, engage — not just the till." },
      { t: "Decisions with evidence", d: "Every window change becomes a measured A/B, not a Monday-morning opinion." },
      { t: "A store that learns", d: "The sensor builds your store's normal — and flags what breaks it before it costs a week." },
      { t: "Privacy that sells it", d: "Zero faces, zero cloud video. A pitch you can make with a clear conscience." },
    ],
  },
  pillars: [
    {
      icon: "plug",
      k: "01",
      title: "Zero new hardware",
      desc: "Works with the cameras already above your floor. One cable, a wall mount, done.",
      answer: "Your security line stays unchanged — the sensor reads the same feed, never records it.",
    },
    {
      icon: "shield",
      k: "02",
      title: "Privacy by architecture",
      desc: "It cannot watch. It counts. There is no face data to store, leak or explain away.",
      answer: "Frames become vectors of motion in volatile memory, then vanish. The cloud sees a timestamp, a dwell, an entry.",
    },
    {
      icon: "verdict",
      k: "03",
      title: "Verdicts, not dashboards",
      desc: "The Monday Brief ends with three actions and the evidence behind each one.",
      answer: "Physical A/B on every rotation, with confidence bands. Keep or kill — decided by the street.",
    },
    {
      icon: "learn",
      k: "04",
      title: "Learns your store",
      desc: "Baselines built from your own history, not a category average from a slide deck.",
      answer: "Anomaly watch tuned to your rhythm — the sensor knows your store's normal as well as its staff.",
    },
  ],
  kpi: {
    title: "The promises we can prove",
    strip: [
      { value: "12", label: "behavioural signals, one sensor" },
      { value: "1 day", label: "from unboxing to a live count" },
      { value: "~2 hrs", label: "total installation time" },
      { value: "0", label: "faces stored, ever" },
      { value: "14", label: "day physical A/B verdict cycle" },
    ],
  },
  ip: {
    title: "The IP behind the promise",
    chips: [
      { t: "On-device behavioural telemetry", d: "pass · stop · dwell · enter from a plain RTSP feed, sub-second" },
      { t: "Anonymous spatial analytics", d: "3D occupancy mesh, zero biometrics" },
      { t: "Physical A/B attribution", d: "14-day keep-or-kill verdicts with confidence bands" },
      { t: "Edge inference on commodity compute", d: "12W box that survives internet drops" },
    ],
  },
}

export const BLINDSPOT = {
  index: "01",
  kicker: "The Problem",
  h2a: "You count who walked in.",
  h2b: "Not who walked past.",
  cards: [
    {
      num: "01",
      tag: "THE STREET",
      title: "People walking past",
      metric: "100% Street Footfall",
      desc: "Thousands pass your glass every day. Most never appear in any report.",
      insight: "The decision happens at the glass, not the till.",
      image: "/images/blindspot-pass.jpg",
    },
    {
      num: "02",
      tag: "THE STOP",
      title: "One person stops",
      metric: "Gaze & Dwell",
      desc: "A pause of 4+ seconds is intent. Windows win or lose here.",
      insight: "Stop rate is the first honest score for your display.",
      image: "/images/blindspot-stop.jpg",
      highlight: true,
    },
    {
      num: "03",
      tag: "THE DOOR",
      title: "One person enters",
      metric: "Walk-In Conversion",
      desc: "Entry is the only number most stores see. The leak sits before it.",
      insight: "Pass → stop → enter is the funnel your POS never had.",
      image: "/images/blindspot-enter.jpg",
    },
  ],
  closer: "Traditional counters only count who came inside.",
  closerBold: "AD Labs measures the street before the door.",
  context: [
    "Most retailers only see the till. The street decision is invisible.",
    "Windows change on opinion. There is no measured keep-or-kill.",
    "Privacy fear blocks tools. Edge and Cloud paths both stay DPDP + GDPR aligned.",
  ],
  verdictLabel: "THREE LEAKS",
  verdict: "Pass uncounted. Stop unmeasured. Window unproven. Fix the funnel at the glass.",
}

/* Dual deployment — Edge AI and Cloud as peer options */
export const PLANS = {
  index: "02",
  kicker: "Two ways to proceed",
  h2: "Edge AI or Cloud. Same signals. Same privacy bar.",
  sub: "Pick where inference runs. Both paths adhere to DPDP (India) and GDPR.",
  toggle: { edge: "Edge AI", cloud: "Cloud" },
  edge: {
    id: "edge",
    title: "Edge AI",
    tagline: "On-prem inference. Cameras stay local.",
    when: "Choose Edge when video must never leave the store, internet is unreliable, or IT wants air-gapped processing.",
    runs: [
      "A 12W box plugs into your existing RTSP / NVR cameras",
      "Inference runs on device, sub-second",
      "Store keeps counting when the line drops",
    ],
    privacy: "Video frames stay in volatile memory on site. Only anonymised counts leave (timestamp, dwell, entry).",
    neverLeaves: "Raw video, faces, biometrics",
    canLeave: "Aggregate behavioural events only",
  },
  cloud: {
    id: "cloud",
    title: "Cloud processing",
    tagline: "Process in the cloud when that fits.",
    when: "Choose Cloud when you want faster multi-store rollouts, lighter on-site hardware, or centralised model updates.",
    runs: [
      "Cameras feed a controlled cloud pipeline",
      "Same pass / stop / enter signals as Edge",
      "Central dashboard across doors from day one",
    ],
    privacy: "DPDP + GDPR controls apply. No facial identity. Retention and access are scoped to your contract.",
    neverLeaves: "Facial identity, biometric templates",
    canLeave: "Processed frames or derived events under your retention and access rules",
  },
  shared: [
    "Same Monday Brief and physical A/B engine",
    "Zero facial recognition / re-identification product",
    "Pilot terms mapped to the path you pick",
  ],
  cta: "Talk through which path fits",
}

export const JOURNEY = {
  index: "02",
  kicker: "Core Journey",
  h2: "Beyond footfall.",
  sub: "The complete behavioral continuum — from street attention to in-store product consideration.",
  funnelLabel: "Continuous Physical Funnel",
  funnelSub: "FROM STREET VISIBILITY TO BOUTIQUE ENGAGEMENT",
  bars: [
    { label: "Pass", value: 2481 },
    { label: "Stop", value: 186 },
    { label: "Enter", value: 39 },
    { label: "Explore", value: 34 },
    { label: "Engage", value: 18 },
  ],
  steps: [
    {
      step: "STEP 01",
      name: "PASS",
      count: 2481,
      countLabel: "Street Footfall",
      rate: "100%",
      rateLabel: "Base Street Volume",
      desc: "Pedestrians walking along your storefront perimeter.",
      metrics: ["Avg Pace: 1.4 m/s", "Street Width: 18m"],
      share: 100,
      answer: "All 2,481 people walked the same 18 metres of glass — the total opportunity the window competes for, every day.",
    },
    {
      step: "STEP 02",
      name: "STOP",
      count: 186,
      countLabel: "Attention Hook",
      rate: "7.5%",
      rateLabel: "Stop Rate",
      desc: "Passers-by who paused at the window for 4+ seconds.",
      metrics: ["Avg Window Dwell: 4.8s", "Gaze Intensity: 94%"],
      share: 7.5,
      answer: "The window earns a 4.8-second pause at 94% gaze intensity — stop is the storefront's true landing rate.",
    },
    {
      step: "STEP 03",
      name: "ENTER",
      count: 39,
      countLabel: "Threshold Cross",
      rate: "21.0%",
      rateLabel: "Stop-to-Enter",
      desc: "Attention converts into a physical visit through the door.",
      metrics: ["Threshold Velocity: 0.8 m/s"],
      share: 21.0,
      answer: "39 of 186 stoppers crossed the threshold. The door closes the deal the window started.",
    },
    {
      step: "STEP 04",
      name: "EXPLORE",
      count: 34,
      countLabel: "Zone Immersion",
      rate: "87.2%",
      rateLabel: "Active Browsing",
      desc: "Visitors moving through zones with deliberate engagement.",
      metrics: ["Top zone: Leather Goods Island · 68% visit rate"],
      share: 87.2,
      answer: "87.2% of visitors browse deliberately — Leather Island’s 68% visit rate means most entered that zone (zones overlap; rates need not sum to 100%).",
    },
    {
      step: "STEP 05",
      name: "ENGAGE",
      count: 18,
      countLabel: "Product Consideration",
      rate: "52.9%",
      rateLabel: "High-Intent Touch",
      desc: "Hands on product — the moment consideration becomes intent.",
      metrics: ["Avg Product Gaze: 8.4s", "Fitting Trials: 14"],
      share: 52.9,
      answer: "52.9% of explorers put hands on product — 8.4s of gaze on the hero vitrine, 14 fitting trials today.",
    },
  ],
  band: {
    title: "Full-Funnel Store Intelligence",
    sub: "From street sidewalk to high-touch checkout.",
    tags: ["Zero Face Biometrics", "100% Local Edge Compute", "Sub-Second Precision"],
  },
  demoNote: "Demo funnel for a single storefront day (Organic Clothing Co., Bandra). The same pipeline runs on your window from day one.",
}

export const ATELIER = {
  index: "04",
  kicker: "Inside The Boutique",
  h2: "What happens once they step inside?",
  sub: "In-store intelligence layered on your existing cameras — zones, gaze, pace and cohorts.",
  image: "/images/in-store-zones.jpg",
  camLabel: "BOUTIQUE INTERIOR CAM 02 · 3D OCCUPANCY MESH",
  ui: {
    store: "ORGANIC CLOTHING CO. · BANDRA FLAGSHIP",
    view: "IN-STORE INTELLIGENCE · CAM 02",
    live: "LIVE · TODAY",
    nav: "VIEWS",
  },
  tabs: [
    {
      id: "zones",
      label: "1. Zone Heatmaps",
      overlay: {
        tag: "ZONE 01 · APPAREL",
        big: "41% visit rate",
        lines: ["Avg Dwell: 6m 12s", "182 Shoppers"],
        note: "H3 visit rate 55% and L2 68% can both be true — zones overlap, so rates need not sum to 100%. F1 at 9% is under-lit (lighting, not layout).",
        move: "Relight Zone F1 and re-measure for 7 days — dead light reads as dead floor.",
      },
      pin: { title: "Hero Handbag Vitrine", value: "8.4s Gaze Time · 42% Touch Rate" },
      markers: [
        { title: "Zone H3 · Hero Rotunda", value: "55% visit rate · 9m 45s", x: 62, y: 32 },
        { title: "Zone L2 · Leather Island", value: "68% visit rate · 7m 04s", x: 34, y: 58 },
        { title: "Zone A1 · Apparel", value: "41% visit rate · 6m 12s", x: 80, y: 68 },
        { title: "Zone F1 · Vitrine West", value: "9% visit rate · under-lit", x: 18, y: 38 },
      ],
    },
    {
      id: "gaze",
      label: "2. Product Gaze & Sections",
      overlay: {
        tag: "HERO ZONE · ACCESSORIES",
        big: "68% Traffic",
        lines: ["Highest Store Density", "9m 45s Dwell"],
        note: "The hero vitrine holds an 8.4-second gaze — the longest single stare in the store.",
        move: "Capsule rail trails at 5.2s — after the launch, promote it over the sector leader.",
      },
      pin: { title: "Capsule Runway Rail", value: "5.2s Gaze Time · 24% Interaction" },
      markers: [
        { title: "Hero Handbag Vitrine", value: "8.4s gaze · 42% touch", x: 66, y: 30 },
        { title: "Capsule Runway Rail", value: "5.2s gaze · 24% touch", x: 38, y: 62 },
        { title: "Fragrance Counter", value: "6m 12s dwell · 55% touch", x: 84, y: 74 },
      ],
    },
    {
      id: "velocity",
      label: "3. Movement Velocity & Speed",
      overlay: {
        tag: "DECELERATION DETECTED",
        big: "0.3 m/s Browsing Pace",
        lines: ["Shoppers slow by 76% when entering the accessory rotunda."],
        note: "Deceleration is consideration — 0.3 m/s at the rotunda is where browsing becomes buying.",
        move: "Place the offer at the deceleration point, not the transit corridor at 1.3 m/s.",
      },
      pin: { title: "Transit Corridor", value: "1.3 m/s Pace" },
      markers: [
        { title: "Transit Corridor", value: "1.3 m/s — cold transit", x: 70, y: 20 },
        { title: "Entry flow", value: "0.8 m/s — hot zone", x: 16, y: 48 },
        { title: "Rotunda slowdown", value: "0.3 m/s browsing pace", x: 50, y: 60 },
      ],
    },
    {
      id: "cohorts",
      label: "4. Shopper Demographics",
      overlay: {
        tag: "ANONYMOUS COHORT TELEMETRY · TODAY",
        big: "Age 28–44 (62%)",
        lines: [
          "Primary Cohort",
          "Shopping Dynamic: 58% Solo · 42% Pair",
          "Peak Footfall Time: 16:30 – 18:45",
          "Fitting Room Conversion: 74%",
        ],
        note: "The 28–44 cohort peaks at 16:30 — and 74% of what reaches the fitting room converts.",
        move: "Staff pairs from 16:30 — pairs decide; solos research.",
      },
      pin: { title: "Advisory Salon", value: "Conversion: 38%" },
      markers: [
        { title: "Entry cohort · 28–44", value: "62% of stops", x: 20, y: 40 },
        { title: "Advisory Salon", value: "38% conversion · 15% traffic", x: 74, y: 46 },
        { title: "Fitting Rooms", value: "74% conversion", x: 56, y: 76 },
      ],
    },
  ],
  features: [
    {
      title: "Zone Dwell Share",
      sub: "Know your hottest sections",
      desc: "Which zones capture the most browsing time — and which floors traffic forgets.",
    },
    {
      title: "Product Gaze Duration",
      sub: "Measure fixture attention",
      desc: "Exact gaze time on hero products, vitrines and fixture drops.",
    },
    {
      title: "Movement Velocity",
      sub: "Track browsing speed",
      desc: "Where pace decelerates into consideration, and where corridors stay cold.",
    },
    {
      title: "Demographic Cohorts",
      sub: "Understand your audience",
      desc: "Privacy-safe age brackets and group dynamics across days and launches.",
    },
  ],
}

export const PROOF = {
  index: "07",
  kicker: 'The "Aha" Moment',
  h2: "Did your storefront work?",
  sub: "Connect merchandising changes with changes in customer behaviour.",
  chip: "PHYSICAL A/B MEASUREMENT",
  store: "Organic Clothing Co. · Bandra Flagship · Mumbai",
  before: {
    label: "BASELINE",
    value: "6.4%",
    metric: "Window Stop Rate",
    desc: "Traditional static mannequin installation.",
    image: "/images/window-before.jpg",
  },
  after: {
    label: "NEW ROTATION",
    badges: ["AFTER", "VERIFIED"],
    value: "7.3%",
    metric: "Window Stop Rate",
    desc: "Statistically measured over a 14-Day A/B Rotation.",
    image: "/images/window-after.jpg",
  },
  uplift: "↑ +14.6% observed uplift",
  demoNote: "Illustrative pilot scenario — sample window rotation, fourteen-day cycle. Your baseline, rotation and verdict are computed from your own window on your own street.",
  benchmark: "As an industry reference, storefront A/B programmes typically see a 3–8% conversion uplift when the best-scoring display gets scaled (V-Count, vendor benchmark) — the 14-day verdict is the only way to know which display that is.",
}

export const SYSTEM = {
  index: "05",
  kicker: "One Sensor. One Decision Point.",
  h2: "The sensor tracks behavior. The brand tracks context. The engine finds the correlation.",
  sub: "You stop guessing. You start knowing.",
  trio: [
    {
      k: "01",
      title: "Sensor tracks behavior",
      desc: "Pass, stop, dwell, enter — measured on-device from your existing RTSP/NVR cameras.",
      answer: "Four behaviours, measured on-device in under a second — pass, stop, dwell, enter. No video ever leaves the box.",
    },
    {
      k: "02",
      title: "Brand tracks context",
      desc: "Window resets, campaigns, staffing and layout — the changes you make, logged.",
      answer: "Your resets and campaigns become timestamped changes — so every verdict later attributes to a real move you made.",
    },
    {
      k: "03",
      title: "Engine finds correlation",
      desc: "Every Monday: what changed, what moved, and the three actions worth your time.",
      answer: "Each Monday the engine cross-references your calendar against the street's curve and returns three actions with evidence.",
    },
  ],
  interface: {
    kicker: "The Interface",
    h2: "Quiet clarity.",
    sub: "No endless dashboards. Just the vital signals you need to make decisions — and the staffing behind them.",
    decision: "Every decision returns as a verdict: what the street chose, when, and with what confidence. Keep or kill, decided by evidence.",
    fixes: [
      {
        num: "01",
        tag: "MANAGER REPORTING",
        chip: "SOLVED",
        desc: "The Monday Brief replaces the weekly report — audited, attributed, and three actions to take. No more Friday guessing.",
      },
      {
        num: "02",
        tag: "STAFFING",
        chip: "SOLVED",
        desc: "Peak windows (15–17h), zone dwell and solo-vs-pair dynamics show exactly where and when to place staff. Coverage follows the crowd, not the calendar.",
      },
      {
        num: "03",
        tag: "CONSUMER · RETAIL INTELLIGENCE",
        chip: "THE OFFER",
        desc: "From street attention to buyer behaviour — the questions the till could never answer, now measured at the glass.",
      },
    ],
    store: "Organic Clothing Co. · Bandra Flagship · Mumbai",
    live: "LIVE · TODAY",
    stats: [
      { label: "People today", value: 2481 },
      { label: "Stop rate", value: 7.5, suffix: "%" },
      { label: "Walk-ins", value: 39 },
    ],
    trend: "HOURLY ATTENTION TREND",
    trendDelta: "+14.6% vs baseline",
    hours: "09:00 — 21:00",
    cta: "Explore the insights",
  },
}

export type MiniViz = { kind: "line" | "area" | "donut" | "bars"; data?: number[]; value?: number }

export type MetricCard = {
  title: string
  desc: string
  stat: string
  delta: string
  deltaTone: "pos" | "neg" | "flat"
  hint: string
  why: string
  spark: number[]
  viz: "line" | "area" | "donut" | "bars" | "gauge" | "split" | "hours"
  value?: number
  peer?: number
  max?: number
  parts?: { label: string; value: number }[]
  hours?: number[]
}

/** Four pillars + patterns/predictions — concise, honest maturity, no face-ID product. */
export const INTELLIGENCE = {
  kicker: "Intelligence",
  h2: "What the cameras tell you.",
  sub: "From today’s floor to patterns that learn with history. CCTV only — no face recognition.",
  pillars: [
    {
      id: "retail",
      num: "01",
      title: "Retail",
      desc: "Pass → stop → enter → zone → queue, with window stop-rate for A/B.",
      chips: [
        { label: "Funnel live", maturity: "live" },
        { label: "Window stop next", maturity: "next" },
      ],
    },
    {
      id: "visitor",
      num: "02",
      title: "Visitor",
      desc: "Privacy-safe cohorts, solo vs group, and dwell journeys.",
      chips: [
        { label: "Cohorts live", maturity: "live" },
        { label: "Paths next", maturity: "next" },
      ],
    },
    {
      id: "store",
      num: "03",
      title: "Store",
      desc: "Occupancy, zone heat, staffing windows, and under-lit spots.",
      chips: [
        { label: "Heat live", maturity: "live" },
        { label: "Multi-cam next", maturity: "next" },
      ],
    },
    {
      id: "shelf",
      num: "04",
      title: "Shelf",
      desc: "Near-display attention from CCTV — not barcode POS.",
      chips: [
        { label: "Interest live", maturity: "live" },
        { label: "Fixture next", maturity: "next" },
      ],
    },
  ],
  depth: [
    {
      title: "Patterns",
      maturity: "learns",
      maturityLabel: "After months",
      desc: "Weekly motifs from anonymous rollups — peak hours, quiet zones.",
    },
    {
      title: "Predictions",
      maturity: "learns",
      maturityLabel: "4–12 weeks+",
      desc: "Footfall and queue forecasts for staffing; improves with history.",
    },
  ],
  footer: "Dashboard wires EdgeSight live (:8000) when Docker is up — Models & EdgeSight screen shows the pack. Maturity labels stay honest.",
  cta: "Open dashboard",
}

export const METRICS: { index: string; kicker: string; h2: string; sub: string; note: string; items: MetricCard[] } = {
  index: "03",
  kicker: "Outcomes",
  h2: "Six signals the stack can produce.",
  sub: "Grounded in EdgeSight (YOLO26s + ByteTrack + tripwires/zones). Live tripwire/queue/dwell when localhost:8000 is up; otherwise Organic Clothing Co. showcase.",
  note: "Stop rate needs a window zone (≥4s) — still Partial. Engaged dwell is head-facing + dwell — not pupil gaze. No POS sales claims.",
  items: [
    {
      title: "Window stop rate",
      desc: "Share of passers paused ≥4s in the window zone (needs street-facing cam).",
      stat: "7.5%",
      delta: "+0.4pp today",
      deltaTone: "pos",
      hint: "vs yesterday",
      why: "If stop rate falls, the glass stopped working.",
      viz: "line",
      spark: [6.8, 7.0, 7.1, 7.2, 7.3, 7.5],
    },
    {
      title: "Engaged dwell",
      desc: "Share facing the zone (head-pose proxy + dwell). Not eye tracking or face ID.",
      stat: "39%",
      delta: "deep > 4s",
      deltaTone: "pos",
      hint: "vs last week",
      why: "Engaged dwell beats raw footfall for display decisions.",
      viz: "donut",
      value: 39,
      spark: [30, 32, 34, 37, 38, 39],
    },
    {
      title: "Stop → entry",
      desc: "Of window stops, how many then crossed the entrance tripwire.",
      stat: "21%",
      delta: "+1.2pp this wk",
      deltaTone: "pos",
      hint: "vs last week",
      why: "Move the hero into the sightline and this number moves.",
      viz: "line",
      spark: [18.5, 19.2, 19.8, 20.4, 20.8, 21.0],
    },
    {
      title: "Passes at glass",
      desc: "Tracks past the window/outdoor camera — hourly rollup.",
      stat: "2,481",
      delta: "today · peak 15–17",
      deltaTone: "flat",
      hint: "peak 15–17",
      why: "Staff and creative should follow this curve.",
      viz: "area",
      spark: [2.1, 2.2, 2.2, 2.3, 2.4, 2.5, 2.4],
    },
    {
      title: "Zone dwell",
      desc: "Mean time in a floor polygon (foot-point in zone).",
      stat: "9m 45s",
      delta: "hero rotunda",
      deltaTone: "pos",
      hint: "vs last week",
      why: "Put best product and staff where dwell gathers.",
      viz: "area",
      spark: [8.6, 8.9, 9.1, 9.4, 9.7, 9.8],
    },
    {
      title: "Window A/B uplift",
      desc: "Stop-rate delta across a 14-day schedule (same metric, two periods).",
      stat: "+14.6%",
      delta: "demo A/B · 14d",
      deltaTone: "pos",
      hint: "schedule A/B",
      why: "Keep or kill, decided by the street — not POS.",
      viz: "bars",
      spark: [10.2, 10.8, 11.5, 12.1, 12.6, 13.1, 12.0],
    },
  ],
}

export const SECTORS = {
  index: "09",
  kicker: "Environments",
  h2: "Built for spaces where impression is everything.",
  context: "India runs on ~13 million independent shops, and they still ring up ~79–88% of a retail market already past USD 1 trillion (RAI · Redseer 2025). The physics of attention is universal — the instrument adapts.",
  cards: [
    {
      id: "fashion",
      num: "01",
      title: "Fashion",
      sub: "Haute couture & ready-to-wear flagships",
      tag: "SEASONAL COLLECTIONS",
      image: "/images/sector-fashion.jpg",
    },
    {
      id: "beauty",
      num: "02",
      title: "Beauty",
      sub: "Fragrance & luxury cosmetic ateliers",
      tag: "INTERACTIVE COUNTERS",
      image: "/images/sector-beauty.jpg",
    },
    {
      id: "jewellery",
      num: "03",
      title: "Jewellery",
      sub: "High jewellery & fine timepiece salons",
      tag: "HERO VITRINES",
      image: "/images/sector-jewellery.jpg",
    },
    {
      id: "premium",
      num: "04",
      title: "Premium Retail",
      sub: "Concept destinations & department stores",
      tag: "CORNERSTONE ENTRANCES",
      image: "/images/sector-premium-retail.jpg",
    },
  ],
}

export const PRIVACY = {
  index: "04",
  kicker: "Privacy",
  h2: "DPDP and GDPR on both paths.",
  sub: "Privacy is architecture, not a footer. Edge and Cloud meet the same bar.",
  dpdp: {
    title: "DPDP Act 2023 + GDPR",
    body: "Anonymous aggregate behavioural analytics are not personal data under DPDP s.2(1)(t). We never build facial identity. GDPR-aligned controls cover lawful processing, retention, and access on the Cloud path. Edge keeps raw video on site.",
    chips: ["DPDP 2023", "GDPR-aligned", "Zero biometrics product"],
    source: "Digital Personal Data Protection Act 2023 · MeitY · GDPR principles for EU-facing brands",
  },
  principles: [
    {
      num: "01",
      title: "No facial identity.",
      desc: "No recognition, no re-identification, no cross-store person graph.",
      answer: "Every person is an anonymous behavioural vector. There is no face map to leak.",
      chips: ["0 faces", "0 re-ID"],
    },
    {
      num: "02",
      title: "Edge: video stays local.",
      desc: "Frames process in volatile memory on the store box. Recording of identity never begins.",
      answer: "Only anonymised events leave: timestamp, dwell seconds, entry status.",
      chips: ["on-prem", "0 uploaded video"],
    },
    {
      num: "03",
      title: "Cloud: controls, not identity.",
      desc: "When Cloud fits, processing runs under retention and access rules in your contract. Still no facial product.",
      answer: "You choose what can leave. Identity never becomes a feature.",
      chips: ["scoped retention", "access controls"],
    },
  ],
  pipeline: [
    { stage: "ORIGIN", title: "Store Camera", desc: "Existing RTSP / NVR feeds" },
    { stage: "PATH", title: "Edge or Cloud", desc: "You pick where inference runs" },
    { stage: "OUTPUT", title: "Anonymised Insights", desc: "Numbers for the Monday Brief" },
  ],
}

export const HOW = {
  index: "05",
  kicker: "How it works",
  h2: "Three steps. Monday brings the verdict.",
  steps: [
    { num: "01", title: "Connect", desc: "Existing cameras. Edge box on site, or Cloud ingest. Zero new camera buy.", answer: "Pass, stop, dwell, enter on one dashboard." },
    { num: "02", title: "Calibrate", desc: "We map windows and zones. The system learns your store's rhythm.", answer: "Thresholds tuned until the numbers match your floor." },
    { num: "03", title: "Monday Brief", desc: "Verdict, three actions, evidence. Fifteen minutes.", answer: "Physical A/B keep-or-kill on every window move." },
  ],
  compat: "EDGE AI OR CLOUD · EXISTING RTSP/NVR · DPDP + GDPR",
  wishlist: {
    kicker: "Next",
    h2: "Ready to scope a store?",
    sub: "Tell us Edge, Cloud, or not sure — a human replies.",
    successTitle: "You're on the runway.",
    successBody: "We'll review your storefront camera setup with you and schedule installation.",
    successNote: "Confirmation will be sent to",
    feedbackQ: "Was this page clear?",
    feedbackYes: "Yes, crystal",
    feedbackNo: "Not yet",
    feedbackThanks: "Thank you — noted.",
  },
}

export const PILOT_FORM = {
  title: "Retail Pilot Program",
  h2: "Deploy AD Labs on Edge or Cloud.",
  sub: "Existing cameras. First stop-rate report from your first full day. Pick a path or say not sure.",
  fields: {
    brand: { label: "Retail Brand / House Name", placeholder: "e.g. Organic Clothing Co." },
    sector: {
      label: "Sector",
      options: [
        "Fashion & Apparel",
        "Fashion & Haute Couture",
        "Beauty & Cosmetics",
        "Jewellery & Watches",
        "Department Store / Concept",
        "Premium Footwear",
      ],
    },
    locations: {
      label: "Store Locations",
      options: ["1 Flagship Location", "1-5 Stores", "2 - 5 Stores", "6 - 20 Stores", "20+ Global Network"],
    },
    problem: {
      label: "What problem should we solve first?",
      options: [
        "Window & display — which windows actually pull people in",
        "Front-of-store — why people walk past without stopping",
        "Conversion — link street traffic to in-store sales",
        "Staffing & scheduling around real footfall",
        "In-store dead zones & shopper journey",
        "Something else — I'll describe it below",
      ],
    },
    budget: {
      label: "Preferred deployment path",
      options: [
        "Edge AI — on-prem inference",
        "Cloud processing",
        "Not sure — help us choose",
        "Value-first — show me before I commit",
      ],
    },
    detail: { label: "Describe the problem in your own words (optional)", placeholder: "e.g. Our entrance window gets footfall but nobody comes in…" },
    email: { label: "Executive / Work Email", placeholder: "name@brand.com" },
  },
  note: "Works with existing IP cameras. Edge keeps video on site; Cloud runs under DPDP + GDPR controls.",
  submit: "Request Pilot Access",
  successTitle: "Pilot Request Received.",
  successBody: "Our partner team reviews your storefront camera setup with you and schedules installation.",
  return: "Return to Website",
}

export const MISSION = {
  index: "10",
  kicker: "Our Mission",
  h2: "The storefront deserves an answer.",
  sub: "Physical retail has been flying blind since glass windows were invented. We turn the camera you already own into an honest witness — so a boutique owner knows what the street decided, not what the spreadsheet guessed.",
  image: "/images/window-after.jpg",
  principles: [
    {
      title: "Witness, not spy",
      desc: "We measure behaviour as numbers. Nobody is watched, stored or identified — ever.",
      answer: "Frames are reduced to vectors of motion in volatile memory and discarded — 179k events a day, zero faces stored.",
      chips: ["0 faces stored", "179k events / day"],
    },
    {
      title: "Decision-grade",
      desc: "Every statistic ships with its evidence chain: how measured, how verified, how it links to a move.",
      answer: "Every figure on this page is recomputed from raw events before it ships — if it can't be reproduced by hand, it doesn't print.",
      chips: ["every stat audited", "×3 blind checks"],
    },
    {
      title: "On-premise by design",
      desc: "Video never leaves your store. The cloud sees numbers only — zero surveillance transfer.",
      answer: "Camera data stays inside a 12W box at your store — the store keeps counting even with the internet down.",
      chips: ["0 cloud upload", "12W edge box"],
    },
  ],
  stat: { value: 10, suffix: "/10", label: "flagship seats in the founding cohort — 0 filled so far" },
  context: "India's retail market is roughly USD 0.94–1.06 trillion (2024) and is projected to nearly double by 2030 (BCG–RAI · Deloitte–FICCI). Yet analytics adoption remains 62% concentrated in large enterprises — the small shop shelf is wide open (IMARC).",
}

export const ABOUT = {
  hero: {
    kicker: "The Lab",
    h2a: "Two paths.",
    h2b: "One privacy bar.",
    sub: "AD Labs builds storefront intelligence for physical retail. Deploy on Edge AI or Cloud. Both adhere to DPDP and GDPR. Founded 2026 · Bengaluru, India.",
    stats: [
      { value: "Edge + Cloud", label: "Peer deployment options — pick where inference runs" },
      { value: "DPDP + GDPR", label: "Privacy architecture on both paths, not a policy footer" },
      { value: "0 faces", label: "No facial recognition or re-identification product" },
    ],
  },
  vision: {
    title: "A world where no store flies blind again.",
    body: "Digital retail measures every click. Physical retail still guesses at the glass. We close that gap with intelligence that grows with privacy, never against it — on Edge or in the Cloud.",
  },
  mission: {
    title: "Turn cameras you own into an honest witness.",
    body: "Measure the street before the door and the floor past it. Ship the answer as a Monday Brief: verdict, evidence, three actions. You choose Edge AI (on-prem) or Cloud processing. Neither path builds facial identity.",
  },
  problem: {
    index: "02",
    kicker: "THE PROBLEM",
    title: "The problem",
    lead: "You know who entered. You do not know who noticed.",
    points: [
      { num: "01", text: "Counters only see the door. The decision happened outside, at the glass." },
      { num: "02", text: "Windows change on opinion. Campaigns blur into one sales number." },
      { num: "03", text: "Privacy fear blocks tools. Teams skip measurement instead of choosing a compliant path." },
    ],
    stat: { value: "5–15%", label: "typical capture rate — passers-by who enter (Pygmalios 2026)" },
  },
  solution: {
    index: "03",
    kicker: "THE SOLUTION",
    title: "The solution",
    sub: "Same signals. Two deployment paths. One compliance bar.",
    points: [
      { num: "01", text: "Edge AI: a 12W box on your PoE / RTSP / NVR line. Video stays on site." },
      { num: "02", text: "Cloud: controlled processing when multi-store speed or lighter hardware fits — still no facial product." },
      { num: "03", text: "Every Monday: what changed, what moved, three actions. DPDP + GDPR on both paths." },
    ],
  },
  usp: {
    index: "04",
    kicker: "AD LABS USP",
    title: "Why it's different",
    sub: "Four lines. Everything else is a spec sheet.",
    cards: [
      {
        num: "01",
        title: "Dual deployment",
        desc: "Edge AI and Cloud as peers — not a forced edge-only future.",
        answer: "Pick the path that fits IT, bandwidth, and risk. Same Monday Brief either way.",
      },
      {
        num: "02",
        title: "Privacy by architecture",
        desc: "DPDP + GDPR. It counts. It does not watch people as identity.",
        answer: "No faces, no re-identification. Edge keeps video local; Cloud runs under contract controls.",
      },
      {
        num: "03",
        title: "Verdicts, not dashboards",
        desc: "Numbers that end in a move.",
        answer: "14-day physical A/B plus a Monday Brief with three actions.",
      },
      {
        num: "04",
        title: "Your cameras",
        desc: "Zero new camera buy for typical pilots.",
        answer: "Existing RTSP / NVR feeds. One cable and a scope call.",
      },
    ],
  },
  ip: {
    index: "06",
    kicker: "INTELLECTUAL PROPERTY",
    title: "What we own",
    sub: "The engineering that makes the promise hold.",
    points: [
      { num: "01", title: "Behavioural telemetry", desc: "Pass · stop · dwell · enter from plain camera feeds — Edge or Cloud." },
      { num: "02", title: "Anonymous spatial analytics", desc: "Zones, trajectories, cohorts — zero biometrics product." },
      { num: "03", title: "Physical A/B attribution", desc: "14-day window experiments with confidence bands." },
      { num: "04", title: "Dual-path runtime", desc: "On-prem edge box and cloud pipeline sharing one signal contract." },
    ],
  },
  status: {
    index: "07",
    kicker: "WHERE WE ARE",
    title: "Honest status, on record.",
    body: "Founded 2026 in Bengaluru. Accepting founding pilot applications across India — Edge or Cloud.",
    points: [
      { num: "01", text: "Flagship pilot enrollment open" },
      { num: "02", text: "Bengaluru engineering lab" },
      { num: "03", text: "Edge + Cloud deployment paths" },
    ],
    cta: "Join the founding cohort",
  },
  product: {
    index: "08",
    kicker: "THE PRODUCT",
    title: "The product",
    sub: "Street attention to buyer decision — one line of sight.",
    steps: [
      { num: "01", title: "Choose a path", desc: "Edge AI on site, or Cloud processing. We scope cameras either way.", answer: "Footfall and stop rate appear as they happen." },
      { num: "02", title: "Calibrate", desc: "Windows, zones, light. The system learns your rhythm.", answer: "Numbers reflect your floor, not a generic template." },
      { num: "03", title: "Every Monday", desc: "Brief. Verdict, three actions, evidence.", answer: "Physical A/B on every window move." },
    ],
    ctaLabel: "Explore the live dashboard",
    ctaSub: "or compare Edge vs Cloud on the home page —",
  },
  team: {
    index: "10",
    kicker: "The Lab",
    title: "Small team. Singular obsession.",
    sub: "Retail people and machine people — building the instrument the street was missing.",
  },
  demoNote: "Home-page samples illustrate one storefront day. Live numbers compute from your cameras on the path you choose.",
}

export const PRICING = {
  index: "06",
  kicker: "Pricing",
  h2: "Priced by path: Edge or Cloud.",
  sub: "Two clear pilots. Tell us store count on a call; we shape terms around the path you pick.",
  plans: [
    {
      name: "Edge AI Pilot",
      tag: "ON-PREM PATH",
      desc: "Inference on a store box. Video stays local. Ideal when privacy or offline resilience comes first.",
      includes: [
        "1–5 doors + edge hardware",
        "On-device inference, offline-capable",
        "Monday Brief + privacy architecture",
        "DPDP + GDPR by construction",
      ],
      price: "Pilot terms — 10-minute call",
      cta: "Ask Edge pricing",
      featured: true,
    },
    {
      name: "Cloud Pilot",
      tag: "CLOUD PATH",
      desc: "Controlled cloud processing for faster multi-store rollouts and lighter on-site kit.",
      includes: [
        "Multi-store dashboard from day one",
        "Same signals as Edge",
        "Retention & access controls in contract",
        "DPDP + GDPR-aligned controls",
      ],
      price: "Custom pilot terms",
      cta: "Ask Cloud pricing",
    },
  ],
  bottom: "Not sure? Start on Discover — pick Edge, Cloud, or not sure. No lock-ins while the glass proves itself.",
}

export const FAQ = {
  index: "06",
  kicker: "FAQ",
  h2: "Straight answers.",
  sub: "Edge vs Cloud, privacy, cameras. Everything else → talk to us.",
  items: [
    {
      q: "Edge AI or Cloud — which should we pick?",
      a: "Edge when video must stay on site or the line is unreliable. Cloud when you want faster multi-store rollout or lighter hardware. Same signals and Monday Brief either way. Not sure? Say so on Discover and we scope with you.",
    },
    {
      q: "Is this compliant with DPDP and GDPR?",
      a: "Yes. Both paths adhere to DPDP (India) and GDPR. We never ship a facial recognition product. Edge keeps raw video local. Cloud runs under retention and access controls in your contract.",
    },
    {
      q: "Do we need new cameras?",
      a: "Usually no. We plug into existing PoE / RTSP / NVR feeds. Analog stacks can bridge at the recorder.",
    },
    {
      q: "What does a pilot look like?",
      a: "Scoped to one path and a flagship (or small set of doors). Install or connect, calibrate zones, then weekly Monday Briefs. You decide keep-or-kill with real numbers.",
    },
  ],
}

export const CONTACT = {
  index: "15",
  kicker: "Talk to the lab",
  h2: "Tell us about your storefront.",
  sub: "Pilot requests, storefront questions, or partner programmes — a human from the lab replies.",
  email: "sales@adlabs.in",
  city: "Bengaluru, India",
  response: "A human replies",
  fields: {
    name: { label: "Your name", placeholder: "e.g. Aisha Verma" },
    email: { label: "Work email", placeholder: "name@brand.com" },
    brand: { label: "Retail brand / house", placeholder: "e.g. Organic Clothing Co." },
    sector: {
      label: "Store role",
      placeholder: "Select what you need",
      options: ["Window & storefront intelligence", "Pilot with a budget in mind", "Partner / integration programme", "Press & analyst", "Something else"],
    },
    message: { label: "What should we measure first?", placeholder: "e.g. Our entrance window gets footfall but nobody comes in…" },
  },
  submit: "Send to the lab",
  successTitle: "Message received.",
  successBody: "A human from the lab reads every message that lands here.\n\nFor anything urgent, write to sales@adlabs.in directly.",
}

