"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function PayAmountPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col items-center justify-center px-5">
      <p className="text-gray-500 dark:text-gray-400 mb-4">Payment details are not available yet.</p>
      <button onClick={() => router.back()} className="text-[#0D4F3C] dark:text-[#156B53] hover:underline">
        <ArrowLeft className="inline-block w-4 h-4 mr-1" />
        Go back
      </button>
    </div>
  );
}
