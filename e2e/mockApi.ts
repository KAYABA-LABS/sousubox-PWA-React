import type { Page, Request } from "@playwright/test";

type Handler = (req: Request, url: URL) => { status?: number; body: unknown } | undefined;

interface Route {
  method: string;
  pattern: RegExp;
  handler: Handler;
}

/**
 * Mocks the backend behind the `/api/backend` rewrite. Routes are matched in
 * order against the path after `/api/backend`; unmatched calls get a 404 so a
 * missing mock fails loudly instead of hitting a real server.
 */
export async function mockApi(page: Page) {
  const routes: Route[] = [];
  const calls: { method: string; path: string; body: unknown }[] = [];

  await page.route("**/api/backend/**", async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname.replace(/^\/api\/backend/, "");
    let body: unknown = null;
    try {
      body = req.postDataJSON();
    } catch {
      body = req.postData();
    }
    calls.push({ method: req.method(), path: `${path}${url.search}`, body });

    for (const r of routes) {
      if (r.method !== req.method() || !r.pattern.test(path)) continue;
      const result = r.handler(req, url);
      if (!result) continue;
      await route.fulfill({ status: result.status ?? 200, contentType: "application/json", body: JSON.stringify(result.body) });
      return;
    }
    await route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ success: false, error: "NOT_MOCKED", message: `No mock for ${req.method()} ${path}` }) });
  });

  const on = (method: string, pattern: RegExp, handler: Handler | { status?: number; body: unknown }) => {
    routes.unshift({ method, pattern, handler: typeof handler === "function" ? handler : () => handler });
  };

  return {
    calls,
    get: (pattern: RegExp, handler: Handler | { status?: number; body: unknown }) => on("GET", pattern, handler),
    post: (pattern: RegExp, handler: Handler | { status?: number; body: unknown }) => on("POST", pattern, handler),
    put: (pattern: RegExp, handler: Handler | { status?: number; body: unknown }) => on("PUT", pattern, handler),
  };
}

export const ok = (data: unknown) => ({ body: { success: true, data } });
export const fail = (status: number, error: string, message = error, data?: unknown) => ({
  status,
  body: { success: false, error, message, data },
});
