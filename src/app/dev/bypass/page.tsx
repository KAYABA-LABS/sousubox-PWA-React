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
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Bypassing auth...</span>
      </div>
    </div>
  );
}
