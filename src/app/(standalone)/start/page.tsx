import { redirect } from "next/navigation";

import { APP_ENTRY_PATH } from "@/lib/app-entry";

/** Legacy marketing entry path — forwards to the dashboard route. */
export default function StartPage() {
  redirect(APP_ENTRY_PATH);
}
