"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { isDevMode } from "@/lib/dev";

interface RouteGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function RouteGuard({
  children,
  redirectTo = "/signin",
}: RouteGuardProps) {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!userId && !isDevMode()) {
      router.push(redirectTo);
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthorized(true);
  }, [isLoaded, userId, redirectTo, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0C0F14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0D4F3C] dark:border-[#156B53] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
