import { expect, test } from "@playwright/test";
import type { ActivePoolDetails, ModeratedPool, PoolTransparency, SwapRequest } from "../src/lib/api";
import { makePreview } from "../src/test/fixtures";
import { mockApi, ok } from "./mockApi";

const ref = (id: string, firstName: string) => ({ id, username: firstName.toLowerCase(), firstName, lastName: "", photoUrl: null });
const ama = ref("u-ama", "Ama");
const esi = ref("u-esi", "Esi");
const kofi = ref("e2e-user", "Kofi");

const approved = ok({
  status: "APPROVED",
  appliedAt: null,
  decidedAt: null,
  decisionReason: null,
  maxConcurrentModeratedPools: 3,
  applicationsOpen: true,
  canApply: false,
  eligibility: null,
});

const basePool: ModeratedPool = {
  id: "pool-2",
  name: "Osu Savers",
  status: "FORMING",
  contributionAmount: 20,
  payoutIntervalDays: 7,
  maxMembers: 3,
  currentMemberCount: 3,
  currentCycle: 0,
  totalCycles: 3,
  formingDeadline: "2026-11-01T00:00:00.000Z",
  configFrozenAt: "2026-10-05T00:00:00.000Z",
  payoutOrderType: "MANUAL",
  bond: { initialAmount: 400, toppedUpTotal: 0, remaining: 400, drawnTotal: 0, repaidTotal: 0, status: "LOCKED" },
  inviteCode: "OSUSAVE2",
  pendingRequestCount: 0,
};

const timeline = (swapped: boolean): PoolTransparency["payoutTimeline"] => [
  { cycleNumber: 1, recipient: ama, isMe: false, expectedPayoutDate: "2026-10-07", status: "COMPLETED" },
  { cycleNumber: 2, recipient: swapped ? kofi : esi, isMe: swapped, expectedPayoutDate: "2026-10-14", status: "PENDING" },
  { cycleNumber: 3, recipient: swapped ? esi : kofi, isMe: !swapped, expectedPayoutDate: "2026-10-21", status: "PENDING" },
];

test.describe("Payout order and swaps", () => {
  test("moderator reorders a MANUAL pool and saves", async ({ page }) => {
    const api = await mockApi(page);
    api.get(/^\/moderator\/status\//, approved);
    api.get(/^\/groupPools\/moderated\//, ok([basePool]));
    api.get(/^\/pool-2\/members$/, ok([
      { role: "MEMBER", joinedAt: "2026-10-01", user: ama },
      { role: "MEMBER", joinedAt: "2026-10-02", user: esi },
      { role: "MODERATOR", joinedAt: "2026-09-30", user: kofi },
    ]));
    api.get(/^\/groupPools\/preview\//, ok(makePreview({
      payoutOrderType: "MANUAL",
      manualOrder: [
        { position: 1, user: ama },
        { position: 2, user: esi },
      ],
    })));
    api.put(/^\/groupPools\/pool-2\/order\//, ok({ changedMembers: 2 }));

    await page.goto("/moderator/pools/pool-2?tab=order");
    const rows = page.getByRole("list", { name: "Payout order" }).getByRole("listitem");
    await expect(rows).toHaveText([/Ama/, /Esi/, /Kofi/]);
    await expect(page.getByRole("button", { name: "Save order" })).toBeDisabled();

    await page.getByRole("button", { name: "Move Kofi up" }).click();
    await expect(rows).toHaveText([/Ama/, /Kofi/, /Esi/]);

    await page.getByRole("button", { name: "Save order" }).click();
    await expect(page.getByText("Order saved. 2 members need to accept their new position.")).toBeVisible();
    expect(api.calls.find((c) => c.method === "PUT" && c.path.includes("/order/"))?.body).toEqual({
      orderedUserIds: ["u-ama", "e2e-user", "u-esi"],
    });
  });

  test("moderator proposes a swap, then the member accepts it", async ({ page }) => {
    const api = await mockApi(page);
    const running: ModeratedPool = { ...basePool, status: "ACTIVE", currentCycle: 1, inviteCode: null };
    let swaps: SwapRequest[] = [];
    let swapped = false;
    api.get(/^\/moderator\/status\//, approved);
    api.get(/^\/groupPools\/moderated\//, ok([running]));
    api.get(/^\/groupPools\/pool-2\/transparency\//, () =>
      ok({
        poolId: "pool-2",
        name: "Osu Savers",
        status: "ACTIVE",
        pausedAt: null,
        pauseReason: null,
        bond: { total: 400, remaining: 400, coveragePercent: 20, totalPoolValue: 2000, status: "LOCKED" },
        uncovered: { days: 0, amount: 0 },
        debts: [],
        payoutTimeline: timeline(swapped),
      } satisfies PoolTransparency)
    );
    api.get(/^\/groupPools\/pool-2\/swaps\//, () => ok(swaps));
    api.post(/^\/groupPools\/pool-2\/swaps\/propose\//, () => {
      swaps = [{
        id: "swap-1",
        cycleA: 2,
        cycleB: 3,
        userA: esi,
        userB: kofi,
        acceptedAAt: null,
        acceptedBAt: null,
        status: "PENDING",
        expiresAt: "2026-10-16T00:00:00.000Z",
        proposedBy: "u-mod",
      }];
      return ok(swaps[0]);
    });

    await page.goto("/moderator/pools/pool-2?tab=swaps");
    await page.getByRole("combobox", { name: "First payout" }).click();
    await page.getByRole("option", { name: /Cycle 2 · Esi/ }).click();
    await page.getByRole("combobox", { name: "Second payout" }).click();
    await expect(page.getByRole("option", { name: /Cycle 1/ })).toHaveCount(0); // already paid
    await page.getByRole("option", { name: /Cycle 3 · Kofi/ }).click();
    await expect(page.getByTestId("swap-preview")).toContainText("Cycle 2: Esi → Kofi");
    await page.getByRole("button", { name: "Propose swap" }).click();

    await expect(page.getByText("Swap proposed. Both members need to accept it.")).toBeVisible();
    expect(api.calls.find((c) => c.path.includes("/swaps/propose/"))?.body).toEqual({ cycleA: 2, cycleB: 3 });
    await expect(page.getByRole("button", { name: "Cancel swap" })).toBeVisible();

    // Esi accepts first; now Kofi (the signed-in member) sees the request on the pool page.
    swaps = [{ ...swaps[0], acceptedAAt: "2026-10-13T12:00:00.000Z" }];
    const active: ActivePoolDetails = {
      id: "pool-2",
      nickname: "Osu Savers",
      tier: null,
      status: "ACTIVE",
      healthLabel: "ON_TRACK",
      currentCycle: 1,
      totalCycles: 3,
      daysLeftInCycle: 3,
      cyclePot: { currency: "GHS", amount: 420 },
      contributedCount: 3,
      totalMembers: 3,
      members: [],
      myContribution: { amount: 20, isEarly: false, status: "COMPLETED_ON_TIME", paidThisCycle: true },
      payoutTimeline: [],
      contributionTimeline: [],
    };
    api.get(/^\/pool-2\/details$/, ok({ id: "pool-2", status: "ACTIVE", origin: "GROUP", name: "Osu Savers", moderatorId: "u-mod" }));
    api.get(/^\/pool-2\/activePoolDetails\//, () => ok({
      ...active,
      payoutTimeline: timeline(swapped).map((t) => ({ cycleNumber: t.cycleNumber, user: t.recipient!, amount: 420, completed: t.status === "COMPLETED", projected: false })),
    }));
    api.get(/^\/getUserCheckingAccount\//, { body: { success: false } });
    api.post(/^\/groupPools\/swaps\/swap-1\/accept\//, () => {
      swapped = true;
      swaps = [{ ...swaps[0], acceptedBAt: "2026-10-13T13:00:00.000Z", status: "ACCEPTED" }];
      return ok({ status: "ACCEPTED" });
    });

    await page.goto("/pools/group/pool-2");
    await expect(page.getByText("Move your payout from cycle 3 to cycle 2, swapping with Esi?")).toBeVisible();
    await page.getByRole("button", { name: "Accept swap" }).click();
    await expect(page.getByText("Swapped. You're now paid in cycle 2.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Accept swap" })).toHaveCount(0);

    // Rows read "<cycle><initials><name>…": Kofi now holds cycle 2 and Esi cycle 3.
    await page.getByRole("tab", { name: "Payout Timeline" }).click();
    await expect(page.getByRole("tabpanel")).toContainText(/2K?Kofi.*3E?Esi/);
  });

  test("earnings show totals and per-pool rows", async ({ page }) => {
    const api = await mockApi(page);
    api.get(/^\/moderator\/status\//, approved);
    api.get(/^\/groupPools\/earnings\//, ok({
      totalFeeShare: 84.5,
      totalBondLocked: 400,
      totalOwedToMe: 60,
      pools: [{ poolId: "pool-2", name: "Osu Savers", status: "ACTIVE", feeShare: 84.5, bond: { status: "LOCKED", remaining: 340, drawnTotal: 60, repaidTotal: 0 }, owedToMe: 60 }],
    }));

    await page.goto("/moderator/earnings");
    await expect(page.getByText("GH₵84.50").first()).toBeVisible();
    await expect(page.getByText("Osu Savers")).toBeVisible();
    await expect(page.getByText("GH₵60.00 · GH₵0.00")).toBeVisible();
  });
});
