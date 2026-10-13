import { describe, expect, it } from "vitest";
import { normalizeMember } from "@/lib/groupPoolMembers";
import { checkForRow, snapshotRows } from "@/lib/moderatorEligibility";

describe("normalizeMember", () => {
  it("reads a nested user", () => {
    expect(
      normalizeMember({ role: "MODERATOR", joinedAt: "2026-10-01", user: { id: "u1", username: "ama", firstName: "Ama", lastName: "K", photoUrl: null } })
    ).toEqual({
      userId: "u1",
      role: "MODERATOR",
      joinedAt: "2026-10-01",
      user: { id: "u1", username: "ama", firstName: "Ama", lastName: "K", photoUrl: null },
    });
  });

  it("reads a flat record with userId and memberRole", () => {
    const member = normalizeMember({ userId: "u2", username: "kofi", memberRole: "MEMBER" });
    expect(member).toMatchObject({ userId: "u2", role: "MEMBER", user: { id: "u2", username: "kofi" } });
  });

  it("drops records without an id", () => {
    expect(normalizeMember({ username: "ghost" })).toBeNull();
  });
});

describe("snapshotRows", () => {
  it("pairs values with required thresholds and maps them to checks", () => {
    const rows = snapshotRows({
      reputationScore: 640,
      completedPools: 1,
      accountAgeDays: 12,
      kycStatus: "VERIFIED",
      required: { reputationScore: 700, completedPools: 2, accountAgeDays: 30 },
    });
    const reputation = rows.find((r) => r.key === "reputationScore");
    expect(reputation).toMatchObject({ value: "640", required: "700", label: "Reputation Score" });
    expect(checkForRow(reputation!)).toBe("REPUTATION_TOO_LOW");
    expect(checkForRow(rows.find((r) => r.key === "accountAgeDays")!)).toBe("ACCOUNT_TOO_NEW");
    expect(checkForRow(rows.find((r) => r.key === "completedPools")!)).toBe("NOT_ENOUGH_COMPLETED_POOLS");
    expect(rows.find((r) => r.key === "kycStatus")?.required).toBeNull();
  });

  it("copes with a missing snapshot", () => {
    expect(snapshotRows(null)).toEqual([]);
  });
});
