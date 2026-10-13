import type { EligibilityFailure } from "@/lib/api";

export const ELIGIBILITY_CHECKS = [
  { code: "KYC_REQUIRED", label: "ID verified", keywords: ["kyc"] },
  { code: "OUTSTANDING_DEBT", label: "No unpaid balance", keywords: ["amountowed", "outstandingdebt"] },
  { code: "OUTSTANDING_GROUP_DEBT", label: "No unpaid group pool debt", keywords: ["groupdebt"] },
  { code: "REPUTATION_TOO_LOW", label: "Reputation score", keywords: ["reputation"] },
  { code: "ACCOUNT_TOO_NEW", label: "Account age", keywords: ["age", "days", "createdat"] },
  { code: "NOT_ENOUGH_COMPLETED_POOLS", label: "Completed pools", keywords: ["pool", "completed"] },
] as const;

export interface SnapshotRow {
  key: string;
  label: string;
  value: string;
  required: string | null;
}

const humanize = (key: string) =>
  key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (c) => c.toUpperCase());

const show = (value: unknown) => {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return Number.isInteger(value) ? String(value) : value.toFixed(2);
  if (typeof value === "string") return value;
  return JSON.stringify(value);
};

/**
 * The eligibility `snapshot` holds the user's values next to `required`
 * thresholds, but its keys aren't documented. Pair them up where possible.
 */
export function snapshotRows(snapshot: Record<string, unknown> | null | undefined): SnapshotRow[] {
  if (!snapshot || typeof snapshot !== "object") return [];
  const required =
    snapshot.required && typeof snapshot.required === "object" ? (snapshot.required as Record<string, unknown>) : {};
  const keys = new Set([...Object.keys(snapshot).filter((k) => k !== "required"), ...Object.keys(required)]);
  return [...keys]
    .filter((key) => {
      const value = snapshot[key];
      return value === undefined || value === null || typeof value !== "object";
    })
    .map((key) => ({
      key,
      label: humanize(key),
      value: show(snapshot[key]),
      required: key in required ? show(required[key]) : null,
    }));
}

/** Matches a snapshot row to an eligibility check by keyword, or null. */
export function checkForRow(row: SnapshotRow) {
  const key = row.key.toLowerCase();
  return ELIGIBILITY_CHECKS.find((check) => check.keywords.some((k) => key.includes(k)))?.code ?? null;
}

export function failureFor(failures: EligibilityFailure[] | undefined, code: string) {
  return failures?.find((f) => f.code === code) ?? null;
}
