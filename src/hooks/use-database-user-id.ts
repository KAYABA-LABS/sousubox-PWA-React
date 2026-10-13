"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { isDevMode } from "@/lib/dev";

/**
 * The backend user id (from Clerk `unsafeMetadata.userId`). `ready` is true once
 * Clerk has loaded and there is an id to call the API with (dev mode passes
 * an empty id and lets `resolveUserId` substitute the dev user).
 */
export function useDatabaseUserId() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const metadataId = typeof user?.unsafeMetadata?.userId === "string" ? user.unsafeMetadata.userId : null;
  // Same fallback as AuthTokenProvider, so "is this me?" checks match the id the API calls use.
  const userId =
    metadataId ?? (process.env.NEXT_PUBLIC_DEV_BYPASS === "true" ? process.env.NEXT_PUBLIC_DEV_USERID ?? null : null);
  return {
    isLoaded,
    isSignedIn: !!isSignedIn,
    userId: userId ?? "",
    ready: isLoaded && (!!userId || isDevMode()),
  };
}
