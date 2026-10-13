import { describe, expect, it } from "vitest";
import { bondHealth } from "@/lib/groupPoolBond";

const bond = (remaining: number, status: "LOCKED" | "DEPLETED" | "RELEASED" = "LOCKED") => ({
  initialAmount: 800,
  toppedUpTotal: 200,
  remaining,
  status,
});

describe("bondHealth", () => {
  it("uses initial + topped up as the denominator", () => {
    expect(bondHealth(bond(500)).coverage).toBe(0.5);
  });

  it.each([
    [510, "emerald"],
    [500, "amber"], // exactly 50% is not "> 50%"
    [200, "amber"], // exactly 20% is amber
    [199, "red"],
    [0, "red"],
  ])("remaining %i → %s", (remaining, tone) => {
    expect(bondHealth(bond(remaining)).tone).toBe(tone);
  });

  it("is always red with a top-up prompt when depleted or paused", () => {
    expect(bondHealth(bond(900, "DEPLETED"))).toMatchObject({ tone: "red", needsTopUp: true });
    expect(bondHealth(bond(900), "PAUSED")).toMatchObject({ tone: "red", needsTopUp: true });
  });

  it("handles an unfunded bond", () => {
    expect(bondHealth({ initialAmount: 0, toppedUpTotal: 0, remaining: 0, status: "LOCKED" }).coverage).toBe(0);
  });
});
