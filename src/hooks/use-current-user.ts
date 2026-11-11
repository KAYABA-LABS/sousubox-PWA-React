"use client";

import { useUser } from "@clerk/nextjs";
import { initialsOf } from "@/lib/format";

/**
 * Signed-in user as the app shell needs it: the backend user id stored in Clerk
 * metadata (the API layer falls back to the dev user id when it is missing),
 * plus display name and initials.
 */
export function useCurrentUser() {
  const { user, isLoaded } = useUser();
  const metaId = user?.unsafeMetadata?.userId;
  const dbUserId = typeof metaId === "string" ? metaId : "";
  const firstName = user?.firstName ?? "";
  const lastName = user?.lastName ?? "";
  return {
    isLoaded,
    dbUserId,
    firstName,
    lastName,
    initials: initialsOf(firstName, lastName),
    imageUrl: user?.hasImage ? user.imageUrl : null,
  };
}
