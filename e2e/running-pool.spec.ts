import { expect, test } from "@playwright/test";
import type { ActivePoolDetails, ModeratedPool, PoolTransparency } from "../src/lib/api";
import { mockApi, ok } from "./mockApi";

const member = (id: string, firstName: string) => ({ id, username: firstName.toLowerCase(), firstName, lastName: "", photoUrl: null });
const me = member("e2e-user", "Kofi");
const ama = member("u-ama", "Ama");

const active = (status: "ACTIVE" | "PAUSED"): ActivePoolDetails => ({
  id: "pool-1",
  nickname: "Accra Market Women",
  tier: null,
  status,
  pausedAt: status === "PAUSED" ? "2026-10-10T00:00:00.000Z" : null,
  pauseReason: status === "PAUSED" ? "Guarantee ran out" : null,
  healthLabel: status === "PAUSED" ? "AT_RISK" : "ON_TRACK",
  currentCycle: 3,
  totalCycles: 4,
  daysLeftInCycle: 2,
  cyclePot: { currency: "GHS", amount: 560 },
  contributedCount: 1,
  totalMembers: 2,
  members: [],
  myContribution: { amount: 20, isEarly: false, status: "PENDING", paidThisCycle: false },
  payoutTimeline: [
    { cycleNumber: 1, user: ama, amount: 280, completed: true, projected: false },
    { cycleNumber: 2, user: me, amount: 280, completed: status === "ACTIVE", projected: false },
    { cycleNumber: 3, user: ama, amount: 280, completed: false, projected: true },
  ],
  contributionTimeline: [
    { cycleNumber: 2, user: ama, amount: 20, cycleStatus: "UNCOVERED", completed: false, isMine: false, prepaid: false },
    { cycleNumber: 2, user: me, amount: 20, cycleStatus: "COMPLETED_ON_TIME", completed: true, isMine: true, prepaid: false },
    { cycleNumber: 3, user: me, amount: 20, cycleStatus: "PENDING", completed: false, isMine: true, prepaid: false },
  ],
});

const transparency = (paused: boolean): PoolTransparency => ({
  poolId: "pool-1",
  name: "Accra Market Women",
  status: paused ? "PAUSED" : "ACTIVE",
  pausedAt: null,
  pauseReason: paused ? "Guarantee ran out" : null,
  bond: { total: 400, remaining: paused ? 0 : 60, coveragePercent: 20, totalPoolValue: 2000, status: paused ? "DEPLETED" : "LOCKED" },
  uncovered: { days: paused ? 1 : 0, amount: paused ? 20 : 0 },
  debts: paused ? [{ name: "Kofi", photoUrl: null, isMe: true, amountOwed: 60, daysMissed: 3, amountRepaid: 0 }] : [],
  payoutTimeline: [
    { cycleNumber: 1, recipient: ama, isMe: false, expectedPayoutDate: "2026-10-01", status: "COMPLETED" },
    { cycleNumber: 2, recipient: me, isMe: true, expectedPayoutDate: "2026-10-08", status: paused ? "HOLD" : "COMPLETED" },
    { cycleNumber: 3, recipient: ama, isMe: false, expectedPayoutDate: "2026-10-15", status: "PENDING" },
  ],
});

test.describe("Running group pools", () => {
  test("paused pool → repay my debt → pool resumes", async ({ page }) => {
    const api = await mockApi(page);
    let paused = true;
    api.get(/^\/getUserActivePoolList\//, () =>
      ok([
        {
          id: "pool-1",
          currentCycle: 3,
          totalCycles: 4,
          contributionAmount: 20,
          nextContributionDue: null,
          contributionStatus: "PENDING",
          status: paused ? "PAUSED" : "ACTIVE",
          template: { name: "Accra Market Women", tier: null, origin: "GROUP" },
        },
      ])
    );
    api.get(/^\/pool-1\/details$/, () =>
      ok({ id: "pool-1", status: paused ? "PAUSED" : "ACTIVE", origin: "GROUP", name: "Accra Market Women", moderatorId: "u-mod" })
    );
    api.get(/^\/pool-1\/activePoolDetails\//, () => ({ body: { success: true, data: active(paused ? "PAUSED" : "ACTIVE") } }));
    api.get(/^\/groupPools\/pool-1\/transparency\//, () => ok(transparency(paused)));
    api.get(/^\/getUserCheckingAccount\//, {
      body: { success: true, checkingAccount: { availableBalance: 500, lockedBalance: 0, amountOwedBalance: 0 } },
    });
    api.post(/^\/groupPools\/debts\/repay\//, () => {
      paused = false;
      return ok({ repaid: 60, remainingOutstanding: 0 });
    });

    await page.goto("/pools");
    const card = page.getByRole("heading", { name: "Accra Market Women" }).locator("..").locator("..");
    await expect(card.getByText("Group", { exact: true })).toBeVisible();
    await expect(card.getByText("Paused", { exact: true })).toBeVisible();
    await page.getByRole("heading", { name: "Accra Market Women" }).click();
    await expect(page).toHaveURL(/\/pools\/group\/pool-1$/);

    await expect(page.getByText("Payouts are paused")).toBeVisible();
    await expect(page.getByText(/Guarantee ran out\. The pool's guarantee has run out/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Contribute GH₵20.00" })).toBeVisible();

    await page.getByRole("tab", { name: "Payout Timeline" }).click();
    await expect(page.getByText("Held", { exact: true })).toBeVisible();
    await expect(page.getByText("Held, will be paid when the pool resumes")).toBeVisible();

    await page.getByRole("button", { name: "Repay", exact: true }).click();
    await page.getByRole("button", { name: "Repay now" }).click();
    await expect(page.getByText("Repaid GH₵60.00. You're all clear.")).toBeVisible();
    expect(api.calls.find((c) => c.path.startsWith("/groupPools/debts/repay/"))?.body).toEqual({ poolId: "pool-1" });

    await expect(page.getByText("Payouts are paused")).toHaveCount(0);
    await expect(page.getByText("Nobody owes the pool anything.")).toBeVisible();
  });

  // `next dev` (Turbopack) never finishes compiling /pools/[id] in this repo — reproducible with the
  // pre-group-pools version of the page too — so this can't run against the dev server yet.
  test.fixme("template-style link to a group pool redirects to its page", async ({ page }) => {
    const api = await mockApi(page);
    api.get(/^\/pool-1\/details$/, ok({ id: "pool-1", status: "ACTIVE", origin: "GROUP", name: "Accra Market Women" }));
    api.get(/^\/pool-1\/activePoolDetails\//, ok(active("ACTIVE")));
    api.get(/^\/groupPools\/pool-1\/transparency\//, ok(transparency(false)));
    api.get(/^\/getUserCheckingAccount\//, { body: { success: false } });

    // The client redirect can fire before "load", so only wait for the navigation to commit.
    await page.goto("/pools/pool-1?type=active", { waitUntil: "commit" });
    await expect(page).toHaveURL(/\/pools\/group\/pool-1$/);
    await expect(page.getByText("Group health")).toBeVisible();
  });

  test("moderator tops up a depleted guarantee and the pool resumes", async ({ page }) => {
    const api = await mockApi(page);
    const pool: ModeratedPool = {
      id: "pool-1",
      name: "Accra Market Women",
      status: "PAUSED",
      contributionAmount: 20,
      payoutIntervalDays: 7,
      maxMembers: 4,
      currentMemberCount: 4,
      currentCycle: 3,
      totalCycles: 4,
      formingDeadline: null,
      configFrozenAt: "2026-09-01T00:00:00.000Z",
      payoutOrderType: "RANDOM",
      bond: { initialAmount: 400, toppedUpTotal: 0, remaining: 0, drawnTotal: 400, repaidTotal: 0, status: "DEPLETED" },
      inviteCode: null,
      pendingRequestCount: 0,
    };
    let current = pool;
    api.get(/^\/moderator\/status\//, ok({ status: "APPROVED", appliedAt: null, decidedAt: null, decisionReason: null, maxConcurrentModeratedPools: 3, applicationsOpen: true, canApply: false, eligibility: null }));
    api.get(/^\/groupPools\/moderated\//, () => ok([current]));
    api.post(/^\/groupPools\/pool-1\/bond\/topUp\//, () => {
      const bond = { ...pool.bond, toppedUpTotal: 200, remaining: 180, status: "LOCKED" as const };
      current = { ...pool, status: "ACTIVE", bond };
      return ok({ bond, resumed: true, uncoveredRows: 1, releasedPayouts: 2 });
    });

    await page.goto("/moderator/pools/pool-1?tab=bond");
    await expect(page.getByText("Top up to resume")).toBeVisible();
    await page.getByRole("button", { name: "GH₵200.00" }).click();
    await page.getByRole("button", { name: "Top up GH₵200.00" }).click();

    await expect(page.getByText("Pool resumed — 2 held payouts released")).toBeVisible();
    expect(api.calls.find((c) => c.path.includes("/bond/topUp/"))?.body).toEqual({ amount: 200 });
    await expect(page.getByText(/GH₵180\.00 left/)).toBeVisible();
  });
});
