"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SignInPageContent from "./page-content";

const devBypass = process.env.DEV_BYPASS === "true";

export default function SignInPage() {
  const router = useRouter();

  useEffect(() => {
    if (devBypass) {
      router.replace("/dashboard");
    }
  }, [router]);

  if (devBypass) {
    return null;
  }

  return <SignInPageContent />;
}
