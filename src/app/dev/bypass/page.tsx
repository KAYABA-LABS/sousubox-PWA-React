"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DevBypassPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-sb-canvas flex items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-sb-ink-3">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Bypassing auth...</span>
      </div>
    </div>
  );
}
