import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiUpload, NETWORK_ERROR, PAYLOAD_TOO_LARGE, UPLOAD_ABORTED } from "@/lib/api";

/** Minimal XHR stand-in: the test drives the outcome through `respond` / `fail`. */
class FakeXhr {
  static last: FakeXhr;
  method = "";
  url = "";
  headers: Record<string, string> = {};
  body: unknown = null;
  status = 0;
  responseText = "";
  upload: { onprogress: ((e: { lengthComputable: boolean; loaded: number; total: number }) => void) | null } = {
    onprogress: null,
  };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;

  constructor() {
    FakeXhr.last = this;
  }
  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }
  setRequestHeader(name: string, value: string) {
    this.headers[name] = value;
  }
  send(body: unknown) {
    this.body = body;
  }
  abort() {
    this.onabort?.();
  }
  respond(status: number, body: string) {
    this.status = status;
    this.responseText = body;
    this.onload?.();
  }
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  vi.stubGlobal("XMLHttpRequest", FakeXhr);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiUpload", () => {
  it("posts the form without a Content-Type and reports progress", async () => {
    const form = new FormData();
    const onProgress = vi.fn();
    const promise = apiUpload("/moderator/apply/u1", form, { onProgress });
    await flush();

    const xhr = FakeXhr.last;
    expect(xhr.method).toBe("POST");
    expect(xhr.url).toBe("/api/backend/moderator/apply/u1");
    expect(xhr.headers["Content-Type"]).toBeUndefined();
    expect(xhr.body).toBe(form);

    xhr.upload.onprogress?.({ lengthComputable: true, loaded: 50, total: 200 });
    expect(onProgress).toHaveBeenCalledWith(0.25);

    xhr.respond(201, JSON.stringify({ success: true, data: { status: "PENDING" } }));
    await expect(promise).resolves.toEqual({ success: true, data: { status: "PENDING" } });
  });

  it("throws the backend envelope as an ApiError with details", async () => {
    const promise = apiUpload("/x", new FormData());
    await flush();
    FakeXhr.last.respond(
      400,
      JSON.stringify({ success: false, error: "INVALID_DOCUMENTS", message: "Bad docs", details: ["proofOfAddress: too big"] })
    );
    const err = await promise.catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ code: "INVALID_DOCUMENTS", status: 400, details: ["proofOfAddress: too big"] });
  });

  it("maps a non-JSON 413 from the proxy to PAYLOAD_TOO_LARGE", async () => {
    const promise = apiUpload("/x", new FormData());
    await flush();
    FakeXhr.last.respond(413, "<html>Request Entity Too Large</html>");
    await expect(promise).rejects.toMatchObject({ code: PAYLOAD_TOO_LARGE, status: 413 });
  });

  it("maps network failures and aborts", async () => {
    const failing = apiUpload("/x", new FormData());
    await flush();
    FakeXhr.last.onerror?.();
    await expect(failing).rejects.toMatchObject({ code: NETWORK_ERROR, status: 0 });

    const controller = new AbortController();
    const aborted = apiUpload("/x", new FormData(), { signal: controller.signal });
    await flush();
    controller.abort();
    await expect(aborted).rejects.toMatchObject({ code: UPLOAD_ABORTED });
  });
});
