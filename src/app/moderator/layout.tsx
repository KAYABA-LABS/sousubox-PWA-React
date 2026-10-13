import { notFound } from "next/navigation";
import { groupPoolsEnabled } from "@/lib/featureFlags";

export default function ModeratorLayout({ children }: { children: React.ReactNode }) {
  if (!groupPoolsEnabled) notFound();
  return children;
}
