"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SignUpPageContent from "./page-content";

const devBypass = process.env.DEV_BYPASS === "true";

export default function SignUpPage() {
  const router = useRouter();

  useEffect(() => {
    if (devBypass) {
      router.replace("/dashboard");
    }
  }, [router]);

  if (devBypass) {
    return null;
  }

  return <SignUpPageContent />;
}
