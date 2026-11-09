/**
 * Root index route — redirects immediately to the main dashboard.
 */
import { redirect } from "next/navigation";

/**
 * Root landing handler — redirects incoming traffic to `/dashboard`.
 */
export default function HomePage(): never {
  redirect("/dashboard");
}
