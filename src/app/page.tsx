import { redirect } from "next/navigation";

/** Root route redirects to the embedded dashboard shell. */
export default function Home() {
  redirect("/app");
}
