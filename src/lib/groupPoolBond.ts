import type { GroupPoolBond, GroupPoolStatus } from "@/lib/api";

export type BondHealthTone = "emerald" | "amber" | "red";

export interface BondHealth {
  /** 0–1 share of the guarantee still available. */
  coverage: number;
  tone: BondHealthTone;
  needsTopUp: boolean;
}

/**
 * Coverage = remaining / (initial + topped up). >50% green, 20–50% amber,
 * <20% red; a DEPLETED bond or a PAUSED pool is always red (plan decision 18).
 */
export function bondHealth(bond: Pick<GroupPoolBond, "initialAmount" | "toppedUpTotal" | "remaining" | "status">, poolStatus?: GroupPoolStatus | string): BondHealth {
  const funded = (bond.initialAmount || 0) + (bond.toppedUpTotal || 0);
  const coverage = funded > 0 ? Math.min(1, Math.max(0, bond.remaining / funded)) : 0;
  const needsTopUp = bond.status === "DEPLETED" || poolStatus === "PAUSED";
  if (needsTopUp) return { coverage, tone: "red", needsTopUp };
  if (bond.status === "RELEASED") return { coverage, tone: "emerald", needsTopUp: false };
  const tone: BondHealthTone = coverage > 0.5 ? "emerald" : coverage >= 0.2 ? "amber" : "red";
  return { coverage, tone, needsTopUp };
}
