"use client";

import { useEffect } from "react";
import { setAuthTokenGetter } from "@/lib/api";

const devBypass = process.env.DEV_BYPASS === "true";

let Clerk: any = null;
if (!devBypass) {
  Clerk = require("@clerk/nextjs");
}

export function AuthTokenProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    setAuthTokenGetter(() => Promise.resolve(null));
  }, []);

  return <>{children}</>;
}
