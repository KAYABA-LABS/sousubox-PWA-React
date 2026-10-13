import { notFound } from "next/navigation";
import { groupPoolsEnabled } from "@/lib/featureFlags";

export default function DebtsLayout({ children }: { children: React.ReactNode }) {
  if (!groupPoolsEnabled) notFound();
  return children;
}
