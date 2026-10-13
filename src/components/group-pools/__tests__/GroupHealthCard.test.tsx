import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GroupHealthCard } from "@/components/group-pools/GroupHealthCard";
import type { PoolTransparency } from "@/lib/api";

const transparency = (overrides: Partial<PoolTransparency> = {}): PoolTransparency => ({
  poolId: "pool-1",
  name: "Accra Market Women",
  status: "PAUSED",
  pausedAt: "2026-10-10T00:00:00.000Z",
  pauseReason: "Guarantee depleted",
  bond: { total: 2800, remaining: 0, coveragePercent: 20, totalPoolValue: 14000, status: "DEPLETED" },
  uncovered: { days: 3, amount: 60 },
  debts: [
    { name: "Ama K.", photoUrl: null, isMe: false, amountOwed: 120, daysMissed: 4, amountRepaid: 40 },
    { name: "Kofi M.", photoUrl: null, isMe: true, amountOwed: 60, daysMissed: 3, amountRepaid: 0 },
    { name: "Esi A.", photoUrl: null, isMe: false, amountOwed: 0, daysMissed: 2, amountRepaid: 40 },
  ],
  payoutTimeline: [],
  ...overrides,
});

describe("GroupHealthCard", () => {
  it("shows guarantee coverage and uncovered days", () => {
    render(<GroupHealthCard transparency={transparency()} />);
    expect(screen.getByText("Moderator's guarantee: GH₵0.00 of GH₵2,800.00 left · covers 20% of the pool")).toBeInTheDocument();
    expect(screen.getByText("3 days (GH₵60.00) not yet covered")).toBeInTheDocument();
  });

  it("lists debts in neutral wording, own row first with Repay, and hides cleared debts", async () => {
    const onRepay = vi.fn();
    render(<GroupHealthCard transparency={transparency()} onRepay={onRepay} />);

    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText("You")).toBeInTheDocument();
    expect(within(rows[1]).getByText("GH₵120.00 still to repay · 4 days missed · GH₵40.00 repaid")).toBeInTheDocument();
    expect(screen.queryByText("Esi A.")).not.toBeInTheDocument();
    expect(screen.queryByText(/defaulter/i)).not.toBeInTheDocument();

    expect(within(rows[1]).queryByRole("button", { name: "Repay" })).not.toBeInTheDocument();
    await userEvent.click(within(rows[0]).getByRole("button", { name: "Repay" }));
    expect(onRepay).toHaveBeenCalledOnce();
  });

  it("says so when nobody owes anything", () => {
    render(<GroupHealthCard transparency={transparency({ debts: [], uncovered: { days: 0, amount: 0 } })} />);
    expect(screen.getByText("Nobody owes the pool anything.")).toBeInTheDocument();
  });
});
