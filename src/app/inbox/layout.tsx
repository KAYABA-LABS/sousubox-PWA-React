import type { ReactNode } from "react";
import { FlowShell } from "@/components/shell/FlowShell";

/** Wraps /inbox pages in the app frame (desktop sidebar). */
export default function Layout({ children }: { children: ReactNode }) {
  return <FlowShell>{children}</FlowShell>;
}
