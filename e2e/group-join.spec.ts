import { expect, test } from "@playwright/test";
import { makeMyRequest, makePreview } from "../src/test/fixtures";
import { fail, mockApi, ok } from "./mockApi";

test.describe("Join a group pool by invite", () => {
  test("invite link → preview → consent → request sent", async ({ page }) => {
    const api = await mockApi(page);
    api.get(/^\/groupPools\/preview\//, ok(makePreview()));
    api.get(/^\/kyc\/status\//, ok({ status: "VERIFIED" }));
    api.post(/^\/groupPools\/requests\/[^/]+$/, ok({
      id: "req-1",
      poolId: "pool-1",
      userId: "e2e-user",
      status: "PENDING",
      note: null,
      createdAt: "2026-10-13T10:00:00.000Z",
      expiresAt: "2026-10-16T10:00:00.000Z",
    }));

    // Lowercase and dashed, as people paste it.
    await page.goto("/pools/join?code=abcd-2345");

    await expect(page.getByRole("heading", { name: "Accra Market Women" })).toBeVisible();
    const previewCall = api.calls.find((c) => c.path.startsWith("/groupPools/preview/"));
    expect(previewCall?.path).toContain("code=ABCD2345");

    await page.getByRole("button", { name: "Request to join" }).click();
    const send = page.getByRole("button", { name: "Send request" });
    await expect(send).toBeDisabled();

    await page.getByLabel("I understand and agree.").click();
    await expect(send).toBeEnabled();
    await send.click();

    await expect(page.getByText(/Request sent to Ama/)).toBeVisible();
    await expect(page.getByText(/Request pending/)).toBeVisible();
    const requestCall = api.calls.find((c) => c.method === "POST" && /^\/groupPools\/requests\/[^/]+$/.test(c.path));
    expect(requestCall?.body).toEqual({ code: "ABCD2345", debtVisibilityConsent: true });
  });

  test("unknown code shows an inline error", async ({ page }) => {
    const api = await mockApi(page);
    api.get(/^\/groupPools\/preview\//, fail(404, "CODE_NOT_FOUND"));

    await page.goto("/pools/join?code=ZZZZ2345");
    await expect(page.locator("#invite-code-error")).toHaveText("This code isn't valid or the pool is no longer open.");
  });

  test("rate limiting disables the input", async ({ page }) => {
    const api = await mockApi(page);
    api.get(/^\/groupPools\/preview\//, fail(429, "", "Too many requests"));

    await page.goto("/pools/join?code=ZZZZ2345");
    await expect(page.locator("#invite-code-error")).toContainText("Too many tries");
    await expect(page.locator("#invite-code")).toBeDisabled();
  });

  test("KYC not verified opens the verify sheet instead of the drawer", async ({ page }) => {
    const api = await mockApi(page);
    api.get(/^\/groupPools\/preview\//, ok(makePreview()));
    api.get(/^\/kyc\/status\//, ok({ status: "PENDING" }));

    await page.goto("/pools/join?code=ABCD2345");
    await page.getByRole("button", { name: "Request to join" }).click();
    await expect(page.getByRole("button", { name: "Verify my ID" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Send request" })).toHaveCount(0);
  });

  test("AWAITING_FUNDS → top up → deposit Continue → join completes", async ({ page }) => {
    const api = await mockApi(page);
    let joined = false;
    api.get(/^\/groupPools\/myRequests\//, () => ok([makeMyRequest({ status: joined ? "JOINED" : "AWAITING_FUNDS" })]));
    api.get(/^\/getUserCheckingAccount\//, {
      body: { success: true, checkingAccount: { availableBalance: 10, lockedBalance: 0, amountOwedBalance: 0 } },
    });
    api.post(/^\/groupPools\/requests\/req-1\/completeJoin\//, () => {
      joined = true;
      return ok({ status: "JOINED" });
    });
    api.get(/^\/mobileMoneyPayment\//, ok({ reference: "R1", status: "success", credited: true }));

    await page.goto("/pools/join/requests");
    await expect(page.getByText(/You're approved! Add GH₵52\.00/)).toBeVisible();

    await page.getByRole("button", { name: "Top up & complete" }).click();
    await page.getByRole("button", { name: "Add GH₵52.00" }).click();
    await expect(page).toHaveURL(/\/deposit\?amount=52\.00&returnTo=%2Fpools%2Fjoin%2Frequests%3Fcomplete%3Dreq-1/);

    // Skip the momo prompt itself: land on a successful status page as the flow would.
    const data = encodeURIComponent(
      JSON.stringify({ method: "momo", methodName: "Mobile Money", amount: "52.00", referenceCode: "R1", status: "success" })
    );
    await page.goto(`/deposit/status?data=${data}&returnTo=${encodeURIComponent("/pools/join/requests?complete=req-1")}`);
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText("You've joined Accra Market Women")).toBeVisible();
    await expect(page).toHaveURL(/\/pools\/join\/requests$/);
    expect(api.calls.filter((c) => c.path.includes("/completeJoin/"))).toHaveLength(1);
  });
});
