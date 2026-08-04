"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DevSignIn() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0C0F14] flex items-center justify-center">
      <div className="text-white text-center">
        <p className="text-lg mb-2">Dev Mode: Signing in...</p>
        <p className="text-sm text-gray-500">Bypassing Clerk auth</p>
      </div>
    </div>
  );
}
