/**
 * Accepts only same-origin relative paths ("/pools/join?code=X"), rejecting
 * absolute URLs, protocol-relative ("//evil.com") and backslash tricks.
 */
export function isSafeRelativePath(value: string | null | undefined): value is string {
  if (!value || typeof value !== "string") return false;
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//") || value.startsWith("/\\")) return false;
  if (/[\u0000-\u001f]/.test(value)) return false;
  try {
    const url = new URL(value, "http://localhost");
    return url.origin === "http://localhost";
  } catch {
    return false;
  }
}

export function safeRelativePath(value: string | null | undefined, fallback: string) {
  return isSafeRelativePath(value) ? value : fallback;
}

/** Link into the deposit flow, prefilled with `amount` and returning to `returnTo` on success. */
export function depositHref(amount: number | null, returnTo?: string) {
  const params = new URLSearchParams();
  if (amount && amount > 0) params.set("amount", (Math.ceil(amount * 100) / 100).toFixed(2));
  if (isSafeRelativePath(returnTo)) params.set("returnTo", returnTo);
  const query = params.toString();
  return query ? `/deposit?${query}` : "/deposit";
}
