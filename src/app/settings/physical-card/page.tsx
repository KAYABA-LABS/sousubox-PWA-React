"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard } from "lucide-react";

export default function PhysicalCard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0C0F14] p-6 pb-32">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.push("/settings")} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span>Settings</span>
        </button>
        <div className="bg-[#151A1F] rounded-2xl p-6 text-center">
          <CreditCard className="w-8 h-8 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Physical Card</h1>
          <p className="text-gray-400">Card information is not available from the backend yet.</p>
        </div>
      </div>
    </div>
  );
}
