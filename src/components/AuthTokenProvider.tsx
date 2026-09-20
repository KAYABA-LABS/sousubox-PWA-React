"use client";

import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { setApiUserIdGetter, setAuthTokenGetter } from "@/lib/api";
import { isDevMode } from "@/lib/dev";

export function AuthTokenProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    setAuthTokenGetter(() => getToken());
    setApiUserIdGetter(() => {
      const databaseUserId = user?.unsafeMetadata?.userId;
      if (typeof databaseUserId === "string") return databaseUserId;
      return isDevMode() ? process.env.NEXT_PUBLIC_DEV_USERID ?? null : null;
    });

    return () => {
      setAuthTokenGetter(() => Promise.resolve(null));
      setApiUserIdGetter(() => null);
    };
  }, [getToken, user]);

  return <>{children}</>;
}
