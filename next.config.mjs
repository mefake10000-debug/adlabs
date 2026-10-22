import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.dirname(fileURLToPath(import.meta.url))

const EDGE = (process.env.EDGE_SIGHT_URL || "http://localhost:8000").replace(/\/$/, "")

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root,
  },
  /**
   * Same-origin reverse proxy: Calibration Studio + EdgeSight APIs under localhost:3000.
   * Streamlit (:8501) is embedded from Live ops with baseUrlPath=/dashboard/live/ops
   * (WebSockets cannot reliably upgrade through Next rewrites).
   */
  async rewrites() {
    return {
      beforeFiles: [
        // Calibration Studio HTML — iframe src; root-relative /api/v1/* uses proxies below
        { source: "/dashboard/live/calibrate", destination: `${EDGE}/` },
        { source: "/dashboard/live/calibrate/", destination: `${EDGE}/` },

        // EdgeSight FastAPI (MJPEG, calib fetch, docs)
        { source: "/api/v1/:path*", destination: `${EDGE}/api/v1/:path*` },
        { source: "/health", destination: `${EDGE}/health` },
        { source: "/openapi.json", destination: `${EDGE}/openapi.json` },
        { source: "/docs", destination: `${EDGE}/docs` },
        { source: "/docs/:path*", destination: `${EDGE}/docs/:path*` },
        { source: "/redoc", destination: `${EDGE}/redoc` },
      ],
    }
  },
}

export default nextConfig
