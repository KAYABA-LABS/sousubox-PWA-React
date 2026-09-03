"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ArrowLeft,
  Save,
  Check,
  Loader2,
  Lock,
} from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { isDevMode } from "@/lib/dev";
import { useUserService } from "@/services/userService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ProfileSettings() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const userService = useUserService();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form Fields
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

    const loadProfileData = async () => {
      try {
        if (userId || isDevMode()) {
          const profile = await userService.getUserProfile(userId || "");
          
          const backendName = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
          setFullName(backendName || (user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : ""));
          setEmail(profile.email || user?.emailAddresses?.[0]?.emailAddress || "");
          setPhone(profile.phoneNumber || user?.phoneNumbers?.[0]?.phoneNumber || "");
          setDateOfBirth(profile.dateOfBirth || "");

          if (profile.address) {
            if (typeof profile.address === "object") {
              setAddress(profile.address.street || "");
            } else {
              try {
                const parsed = JSON.parse(profile.address);
                setAddress(parsed.street || profile.address);
              } catch {
                setAddress(profile.address);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile from backend:", err);
        // Fallback to Clerk data
        if (user) {
          const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "";
          setFullName(name);
          setEmail(user.emailAddresses?.[0]?.emailAddress || "");
          setPhone(user.phoneNumbers?.[0]?.phoneNumber || "");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [userId, isLoaded, user, router, userService]);

  const handleSave = async () => {
    if (!userId && !isDevMode()) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const [first, ...last] = fullName.trim().split(" ");
      const firstName = first || "";
      const lastName = last.join(" ") || "";

      await userService.updateUserProfile(userId || "", {
        firstName,
        lastName,
        phoneNumber: phone,
        dateOfBirth,
        address: JSON.stringify({ street: address }),
      });

      setSaveSuccess(true);
      toast.success("Profile saved successfully");
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0C0F14] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,230,96,0.05),transparent_60%)]" />
        <Loader2 className="w-8 h-8 border-2 border-[#00E660] border-t-transparent rounded-full animate-spin z-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0F14] text-white p-6 pb-32 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,230,96,0.06),transparent_60%)] pointer-events-none" />

      <div className="max-w-2xl mx-auto z-10 relative">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-semibold">Settings</span>
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Profile
            </h1>
            <p className="text-zinc-500 text-sm">Update your personal details below.</p>
          </div>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 text-[#00E660] text-sm bg-[#00E660]/10 border border-[#00E660]/20 px-3 py-1.5 rounded-full font-semibold"
            >
              <Check className="w-4 h-4" />
              Saved
            </motion.div>
          )}
        </div>

        <Card className="bg-white/[0.02] border-white/[0.08] backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
          <CardHeader className="border-b border-white/[0.04] p-6 bg-white/[0.01]">
            <CardTitle className="text-lg font-bold text-white">Personal Information</CardTitle>
            <CardDescription className="text-zinc-400 text-xs mt-1">
              Your details are stored securely. Some fields are locked to match verified identity credentials.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <User className="w-4 h-4 text-zinc-400" />
                <span>Full Name</span>
              </Label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15] focus:border-[#00E660] text-white placeholder-zinc-500 rounded-xl h-11 transition-all"
              />
            </div>

            {/* Email (Read Only - Locked) */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <Mail className="w-4 h-4 text-zinc-400" />
                <span className="flex items-center gap-1.5">
                  Email Address
                  <Lock className="w-3 h-3 text-zinc-500" />
                </span>
              </Label>
              <Input
                type="email"
                value={email}
                disabled
                className="bg-white/[0.01] border-white/[0.04] text-zinc-500 rounded-xl h-11 cursor-not-allowed select-none"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <Phone className="w-4 h-4 text-zinc-400" />
                <span>Phone Number</span>
              </Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15] focus:border-[#00E660] text-white placeholder-zinc-500 rounded-xl h-11 transition-all"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <span>Date of Birth</span>
              </Label>
              <Input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15] focus:border-[#00E660] text-white rounded-xl h-11 transition-all [color-scheme:dark]"
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-zinc-400" />
                <span>Physical Address</span>
              </Label>
              <Textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your address"
                rows={3}
                className="bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15] focus:border-[#00E660] text-white placeholder-zinc-500 rounded-xl transition-all resize-none p-3"
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-[#00E660] to-[#00C850] hover:from-[#00FF6A] hover:to-[#00D957] text-black font-bold h-12 rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(0,230,96,0.2)] hover:shadow-[0_4px_25px_rgba(0,230,96,0.35)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-black" />
                  <span>Save Profile</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
