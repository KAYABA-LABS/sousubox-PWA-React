"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function TransactionDetailPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0C0F14] flex flex-col items-center justify-center px-5">
      <p className="text-gray-400 mb-4">Transaction details are not available yet.</p>
      <button onClick={() => router.back()} className="text-[#00E660] hover:underline">
        <ArrowLeft className="inline-block w-4 h-4 mr-1" />
        Go back
      </button>
    </div>
  );
}
