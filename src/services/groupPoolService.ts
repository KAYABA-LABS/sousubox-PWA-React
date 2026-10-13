"use client";

import { useMemo } from "react";
import {
  api,
  ApiError,
  type GroupEnvelope,
  type CreateJoinRequestBody,
  type GroupPoolConfigInput,
  type JoinRequestStatus,
} from "@/lib/api";

/** Unwraps `data`, throwing an `ApiError` when the envelope reports failure. */
async function unwrap<T>(request: Promise<GroupEnvelope<T>>, fallback: string): Promise<T> {
  const result = await request;
  if (!result.success) {
    throw new ApiError(result.message || result.error || fallback, result.error, {
      details: result.details,
      data: result.data,
    });
  }
  return result.data as T;
}

export function useGroupPoolService() {
  return useMemo(() => ({
    // Member side
    getPreview: (userId: string, code: string) =>
      unwrap(api.getGroupPoolPreview(userId, code), "Failed to load pool"),

    requestToJoin: (userId: string, body: CreateJoinRequestBody) =>
      unwrap(api.createJoinRequest(userId, body), "Failed to send request"),

    getMyRequests: async (userId: string) =>
      (await unwrap(api.getMyJoinRequests(userId), "Failed to load requests")) ?? [],

    cancelRequest: (userId: string, requestId: string) =>
      unwrap(api.cancelJoinRequest(userId, requestId), "Failed to cancel request"),

    completeJoin: (userId: string, requestId: string) =>
      unwrap(api.completeJoin(userId, requestId), "Failed to complete join"),

    acceptOrder: (userId: string, poolId: string) =>
      unwrap(api.acceptPayoutOrder(userId, poolId), "Failed to accept order"),

    getMyDebts: async (userId: string) =>
      (await unwrap(api.getMyGroupDebts(userId), "Failed to load debts")) ?? { totalOutstanding: 0, debts: [] },

    repayDebt: (userId: string, poolId?: string) =>
      unwrap(api.repayGroupDebt(userId, poolId), "Failed to repay"),

    getTransparency: (userId: string, poolId: string) =>
      unwrap(api.getPoolTransparency(userId, poolId), "Failed to load pool"),

    getSwaps: async (userId: string, poolId: string) =>
      (await unwrap(api.getPoolSwaps(userId, poolId), "Failed to load swaps")) ?? [],

    acceptSwap: (userId: string, swapId: string) =>
      unwrap(api.acceptSwap(userId, swapId), "Failed to accept swap"),

    declineSwap: (userId: string, swapId: string) =>
      unwrap(api.declineSwap(userId, swapId), "Failed to decline swap"),

    // Moderator side
    getModeratorStatus: (userId: string) =>
      unwrap(api.getModeratorStatus(userId), "Failed to load moderator status"),

    applyForModerator: (userId: string, motivation?: string) =>
      unwrap(api.applyForModerator(userId, motivation), "Failed to apply"),

    getModeratedPools: async (userId: string) =>
      (await unwrap(api.getModeratedPools(userId), "Failed to load pools")) ?? [],

    createPool: (userId: string, body: GroupPoolConfigInput) =>
      unwrap(api.createGroupPool(userId, body), "Failed to create pool"),

    updatePool: (userId: string, poolId: string, body: Partial<GroupPoolConfigInput>) =>
      unwrap(api.updateGroupPool(userId, poolId, body), "Failed to update pool"),

    regenerateInviteCode: (userId: string, poolId: string) =>
      unwrap(api.regenerateInviteCode(userId, poolId), "Failed to create a new code"),

    getPoolRequests: async (userId: string, poolId: string, status?: JoinRequestStatus) =>
      (await unwrap(api.getPoolJoinRequests(userId, poolId, status), "Failed to load requests")) ?? [],

    approveRequest: (userId: string, requestId: string) =>
      unwrap(api.approveJoinRequest(userId, requestId), "Failed to approve"),

    rejectRequest: (userId: string, requestId: string, reason?: string) =>
      unwrap(api.rejectJoinRequest(userId, requestId, reason), "Failed to reject"),

    removeMember: (userId: string, poolId: string, memberUserId: string, reason?: string) =>
      unwrap(api.removeGroupPoolMember(userId, poolId, memberUserId, reason), "Failed to remove member"),

    cancelPool: (userId: string, poolId: string, reason?: string) =>
      unwrap(api.cancelGroupPool(userId, poolId, reason), "Failed to cancel pool"),

    extendPool: (userId: string, poolId: string) =>
      unwrap(api.extendGroupPool(userId, poolId), "Failed to extend"),

    setOrder: (userId: string, poolId: string, orderedUserIds: string[]) =>
      unwrap(api.setPayoutOrder(userId, poolId, orderedUserIds), "Failed to save order"),

    topUpBond: (userId: string, poolId: string, amount: number) =>
      unwrap(api.topUpBond(userId, poolId, amount), "Failed to top up"),

    proposeSwap: (userId: string, poolId: string, cycleA: number, cycleB: number) =>
      unwrap(api.proposeSwap(userId, poolId, cycleA, cycleB), "Failed to propose swap"),

    cancelSwap: (userId: string, swapId: string) =>
      unwrap(api.cancelSwap(userId, swapId), "Failed to cancel swap"),

    getEarnings: (userId: string) =>
      unwrap(api.getModeratorEarnings(userId), "Failed to load earnings"),
  }), []);
}
