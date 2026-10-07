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
  constructor(message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
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
    const details = body.details ?? body.errors;
    const message = body.message || body.error || `API error ${res.status}`;
    throw new ApiError(details ? `${message}: ${typeof details === "string" ? details : JSON.stringify(details)}` : message, body.error);
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
  tier: string;
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
    template: { name: string; tier: string; description: string };
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
  template: { name: string; tier: string };
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
  cycleStatus: string;
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
  tier: string;
  status: string;
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
  tier: string;
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
  tier: string;
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
