import { describe, expect, it } from "vitest";
import { PING_FOCUS_INTERVAL_MS, shouldPing } from "@/stores/useModeratorStore";

const NOW = 1_800_000_000_000;

describe("shouldPing", () => {
  it("always pings in the moderator area", () => {
    expect(shouldPing("moderator-area", { status: "NONE", lastPingAt: NOW }, NOW)).toBe(true);
  });

  it("pings once on app open for unknown or approved status", () => {
    expect(shouldPing("app-open", { status: null, lastPingAt: null }, NOW)).toBe(true);
    expect(shouldPing("app-open", { status: "APPROVED", lastPingAt: null }, NOW)).toBe(true);
    expect(shouldPing("app-open", { status: "APPROVED", lastPingAt: NOW - 5 }, NOW)).toBe(false);
  });

  it("doesn't ping non-moderators on app open or focus", () => {
    expect(shouldPing("app-open", { status: "NONE", lastPingAt: null }, NOW)).toBe(false);
    expect(shouldPing("focus", { status: "PENDING", lastPingAt: null }, NOW)).toBe(false);
  });

  it("throttles focus pings to once an hour", () => {
    const state = { status: "APPROVED" as const, lastPingAt: NOW - PING_FOCUS_INTERVAL_MS + 1 };
    expect(shouldPing("focus", state, NOW)).toBe(false);
    expect(shouldPing("focus", { ...state, lastPingAt: NOW - PING_FOCUS_INTERVAL_MS }, NOW)).toBe(true);
  });
});
