"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Plus, Lock, Trash2 } from "lucide-react";

export default function VirtualCards() {
  const router = useRouter();

  const cards = [
    {
      id: 1,
      name: "Shopping Card",
      last4: "4242",
      limit: "$500",
      spent: "$127.40",
      status: "Active",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 2,
      name: "Subscription Card",
      last4: "8888",
      limit: "$200",
      spent: "$89.99",
      status: "Active",
      color: "from-blue-500 to-cyan-500",
    },
  ];

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

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Virtual Cards
            </h1>
            <p className="text-gray-400 text-sm">{cards.length} active cards</p>
          </div>
          <button className="flex items-center gap-2 bg-[#00E660] text-black px-4 py-2 rounded-xl font-medium hover:bg-[#00D055] transition-colors">
            <Plus className="w-4 h-4" />
            New Card
          </button>
        </div>

        <div className="space-y-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-[#151A1F] rounded-2xl p-5 space-y-4"
            >
              <div
                className={`bg-gradient-to-br ${card.color} rounded-xl p-4 text-white`}
              >
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-sm opacity-80">Virtual Card</p>
                    <p className="font-semibold text-lg">{card.name}</p>
                  </div>
                  <CreditCard className="w-6 h-6 opacity-80" />
                </div>
                <p className="text-xl tracking-wider">
                  •••• •••• •••• {card.last4}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Spending Limit</p>
                  <p className="text-white font-medium">{card.limit}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Total Spent</p>
                  <p className="text-white font-medium">{card.spent}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button className="flex-1 flex items-center justify-center gap-2 bg-white/5 text-white py-2 rounded-lg hover:bg-white/10 transition-colors">
                  <Lock className="w-4 h-4" />
                  Freeze
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-white/5 text-red-400 py-2 rounded-lg hover:bg-red-500/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
