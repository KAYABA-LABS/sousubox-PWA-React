import { ApiError, NETWORK_ERROR, PAYLOAD_TOO_LARGE, UPLOAD_ABORTED } from "@/lib/api";

export type ErrorTreatment = "inline" | "toast" | "sheet" | "page";

/** Which blocking sheet a `sheet` treatment opens. */
export type ErrorSheet =
  | "KYC_REQUIRED"
  | "OUTSTANDING_DEBT"
  | "OUTSTANDING_GROUP_DEBT"
  | "INSUFFICIENT_FUNDS"
  | "LIMIT"
  | "ACCOUNT_NOT_ACTIVE";

export const RATE_LIMITED = "RATE_LIMITED";
export const UNKNOWN_ERROR = "UNKNOWN";

interface ErrorRule {
  treatment: ErrorTreatment;
  /** Our copy; when absent the backend `message` is shown. */
  message?: string;
  /** The screen should reload its data after showing this. */
  refetch?: boolean;
  sheet?: ErrorSheet;
}

const rule = (treatment: ErrorTreatment, message?: string, extra: Partial<ErrorRule> = {}): ErrorRule => ({
  treatment,
  message,
  ...extra,
});

const RULES: Record<string, ErrorRule> = {
  CODE_NOT_FOUND: rule("inline", "This code isn't valid or the pool is no longer open."),
  [RATE_LIMITED]: rule("inline", "Too many tries. Wait a few minutes and try again."),
  CONSENT_REQUIRED: rule("inline", "Please confirm you understand how missed payments are shown."),
  ORDER_ACCEPTANCE_REQUIRED: rule("inline", "Please accept the payout order to continue."),

  KYC_REQUIRED: rule("sheet", "Verify your ID to join group pools.", { sheet: "KYC_REQUIRED" }),
  OUTSTANDING_DEBT: rule("sheet", "You have an unpaid balance. Clear it to join a pool.", { sheet: "OUTSTANDING_DEBT" }),
  OUTSTANDING_GROUP_DEBT: rule("sheet", "You have unpaid group pool debt. Repay it to join another pool.", {
    sheet: "OUTSTANDING_GROUP_DEBT",
  }),
  INSUFFICIENT_FUNDS: rule("sheet", "You don't have enough in your balance yet.", { sheet: "INSUFFICIENT_FUNDS" }),
  MAX_GROUP_POOLS_EXCEEDED: rule("sheet", "You've reached the limit of group pools and open requests you can have at once.", {
    sheet: "LIMIT",
  }),
  MAX_MODERATED_POOLS_EXCEEDED: rule("sheet", "You've reached the limit of pools you can moderate at once.", {
    sheet: "LIMIT",
  }),
  ACCOUNT_NOT_ACTIVE: rule("sheet", "Your account isn't active right now. Contact support for help.", {
    sheet: "ACCOUNT_NOT_ACTIVE",
  }),

  REQUEST_REJECTED: rule("inline", "The moderator declined your request. You can't request this pool again."),
  REQUEST_ALREADY_OPEN: rule("inline", "You already have an open request for this pool."),
  ALREADY_MEMBER: rule("inline", "You're already a member of this pool."),
  MODERATOR_OWN_POOL: rule("inline", "You moderate this pool."),

  POOL_FULL: rule("toast", "This pool is full.", { refetch: true }),
  POOL_NOT_ACCEPTING: rule("toast", "This pool isn't accepting new members.", { refetch: true }),
  POOL_NOT_FORMING: rule("toast", "This pool has already started or closed.", { refetch: true }),
  REQUEST_NOT_OPEN: rule("toast", "This request is no longer open.", { refetch: true }),
  REQUEST_EXPIRED: rule("toast", "This request has expired.", { refetch: true }),

  GROUP_POOL_REQUIRES_REQUEST: rule("toast", "This pool joins by invite."),
  MODERATOR_CANNOT_LEAVE: rule("toast", "Moderators can't leave their pool. Cancel the pool instead."),

  APPLICATIONS_CLOSED: rule("toast", "Moderator applications aren't open yet.", { refetch: true }),
  INVALID_DOCUMENTS: rule("inline", "Some documents need fixing."),
  [NETWORK_ERROR]: rule("inline", "Couldn't reach SousuBoxx. Check your connection and try again."),
  [PAYLOAD_TOO_LARGE]: rule("inline", "Your files are too large to send together. Try smaller scans or PDFs."),
  [UPLOAD_ABORTED]: rule("inline", "Sending was cancelled."),
  GROUP_POOLS_CLOSED: rule("inline", "Group pools aren't open yet."),
  NOT_ELIGIBLE: rule("inline", "You don't meet the requirements yet."),
  ALREADY_PENDING: rule("toast", "Your application is already being reviewed.", { refetch: true }),
  ALREADY_APPROVED: rule("toast", "You're already a moderator.", { refetch: true }),
  ALREADY_SUSPENDED: rule("toast", "Your moderator role is suspended.", { refetch: true }),
  ALREADY_REVOKED: rule("toast", "Your moderator role was revoked.", { refetch: true }),
  INVALID_POOL_CONFIG: rule("inline", "Some settings need changing."),
  CONFIG_FROZEN: rule("inline", "Amounts and size are locked once the first member is approved."),

  NOT_A_MODERATOR: rule("page", "You're not a pool moderator."),
  NOT_POOL_MODERATOR: rule("page", "You don't moderate this pool."),
  MODERATOR_NOT_ACTIVE: rule("page", "Your moderator role isn't active."),
  NOT_A_MEMBER: rule("page", "You're not a member of this pool."),

  CANNOT_REMOVE_MODERATOR: rule("toast", "The moderator can't be removed."),
  NOT_MANUAL_ORDER: rule("toast", "This pool doesn't use a manual payout order."),
  INVALID_ORDER: rule("toast", "That order isn't valid."),
  ALREADY_EXTENDED: rule("toast", "The deadline can only be extended once."),
  INVALID_AMOUNT: rule("toast", "Enter a valid amount."),
  POOL_NOT_RUNNING: rule("toast", "This pool isn't running."),
  NOT_BOND_OWNER: rule("toast", "Only the original moderator can top up this guarantee."),

  SWAP_NOT_FOUND: rule("toast", "That swap no longer exists.", { refetch: true }),
  SWAP_NOT_PENDING: rule("toast", "That swap is no longer pending.", { refetch: true }),
  SWAP_EXPIRED: rule("toast", "That swap has expired.", { refetch: true }),
  SWAP_STALE: rule("toast", "The payout order changed, so this swap no longer applies.", { refetch: true }),
  SWAP_NOT_ALLOWED: rule("toast", "Swaps aren't allowed right now.", { refetch: true }),
  SWAP_ALREADY_PENDING: rule("toast", "There's already a pending swap for one of these slots.", { refetch: true }),
  INVALID_SWAP: rule("toast", "Pick two different future payouts.", { refetch: true }),
  MEMBER_ALREADY_PAID: rule("toast", "One of these members has already been paid.", { refetch: true }),
  MODERATOR_CANNOT_ADVANCE: rule("toast", "You can't move your own payout earlier.", { refetch: true }),
  POOL_DISPUTED: rule("toast", "This pool is under review, so changes are paused.", { refetch: true }),

  NO_OUTSTANDING_DEBT: rule("toast", "You don't owe anything.", { refetch: true }),
  NOTHING_TO_ACCEPT: rule("toast", "There's nothing to accept.", { refetch: true }),
};

export interface ResolvedGroupPoolError {
  code: string;
  status: number;
  treatment: ErrorTreatment;
  message: string;
  refetch: boolean;
  sheet?: ErrorSheet;
  details?: string[];
  data?: unknown;
}

export function resolveGroupPoolError(err: unknown): ResolvedGroupPoolError {
  const apiErr = err instanceof ApiError ? err : null;
  const status = apiErr?.status ?? 0;
  const code = status === 429 ? RATE_LIMITED : apiErr?.code || UNKNOWN_ERROR;
  const known = RULES[code];
  const backendMessage = err instanceof Error && err.message ? err.message : "";

  return {
    code,
    status,
    treatment: known?.treatment ?? "toast",
    message: known?.message ?? (backendMessage || "Something went wrong"),
    refetch: known?.refetch ?? false,
    sheet: known?.sheet,
    details: apiErr?.details,
    data: apiErr?.data,
  };
}

/** Reads a numeric field from an error's `data` payload (e.g. `availableBalance`). */
export function errorDataNumber(error: Pick<ResolvedGroupPoolError, "data">, key: string): number | null {
  const data = error.data;
  if (!data || typeof data !== "object") return null;
  const value = (data as Record<string, unknown>)[key];
  const num = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(num) ? num : null;
}

/** Resolves a client-detected condition (e.g. KYC not verified) through the same map. */
export function syntheticError(code: string, data?: unknown): ResolvedGroupPoolError {
  return resolveGroupPoolError(new ApiError("", code, { data }));
}
