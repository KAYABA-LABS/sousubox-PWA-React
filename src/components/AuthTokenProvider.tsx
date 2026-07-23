"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { setAuthTokenGetter } from "@/lib/api";

export function AuthTokenProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    setAuthTokenGetter(getToken);
  }, [getToken]);

  return <>{children}</>;
}
