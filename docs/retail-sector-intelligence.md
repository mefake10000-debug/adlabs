# Retail sector intelligence (Live hub)

Floor-role segments on `/dashboard/live` — not industry vertical tabs. Switching a segment only changes which KPI grid + FUTURE chips show; it never invents sample numbers.

Default Live view stays **video · In / Present / Out · store brief**. Segments live under one refined **Retail intelligence** drawer.

## Floor roles (taxonomy)

| Segment | Promise | Typical maturity |
|---------|---------|------------------|
| Entrance conversion | Pass → stop → enter | Entries **LIVE**; glass stop-rate **FUTURE** until ROI |
| Path & discovery | Journey traction + dead aisles | **LIVE**/**EMPTY** from `live.journey` |
| Dwell hotspots | Ranked dwell polygons | **LIVE** with zones; else **EMPTY** |
| Queue health | Length · wait · p95 | Length/wait **LIVE**; p95 **PARTIAL** until samples |
| Staff coverage | Geometry staff tags | **LIVE** with staff polygons; response **PARTIAL** |
| Shelf / display | Open-vocab interest | **LIVE**/**PARTIAL** when products model on; Moondream QA + accounting **FUTURE** |

No demographics as LIVE. NFC webhook remains an optional Edge stub — not a top segment.

## Field map (portal → EdgeSight)

| Segment | Card | Path |
|---------|------|------|
| Entrance | Entries in | `live.total_visitors` |
| Entrance | Glass stop-rate | `live.entrance.stop_rate` |
| Entrance | Glass → entry | `live.entrance.conversion_glass_to_entry` |
| Path | Live / dead / missing | `live.journey.summary.*` |
| Dwell | Top hotspot · dwell · active | `live.zones[]` ranked |
| Queue | Length · avg wait · p95 | `live.queue_length` · `avg_queue_wait_seconds` · `queues[].kpi.p95_wait_ms` |
| Staff | Staff now · zones · response | `live.staff_now` · `staff_zones[]` · `staff.response_time_to_queue` |
| Shelf | Top category · viewers · dwell | `live.products_top[]` |

Edge also emits `retail_roles` (honest maturity map). Deprecated `industry` fashion/restaurant/manufacturing/jewelry alias remains for older clients only.

## UX

- One segment switcher inside the Retail intelligence drawer (collapsed by default)
- Each segment: title · one-line promise · 2–3 quiet KPIs (— / 0 / nil) · FUTURE chips
- Persist: `localStorage` `adlabs.live.retailSegment` + `?segment=entrance|path|dwell|queue|staff|shelf`
- Legacy `?industry=` soft-maps into a floor role; industry UI removed
- Badge spam removed from default KPI tiles (header owns connectivity clock)

## Click URLs

- http://localhost:3000/dashboard/live
- http://localhost:3000/dashboard/live?segment=entrance
- http://localhost:3000/dashboard/live?segment=path
- http://localhost:3000/dashboard/live?segment=dwell
- http://localhost:3000/dashboard/live?segment=queue
- http://localhost:3000/dashboard/live?segment=staff
- http://localhost:3000/dashboard/live?segment=shelf
- http://localhost:8000/api/v1/live
- http://localhost:8000/docs (NFC stub routes still listed)

## Anti-hallucination

- Title + brief + `—` / nil until real signals
- No demo stop-rates, no fake p95, no invented demographics
- FUTURE chips are suggestions only — never numeric claims
EOF
