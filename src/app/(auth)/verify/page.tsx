"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function VerifyPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/signin");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C0F14]">
      <Loader2 className="w-8 h-8 animate-spin text-[#00E660]" />
    </div>
  );
}
