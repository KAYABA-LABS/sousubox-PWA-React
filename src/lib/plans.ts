import { Leaf, Lock, RefreshCw, Target, type LucideIcon } from "lucide-react";
import type { InstrumentType } from "@/lib/api";

export type PlanId = "flex" | "vault" | "target" | "auto";

export interface SavingsProduct {
  planId: PlanId;
  type: InstrumentType;
  name: string;
  tagline: string;
  description: string;
  /** Annual rate as shown to users; kept in one place so every screen agrees. */
  ratePct: number;
  icon: LucideIcon;
}

/** Savings products offered by Sousubox. Rates match the existing invest flow. */
export const SAVINGS_PRODUCTS: SavingsProduct[] = [
  {
    planId: "flex",
    type: "FLEXIBLE_SAVINGS",
    name: "Flex Save",
    tagline: "Save small, earn more.",
    description: "Withdraw anytime. Interest paid daily.",
    ratePct: 10,
    icon: Leaf,
  },
  {
    planId: "vault",
    type: "TIMELOCK_VAULT",
    name: "Fixed Savings",
    tagline: "Lock in your savings.",
    description: "Lock your money for a set period for a higher rate.",
    ratePct: 12,
    icon: Lock,
  },
  {
    planId: "target",
    type: "TARGET_FUND",
    name: "Goal Booster",
    tagline: "Reach your goals faster.",
    description: "Save towards a target with regular nudges.",
    ratePct: 10,
    icon: Target,
  },
  {
    planId: "auto",
    type: "AUTOSAVE",
    name: "Auto Save",
    tagline: "Save without thinking.",
    description: "Move money in automatically from MoMo.",
    ratePct: 10,
    icon: RefreshCw,
  },
];

/** Product details for a savings instrument type. */
export function productForType(type: InstrumentType): SavingsProduct {
  return SAVINGS_PRODUCTS.find((p) => p.type === type) ?? SAVINGS_PRODUCTS[0];
}

/** Link that starts the create-plan flow, optionally preselecting a product. */
export function newPlanHref(planId?: PlanId) {
  return planId ? `/invest/new?plan=${planId}` : "/invest/new";
}
