import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiError, type ModeratorStatusResponse } from "@/lib/api";

const replace = vi.fn();
const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, push }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/hooks/use-database-user-id", () => ({
  useDatabaseUserId: () => ({ userId: "user-1", ready: true, isLoaded: true, isSignedIn: true }),
}));

let details: ModeratorStatusResponse;
const refresh = vi.fn(async () => {});
vi.mock("@/hooks/use-moderator-ping", () => ({
  useModeratorAreaStatus: () => ({ details, loaded: true, refresh }),
}));

const applyForModerator = vi.fn();
vi.mock("@/services/groupPoolService", () => ({ useGroupPoolService: () => ({ applyForModerator }) }));

// Storage is covered by moderatorDraft.test; here the draft is plain memory.
vi.mock("@/lib/moderatorDraft", () => ({
  isDraftStorageAvailable: async () => true,
  loadDraft: async () => null,
  saveDraftFile: async () => {},
  removeDraftFile: async () => {},
  saveDraftMotivation: async () => {},
  deleteDraft: vi.fn(async () => {}),
}));

import ModeratorApplyPage from "@/app/moderator/apply/page";

const baseStatus = (overrides: Partial<ModeratorStatusResponse> = {}): ModeratorStatusResponse => ({
  status: "NONE",
  appliedAt: null,
  decidedAt: null,
  decisionReason: null,
  documents: [],
  requiredDocuments: [
    { kind: "BUSINESS_REGISTRATION", field: "businessRegistration", label: "Certificate of incorporation" },
    { kind: "PROOF_OF_ADDRESS", field: "proofOfAddress", label: "Proof of address" },
    { kind: "REFERENCE_LETTER", field: "referenceLetter", label: "Reference letter" },
  ],
  applicationsOpen: true,
  canApply: true,
  eligibility: {
    eligible: true,
    failures: [],
    snapshot: {
      kycStatus: "VERIFIED",
      amountOwedBalance: 0,
      groupDebtOutstanding: 0,
      reputationScore: 820,
      accountAgeDays: 200,
      completedPools: 3,
      required: { minReputation: 700, minAccountAgeDays: 90, minCompletedPools: 1 },
    },
  },
  ...overrides,
});

const pdf = (name: string, size = 10) => new File(["x".repeat(size)], name, { type: "application/pdf" });

async function renderPage() {
  render(<ModeratorApplyPage />);
  await screen.findByText("Your documents");
}

function pickAll() {
  fireEvent.change(screen.getByTestId("file-businessRegistration"), { target: { files: [pdf("cert.pdf")] } });
  fireEvent.change(screen.getByTestId("file-proofOfAddress"), { target: { files: [pdf("bill.pdf")] } });
  fireEvent.change(screen.getByTestId("file-referenceLetter"), { target: { files: [pdf("letter.pdf")] } });
}

const send = () => screen.getByRole("button", { name: "Send application" });

beforeEach(() => {
  details = baseStatus();
  vi.clearAllMocks();
});

describe("ModeratorApplyPage", () => {
  it("renders a slot per required document from the status", async () => {
    await renderPage();
    for (const label of ["Certificate of incorporation", "Proof of address", "Reference letter"]) {
      expect(screen.getByRole("group", { name: label })).toBeInTheDocument();
    }
    expect(screen.getByText(/Only SousuBoxx admins/)).toBeInTheDocument();
  });

  it("flags missing documents instead of sending", async () => {
    const user = userEvent.setup();
    await renderPage();
    fireEvent.change(screen.getByTestId("file-businessRegistration"), { target: { files: [pdf("cert.pdf")] } });
    await user.click(send());
    expect(applyForModerator).not.toHaveBeenCalled();
    expect(screen.getAllByText("Add this document to continue.")).toHaveLength(2);
  });

  it("rejects unsupported and oversize files on pick", async () => {
    await renderPage();
    fireEvent.change(screen.getByTestId("file-proofOfAddress"), {
      target: { files: [new File(["x"], "bill.docx", { type: "application/msword" })] },
    });
    expect(await screen.findByText(/file type isn't supported/)).toBeInTheDocument();
    expect(screen.queryByText("bill.docx")).not.toBeInTheDocument();

    const big = pdf("big.pdf");
    Object.defineProperty(big, "size", { value: 11 * 1024 * 1024 });
    fireEvent.change(screen.getByTestId("file-referenceLetter"), { target: { files: [big] } });
    expect(await screen.findByText(/over 10 MB/)).toBeInTheDocument();
  });

  it("submits the three files and motivation, then returns to the status", async () => {
    const user = userEvent.setup();
    applyForModerator.mockResolvedValue({ status: "PENDING" });
    await renderPage();
    pickAll();
    await user.type(screen.getByLabelText(/Why do you want to moderate/), "I run a market group");
    await user.click(send());

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/moderator"));
    const [userId, application] = applyForModerator.mock.calls[0];
    expect(userId).toBe("user-1");
    expect(application.motivation).toBe("I run a market group");
    expect(Object.keys(application.files).sort()).toEqual(["businessRegistration", "proofOfAddress", "referenceLetter"]);
    expect(refresh).toHaveBeenCalled();
  });

  it("puts INVALID_DOCUMENTS details under the right slot and keeps the files", async () => {
    const user = userEvent.setup();
    applyForModerator.mockRejectedValue(
      new ApiError("Invalid", "INVALID_DOCUMENTS", {
        status: 400,
        details: ["proofOfAddress: must be 10 MB or smaller", "Unexpected field: photo"],
      })
    );
    await renderPage();
    pickAll();
    await user.click(send());

    const group = await screen.findByRole("group", { name: "Proof of address" });
    expect(group).toHaveTextContent("must be 10 MB or smaller");
    expect(screen.getByText("Unexpected field: photo")).toBeInTheDocument();
    expect(screen.getByText("cert.pdf")).toBeInTheDocument();
    expect(send()).toBeEnabled();
  });

  it("shows the checklist on NOT_ELIGIBLE", async () => {
    const user = userEvent.setup();
    applyForModerator.mockRejectedValue(
      new ApiError("Not eligible", "NOT_ELIGIBLE", {
        status: 403,
        data: { failures: [{ code: "KYC_REQUIRED", message: "Verify your ID first." }] },
      })
    );
    await renderPage();
    pickAll();
    await user.click(send());

    expect(await screen.findByText("Verify your ID first.")).toBeInTheDocument();
    expect(send()).toBeDisabled();
  });

  it("keeps files after a network failure", async () => {
    const user = userEvent.setup();
    applyForModerator.mockRejectedValue(new ApiError("Network error", "NETWORK", { status: 0 }));
    await renderPage();
    pickAll();
    await user.click(send());

    expect(await screen.findByText(/Couldn't reach SousuBoxx/)).toBeInTheDocument();
    expect(screen.getByText("letter.pdf")).toBeInTheDocument();
  });

  it("shows upload progress while sending", async () => {
    const user = userEvent.setup();
    let report: (n: number) => void = () => {};
    applyForModerator.mockImplementation((_u, _a, opts) => {
      report = opts.onProgress;
      return new Promise(() => {});
    });
    await renderPage();
    pickAll();
    await user.click(send());
    act(() => report(0.42));
    expect(await screen.findByText("Sending… 42%")).toBeInTheDocument();
  });

  it("sends users who can't apply back to the status screen", async () => {
    details = baseStatus({ status: "PENDING", canApply: false });
    render(<ModeratorApplyPage />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/moderator"));
  });
});
