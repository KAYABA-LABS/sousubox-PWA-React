"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { isDevMode } from "@/lib/dev";
import { useUserService } from "@/services/userService";

export default function PersonalSettings() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const databaseUserId = typeof user?.unsafeMetadata?.userId === "string" ? user.unsafeMetadata.userId : null;
  const userService = useUserService();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!databaseUserId && !isDevMode()) {
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
    if (!databaseUserId && !isDevMode()) return;
    setIsSaving(true);

    try {
      const [first, ...last] = fullName.trim().split(" ");
      const firstName = first || "";
      const lastName = last.join(" ") || "";

      await userService.updateUserProfile(databaseUserId || "", {
        firstName,
        lastName,
        phoneNumber: phone,
        email,
      });

      toast.success("Profile updated");
      router.push("/settings");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-sb-canvas flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sb-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-sb-canvas p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold text-sb-ink">
          Personal Information
        </h1>

        <div className="bg-sb-surface p-6 rounded-2xl space-y-4">
          <label className="text-sm text-sb-ink-2">Full name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-gray-50 dark:bg-sb-canvas rounded-xl p-3 text-sb-ink"
          />

          <label className="text-sm text-sb-ink-2">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-50 dark:bg-sb-canvas rounded-xl p-3 text-sb-ink"
          />

          <label className="text-sm text-sb-ink-2">Phone (optional)</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-gray-50 dark:bg-sb-canvas rounded-xl p-3 text-sb-ink"
          />

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-sb-brand-800 text-white px-4 py-2 rounded-xl"
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
              className="bg-transparent border border-sb-line px-4 py-2 rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
