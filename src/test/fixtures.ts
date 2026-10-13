import type { GroupPoolPreview, MyJoinRequest } from "@/lib/api";

export const moderator = {
  id: "mod-1",
  username: "ama",
  firstName: "Ama",
  lastName: "Kusi",
  photoUrl: null,
  stats: { reputationScore: 812, reputationTier: "TRUSTED" as const, poolsModerated: 3 },
};

export function makePreview(overrides: Partial<GroupPoolPreview> = {}): GroupPoolPreview {
  return {
    id: "pool-1",
    name: "Accra Market Women",
    description: "Weekly savings for our stall group.",
    rulesText: "Pay before 6pm.",
    status: "FORMING",
    moderator,
    contributionAmount: 20,
    payoutIntervalDays: 7,
    payoutFrequencyLabel: "Weekly",
    grossPayoutAmount: 1400,
    payoutAmount: 1330,
    managementFeePercent: 0.05,
    totalCycles: 10,
    maxMembers: 10,
    currentMemberCount: 4,
    spotsRemaining: 6,
    joinAmount: 62,
    securityReserve: 60,
    joiningFee: 2,
    payoutOrderType: "RANDOM",
    manualOrder: [],
    latePenaltyRate: 0.05,
    contributionLifelines: 3,
    bond: { amount: 2800, totalPoolValue: 14000, coveragePercent: 20, coverageMemberDays: 140 },
    debtVisibilityNotice: "Members can see debts in this pool.",
    myRequest: null,
    ...overrides,
  };
}

export function makeMyRequest(overrides: Partial<MyJoinRequest> = {}): MyJoinRequest {
  return {
    id: "req-1",
    poolId: "pool-1",
    userId: "user-1",
    status: "PENDING",
    note: null,
    createdAt: "2026-10-10T10:00:00.000Z",
    expiresAt: "2026-10-20T10:00:00.000Z",
    pool: { id: "pool-1", name: "Accra Market Women", status: "FORMING", contributionAmount: 20, payoutIntervalDays: 7, joinAmount: 62 },
    ...overrides,
  };
}
