# Industry use-case modes (Live hub)

Segmented industry modes on `/dashboard/live`. Switching industry **only** changes which KPI grid + playbook emphasis shows — it never invents sample numbers.

## Industries

| Mode | Emphasis | Typical maturity |
|------|----------|------------------|
| Fashion | NFC product taps (id · time · zone) | **NEEDS-HARDWARE** until `POST /api/v1/nfc/tap` |
| Restaurants | Tables (dwell polygons), staff, service wait | **LIVE**/**PARTIAL** with zones; food served **FUTURE** |
| Manufacturing | Line activity, box/object classes | Boxes **LIVE** when products model on; defects **FUTURE** |
| Jewelry | High-interaction zones (dwell rank) | **LIVE**/**PARTIAL**; hand-near-shelf **FUTURE** without pose |

Global **In / Present / Out** stay for all modes.

## Field map (portal → EdgeSight)

See also EdgeSight `docs/industry-use-cases.md`.

| Industry | Card | Path |
|----------|------|------|
| Fashion | NFC taps | `live.nfc.tap_count_session` · `recent_taps[]` |
| Fashion | Connect path | `live.nfc.connect_hint` |
| Restaurant | Tables occupied | `live.zones[]` dwell occupancy · live/state `dwell_zones` |
| Restaurant | Staff | `live.staff_now` |
| Restaurant | Service wait | `live.avg_queue_wait_seconds` |
| Manufacturing | Boxes | `live.products_top[]` |
| Manufacturing | Defects | — (**FUTURE**) |
| Jewelry | Top zone | ranked `live.zones[]` / `dwell_zones` |

## UX

- Segmented control near top of Live hub
- 4–6 KPI cards per industry (title · brief · value or — · maturity)
- **Cross-industry playbook** accordion: helped · calibrate · models · LIVE\|PARTIAL\|FUTURE\|NEEDS-HARDWARE
- Persist: `localStorage` `adlabs.live.industry` + `?industry=fashion|restaurant|manufacturing|jewelry`
- Guided flow preserved: Live → Set up zones → Advanced

## Click URLs

- http://localhost:3000/dashboard/live
- http://localhost:3000/dashboard/live?industry=fashion
- http://localhost:3000/dashboard/live?industry=restaurant
- http://localhost:3000/dashboard/live?industry=manufacturing
- http://localhost:3000/dashboard/live?industry=jewelry
- http://localhost:8000/api/v1/live
- http://localhost:8000/docs (NFC routes)

## Anti-hallucination

- Title + brief + `—` / nil until real signals
- No demo taps, no fake defect rates, no invented table counts without polygons
EOF