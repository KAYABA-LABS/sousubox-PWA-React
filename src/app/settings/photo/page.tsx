"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Loader2, Upload } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { isDevMode } from "@/lib/dev";
import { useUserService } from "@/services/userService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_DIMENSION = 512;

// Downscale to MAX_DIMENSION and re-encode as JPEG so phone photos upload quickly
async function resizeImage(file: File): Promise<Blob | null> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function ProfilePhotoSettings() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const databaseUserId = typeof user?.unsafeMetadata?.userId === "string" ? user.unsafeMetadata.userId : null;
  const userService = useUserService();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [initials, setInitials] = useState("U");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!databaseUserId && !isDevMode()) {
      router.push("/signin");
      return;
    }

    const loadProfile = async () => {
      try {
        const profile = await userService.getUserProfile(databaseUserId || "");
        setCurrentPhotoUrl(profile.photoUrl || null);
        const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ")
          || [user?.firstName, user?.lastName].filter(Boolean).join(" ");
        const parts = name.trim().split(" ").filter(Boolean);
        if (parts.length) {
          setInitials(
            (parts[0].charAt(0) + (parts.length > 1 ? parts[parts.length - 1].charAt(0) : "")).toUpperCase()
          );
        }
      } catch (err) {
        console.error("Failed to load profile photo:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId, isLoaded, user, router, userService]);

  // Release the preview object URL when it changes or on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      clearSelection();
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be 10 MB or smaller");
      clearSelection();
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!databaseUserId && !isDevMode()) {
      router.push("/signin");
      return;
    }
    if (!selectedFile) {
      toast.error("Please choose a photo");
      return;
    }

    setIsUploading(true);
    try {
      const blob = await resizeImage(selectedFile);
      if (!blob || blob.size === 0) {
        toast.error("Could not process image");
        return;
      }

      const uid = databaseUserId || "dev";
      const newPhotoUrl = await userService.updateUserProfilePhoto(uid, blob, `${uid}-${Date.now()}.jpg`);
      setCurrentPhotoUrl(newPhotoUrl);
      toast.success("Profile photo updated");
      router.push("/settings");
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0D4F3C] dark:border-[#156B53] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayUrl = previewUrl || currentPhotoUrl;

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] text-[#0C0F14] dark:text-white p-6 pb-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(13,79,60,0.06),transparent_60%)] pointer-events-none" />

      <div className="max-w-xl mx-auto z-10 relative">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-[#0C0F14] dark:hover:text-white mb-8 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-semibold">Settings</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Profile Photo</h1>
          <p className="text-zinc-400 dark:text-zinc-500 text-sm">Choose a new photo for your account.</p>
        </div>

        <div className="bg-white dark:bg-[#151A1F] border border-black/[0.04] dark:border-white/10 rounded-[24px] p-6 flex flex-col items-center gap-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-black/20">
          <Avatar className="w-32 h-32">
            {displayUrl && <AvatarImage key={displayUrl} src={displayUrl} alt="Profile photo" className="object-cover" />}
            <AvatarFallback className="bg-[#0D4F3C] text-4xl font-bold text-white select-none">
              {initials}
            </AvatarFallback>
          </Avatar>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-full space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full h-11 rounded-full font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              {selectedFile ? "Choose Another Photo" : "Choose Photo"}
            </Button>

            <Button
              type="button"
              onClick={handleSave}
              disabled={!selectedFile || isUploading}
              className="w-full h-11 rounded-full bg-[#0D4F3C] hover:bg-[#0D4F3C]/90 dark:bg-[#156B53] dark:hover:bg-[#156B53]/90 text-white font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {isUploading ? "Uploading..." : "Save Photo"}
            </Button>
          </div>

          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center">
            JPG, PNG or WebP, up to 10 MB.
          </p>
        </div>
      </div>
    </div>
  );
}
