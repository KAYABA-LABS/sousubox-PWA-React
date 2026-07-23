"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { isDevMode } from "@/lib/dev";

export default function PersonalSettings() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId && !isDevMode()) {
      router.push("/signin");
      return;
    }

    if (user) {
      const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "";
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFullName(name);
      setEmail(user.emailAddresses?.[0]?.emailAddress || "");
      setPhone(user.phoneNumbers?.[0]?.phoneNumber || "");
    }

    setIsLoading(false);
  }, [userId, isLoaded, user, router]);

  const handleSave = async () => {
    setIsSaving(true);
    // Clerk profile updates are handled through Clerk's own UI
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
    router.push("/settings");
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-[#0C0F14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00E660] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0C0F14] p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold text-white">
          Personal Information
        </h1>

        <div className="bg-[#151A1F] p-6 rounded-2xl space-y-4">
          <label className="text-sm text-gray-400">Full name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-[#0C0F14] rounded-xl p-3 text-white"
          />

          <label className="text-sm text-gray-400">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#0C0F14] rounded-xl p-3 text-white"
          />

          <label className="text-sm text-gray-400">Phone (optional)</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-[#0C0F14] rounded-xl p-3 text-white"
          />

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#00E660] text-black px-4 py-2 rounded-xl"
            >
              {isSaving ? (
                <>
                  <Loader2 className="inline-block w-4 h-4 animate-spin" />{" "}
                  Saving...
                </>
              ) : (
                <>
                  Save <Check className="inline-block w-4 h-4 ml-2" />
                </>
              )}
            </button>
            <button
              onClick={() => router.push("/settings")}
              className="bg-transparent border border-white/10 px-4 py-2 rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
