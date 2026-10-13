import { describe, expect, it } from "vitest";
import { depositHref, isSafeRelativePath } from "@/lib/safeRedirect";
import { sameOriginPath } from "@/lib/postAuthRedirect";

describe("isSafeRelativePath", () => {
  it.each(["/pools/join?code=ABCD2345", "/pools/join/requests?complete=r1", "/"])("accepts %s", (path) => {
    expect(isSafeRelativePath(path)).toBe(true);
  });

  it.each([
    "https://evil.com",
    "//evil.com",
    "/\\evil.com",
    "javascript:alert(1)",
    "pools/join",
    "/\u0000x",
    "",
    null,
    undefined,
  ])("rejects %j", (path) => {
    expect(isSafeRelativePath(path)).toBe(false);
  });
});

describe("sameOriginPath", () => {
  const origin = "https://app.sousubox.com";

  it("keeps relative paths", () => {
    expect(sameOriginPath("/pools/join?code=ABCD2345", origin)).toBe("/pools/join?code=ABCD2345");
  });

  it("accepts Clerk's absolute same-origin redirect", () => {
    expect(sameOriginPath("https://app.sousubox.com/pools/join/requests", origin)).toBe("/pools/join/requests");
  });

  it("rejects other origins", () => {
    expect(sameOriginPath("https://evil.com/pools/join", origin)).toBeNull();
    expect(sameOriginPath("//evil.com/x", origin)).toBeNull();
    expect(sameOriginPath("/\\evil.com", origin)).toBeNull();
  });
});

describe("depositHref", () => {
  it("rounds the amount up to the pesewa and keeps a safe returnTo", () => {
    expect(depositHref(12.341, "/pools/join/requests?complete=r1")).toBe(
      "/deposit?amount=12.35&returnTo=%2Fpools%2Fjoin%2Frequests%3Fcomplete%3Dr1"
    );
  });

  it("drops unsafe returnTo and empty amounts", () => {
    expect(depositHref(0, "https://evil.com")).toBe("/deposit");
    expect(depositHref(null)).toBe("/deposit");
  });
});
