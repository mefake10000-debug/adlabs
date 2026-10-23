import { DashboardPage } from "../../../src/app/DashboardPage"

/** Deep link: /dashboard/live → Live portal (default panel = video) */
export default function DashboardLive() {
  return <DashboardPage initialScreen="liveOps" />
}
