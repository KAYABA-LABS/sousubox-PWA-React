const ghs = new Intl.NumberFormat("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const ghsWhole = new Intl.NumberFormat("en-GH", { maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat("en-GH", { notation: "compact", maximumFractionDigits: 1 });

/** "GHS 12,500.00"; pass `whole` to drop decimals ("GHS 3,500"). */
export function formatGHS(amount: number | null | undefined, whole = false) {
  const value = Number(amount ?? 0);
  return `GHS ${(whole ? ghsWhole : ghs).format(Number.isFinite(value) ? value : 0)}`;
}

/** Signed amount for activity lists: "+GHS 50.00" / "-GHS 200.00". */
export function formatSignedGHS(amount: number, direction: "in" | "out") {
  return `${direction === "in" ? "+" : "-"}${formatGHS(Math.abs(amount))}`;
}

/** Short amount for dense labels: "GHS 30k". */
export function formatCompactGHS(amount: number) {
  return `GHS ${compact.format(amount).toLowerCase()}`;
}

/** "Nov 14" style date, or null when the input is missing/invalid. */
export function formatShortDate(iso: string | null | undefined) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", { month: "short", day: "numeric" }).replace(/(\d+) (\w+)/, "$2 $1");
}

/** Whole days from now until `iso` (negative when overdue), or null. */
export function daysUntil(iso: string | null | undefined) {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Number.isFinite(ms) ? Math.ceil(ms / 86_400_000) : null;
}

/** "in 2 days" / "today" / "2 days late". */
export function describeDue(days: number | null) {
  if (days === null) return null;
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days > 1) return `in ${days} days`;
  return `${Math.abs(days)} day${days === -1 ? "" : "s"} late`;
}

/** Title-case an API enum like "BI_WEEKLY" → "Bi-weekly". */
export function humanizeEnum(value: string | null | undefined) {
  if (!value) return "";
  const text = value.toLowerCase().replace(/_/g, "-");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Two-letter initials from a first and last name, falling back to "?". */
export function initialsOf(first?: string | null, last?: string | null) {
  const letters = `${first?.trim()?.[0] ?? ""}${last?.trim()?.[0] ?? ""}`.toUpperCase();
  return letters || "?";
}

/** Greeting that matches the user's local time of day. */
export function greetingForNow(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
