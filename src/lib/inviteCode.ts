/** Alphabet the backend draws invite codes from (no 0/O/1/I). */
export const INVITE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const INVITE_CODE_LENGTH = 8;

const INVITE_CODE_RE = new RegExp(`^[${INVITE_CODE_ALPHABET}]{${INVITE_CODE_LENGTH}}$`);

/** Uppercases and strips spaces, dashes and anything else non-alphanumeric. */
export function normalizeInviteCode(raw: string) {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function isValidInviteCode(raw: string) {
  return INVITE_CODE_RE.test(normalizeInviteCode(raw));
}

export function appUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "");
  if (configured) return configured;
  return typeof window !== "undefined" ? window.location.origin : "";
}

export function inviteUrl(code: string) {
  return `${appUrl()}/pools/join?code=${encodeURIComponent(normalizeInviteCode(code))}`;
}

/**
 * Pulls an invite code out of scanned or pasted text: a `/pools/join?code=` URL
 * (any host) or a bare code. Returns null when the text is neither.
 */
export function extractInviteCode(text: string): string | null {
  const trimmed = text.trim();
  try {
    const url = new URL(trimmed);
    if (url.pathname.replace(/\/+$/, "") !== "/pools/join") return null;
    const code = url.searchParams.get("code");
    return code && isValidInviteCode(code) ? normalizeInviteCode(code) : null;
  } catch {
    // not a URL
  }
  if (trimmed.length > 16) return null;
  return isValidInviteCode(trimmed) ? normalizeInviteCode(trimmed) : null;
}
