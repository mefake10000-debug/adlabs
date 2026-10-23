#!/usr/bin/env node
/**
 * Poll /api/v1/live for 45s.
 * Assert Present === active track ids, and In/Out are session tripwires
 * (not the SQLite day rollup).
 *
 *   node scripts/live-reflection-poll.mjs
 *   LIVE_URL=http://127.0.0.1:8000/api/v1/live node scripts/live-reflection-poll.mjs
 */

const LIVE_URL = process.env.LIVE_URL || "http://127.0.0.1:8000/api/v1/live"
const STACK_URL = process.env.STACK_URL || LIVE_URL.replace(/\/api\/v1\/live.*$/, "/api/v1/models/stack")
const DURATION_MS = Number(process.env.POLL_MS || 45_000)
const INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS || 1_000)

function sum(rows, key) {
  return (rows || []).reduce((n, row) => n + (Number(row?.[key]) || 0), 0)
}

function lifetimeProduct(rows, people) {
  if (!Array.isArray(rows) || !rows.length) return false
  const cap = Math.max(Number(people) || 0, 1) * 50
  return rows.some((p) => {
    const viewers = Number(p.viewers) || 0
    const detections = Number(p.detections) || 0
    return viewers > Math.max(cap, 200) || detections > Math.max(cap * 4, 800)
  })
}

function checkSample(body) {
  const errors = []
  if (body?.source !== "live_snapshot") {
    errors.push(`source=${body?.source ?? "missing"} (day rollup must not be the live source)`)
  }
  const ids = body?.track_ids
  if (!Array.isArray(ids)) {
    errors.push("track_ids missing — Present cannot be checked against boxes")
  } else if (body.people_now !== ids.length) {
    errors.push(`Present ${body.people_now} !== tracks ${ids.length}`)
  }
  if (body?.active_tracks !== body?.people_now) {
    errors.push(`active_tracks ${body?.active_tracks} !== people_now ${body?.people_now}`)
  }
  if (body?.present_binding !== "active_tracks") {
    errors.push(`present_binding=${body?.present_binding ?? "missing"}`)
  }
  const trip = body?.tripwires
  if (!Array.isArray(trip) || trip.length === 0) {
    errors.push("tripwires missing — In/Out cannot be proven as session crossings")
  } else {
    const inn = sum(trip, "in_count")
    const out = sum(trip, "out_count")
    if (body.total_visitors !== inn) {
      errors.push(`In ${body.total_visitors} !== tripwire in ${inn} (day-rollup poison)`)
    }
    if (body.total_exits !== out) {
      errors.push(`Out ${body.total_exits} !== tripwire out ${out} (day-rollup poison)`)
    }
    if (body.session_in !== inn || body.session_out !== out) {
      errors.push(`session_in/out ${body.session_in}/${body.session_out} !== tripwire ${inn}/${out}`)
    }
  }
  if (body?.inout_binding !== "session_tripwire") {
    errors.push(`inout_binding=${body?.inout_binding ?? "missing"}`)
  }
  if (body?.models?.enrichment === false && body.engagement != null) {
    errors.push("engagement zeros leaked while enrichment is off")
  }
  if (lifetimeProduct(body?.products_top, body?.people_now)) {
    errors.push("lifetime product rollup leaked into products_top")
  }
  return errors
}

async function getJson(url) {
  const res = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } })
  if (!res.ok) throw new Error(`${url} ${res.status}`)
  return res.json()
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const samples = []
const failures = []
const started = Date.now()
const deadline = started + DURATION_MS

while (Date.now() < deadline) {
  const t0 = Date.now()
  let body
  try {
    body = await getJson(LIVE_URL)
  } catch (err) {
    failures.push({ t: new Date().toISOString(), errors: [String(err.message || err)] })
  }
  if (body) {
    const errors = checkSample(body)
    const row = {
      t: body.generated_at || body.last_updated || new Date().toISOString(),
      present: body.people_now,
      tracks: Array.isArray(body.track_ids) ? body.track_ids.length : null,
      inn: body.total_visitors,
      out: body.total_exits,
      source: body.source,
      detector: body.models?.person_detector ?? null,
    }
    samples.push(row)
    if (errors.length) failures.push({ ...row, errors })
  }
  const next = t0 + INTERVAL_MS
  const wait = Math.min(next, deadline) - Date.now()
  if (wait > 0) await sleep(wait)
}

let stack = null
let stackErrors = []
try {
  stack = await getJson(STACK_URL)
  const models = stack.models || []
  const liveDet = samples.at(-1)?.detector || ""
  const yolo = models.find((m) => m.key === "yolo26n")
  const rf = models.find((m) => m.key === "rfdetr")
  if (!yolo) stackErrors.push("stack missing yolo26n")
  else if (!String(yolo.feeds_kpi || "").includes("Present")) {
    stackErrors.push(`yolo26n feeds_kpi=${yolo.feeds_kpi}`)
  }
  if (/yolo/i.test(liveDet)) {
    if (yolo && String(yolo.run_state).toUpperCase() !== "ON") {
      stackErrors.push(`yolo26n run_state=${yolo.run_state} while detector is ${liveDet}`)
    }
    if (rf && String(rf.run_state).toUpperCase() === "ON") {
      stackErrors.push("rfdetr ON while yolo is the live detector")
    }
  }
} catch (err) {
  stackErrors.push(String(err.message || err))
}

const presents = samples.map((s) => s.present).filter((n) => typeof n === "number")
const summary = {
  url: LIVE_URL,
  duration_s: Math.round((Date.now() - started) / 1000),
  samples: samples.length,
  failures: failures.length,
  present_min: presents.length ? Math.min(...presents) : null,
  present_max: presents.length ? Math.max(...presents) : null,
  present_moved: presents.length ? Math.min(...presents) !== Math.max(...presents) : false,
  in_last: samples.at(-1)?.inn ?? null,
  out_last: samples.at(-1)?.out ?? null,
  detector: samples.at(-1)?.detector ?? null,
  stack_ok: stackErrors.length === 0,
  stack_errors: stackErrors,
  ok: failures.length === 0 && samples.length >= 35 && stackErrors.length === 0,
}

console.log(JSON.stringify({ summary, failures: failures.slice(0, 5), tail: samples.slice(-3) }, null, 2))
if (!summary.ok) process.exit(1)
