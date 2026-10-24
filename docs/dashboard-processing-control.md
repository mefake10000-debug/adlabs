# Dashboard processing control

The dashboard retains its existing analytics preview and marks it as **Demo**. A separate Edge processing panel allows a local operator to select configured cameras, start/stop processing, refresh state, and see whether recent frames reached the worker. It does not copy live worker numbers into the demo charts.

The website repository is independent from EdgeSight and talks to it only through the versioned HTTP API. The Next.js App Router is rooted at `app/`; routes are under `app/api/processing/`, while `src/app/` holds React dashboard screens/components.

Set server-only `EDGESIGHT_API_URL=http://127.0.0.1:8000` and `EDGESIGHT_API_KEY` in the local website `.env.local`, then run `npm run dev`. The API key is not prefixed with `NEXT_PUBLIC_`, serialized to the browser, or committed. Controls are disabled outside local development. A hosted Vercel/production site cannot reach the store computer’s loopback service and cannot start its edge worker.

This is a local single-operator control path, not user login or tenant authorization. Existing dashboard business figures remain samples; no analytics-to-live integration is claimed here.
