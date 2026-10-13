import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { canSubmitJoinRequest, JoinRequestDrawer } from "@/components/group-pools/JoinRequestDrawer";
import { makePreview } from "@/test/fixtures";

function renderDrawer(pool = makePreview(), onSubmit = vi.fn()) {
  render(
    <JoinRequestDrawer open onOpenChange={() => {}} pool={pool} myUserId="user-2" submitting={false} onSubmit={onSubmit} />
  );
  return { onSubmit, send: () => screen.getByRole("button", { name: "Send request" }) };
}

describe("canSubmitJoinRequest", () => {
  it("needs consent, plus order acceptance for MANUAL pools", () => {
    expect(canSubmitJoinRequest(false, false, false)).toBe(false);
    expect(canSubmitJoinRequest(true, false, false)).toBe(true);
    expect(canSubmitJoinRequest(true, true, false)).toBe(false);
    expect(canSubmitJoinRequest(true, true, true)).toBe(true);
  });
});

describe("JoinRequestDrawer", () => {
  it("keeps Send disabled until the debt-visibility consent is checked", async () => {
    const user = userEvent.setup();
    const { send, onSubmit } = renderDrawer();

    expect(screen.getByText("Members can see debts in this pool.")).toBeInTheDocument();
    expect(send()).toBeDisabled();

    await user.click(screen.getByLabelText("I understand and agree."));
    expect(send()).toBeEnabled();

    await user.type(screen.getByLabelText(/Note to the moderator/), "  Hi, I'm Kofi  ");
    await user.click(send());
    expect(onSubmit).toHaveBeenCalledWith({ acceptPayoutOrder: false, note: "Hi, I'm Kofi" });
  });

  it("requires accepting the order on MANUAL pools and shows my position", async () => {
    const user = userEvent.setup();
    const pool = makePreview({
      payoutOrderType: "MANUAL",
      manualOrder: [
        { position: 1, user: { id: "user-9", username: "esi", firstName: "Esi", lastName: "M", photoUrl: null } },
        { position: 2, user: { id: "user-2", username: "kofi", firstName: "Kofi", lastName: "A", photoUrl: null } },
      ],
    });
    const { send, onSubmit } = renderDrawer(pool);

    await user.click(screen.getByLabelText("I understand and agree."));
    expect(send()).toBeDisabled();

    await user.click(screen.getByLabelText("I accept this payout order. I'll receive my payout in position 2."));
    expect(send()).toBeEnabled();

    await user.click(send());
    expect(onSubmit).toHaveBeenCalledWith({ acceptPayoutOrder: true, note: "" });
  });
});
