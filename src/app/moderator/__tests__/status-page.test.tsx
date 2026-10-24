import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import type { ModeratorStatusResponse } from "@/lib/api";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/hooks/use-database-user-id", () => ({
  useDatabaseUserId: () => ({ userId: "user-1", ready: true, isLoaded: true, isSignedIn: true }),
}));

let details: ModeratorStatusResponse;
vi.mock("@/hooks/use-moderator-ping", () => ({
  useModeratorAreaStatus: () => ({ details, loaded: true, refresh: vi.fn() }),
}));
vi.mock("@/services/groupPoolService", () => ({
  useGroupPoolService: () => ({ getModeratedPools: vi.fn(async () => []) }),
}));
const deleteDraft = vi.fn(async () => {});
vi.mock("@/lib/moderatorDraft", () => ({ deleteDraft: (...args: unknown[]) => deleteDraft(...(args as [])) }));

import ModeratorHomePage from "@/app/moderator/page";

const status = (overrides: Partial<ModeratorStatusResponse> = {}): ModeratorStatusResponse => ({
  status: "NONE",
  appliedAt: null,
  decidedAt: null,
  decisionReason: null,
  documents: [],
  requiredDocuments: [],
  applicationsOpen: true,
  canApply: true,
  eligibility: null,
  ...overrides,
});

beforeEach(() => vi.clearAllMocks());

describe("ModeratorHomePage status view", () => {
  it("NONE: invites the user to apply and keeps their draft", async () => {
    details = status();
    render(<ModeratorHomePage />);
    expect(screen.getByText("Run a pool for your group")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Apply to become a moderator" })).toBeEnabled();
    await new Promise((r) => setTimeout(r, 0));
    expect(deleteDraft).not.toHaveBeenCalled();
  });

  it("closed: says applications aren't open", () => {
    details = status({ applicationsOpen: false, canApply: false });
    render(<ModeratorHomePage />);
    expect(screen.getByText("Applications aren't open yet.")).toBeInTheDocument();
  });

  it("PENDING: lists what was sent and clears any draft", async () => {
    details = status({
      status: "PENDING",
      appliedAt: "2026-10-14T09:00:00.000Z",
      canApply: false,
      documents: [
        { kind: "PROOF_OF_ADDRESS", originalName: "ecg-bill.pdf", mimeType: "application/pdf", bytes: 2 * 1024 * 1024, uploadedAt: "2026-10-14T09:00:00.000Z" },
      ],
    });
    render(<ModeratorHomePage />);
    expect(screen.getByText("Application under review")).toBeInTheDocument();
    expect(screen.getByText(/You applied on Oct 14, 2026/)).toBeInTheDocument();
    expect(screen.getByText("What you sent")).toBeInTheDocument();
    expect(screen.getByText("Proof of address")).toBeInTheDocument();
    expect(screen.getByText(/ecg-bill\.pdf · 2\.0 MB/)).toBeInTheDocument();
    await waitFor(() => expect(deleteDraft).toHaveBeenCalledWith("user-1"));
  });

  it("REJECTED: shows the reason, the re-upload note and Apply again", () => {
    details = status({ status: "REJECTED", decisionReason: "The utility bill was older than 3 months." });
    render(<ModeratorHomePage />);
    expect(screen.getByText("The utility bill was older than 3 months.")).toBeInTheDocument();
    expect(screen.getByText(/upload all three documents again/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Apply again" })).toBeInTheDocument();
  });

  it.each(["SUSPENDED", "REVOKED"] as const)("%s: shows the reason and contact support", (s) => {
    details = status({ status: s, canApply: false, decisionReason: "Missed payouts." });
    render(<ModeratorHomePage />);
    expect(screen.getByText("Missed payouts.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Contact support" })).toBeInTheDocument();
  });

  it("APPROVED: hands off to the moderator dashboard", async () => {
    details = status({ status: "APPROVED", canApply: false, maxConcurrentModeratedPools: 3 });
    render(<ModeratorHomePage />);
    expect(await screen.findByText("Create your first pool")).toBeInTheDocument();
  });
});
