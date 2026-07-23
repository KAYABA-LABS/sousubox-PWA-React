"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Plus, User, ChevronRight } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { isDevMode } from "@/lib/dev";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Recipient = { id: string; name: string; email: string; avatar: string };

const recentRecipients: Recipient[] = [
  { id: "1", name: "Sarah Johnson", email: "sarah.j@email.com", avatar: "SJ" },
  { id: "2", name: "Mike Chen", email: "mike.chen@email.com", avatar: "MC" },
  { id: "3", name: "Emily Davis", email: "emily.d@email.com", avatar: "ED" },
];

export default function SendPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const [balance, setBalance] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [canProceed, setCanProceed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId && !isDevMode()) {
      router.push("/signin");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBalance(0);
    setCanProceed(false);
    setIsLoading(false);
  }, [userId, isLoaded, user, router]);

  const handleSelectRecipient = (recipient: Recipient) => {
    if (!canProceed) {
      toast.error("You need to deposit at least $350 before you can send money.");
      return;
    }
    router.push(
      `/send/amount?recipient=${encodeURIComponent(JSON.stringify(recipient))}`
    );
  };

  const handleNewRecipient = () => {
    if (!canProceed) {
      toast.error("You need to deposit at least $350 before you can send money.");
      return;
    }
    router.push("/send/new-recipient");
  };

  const filteredRecipients = recentRecipients.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0C0F14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00E660] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main id="main-content" role="main" className="min-h-screen bg-[#0C0F14] flex flex-col">
      <header role="banner" className="bg-[#0C0F14] px-5 pt-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-4 mb-4">
          <Button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2} />
          </Button>
          <h1 className="text-xl font-semibold text-white">Send Money</h1>
        </div>

        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            strokeWidth={2}
          />
          <Input
            type="text"
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#151A1F] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00E660] transition-colors"
          />
        </div>
      </header>

      <main className="flex-1 px-5 py-6 overflow-auto">
        {!canProceed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-6"
          >
            <p className="text-sm text-yellow-500">
              ⚠️ Deposit at least $350 to unlock sending. Current balance: $
              {balance.toFixed(2)}
            </p>
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleNewRecipient}
          className="w-full bg-[#00E660] hover:bg-[#00cc55] disabled:bg-white/10 rounded-2xl p-4 flex items-center gap-3 mb-6 transition-colors disabled:cursor-not-allowed"
          disabled={!canProceed}
        >
          <div className="w-12 h-12 rounded-full bg-black/20 flex items-center justify-center">
            <Plus className="w-6 h-6 text-black" strokeWidth={2} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-black">New Recipient</p>
            <p className="text-xs text-black/70">Send to someone new</p>
          </div>
          <ChevronRight className="w-5 h-5 text-black" strokeWidth={2} />
        </motion.button>

        <div>
          <h2 className="text-sm font-medium text-gray-400 mb-3 px-1">
            Recent
          </h2>
          <div className="space-y-2">
            {filteredRecipients.map((recipient, index) => (
              <motion.button
                key={recipient.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelectRecipient(recipient)}
                disabled={!canProceed}
                className="w-full bg-[#151A1F] hover:bg-[#1A1F25] disabled:opacity-50 rounded-2xl p-4 flex items-center gap-3 transition-colors group disabled:cursor-not-allowed"
              >
                <div className="w-12 h-12 rounded-full bg-[#00E660] flex items-center justify-center text-black font-bold">
                  {recipient.avatar}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white">
                    {recipient.name}
                  </p>
                  <p className="text-xs text-gray-400">{recipient.email}</p>
                </div>
                <ChevronRight
                  className="w-5 h-5 text-gray-500 group-hover:text-gray-400 transition-colors"
                  strokeWidth={2}
                />
              </motion.button>
            ))}
          </div>
        </div>

        {filteredRecipients.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <User
              className="w-12 h-12 text-gray-600 mx-auto mb-3"
              strokeWidth={1.5}
            />
            <p className="text-gray-400">No recipients found</p>
          </div>
        )}
      </main>
    </main>
  );
}
