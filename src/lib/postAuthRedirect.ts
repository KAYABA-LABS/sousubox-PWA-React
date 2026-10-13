import { groupPoolsEnabled } from "@/lib/featureFlags";
import { readPendingInviteCode } from "@/lib/pendingInvite";
import { isSafeRelativePath } from "@/lib/safeRedirect";

/**
 * Turns a `redirect_url` value into a same-origin relative path, or null.
 * Accepts relative paths and absolute URLs on our own origin (Clerk's
 * `auth.protect()` sends the latter); everything else is rejected.
 */
export function sameOriginPath(raw: string | null, origin: string): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw, origin);
    if (url.origin !== origin) return null;
    const path = `${url.pathname}${url.search}${url.hash}`;
    return isSafeRelativePath(path) ? path : null;
  } catch {
    return null;
  }
}

/** Where to go after sign-in/sign-up: `redirect_url`, then a saved invite, then the fallback. */
export function postAuthDestination(fallback = "/dashboard") {
  if (typeof window === "undefined") return fallback;
  const redirect = sameOriginPath(new URLSearchParams(window.location.search).get("redirect_url"), window.location.origin);
  if (redirect && !redirect.startsWith("/signin") && !redirect.startsWith("/signup")) return redirect;
  const invite = groupPoolsEnabled ? readPendingInviteCode() : null;
  if (invite) return `/pools/join?code=${encodeURIComponent(invite)}`;
  return fallback;
}
