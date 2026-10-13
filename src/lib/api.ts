const API_BASE =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_API_URL || "http://192.168.0.166:8000/api/v1"
    : "/api/backend";

let authTokenGetter: (() => Promise<string | null>) | null = null;
let apiUserIdGetter: (() => string | null) | null = null;

export function setAuthTokenGetter(getter: () => Promise<string | null>) {
  authTokenGetter = getter;
}

export function setApiUserIdGetter(getter: () => string | null) {
  apiUserIdGetter = getter;
}

function resolveUserId(userId: string) {
  return apiUserIdGetter?.() || userId;
}

export function getApiUserId(fallback?: string | null): string | null {
  return apiUserIdGetter?.() || fallback || null;
}

export class ApiError extends Error {
  code?: string;
  /** HTTP status; 0 when the error was raised from a 2xx `success: false` envelope. */
  status: number;
  details?: string[];
  data?: unknown;
  constructor(
    message: string,
    code?: string,
    extra: { status?: number; details?: string[]; data?: unknown } = {}
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = extra.status ?? 0;
    this.details = extra.details;
    this.data = extra.data;
  }
}

function normalizeDetails(details: unknown): string[] | undefined {
  if (details == null) return undefined;
  if (Array.isArray(details)) return details.map((d) => (typeof d === "string" ? d : JSON.stringify(d)));
  if (typeof details === "string") return [details];
  return [JSON.stringify(details)];
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = authTokenGetter ? await authTokenGetter() : null;
  // FormData bodies need the browser to set the multipart boundary itself
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = body.message || body.error || `API error ${res.status}`;
    throw new ApiError(message, body.error, {
      status: res.status,
      details: normalizeDetails(body.details ?? body.errors),
      data: body.data,
    });
  }

  return res.json();
}

export interface BackendEnvelope<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

// ── User ──────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string | null;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  tier: string;
  status: string;
  photoUrl: string | null;
  walletAddress: string | null;
  dateOfBirth: string | null;
  address: { street?: string; city?: string; state?: string; country?: string; postalCode?: string } | null;
  kyc: { level: string; status: string; submittedAt: string; verifiedAt?: string; expiresAt?: string; rejectionReason?: string } | null;
  stats: UserStats | null;
  maxPersonalInstruments: number;
  maxPoolInstruments: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface UpdateProfilePhotoResponse {
  success: boolean;
  message?: string;
  photoUrl: string;
  user?: unknown;
  error?: string;
}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type ReputationTier = "RESTRICTED" | "STARTER" | "TRUSTED" | "GOLD_TRUST" | "ELITE";

export interface UserStats {
  id: string;
  userId: string;

  // Financial totals
  totalContributions: number;
  totalPayouts: number;
  totalAmountSaved: number;
  totalAmountEarned: number;

  // Contribution behavior
  successfulContributions: number;
  failedContributions: number;
  missedContributions: number;
  onTimeContributions: number;
  lateContributions: number;
  earlyContributions: number;
  totalLateDays: number;
  currentStreak: number;
  longestStreak: number;

  // Pool performance
  poolsJoined: number;
  poolsCompleted: number;
  poolsDefaulted: number;

  // Savings performance
  personalInstrumentsActive: number;
  personalInstrumentsCompleted: number;
  personalGoalsAchieved: number;

  // Social trust
  followersCount: number;
  followingCount: number;
  positiveReviews: number;
  negativeReviews: number;
  disputeCount: number;
  resolvedDisputes: number;
  referralCount: number;

  // Reputation sub-scores (0–1000)
  contributionScore: number;
  punctualityScore: number;
  completionScore: number;
  longevityScore: number;
  trustScore: number;
  walletScore: number;
  verificationScore: number;

  // Final trust engine
  reputationScore: number;
  reliabilityScore: number; // percentage 0–100
  completionRate: number; // percentage 0–100
  riskLevel: RiskLevel;
  reputationTier: ReputationTier;

  // Activity (ISO date strings)
  totalActiveDays: number;
  lastContributionAt: string | null;
  lastPayoutAt: string | null;
  lastActivityAt: string;

  // System
  scoreLastCalculatedAt: string | null;
  updatedAt: string;
}

export interface GetUserStatsResponse {
  success: boolean;
  message: string;
  data?: UserStats;
  error?: string;
}

export interface UserReferral {
  referralCode: string;
  referralCount: number;
  referralReputationScore: number;
  referralLink: string;
}

export interface GetUserReferralResponse {
  success: boolean;
  message?: string;
  data?: UserReferral;
  error?: string;
}

export interface UserCheckingAccount {
  availableBalance: number;
  lockedBalance: number;
  amountOwedBalance: number;
}

export interface CheckingAccountResponse {
  success: boolean;
  message?: string;
  checkingAccount: UserCheckingAccount;
  error?: string;
}

// ── Pools ─────────────────────────────────────────────────────────────────────

export interface DiscoverPoolTemplate {
  contributionAmount: number;
  description: string;
  frequency: string;
  id: string;
  maxMembers: number;
  name: string;
  tier: string | null;
  origin?: PoolOrigin;
}

export interface DiscoverPool {
  contributionAmount: number;
  currentMemberCount: number;
  frequency: string;
  id: string;
  nextContributionDue: string | null;
  payoutAmount: number;
  spotsRemaining: number;
  startDate: string;
  status: string;
  template: DiscoverPoolTemplate;
  totalCycles: number;
}

export interface UserPoolMembership {
  membershipId: string;
  memberStatus: string;
  memberRole: string;
  totalContributed: number;
  totalReceived: number;
  joinedAt: string;
  pool: {
    id: string;
    status: string;
    currentCycle: number;
    totalCycles: number;
    contributionAmount: number;
    payoutAmount: number;
    frequency: string;
    currentMemberCount: number;
    maxMembers: number;
    nextContributionDue: string | null;
    template: { name: string; tier: string | null; description: string; origin?: PoolOrigin };
  };
}

// ── Pools: Active tab ────────────────────────────────────────────────────────

export interface PoolMemberRef {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
}

export interface ActivePoolListItem {
  id: string;
  currentCycle: number;
  totalCycles: number;
  contributionAmount: number;
  nextContributionDue: string | null;
  contributionStatus: string;
  /** ACTIVE or PAUSED */
  status?: GroupPoolStatus | string;
  template: { name: string; tier: string | null; origin?: PoolOrigin };
}

export interface ActivePoolPayoutEntry {
  cycleNumber: number;
  user: PoolMemberRef;
  amount: number;
  completed: boolean;
  projected: boolean;
}

export interface ActivePoolContributionEntry {
  cycleNumber: number;
  user: PoolMemberRef;
  amount: number;
  cycleStatus: CycleStatus | string;
  completed: boolean;
  isMine: boolean;
  prepaid: boolean;
}

export interface UserRecentContribution {
  id: string;
  poolId: string;
  poolName: string;
  cycleNumber: number;
  amount: number;
  status: string;
  completed: boolean;
}

export interface ActivePoolDetails {
  id: string;
  nickname: string;
  tier: string | null;
  status: string;
  pausedAt?: string | null;
  pauseReason?: string | null;
  healthLabel: "ON_TRACK" | "AT_RISK";
  currentCycle: number;
  totalCycles: number;
  daysLeftInCycle: number | null;
  cyclePot: { currency: string; amount: number };
  contributedCount: number;
  totalMembers: number;
  // Exact shape of the backend's `_deriveMemberContributionStates` helper is not
  // documented — render defensively (Array.isArray + optional chaining) rather
  // than assuming field names.
  members: Record<string, unknown>[];
  myContribution: { amount: number; isEarly: boolean; status: string; paidThisCycle: boolean } | null;
  payoutTimeline: ActivePoolPayoutEntry[];
  contributionTimeline: ActivePoolContributionEntry[];
}

// ── Pools: Joined tab ────────────────────────────────────────────────────────

export interface JoinedPoolTemplate {
  id: string;
  name: string;
  tier: string | null;
  origin?: PoolOrigin;
  contributionAmount: number;
  frequency: string;
  maxMembers: number;
  description: string;
}

export interface JoinedPoolListItem {
  id: string;
  status: string;
  currentMemberCount: number;
  spotsRemaining: number;
  contributionAmount: number;
  payoutAmount: number;
  frequency: string;
  totalCycles: number;
  template: JoinedPoolTemplate;
}

export interface JoinedPoolDetails {
  id: string;
  status: string;
  currentMemberCount: number;
  spotsRemaining: number;
  contributionAmount: number;
  payoutAmount: number;
  frequency: string;
  totalCycles: number;
  startDate: string | null;
  nextContributionDue: string | null;
  joinedAt: string;
  memberStatus: string;
  template: JoinedPoolTemplate & { joiningFee: number };
}

// ── Pools: Discover tab ──────────────────────────────────────────────────────

export interface AvailablePoolTemplate {
  id: string;
  name: string;
  tier: string | null;
  origin?: PoolOrigin;
  contributionAmount: number;
  joinAmount: number;
  joiningFee: number;
  frequency: string;
  maxMembers: number;
  description: string;
}

export interface AvailablePoolDetails {
  id: string;
  status: string;
  currentMemberCount: number;
  spotsRemaining: number;
  contributionAmount: number;
  payoutAmount: number;
  joinAmount: number;
  frequency: string;
  totalCycles: number;
  startDate: string | null;
  nextContributionDue: string | null;
  template: AvailablePoolTemplate;
}

export interface PoolDetailsEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ── Group Pools ──────────────────────────────────────────────────────────────

// TODO(B7): confirm the backend's exact `origin` enum values.
export type PoolOrigin = "TEMPLATE" | "GROUP";
export type GroupPoolStatus = "FORMING" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
export type ModeratorStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED" | "REVOKED";
export type JoinRequestStatus = "PENDING" | "APPROVED" | "AWAITING_FUNDS" | "JOINED" | "REJECTED" | "CANCELLED" | "EXPIRED";
export type PayoutStatus = "PENDING" | "COMPLETED" | "HOLD" | "FAILED";
export type CycleStatus = "PENDING" | "COMPLETED_EARLY" | "COMPLETED_ON_TIME" | "COMPLETED_LATE" | "MISSED" | "UNCOVERED";
export type SwapStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "CANCELLED";
export type BondStatus = "LOCKED" | "DEPLETED" | "RELEASED";
export type PayoutOrderType = "RANDOM" | "SENIORITY" | "MANUAL";

export interface EligibilityFailure {
  code: string;
  message: string;
}

export interface ModeratorStatusResponse {
  status: ModeratorStatus;
  appliedAt: string | null;
  decidedAt: string | null;
  decisionReason: string | null;
  maxConcurrentModeratedPools: number;
  applicationsOpen: boolean;
  canApply: boolean;
  eligibility: { eligible: boolean; failures: EligibilityFailure[]; snapshot: Record<string, unknown> } | null;
}

export interface GroupPoolModerator extends PoolMemberRef {
  stats: { reputationScore: number; reputationTier: ReputationTier; poolsModerated: number } | null;
}

export interface MyJoinRequestRef {
  id: string;
  status: JoinRequestStatus;
  createdAt: string;
  expiresAt: string | null;
}

export interface GroupPoolPreview {
  id: string;
  name: string;
  description: string | null;
  rulesText: string | null;
  status: GroupPoolStatus;
  moderator: GroupPoolModerator;
  contributionAmount: number;
  payoutIntervalDays: number;
  payoutFrequencyLabel: string;
  grossPayoutAmount: number;
  payoutAmount: number;
  managementFeePercent: number;
  totalCycles: number;
  maxMembers: number;
  currentMemberCount: number;
  spotsRemaining: number;
  joinAmount: number;
  securityReserve: number;
  joiningFee: number;
  payoutOrderType: PayoutOrderType;
  manualOrder: { position: number; user: PoolMemberRef }[];
  latePenaltyRate: number;
  contributionLifelines: number;
  bond: { amount: number; totalPoolValue: number; coveragePercent: number; coverageMemberDays: number };
  debtVisibilityNotice: string;
  myRequest: MyJoinRequestRef | null;
}

export interface CreateJoinRequestBody {
  code: string;
  debtVisibilityConsent: true;
  acceptPayoutOrder?: boolean;
  note?: string;
}

export interface JoinRequest {
  id: string;
  poolId: string;
  userId: string;
  status: JoinRequestStatus;
  note: string | null;
  createdAt: string;
  expiresAt: string | null;
}

export interface MyJoinRequest extends JoinRequest {
  pool: {
    id: string;
    name: string;
    status: GroupPoolStatus;
    contributionAmount: number;
    payoutIntervalDays: number;
    joinAmount: number;
  };
}

export interface PoolJoinRequestForModerator extends JoinRequest {
  user: PoolMemberRef & {
    createdAt: string;
    stats: { reputationScore: number; reputationTier: ReputationTier; poolsCompleted: number; poolsDefaulted: number } | null;
  };
}

export interface GroupDebt {
  id: string;
  poolId: string;
  creditor: "BOND" | "MODERATOR";
  principal: number;
  repaid: number;
  outstanding: number;
  daysMissed: number;
  pool: { id: string; name: string; status: GroupPoolStatus };
}

export interface MyGroupDebts {
  totalOutstanding: number;
  debts: GroupDebt[];
}

export interface RepayGroupDebtResult {
  repaid: number;
  remainingOutstanding: number;
}

export interface PoolTransparency {
  poolId: string;
  name: string;
  status: GroupPoolStatus;
  pausedAt: string | null;
  pauseReason: string | null;
  bond: { total: number; remaining: number; coveragePercent: number; totalPoolValue: number; status: BondStatus };
  uncovered: { days: number; amount: number };
  debts: { name: string; photoUrl: string | null; isMe: boolean; amountOwed: number; daysMissed: number; amountRepaid: number }[];
  payoutTimeline: {
    cycleNumber: number;
    recipient: PoolMemberRef | null;
    isMe: boolean;
    expectedPayoutDate: string;
    status: PayoutStatus;
  }[];
}

export interface SwapRequest {
  id: string;
  cycleA: number;
  cycleB: number;
  userA: PoolMemberRef;
  userB: PoolMemberRef;
  acceptedAAt: string | null;
  acceptedBAt: string | null;
  status: SwapStatus;
  expiresAt: string;
  proposedBy: string;
}

export interface GroupPoolConfigInput {
  name: string;
  description?: string;
  rulesText?: string;
  contributionAmount: number;
  maxMembers: number;
  payoutIntervalDays: number;
  payoutOrderType: PayoutOrderType;
  latePenaltyRate?: number;
  contributionLifelines?: number;
  moderatorParticipates: boolean;
}

export interface GroupPoolBond {
  initialAmount: number;
  toppedUpTotal: number;
  remaining: number;
  drawnTotal: number;
  repaidTotal: number;
  status: BondStatus;
}

export interface ModeratedPool {
  id: string;
  name: string;
  status: GroupPoolStatus;
  contributionAmount: number;
  payoutIntervalDays: number;
  maxMembers: number;
  currentMemberCount: number;
  currentCycle: number;
  totalCycles: number;
  formingDeadline: string | null;
  configFrozenAt: string | null;
  payoutOrderType: PayoutOrderType;
  bond: GroupPoolBond;
  inviteCode: string | null;
  pendingRequestCount: number;
  // The spec says "pool fields + …" without enumerating them all.
  [key: string]: unknown;
}

export interface CreateGroupPoolResult extends ModeratedPool {
  inviteCode: string;
  bondAmount: number;
  totalPoolValue: number;
}

export interface BondTopUpResult {
  bond: GroupPoolBond;
  resumed: boolean;
  uncoveredRows: number;
  releasedPayouts: number;
}

export interface ModeratorEarnings {
  totalFeeShare: number;
  totalBondLocked: number;
  totalOwedToMe: number;
  pools: {
    poolId: string;
    name: string;
    status: GroupPoolStatus;
    feeShare: number;
    bond: { status: BondStatus; remaining: number; drawnTotal: number; repaidTotal: number } | null;
    owedToMe: number;
  }[];
}

export interface GroupEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: string[];
}

// ── Savings ───────────────────────────────────────────────────────────────────

export type InstrumentType = "AUTOSAVE" | "TIMELOCK_VAULT" | "FLEXIBLE_SAVINGS" | "TARGET_FUND";
export type InstrumentStatus = "INACTIVE" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "FROZEN" | "DEFAULTED" | "PAUSED" | "ARCHIVED";

export interface SavingsGoal {
  id: string;
  name: string;
  type: InstrumentType;
  status: InstrumentStatus;
  balance: number;
  target: number;
  dueDays: number | null;
  createdAt: string;
  updatedAt: string;
}

// ── KYC ───────────────────────────────────────────────────────────────────────

export interface KycStatus {
  status: "NOT_SUBMITTED" | "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED" | "EXPIRED";
  level?: string;
  sessionId?: string | null;
}

export interface KycSession {
  session_id: string;
  session_token: string;
  session_kind: string;
  session_number: string;
  url: string;
  status: string;
}

// ── Funding Sources ───────────────────────────────────────────────────────────

export type FundingSourceNetwork = "MTN" | "TELECEL" | "AIRTELTIGO";

export interface FundingSourceIdentifier {
  networkId: FundingSourceNetwork;
  phoneNumber: string;
}

export interface FundingSource extends FundingSourceIdentifier {
  active: boolean;
}

export interface FundingSourcesEnvelope {
  success: boolean;
  message: string;
  data?: FundingSource[];
  error?: string;
}

// ── Mobile Money Payments ─────────────────────────────────────────────────────

export type MomoChargeStatus = "send_otp" | "pay_offline" | "pending" | "success" | "failed";

export interface MomoChargeResult {
  reference: string;
  status: MomoChargeStatus;
  display_text?: string;
  message?: string;
}

export interface MomoChargeStatusResult {
  reference: string;
  status: MomoChargeStatus;
  display_text?: string;
  credited: boolean;
}

// ── API Methods ───────────────────────────────────────────────────────────────

export const api = {
  // User
  registerUser: (data: {
    phoneNumber: string;
    createdUserId: string;
    createdSessionId: string;
    email?: string;
  }) =>
    apiFetch<{ success: boolean; message?: string; error?: string; user?: { id?: string } }>("/registerUser", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  loginUser: (phoneNumber: string) =>
    apiFetch<{
      success: boolean;
      message?: string;
      error?: string;
      suggestion?: string;
      user?: {
        id: string;
        phoneNumber: string;
        email: string | null;
        firstName: string;
        lastName: string;
        username: string;
        walletAddress: string | null;
        status: string;
        tier: string;
        maxPersonalInstruments: number;
        maxPoolInstruments: number;
        createdAt: string;
        lastLoginAt: string;
      };
    }>("/loginUser", {
      method: "POST",
      body: JSON.stringify({ phoneNumber }),
    }),

  getUserProfile: (userId: string) =>
    apiFetch<BackendEnvelope<UserProfile>>(`/getUserProfile/${resolveUserId(userId)}`),

  getUserStats: (userId: string) =>
    apiFetch<GetUserStatsResponse>(`/getUserStats/${resolveUserId(userId)}`),

  getUserReferral: (userId: string) =>
    apiFetch<GetUserReferralResponse>(`/userReferral/${resolveUserId(userId)}`),

  getUserCheckingAccount: (userId: string) =>
    apiFetch<CheckingAccountResponse>(`/getUserCheckingAccount/${resolveUserId(userId)}`),

  updateProfile: (userId: string, data: Record<string, string>) =>
    apiFetch<BackendEnvelope<UserProfile>>("/updateProfile", {
      method: "PATCH",
      body: JSON.stringify({ userId: resolveUserId(userId), ...data }),
    }),

  signUpUserProfileUpdate: (userId: string, data: Record<string, string>) =>
    apiFetch<BackendEnvelope<UserProfile>>("/signUpUserProfileUpdate", {
      method: "PATCH",
      body: JSON.stringify({ userId: resolveUserId(userId), ...data }),
    }),

  updateUserProfilePhoto: (userId: string, photo: Blob, filename: string) => {
    const form = new FormData();
    form.append("photo", photo, filename);
    return apiFetch<UpdateProfilePhotoResponse>(`/updateUserProfilePhoto/${resolveUserId(userId)}`, {
      method: "PUT",
      body: form,
    });
  },

  // Pools
  discoverPools: (userId: string) =>
    apiFetch<BackendEnvelope<DiscoverPool[]>>(`/getUserAvailablePoolsList/${resolveUserId(userId)}`),

  joinPool: (userId: string, poolId: string) =>
    apiFetch<BackendEnvelope<void>>(`/joinPool/${resolveUserId(userId)}/${poolId}`, { method: "POST" }),

  getUserPools: (userId: string) =>
    apiFetch<BackendEnvelope<UserPoolMembership[]>>(`/getUserPools/${resolveUserId(userId)}`),

  getPoolDetails: (poolId: string) =>
    apiFetch<BackendEnvelope<Record<string, unknown>>>(`/${poolId}/details`),

  getActivePools: (userId: string) =>
    apiFetch<BackendEnvelope<ActivePoolListItem[]>>(`/getUserActivePoolList/${resolveUserId(userId)}`),

  getActivePoolDetails: (userId: string, poolId: string) =>
    apiFetch<PoolDetailsEnvelope<ActivePoolDetails>>(`/${poolId}/activePoolDetails/${resolveUserId(userId)}`),

  getJoinedPools: (userId: string) =>
    apiFetch<BackendEnvelope<JoinedPoolListItem[]>>(`/getUserJoinedPoolsList/${resolveUserId(userId)}`),

  getRecentContributions: (userId: string) =>
    apiFetch<BackendEnvelope<UserRecentContribution[]>>(`/getUserRecentContributions/${resolveUserId(userId)}`),

  getJoinedPoolDetails: (userId: string, poolId: string) =>
    apiFetch<PoolDetailsEnvelope<JoinedPoolDetails>>(`/${poolId}/joinedPoolDetails/${resolveUserId(userId)}`),

  getAvailablePoolDetails: (userId: string, poolId: string) =>
    apiFetch<PoolDetailsEnvelope<AvailablePoolDetails>>(`/${poolId}/availablePoolDetails/${resolveUserId(userId)}`),

  // Group Pools — member side
  getGroupPoolPreview: (userId: string, code: string) =>
    apiFetch<GroupEnvelope<GroupPoolPreview>>(
      `/groupPools/preview/${resolveUserId(userId)}?code=${encodeURIComponent(code)}`
    ),

  createJoinRequest: (userId: string, body: CreateJoinRequestBody) =>
    apiFetch<GroupEnvelope<JoinRequest>>(`/groupPools/requests/${resolveUserId(userId)}`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getMyJoinRequests: (userId: string) =>
    apiFetch<GroupEnvelope<MyJoinRequest[]>>(`/groupPools/myRequests/${resolveUserId(userId)}`),

  cancelJoinRequest: (userId: string, requestId: string) =>
    apiFetch<GroupEnvelope<unknown>>(`/groupPools/requests/${requestId}/cancel/${resolveUserId(userId)}`, {
      method: "POST",
    }),

  completeJoin: (userId: string, requestId: string) =>
    apiFetch<GroupEnvelope<{ status: JoinRequestStatus }>>(
      `/groupPools/requests/${requestId}/completeJoin/${resolveUserId(userId)}`,
      { method: "POST" }
    ),

  acceptPayoutOrder: (userId: string, poolId: string) =>
    apiFetch<GroupEnvelope<unknown>>(`/groupPools/${poolId}/order/accept/${resolveUserId(userId)}`, {
      method: "POST",
    }),

  getMyGroupDebts: (userId: string) =>
    apiFetch<GroupEnvelope<MyGroupDebts>>(`/groupPools/myDebts/${resolveUserId(userId)}`),

  repayGroupDebt: (userId: string, poolId?: string) =>
    apiFetch<GroupEnvelope<RepayGroupDebtResult>>(`/groupPools/debts/repay/${resolveUserId(userId)}`, {
      method: "POST",
      body: JSON.stringify(poolId ? { poolId } : {}),
    }),

  getPoolTransparency: (userId: string, poolId: string) =>
    apiFetch<GroupEnvelope<PoolTransparency>>(`/groupPools/${poolId}/transparency/${resolveUserId(userId)}`),

  getPoolSwaps: (userId: string, poolId: string) =>
    apiFetch<GroupEnvelope<SwapRequest[]>>(`/groupPools/${poolId}/swaps/${resolveUserId(userId)}`),

  acceptSwap: (userId: string, swapId: string) =>
    apiFetch<GroupEnvelope<{ status: SwapStatus }>>(`/groupPools/swaps/${swapId}/accept/${resolveUserId(userId)}`, {
      method: "POST",
    }),

  declineSwap: (userId: string, swapId: string) =>
    apiFetch<GroupEnvelope<{ status: SwapStatus }>>(`/groupPools/swaps/${swapId}/decline/${resolveUserId(userId)}`, {
      method: "POST",
    }),

  // Group Pools — moderator side
  getModeratorStatus: (userId: string) =>
    apiFetch<GroupEnvelope<ModeratorStatusResponse>>(`/moderator/status/${resolveUserId(userId)}`),

  applyForModerator: (userId: string, motivation?: string) =>
    apiFetch<GroupEnvelope<unknown>>(`/moderator/apply/${resolveUserId(userId)}`, {
      method: "POST",
      body: JSON.stringify(motivation ? { motivation } : {}),
    }),

  getModeratedPools: (userId: string) =>
    apiFetch<GroupEnvelope<ModeratedPool[]>>(`/groupPools/moderated/${resolveUserId(userId)}`),

  createGroupPool: (userId: string, body: GroupPoolConfigInput) =>
    apiFetch<GroupEnvelope<CreateGroupPoolResult>>(`/groupPools/create/${resolveUserId(userId)}`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateGroupPool: (userId: string, poolId: string, body: Partial<GroupPoolConfigInput>) =>
    apiFetch<GroupEnvelope<ModeratedPool>>(`/groupPools/${poolId}/update/${resolveUserId(userId)}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  regenerateInviteCode: (userId: string, poolId: string) =>
    apiFetch<GroupEnvelope<{ inviteCode: string }>>(
      `/groupPools/${poolId}/inviteCode/regenerate/${resolveUserId(userId)}`,
      { method: "POST" }
    ),

  getPoolJoinRequests: (userId: string, poolId: string, status?: JoinRequestStatus) =>
    apiFetch<GroupEnvelope<PoolJoinRequestForModerator[]>>(
      `/groupPools/${poolId}/requests/${resolveUserId(userId)}${status ? `?status=${status}` : ""}`
    ),

  approveJoinRequest: (userId: string, requestId: string) =>
    apiFetch<GroupEnvelope<{ status: JoinRequestStatus }>>(
      `/groupPools/requests/${requestId}/approve/${resolveUserId(userId)}`,
      { method: "POST" }
    ),

  rejectJoinRequest: (userId: string, requestId: string, reason?: string) =>
    apiFetch<GroupEnvelope<unknown>>(`/groupPools/requests/${requestId}/reject/${resolveUserId(userId)}`, {
      method: "POST",
      body: JSON.stringify(reason ? { reason } : {}),
    }),

  removeGroupPoolMember: (userId: string, poolId: string, memberUserId: string, reason?: string) =>
    apiFetch<GroupEnvelope<unknown>>(
      `/groupPools/${poolId}/members/${memberUserId}/remove/${resolveUserId(userId)}`,
      { method: "POST", body: JSON.stringify(reason ? { reason } : {}) }
    ),

  cancelGroupPool: (userId: string, poolId: string, reason?: string) =>
    apiFetch<GroupEnvelope<unknown>>(`/groupPools/${poolId}/cancel/${resolveUserId(userId)}`, {
      method: "POST",
      body: JSON.stringify(reason ? { reason } : {}),
    }),

  extendGroupPool: (userId: string, poolId: string) =>
    apiFetch<GroupEnvelope<{ formingDeadline: string }>>(`/groupPools/${poolId}/extend/${resolveUserId(userId)}`, {
      method: "POST",
    }),

  setPayoutOrder: (userId: string, poolId: string, orderedUserIds: string[]) =>
    apiFetch<GroupEnvelope<{ changedMembers: number }>>(`/groupPools/${poolId}/order/${resolveUserId(userId)}`, {
      method: "PUT",
      body: JSON.stringify({ orderedUserIds }),
    }),

  topUpBond: (userId: string, poolId: string, amount: number) =>
    apiFetch<GroupEnvelope<BondTopUpResult>>(`/groupPools/${poolId}/bond/topUp/${resolveUserId(userId)}`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    }),

  proposeSwap: (userId: string, poolId: string, cycleA: number, cycleB: number) =>
    apiFetch<GroupEnvelope<SwapRequest>>(`/groupPools/${poolId}/swaps/propose/${resolveUserId(userId)}`, {
      method: "POST",
      body: JSON.stringify({ cycleA, cycleB }),
    }),

  cancelSwap: (userId: string, swapId: string) =>
    apiFetch<GroupEnvelope<unknown>>(`/groupPools/swaps/${swapId}/cancel/${resolveUserId(userId)}`, {
      method: "POST",
    }),

  getModeratorEarnings: (userId: string) =>
    apiFetch<GroupEnvelope<ModeratorEarnings>>(`/groupPools/earnings/${resolveUserId(userId)}`),

  // Savings - Personal Instruments
  getSavingsInstruments: (userId: string) =>
    apiFetch<BackendEnvelope<Record<string, unknown>[]>>(`/getAllUserPersonalSavingsInstruments/${resolveUserId(userId)}`),

  getSavingsInstrumentById: (userId: string, instrumentId: string) =>
    apiFetch<BackendEnvelope<Record<string, unknown>>>(`/getPersonalSavingsInstrument/${resolveUserId(userId)}/${instrumentId}`),

  getAutoSaveInstrument: (userId: string) =>
    apiFetch<BackendEnvelope<Record<string, unknown>>>(`/getUserAutoSaveInstrument/${resolveUserId(userId)}`),

  getTimeLockInstrument: (userId: string) =>
    apiFetch<BackendEnvelope<Record<string, unknown>>>(`/getUserTimeLockInstrument/${resolveUserId(userId)}`),

  getFlexibleSavingsInstrument: (userId: string) =>
    apiFetch<BackendEnvelope<Record<string, unknown>>>(`/getUserFlexibleSavingsInstrument/${resolveUserId(userId)}`),

  getTargetFundInstrument: (userId: string) =>
    apiFetch<BackendEnvelope<Record<string, unknown>>>(`/getUserTargetFundInstrument/${resolveUserId(userId)}`),

  activateAutoSave: (userId: string, instrumentId: string, data: Record<string, unknown>) =>
    apiFetch<BackendEnvelope<Record<string, unknown>>>(`/activateAutoSaveInstrument/${resolveUserId(userId)}/${instrumentId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  activateTimeLock: (userId: string, instrumentId: string, data: Record<string, unknown>) =>
    apiFetch<BackendEnvelope<Record<string, unknown>>>(`/activateTimeLockInstrument/${resolveUserId(userId)}/${instrumentId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  activateFlexibleSavings: (userId: string, instrumentId: string, data: Record<string, unknown>) =>
    apiFetch<BackendEnvelope<Record<string, unknown>>>(`/activateFlexibleSavingsInstrument/${resolveUserId(userId)}/${instrumentId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  activateTargetFund: (userId: string, instrumentId: string, data: Record<string, unknown>) =>
    apiFetch<BackendEnvelope<Record<string, unknown>>>(`/activateTargetFundInstrument/${resolveUserId(userId)}/${instrumentId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Payments
  mobileMoneyPayment: (data: {
    amount: number;
    email: string;
    mobile_money: { phone: string; provider: string };
    currency?: string;
    metadata?: Record<string, unknown>;
  }) =>
    apiFetch<BackendEnvelope<MomoChargeResult>>("/mobileMoneyPayment", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  submitMomoOtp: (data: { otp: string; reference: string; userId: string }) =>
    apiFetch<BackendEnvelope<MomoChargeResult>>("/mobileMoneyPayment/submit-otp", {
      method: "POST",
      body: JSON.stringify({ ...data, userId: resolveUserId(data.userId) }),
    }),

  getMomoChargeStatus: (reference: string, userId: string) =>
    apiFetch<BackendEnvelope<MomoChargeStatusResult>>(
      `/mobileMoneyPayment/${encodeURIComponent(reference)}/status?userId=${encodeURIComponent(resolveUserId(userId))}`
    ),

  // Withdrawals
  requestWithdrawal: (userId: string, data: {
    amount: number;
    fundingSource: FundingSourceIdentifier;
    metadata?: Record<string, unknown>;
  }) =>
    apiFetch<BackendEnvelope<Record<string, unknown>>>("/requestWithdrawal", {
      method: "POST",
      body: JSON.stringify({ userId: resolveUserId(userId), ...data }),
    }),

  // Pool Contributions
  contributeToPool: (userId: string, poolId: string, amount: number) =>
    apiFetch<BackendEnvelope<Record<string, unknown>>>(`/${resolveUserId(userId)}/${poolId}/contribute`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    }),

  // Savings Contributions
  contributeToSavings: (userId: string, instrumentId: string, amount: number) =>
    apiFetch<BackendEnvelope<Record<string, unknown>>>(`/contribute/${resolveUserId(userId)}/${instrumentId}`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    }),

  // KYC
  getKycStatus: (userId: string) =>
    apiFetch<BackendEnvelope<KycStatus>>(`/kyc/status/${resolveUserId(userId)}`),

  createKycSession: (userId: string, options?: {
    callback?: string;
    callback_method?: "initiator" | "completer" | "both";
    metadata?: Record<string, unknown>;
    language?: string;
  }) =>
    apiFetch<BackendEnvelope<KycSession>>("/kyc/session", {
      method: "POST",
      body: JSON.stringify({ userId: resolveUserId(userId), ...options }),
    }),

  // Funding Sources
  getFundingSources: (userId: string) =>
    apiFetch<FundingSourcesEnvelope>(`/getUserFundingSources/${resolveUserId(userId)}`),

  addFundingSource: (userId: string, fundingSource: FundingSourceIdentifier) =>
    apiFetch<FundingSourcesEnvelope>("/addUserFundingSource", {
      method: "POST",
      body: JSON.stringify({ userId: resolveUserId(userId), ...fundingSource }),
    }),

  setActiveFundingSource: (userId: string, fundingSource: FundingSourceIdentifier) =>
    apiFetch<FundingSourcesEnvelope>("/SetUserFundingSourceActive", {
      method: "PATCH",
      body: JSON.stringify({ userId: resolveUserId(userId), ...fundingSource }),
    }),

  removeFundingSource: (userId: string, fundingSource: FundingSourceIdentifier) =>
    apiFetch<FundingSourcesEnvelope>(`/removeFundingSource/${resolveUserId(userId)}`, {
      method: "DELETE",
      body: JSON.stringify({ userId: resolveUserId(userId), ...fundingSource }),
    }),
};
