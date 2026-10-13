/**
 * Client-side estimate of a group pool's economics (spec §3.4). Policy values
 * (management fee, bond floor/percent) aren't readable yet (backend request B1),
 * so net payout and bond are left to the server. Always label results "Estimate".
 */
export interface EstimateInput {
  contributionAmount: number;
  maxMembers: number;
  payoutIntervalDays: number;
}

export interface PoolEstimate {
  scale: number;
  grossPayoutAmount: number;
  securityReserve: number;
  joiningFee: number;
  joinAmount: number;
  totalPoolValue: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Reserve and lifelines scale with the interval: one unit per started week. */
export function intervalScale(payoutIntervalDays: number) {
  return Math.max(1, Math.ceil(payoutIntervalDays / 7));
}

export function estimatePool({ contributionAmount: daily, maxMembers: n, payoutIntervalDays: d }: EstimateInput): PoolEstimate | null {
  if (!(daily > 0) || !(n > 0) || !(d > 0)) return null;
  const scale = intervalScale(d);
  const securityReserve = round2(daily * 3 * scale);
  const joiningFee = round2(daily * 0.1);
  return {
    scale,
    grossPayoutAmount: round2(daily * d * n),
    securityReserve,
    joiningFee,
    joinAmount: round2(securityReserve + joiningFee),
    totalPoolValue: round2(daily * d * n * n),
  };
}
