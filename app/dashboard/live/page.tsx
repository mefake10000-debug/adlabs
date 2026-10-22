import { DashboardPage } from "../../../src/app/DashboardPage"

/** Deep link: /dashboard/live → Calibration / Live ops screen */
export default function DashboardLive() {
  return <DashboardPage initialScreen="liveOps" />
}
