import { formatGhs } from "@/lib/pool-format";

/** User-facing strings for group pools (plan §9). */
export const groupPoolCopy = {
  joinWithCode: "Join with code",
  codeHint: "8-character code from your group's moderator",

  money: {
    summary: (joinAmount: number) =>
      `To join you'll pay ${formatGhs(joinAmount)} when the moderator approves you. Nothing is charged now.`,
    reserve: (securityReserve: number) =>
      `Security reserve ${formatGhs(securityReserve)}: refundable. It covers you if you miss a day.`,
    fee: (joiningFee: number) => `Joining fee ${formatGhs(joiningFee)}: one-time, non-refundable.`,
    rhythm: (contributionAmount: number, payoutIntervalDays: number, payoutAmount: number) =>
      `You'll contribute ${formatGhs(contributionAmount)} every day. Every ${payoutIntervalDays} ${
        payoutIntervalDays === 1 ? "day" : "days"
      }, one member receives ${formatGhs(payoutAmount)}.`,
  },

  consent: {
    heading: "Missed payments are visible to your group",
    summary:
      "If you miss contributions and the moderator's guarantee covers you, other members of this pool will see your name, how much you owe, the days you missed and what you've repaid. Your phone number and email are never shown.",
    checkbox: "I understand and agree.",
  },

  manualOrderCheckbox: (position: number | null) =>
    position
      ? `I accept this payout order. I'll receive my payout in position ${position}.`
      : "I accept this payout order. I'll be added after the members listed.",

  requestSent: (moderatorFirstName: string, expiresAt: string) =>
    `Request sent to ${moderatorFirstName}. We'll let you know when they respond. Requests expire on ${expiresAt}.`,

  awaitingFunds: (shortfall: string, deadline: string) =>
    `You're approved! Add ${shortfall} to your balance by ${deadline} to take your spot. Spots aren't held, so if the pool fills first you'll miss out.`,
  topUpAndComplete: "Top up & complete",
  rejected: "The moderator didn't accept your request for this pool.",

  /** `lateFee` is preformatted, e.g. "5%". */
  lifelinesTooltip: (lateFee: string, contributionLifelines: number) =>
    `If you miss a day, it's paid from your reserve plus a ${lateFee} late fee, using one of your ${contributionLifelines} lifelines. When those run out, the moderator's guarantee covers you and you owe it back.`,

  bondMember: (remaining: number, total: number, coveragePercent: number) =>
    `Moderator's guarantee: ${formatGhs(remaining)} of ${formatGhs(total)} left · covers ${coveragePercent}% of the pool`,

  debtBlocker: (total: number) =>
    `You have unpaid group pool debt (${formatGhs(total)}). Repay it to join another pool.`,
  ownDebt: (amountOwed: number) =>
    `You owe ${formatGhs(amountOwed)} to this pool. Repaying it lets you join new pools and keeps payouts flowing.`,
};
