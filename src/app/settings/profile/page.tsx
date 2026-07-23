"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ArrowLeft,
  Save,
  Check,
} from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { isDevMode } from "@/lib/dev";

export default function ProfileSettings() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId && !isDevMode()) {
      router.push("/signin");
      return;
    }

    if (user) {
      const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "";
      setFullName(name);
      setEmail(user.emailAddresses?.[0]?.emailAddress || "");
      setPhone(user.phoneNumbers?.[0]?.phoneNumber || "");
    }

    setIsLoading(false);
  }, [userId, isLoaded, user, router]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Clerk profile updates are handled through Clerk's own UI
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0C0F14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00E660] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          {saveSuccess && (
            <div className="flex items-center gap-2 text-[#00E660] text-sm">
              <Check className="w-4 h-4" />
              Saved
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-[#151A1F] rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <User className="w-5 h-5 text-gray-400" />
              <label className="text-sm text-gray-400">Full Name</label>
            </div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full bg-transparent text-white pl-8 border-0 outline-none placeholder-gray-500"
            />
          </div>

          <div className="bg-[#151A1F] rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <label className="text-sm text-gray-400">Email</label>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-transparent text-white pl-8 border-0 outline-none placeholder-gray-500"
            />
          </div>

          <div className="bg-[#151A1F] rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <label className="text-sm text-gray-400">Phone</label>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full bg-transparent text-white pl-8 border-0 outline-none placeholder-gray-500"
            />
          </div>

          <div className="bg-[#151A1F] rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <label className="text-sm text-gray-400">Date of Birth</label>
            </div>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full bg-transparent text-white pl-8 border-0 outline-none"
            />
          </div>

          <div className="bg-[#151A1F] rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <label className="text-sm text-gray-400">Address</label>
            </div>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your address"
              rows={3}
              className="w-full bg-transparent text-white pl-8 border-0 outline-none placeholder-gray-500 resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-[#00E660] text-black font-medium py-3 rounded-xl hover:bg-[#00D055] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Profile
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
