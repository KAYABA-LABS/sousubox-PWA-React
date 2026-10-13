import { notFound } from "next/navigation";
import { groupPoolsEnabled } from "@/lib/featureFlags";

export default function GroupPoolLayout({ children }: { children: React.ReactNode }) {
  if (!groupPoolsEnabled) notFound();
  return children;
}
