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
  const userId = typeof user?.unsafeMetadata?.userId === "string" ? user.unsafeMetadata.userId : null;
  return {
    isLoaded,
    isSignedIn: !!isSignedIn,
    userId: userId ?? "",
    ready: isLoaded && (!!userId || isDevMode()),
  };
}
