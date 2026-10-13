import { expect, test, type Page } from "@playwright/test";
import type { ModeratedPool, ModeratorStatusResponse } from "../src/lib/api";
import { fail, mockApi, ok } from "./mockApi";

const status = (overrides: Partial<ModeratorStatusResponse>): ModeratorStatusResponse => ({
  status: "NONE",
  appliedAt: null,
  decidedAt: null,
  decisionReason: null,
  maxConcurrentModeratedPools: 3,
  applicationsOpen: true,
  canApply: true,
  eligibility: { eligible: true, failures: [], snapshot: { reputationScore: 820, required: { reputationScore: 700 } } },
  ...overrides,
});

const createdPool: ModeratedPool = {
  id: "pool-9",
  name: "Makola Traders",
  status: "FORMING",
  contributionAmount: 20,
  payoutIntervalDays: 7,
  maxMembers: 10,
  currentMemberCount: 1,
  currentCycle: 0,
  totalCycles: 10,
  formingDeadline: "2026-11-01T00:00:00.000Z",
  configFrozenAt: null,
  payoutOrderType: "RANDOM",
  bond: { initialAmount: 1400, toppedUpTotal: 0, remaining: 1400, drawnTotal: 0, repaidTotal: 0, status: "LOCKED" },
  inviteCode: "MKLA7Q2Z",
  pendingRequestCount: 1,
};

async function fillWizard(page: Page) {
  await page.goto("/moderator/create");
  await page.getByLabel("Pool name").fill("Makola Traders");
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page).toHaveURL(/step=2/);
  await page.getByLabel("Daily contribution (GH₵)").fill("20");
  await page.getByLabel("Number of members").fill("10");
  await expect(page.getByTestId("estimate-panel")).toContainText("GH₵1,400.00");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/step=3/);
}

test.describe("Pool moderator", () => {
  test("apply → approved → create → share → approve a request", async ({ page }) => {
    const api = await mockApi(page);
    let current = status({});
    api.get(/^\/moderator\/status\//, () => ok(current));
    api.post(/^\/moderator\/apply\//, () => {
      current = status({ status: "PENDING", appliedAt: "2026-10-13T09:00:00.000Z", canApply: false });
      return ok({ status: "PENDING" });
    });

    await page.goto("/moderator");
    await expect(page.getByText("Run a pool for your group")).toBeVisible();
    await page.getByRole("button", { name: "Apply to become a moderator" }).click();
    await page.getByLabel(/Why do you want to moderate/).fill("I run a market women's group.");
    await page.getByRole("button", { name: "Send application" }).click();
    await expect(page.getByText("Application under review")).toBeVisible();
    expect(api.calls.find((c) => c.path.startsWith("/moderator/apply/"))?.body).toEqual({
      motivation: "I run a market women's group.",
    });

    // An admin approves the application.
    current = status({ status: "APPROVED", canApply: false });
    let pools: ModeratedPool[] = [];
    api.get(/^\/groupPools\/moderated\//, () => ok(pools));
    api.post(/^\/groupPools\/create\//, () => {
      pools = [createdPool];
      return ok({ ...createdPool, bondAmount: 1400, totalPoolValue: 14000 });
    });
    api.get(/^\/groupPools\/pool-9\/requests\//, (_req, url) =>
      ok(
        url.searchParams.get("status") === "PENDING"
          ? [
              {
                id: "r-1",
                poolId: "pool-9",
                userId: "u-2",
                status: "PENDING",
                note: "Ama's neighbour",
                createdAt: "2026-10-13T09:00:00.000Z",
                expiresAt: "2026-10-16T09:00:00.000Z",
                user: {
                  id: "u-2",
                  username: "kofi",
                  firstName: "Kofi",
                  lastName: "Mensah",
                  photoUrl: null,
                  createdAt: "2025-01-02T00:00:00.000Z",
                  stats: { reputationScore: 712, reputationTier: "TRUSTED", poolsCompleted: 4, poolsDefaulted: 0 },
                },
              },
            ]
          : []
      )
    );
    api.post(/^\/groupPools\/requests\/r-1\/approve\//, ok({ status: "AWAITING_FUNDS" }));

    await page.goto("/moderator");
    await expect(page.getByText("Create your first pool")).toBeVisible();

    await fillWizard(page);
    await page.getByRole("button", { name: "Create pool & lock guarantee" }).click();

    await expect(page).toHaveURL(/\/moderator\/pools\/pool-9\?created=1/);
    await expect(page.getByText("Your pool is ready")).toBeVisible();
    await expect(page.getByTestId("invite-code")).toHaveText("MKLA7Q2Z");
    await expect(page.getByRole("img", { name: "QR code to join Makola Traders" })).toBeVisible();
    await expect(page.getByText(/\/pools\/join\?code=MKLA7Q2Z/)).toBeVisible();
    expect(api.calls.find((c) => c.path.startsWith("/groupPools/create/"))?.body).toEqual({
      name: "Makola Traders",
      contributionAmount: 20,
      maxMembers: 10,
      payoutIntervalDays: 7,
      payoutOrderType: "RANDOM",
      moderatorParticipates: false,
    });

    await page.getByRole("tab", { name: /Requests/ }).click();
    await expect(page.getByText("Kofi Mensah")).toBeVisible();
    await page.getByRole("button", { name: "Approve" }).click();
    await expect(page.getByText(/Approved\. Waiting for Kofi Mensah to add funds/)).toBeVisible();
  });

  test("INVALID_POOL_CONFIG details land on the step they belong to", async ({ page }) => {
    const api = await mockApi(page);
    api.get(/^\/moderator\/status\//, ok(status({ status: "APPROVED" })));
    api.post(
      /^\/groupPools\/create\//,
      { status: 400, body: { success: false, error: "INVALID_POOL_CONFIG", message: "Invalid", details: ["maxMembers must be at most 8"] } }
    );

    await fillWizard(page);
    await page.getByRole("button", { name: "Create pool & lock guarantee" }).click();
    await expect(page).toHaveURL(/step=2/);
    await expect(page.getByRole("alert").filter({ hasText: "maxMembers must be at most 8" })).toBeVisible();
  });

  test("short on funds → deposit → back to review with the draft intact", async ({ page }) => {
    const api = await mockApi(page);
    api.get(/^\/moderator\/status\//, ok(status({ status: "APPROVED" })));
    api.post(
      /^\/groupPools\/create\//,
      fail(402, "INSUFFICIENT_FUNDS", "Insufficient funds", { amountNeeded: 1400, bondAmount: 1400, joinAmount: 62, availableBalance: 400 })
    );

    await fillWizard(page);
    await page.getByRole("button", { name: "Create pool & lock guarantee" }).click();
    await page.getByRole("button", { name: "Add GH₵1,000.00" }).click();
    await expect(page).toHaveURL(/\/deposit\?amount=1000\.00&returnTo=%2Fmoderator%2Fcreate%3Fstep%3D3%26resume%3D1/);

    await page.goto("/moderator/create?step=3&resume=1");
    await expect(page.getByText("Welcome back")).toBeVisible();
    await expect(page.getByText("Makola Traders")).toBeVisible();
    await expect(page.getByText("GH₵20.00", { exact: true })).toBeVisible();
  });

  test("non-moderators can't reach the wizard", async ({ page }) => {
    const api = await mockApi(page);
    api.get(/^\/moderator\/status\//, ok(status({ status: "PENDING", canApply: false })));
    await page.goto("/moderator/create");
    await expect(page).toHaveURL(/\/moderator$/);
    await expect(page.getByText("Application under review")).toBeVisible();
  });
});
