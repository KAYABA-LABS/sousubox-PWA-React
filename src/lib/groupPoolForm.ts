import { z } from "zod";
import type { GroupPoolConfigInput, PayoutOrderType } from "@/lib/api";

/** Plan decision 12. The server stays authoritative and may reject some of these. */
export const INTERVAL_OPTIONS = [
  { days: 1, label: "Daily" },
  { days: 3, label: "Every 3 days" },
  { days: 7, label: "Weekly" },
  { days: 14, label: "Every 2 weeks" },
  { days: 30, label: "Monthly" },
] as const;

export const ORDER_TYPES: { value: PayoutOrderType; label: string; description: string }[] = [
  { value: "RANDOM", label: "Random draw", description: "The order is drawn at random when the pool starts." },
  { value: "SENIORITY", label: "Order of joining", description: "Members are paid in the order they joined." },
  { value: "MANUAL", label: "I'll set the order", description: "You arrange the order; members accept it before joining." },
];

// Policy bounds aren't readable yet (backend request B1), so only basic shape is checked here.
export const poolConfigSchema = z.object({
  name: z.string().trim().min(1, "Give the pool a name").max(80, "Keep the name under 80 characters"),
  description: z.string().max(500, "Keep the description under 500 characters"),
  rulesText: z.string().max(2000, "Keep the rules under 2000 characters"),
  contributionAmount: z
    .number({ error: "Enter the daily amount" })
    .positive("The daily amount must be more than zero"),
  maxMembers: z
    .number({ error: "Enter how many members" })
    .int("Use a whole number")
    .min(2, "A pool needs at least 2 members"),
  payoutIntervalDays: z.number({ error: "Pick how often payouts happen" }).int().positive(),
  payoutOrderType: z.enum(["RANDOM", "SENIORITY", "MANUAL"]),
  moderatorParticipates: z.boolean(),
});

export type PoolConfigValues = z.infer<typeof poolConfigSchema>;

export const DEFAULT_POOL_CONFIG: PoolConfigValues = {
  name: "",
  description: "",
  rulesText: "",
  contributionAmount: Number.NaN,
  maxMembers: Number.NaN,
  payoutIntervalDays: 7,
  payoutOrderType: "RANDOM",
  moderatorParticipates: false,
};

export type WizardStep = 1 | 2 | 3;

export const STEP_FIELDS: Record<WizardStep, (keyof PoolConfigValues)[]> = {
  1: ["name", "description", "rulesText"],
  2: ["contributionAmount", "maxMembers", "payoutIntervalDays", "payoutOrderType"],
  3: ["moderatorParticipates"],
};

export const ECONOMIC_FIELDS: (keyof PoolConfigValues)[] = [
  "contributionAmount",
  "maxMembers",
  "payoutIntervalDays",
  "payoutOrderType",
];

export function stepForField(field: keyof PoolConfigValues): WizardStep {
  return ([1, 2, 3] as const).find((step) => STEP_FIELDS[step].includes(field)) ?? 3;
}

const STEP_KEYWORDS: [WizardStep, RegExp][] = [
  [1, /\b(name|description|rules?)\b/i],
  [2, /(contribution|amount|daily|member|size|interval|payout|frequency|order|penalty|lifeline|cycle)/i],
  [3, /(participat|balance|bond|guarantee)/i],
];

/** Which wizard step an `INVALID_POOL_CONFIG` detail message belongs to (null = review step). */
export function stepForConfigError(message: string): WizardStep | null {
  return STEP_KEYWORDS.find(([, re]) => re.test(message))?.[0] ?? null;
}

/** Request body for create: trimmed, with empty optional text left out. */
export function toCreateBody(values: PoolConfigValues): GroupPoolConfigInput {
  const description = values.description.trim();
  const rulesText = values.rulesText.trim();
  return {
    name: values.name.trim(),
    ...(description ? { description } : {}),
    ...(rulesText ? { rulesText } : {}),
    contributionAmount: values.contributionAmount,
    maxMembers: values.maxMembers,
    payoutIntervalDays: values.payoutIntervalDays,
    payoutOrderType: values.payoutOrderType,
    moderatorParticipates: values.moderatorParticipates,
  };
}

/** Only the fields that changed, for `PUT /update`; economics are left out once frozen. */
export function toUpdateBody(
  initial: PoolConfigValues,
  values: PoolConfigValues,
  economicsLocked: boolean
): Partial<GroupPoolConfigInput> {
  // Unlike create, empty text is sent so a description or rules can be cleared.
  const normalize = (v: PoolConfigValues) => ({
    name: v.name.trim(),
    description: v.description.trim(),
    rulesText: v.rulesText.trim(),
    contributionAmount: v.contributionAmount,
    maxMembers: v.maxMembers,
    payoutIntervalDays: v.payoutIntervalDays,
    payoutOrderType: v.payoutOrderType,
  });
  const before = normalize(initial);
  const next = normalize(values);
  const keys = (Object.keys(next) as (keyof typeof next)[]).filter(
    (key) => !economicsLocked || !ECONOMIC_FIELDS.includes(key)
  );
  return Object.fromEntries(keys.filter((key) => next[key] !== before[key]).map((key) => [key, next[key]]));
}

const DRAFT_KEY = "groupPoolDraft";

/** The draft survives a deposit round trip (plan decision 9). NaN numbers become null in JSON. */
export function saveDraft(values: PoolConfigValues) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(values));
  } catch {
    // storage unavailable
  }
}

export function readDraft(): PoolConfigValues | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Record<keyof PoolConfigValues, unknown>>;
    const num = (v: unknown, fallback: number) => (typeof v === "number" && Number.isFinite(v) ? v : fallback);
    const text = (v: unknown) => (typeof v === "string" ? v : "");
    const order = ORDER_TYPES.some((o) => o.value === parsed.payoutOrderType)
      ? (parsed.payoutOrderType as PayoutOrderType)
      : DEFAULT_POOL_CONFIG.payoutOrderType;
    return {
      name: text(parsed.name),
      description: text(parsed.description),
      rulesText: text(parsed.rulesText),
      contributionAmount: num(parsed.contributionAmount, Number.NaN),
      maxMembers: num(parsed.maxMembers, Number.NaN),
      payoutIntervalDays: num(parsed.payoutIntervalDays, DEFAULT_POOL_CONFIG.payoutIntervalDays),
      payoutOrderType: order,
      moderatorParticipates: parsed.moderatorParticipates === true,
    };
  } catch {
    return null;
  }
}

export function clearDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}
