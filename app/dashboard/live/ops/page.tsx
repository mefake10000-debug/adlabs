import { redirect } from "next/navigation"

/** Deep link → Live portal Advanced · Ops tools (keeps dashboard chrome). */
export default function LiveOpsEmbedRedirect() {
  redirect("/dashboard/live?panel=ops")
}
