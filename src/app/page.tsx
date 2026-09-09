"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { isLoaded, userId, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      router.replace("/dashboard");
    } else {
      const hasSeenOnboarding = localStorage.getItem("sousuchain_onboarded");
      if (hasSeenOnboarding) {
        router.replace("/signin");
      } else {
        router.replace("/splash");
      }
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#0D4F3C] dark:text-[#156B53]" />
    </div>
  );
}
