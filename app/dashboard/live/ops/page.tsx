import { redirect } from "next/navigation"

/** Deep link → Live ops panel with Streamlit tab (keeps dashboard chrome). */
export default function LiveOpsEmbedRedirect() {
  redirect("/dashboard/live?panel=ops")
}
