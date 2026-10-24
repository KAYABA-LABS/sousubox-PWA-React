import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DocumentUploadSlot } from "@/components/group-pools/DocumentUploadSlot";
import { DEFAULT_REQUIRED_DOCUMENTS } from "@/lib/moderatorDocuments";

const proofOfAddress = DEFAULT_REQUIRED_DOCUMENTS[1];

function renderSlot(props: Partial<React.ComponentProps<typeof DocumentUploadSlot>> = {}) {
  const onPick = vi.fn();
  const onRemove = vi.fn();
  render(<DocumentUploadSlot document={proofOfAddress} file={null} error={null} onPick={onPick} onRemove={onRemove} {...props} />);
  return { onPick, onRemove };
}

describe("DocumentUploadSlot", () => {
  it("shows the label, help, examples and multi-page hint when empty", () => {
    renderSlot();
    expect(screen.getByRole("group", { name: "Proof of address" })).toBeInTheDocument();
    expect(screen.getByText(/issued in the last 3 months/)).toBeInTheDocument();
    expect(screen.getByText(/ECG electricity bill, Ghana Water bill/)).toBeInTheDocument();
    expect(screen.getByText(/single PDF/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Upload file: Proof of address" })).toBeInTheDocument();
  });

  it("passes the picked file up and offers no camera capture", () => {
    const { onPick } = renderSlot();
    const input = screen.getByTestId("file-proofOfAddress") as HTMLInputElement;
    expect(input).not.toHaveAttribute("capture");
    expect(input).not.toHaveAttribute("multiple");
    expect(input.accept).toContain("application/pdf");

    const file = new File(["x"], "bill.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [file] } });
    expect(onPick).toHaveBeenCalledWith(file);
  });

  it("shows the picked file with replace and remove", async () => {
    const user = userEvent.setup();
    const file = new File(["x".repeat(2048)], "ecg-bill.pdf", { type: "application/pdf" });
    const { onRemove } = renderSlot({ file });

    expect(screen.getByText("ecg-bill.pdf")).toBeInTheDocument();
    expect(screen.getByText("2 KB")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Replace Proof of address" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove Proof of address" }));
    expect(onRemove).toHaveBeenCalled();
  });

  it("announces errors and links them to the group", () => {
    renderSlot({ error: "This file is over 10 MB." });
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("This file is over 10 MB.");
    expect(screen.getByRole("group").getAttribute("aria-describedby")).toContain(alert.id);
  });
});
