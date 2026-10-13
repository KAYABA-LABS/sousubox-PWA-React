const KEY = "pendingInviteCode";

/** Keeps an invite code across sign-in/sign-up or KYC detours (plan §5). */
export function savePendingInviteCode(code: string) {
  try {
    sessionStorage.setItem(KEY, code);
  } catch {
    // storage unavailable (private mode)
  }
}

export function readPendingInviteCode(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function clearPendingInviteCode() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
