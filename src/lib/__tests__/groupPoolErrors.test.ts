import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api";
import { errorDataNumber, RATE_LIMITED, resolveGroupPoolError, syntheticError } from "@/lib/groupPoolErrors";

describe("resolveGroupPoolError", () => {
  it("maps HTTP 429 to the rate-limit inline error regardless of code", () => {
    const resolved = resolveGroupPoolError(new ApiError("slow down", undefined, { status: 429 }));
    expect(resolved.code).toBe(RATE_LIMITED);
    expect(resolved.treatment).toBe("inline");
  });

  it("maps join gates to their sheets", () => {
    for (const code of ["KYC_REQUIRED", "OUTSTANDING_DEBT", "OUTSTANDING_GROUP_DEBT", "INSUFFICIENT_FUNDS"]) {
      const resolved = resolveGroupPoolError(new ApiError("x", code, { status: 403 }));
      expect(resolved.treatment).toBe("sheet");
      expect(resolved.sheet).toBe(code);
    }
  });

  it("uses our copy for known codes", () => {
    expect(resolveGroupPoolError(new ApiError("backend text", "CODE_NOT_FOUND")).message).toBe(
      "This code isn't valid or the pool is no longer open."
    );
  });

  it("asks for a refetch on state-conflict toasts", () => {
    const resolved = resolveGroupPoolError(new ApiError("x", "POOL_FULL", { status: 409 }));
    expect(resolved).toMatchObject({ treatment: "toast", refetch: true });
  });

  it("falls back to the backend message for unknown codes", () => {
    const resolved = resolveGroupPoolError(new ApiError("Something specific", "BRAND_NEW_CODE"));
    expect(resolved).toMatchObject({ treatment: "toast", message: "Something specific", refetch: false });
  });

  it("falls back to a generic message for non-errors", () => {
    expect(resolveGroupPoolError(undefined).message).toBe("Something went wrong");
  });

  it("keeps details and data", () => {
    const resolved = resolveGroupPoolError(
      new ApiError("bad", "INVALID_POOL_CONFIG", { status: 400, details: ["maxMembers too high"], data: { a: 1 } })
    );
    expect(resolved.details).toEqual(["maxMembers too high"]);
    expect(resolved.data).toEqual({ a: 1 });
  });
});

describe("errorDataNumber", () => {
  it("reads numbers and numeric strings, else null", () => {
    const error = syntheticError("INSUFFICIENT_FUNDS", { joinAmount: 60, availableBalance: "12.5", note: "x" });
    expect(errorDataNumber(error, "joinAmount")).toBe(60);
    expect(errorDataNumber(error, "availableBalance")).toBe(12.5);
    expect(errorDataNumber(error, "note")).toBeNull();
    expect(errorDataNumber(error, "missing")).toBeNull();
  });
});
