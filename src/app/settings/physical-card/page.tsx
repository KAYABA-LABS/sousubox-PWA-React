"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Package, Truck, MapPin } from "lucide-react";

export default function PhysicalCard() {
  const router = useRouter();
  const hasCard = true;

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

        <h1 className="text-2xl font-bold text-white mb-6">Physical Card</h1>

        {hasCard ? (
          <>
            <div className="bg-gradient-to-br from-[#00E660] to-[#00B84D] rounded-2xl p-6 text-black mb-6">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <p className="text-sm opacity-80 mb-1">Vaulta Debit Card</p>
                  <p className="font-semibold text-lg">John Doe</p>
                </div>
                <CreditCard className="w-8 h-8 opacity-80" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl tracking-wider">•••• •••• •••• 4242</p>
                <div className="flex gap-8 text-sm">
                  <div>
                    <p className="opacity-70">Valid Thru</p>
                    <p className="font-semibold">12/28</p>
                  </div>
                  <div>
                    <p className="opacity-70">CVV</p>
                    <p className="font-semibold">•••</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full bg-[#151A1F] rounded-xl p-4 hover:bg-[#1A1F25] transition-colors text-left">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-white font-medium">Replace Card</p>
                    <p className="text-sm text-gray-400">
                      Report lost or damaged card
                    </p>
                  </div>
                </div>
              </button>

              <button className="w-full bg-[#151A1F] rounded-xl p-4 hover:bg-[#1A1F25] transition-colors text-left">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      Update Shipping Address
                    </p>
                    <p className="text-sm text-gray-400">
                      Change delivery address
                    </p>
                  </div>
                </div>
              </button>

              <button className="w-full bg-[#151A1F] rounded-xl p-4 hover:bg-[#1A1F25] transition-colors text-left">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-white font-medium">Card PIN</p>
                    <p className="text-sm text-gray-400">Change or reset PIN</p>
                  </div>
                </div>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-[#151A1F] rounded-2xl p-6 text-center mb-6">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">
                No Physical Card
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Order a physical card for in-person purchases
              </p>
              <button className="bg-[#00E660] text-black px-6 py-3 rounded-xl font-medium hover:bg-[#00D055] transition-colors">
                Order Card - Free
              </button>
            </div>

            <div className="bg-[#151A1F] rounded-2xl p-4">
              <div className="flex gap-3 mb-3">
                <Truck className="w-5 h-5 text-[#00E660] shrink-0" />
                <div>
                  <p className="text-white font-medium mb-1">Free Delivery</p>
                  <p className="text-sm text-gray-400">
                    Receive your card within 5-7 business days
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
