import { beforeEach, describe, expect, it } from "vitest";
import {
  clearDraft,
  DEFAULT_POOL_CONFIG,
  poolConfigSchema,
  readDraft,
  saveDraft,
  stepForConfigError,
  stepForField,
  toCreateBody,
  toUpdateBody,
  type PoolConfigValues,
} from "@/lib/groupPoolForm";

const valid: PoolConfigValues = {
  name: "  Makola Traders  ",
  description: "",
  rulesText: " Pay by 6pm ",
  contributionAmount: 20,
  maxMembers: 10,
  payoutIntervalDays: 7,
  payoutOrderType: "MANUAL",
  moderatorParticipates: true,
};

describe("poolConfigSchema", () => {
  it("accepts a complete config", () => {
    expect(poolConfigSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects the empty defaults with field messages", () => {
    const result = poolConfigSchema.safeParse(DEFAULT_POOL_CONFIG);
    expect(result.success).toBe(false);
    const fields = result.error?.issues.map((i) => i.path[0]);
    expect(fields).toEqual(expect.arrayContaining(["name", "contributionAmount", "maxMembers"]));
  });

  it("rejects fractional member counts", () => {
    expect(poolConfigSchema.safeParse({ ...valid, maxMembers: 4.5 }).success).toBe(false);
  });
});

describe("stepForConfigError", () => {
  it.each([
    ["contributionAmount must be between 5 and 500", 2],
    ["maxMembers must be at most 20", 2],
    ["payoutIntervalDays must be one of 1, 7, 30", 2],
    ["name is too long", 1],
    ["Something unexpected", null],
  ])("%s → step %s", (message, step) => {
    expect(stepForConfigError(message)).toBe(step);
  });

  it("maps fields to their steps", () => {
    expect(stepForField("name")).toBe(1);
    expect(stepForField("maxMembers")).toBe(2);
    expect(stepForField("moderatorParticipates")).toBe(3);
  });
});

describe("toCreateBody", () => {
  it("trims text and drops empty optionals", () => {
    expect(toCreateBody(valid)).toEqual({
      name: "Makola Traders",
      rulesText: "Pay by 6pm",
      contributionAmount: 20,
      maxMembers: 10,
      payoutIntervalDays: 7,
      payoutOrderType: "MANUAL",
      moderatorParticipates: true,
    });
  });
});

describe("toUpdateBody", () => {
  it("sends only changed fields, and empty text to clear it", () => {
    const next = { ...valid, rulesText: "", maxMembers: 12 };
    expect(toUpdateBody(valid, next, false)).toEqual({ rulesText: "", maxMembers: 12 });
  });

  it("leaves out economics once frozen", () => {
    const next = { ...valid, name: "New name", contributionAmount: 50 };
    expect(toUpdateBody(valid, next, true)).toEqual({ name: "New name" });
  });
});

describe("draft storage", () => {
  beforeEach(() => clearDraft());

  it("round-trips, keeping blank numbers blank", () => {
    saveDraft({ ...valid, maxMembers: Number.NaN });
    const draft = readDraft();
    expect(draft?.name).toBe(valid.name);
    expect(Number.isNaN(draft?.maxMembers)).toBe(true);
    expect(draft?.payoutOrderType).toBe("MANUAL");
  });

  it("ignores corrupt data", () => {
    sessionStorage.setItem("groupPoolDraft", "{not json");
    expect(readDraft()).toBeNull();
  });
});
