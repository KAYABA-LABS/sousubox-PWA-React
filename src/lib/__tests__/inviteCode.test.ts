import { describe, expect, it } from "vitest";
import { extractInviteCode, isValidInviteCode, normalizeInviteCode } from "@/lib/inviteCode";

describe("normalizeInviteCode", () => {
  it.each([
    ["abcd2345", "ABCD2345"],
    ["abcd-2345", "ABCD2345"],
    [" ab cd 23 45 ", "ABCD2345"],
    ["ABCD_2345\n", "ABCD2345"],
  ])("%j → %s", (raw, expected) => {
    expect(normalizeInviteCode(raw)).toBe(expected);
  });
});

describe("isValidInviteCode", () => {
  it("accepts 8 characters from the alphabet, after normalising", () => {
    expect(isValidInviteCode("abcd-2345")).toBe(true);
  });

  it("rejects ambiguous characters the backend never issues", () => {
    expect(isValidInviteCode("ABCD0234")).toBe(false); // 0
    expect(isValidInviteCode("ABCDO234")).toBe(false); // O
    expect(isValidInviteCode("ABCD1234")).toBe(false); // 1
    expect(isValidInviteCode("ABCDI234")).toBe(false); // I
  });

  it("rejects the wrong length", () => {
    expect(isValidInviteCode("ABCD234")).toBe(false);
    expect(isValidInviteCode("ABCD23456")).toBe(false);
  });
});

describe("extractInviteCode", () => {
  it("reads the code from an invite URL on any host", () => {
    expect(extractInviteCode("https://app.sousubox.com/pools/join?code=abcd-2345")).toBe("ABCD2345");
    expect(extractInviteCode("http://localhost:3000/pools/join/?code=ABCD2345")).toBe("ABCD2345");
  });

  it("reads a bare code", () => {
    expect(extractInviteCode("  abcd 2345 ")).toBe("ABCD2345");
  });

  it("ignores other URLs and payloads", () => {
    expect(extractInviteCode("https://evil.com/other?code=ABCD2345")).toBeNull();
    expect(extractInviteCode("https://app.sousubox.com/pools/join?code=nope")).toBeNull();
    expect(extractInviteCode('{"type":"vaulta_payment"}')).toBeNull();
  });
});
