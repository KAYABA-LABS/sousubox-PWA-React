"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, Mail, Phone } from "lucide-react";

export default function ContactSupport() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0C0F14] p-6 pb-32">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Settings</span>
        </button>
        <h1 className="text-2xl font-bold text-white mb-6">Contact Support</h1>
        <div className="space-y-3">
          <button className="w-full bg-[#151A1F] rounded-xl p-5 flex items-center gap-4 hover:bg-[#1A1F25] transition-colors">
            <div className="w-12 h-12 bg-[#00E660]/10 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-[#00E660]" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-white font-semibold">Live Chat</h3>
              <p className="text-sm text-gray-400">Average response: 2 min</p>
            </div>
          </button>
          <button className="w-full bg-[#151A1F] rounded-xl p-5 flex items-center gap-4 hover:bg-[#1A1F25] transition-colors">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-white font-semibold">Email Support</h3>
              <p className="text-sm text-gray-400">support@vaulta.app</p>
            </div>
          </button>
          <button className="w-full bg-[#151A1F] rounded-xl p-5 flex items-center gap-4 hover:bg-[#1A1F25] transition-colors">
            <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
              <Phone className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-white font-semibold">Phone Support</h3>
              <p className="text-sm text-gray-400">1-800-VAULTA (24/7)</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
