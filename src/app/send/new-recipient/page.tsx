"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User } from "lucide-react";

type FormErrors = { name?: string; email?: string; note?: string };

export default function NewRecipientPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    note: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const recipient = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        avatar: formData.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
      };
      router.push(
        `/send/amount?recipient=${encodeURIComponent(
          JSON.stringify(recipient)
        )}`
      );
    }
  };

  const canSubmit =
    formData.name.trim() && formData.email.trim() && !errors.email;

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col">
      {/* Header */}
      <header className="bg-[#FBF6EF] dark:bg-[#0C0F14] px-5 pt-6 pb-4 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#0C0F14] dark:text-white" strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-[#0C0F14] dark:text-white">New recipient</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enter recipient details</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Avatar Preview */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-white dark:bg-[#151A1F] border-2 border-black/10 dark:border-white/10 flex items-center justify-center">
              {formData.name ? (
                <span className="text-2xl font-bold text-[#0C0F14] dark:text-white">
                  {formData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </span>
              ) : (
                <User className="w-10 h-10 text-gray-400 dark:text-gray-600" strokeWidth={1.5} />
              )}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Full name *
            </label>
            <input
              type="text"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              className={`w-full bg-white dark:bg-[#151A1F] border ${
                errors.name ? "border-red-500" : "border-black/10 dark:border-white/10"
              } rounded-xl px-4 py-3 text-[#0C0F14] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#0D4F3C] dark:focus:border-[#156B53] transition-colors`}
            />
            {errors.name && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Email address *
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              onBlur={() => {
                if (formData.email && !validateEmail(formData.email)) {
                  setErrors({ ...errors, email: "Invalid email format" });
                }
              }}
              className={`w-full bg-white dark:bg-[#151A1F] border ${
                errors.email ? "border-red-500" : "border-black/10 dark:border-white/10"
              } rounded-xl px-4 py-3 text-[#0C0F14] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#0D4F3C] dark:focus:border-[#156B53] transition-colors`}
            />
            {errors.email && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Friend, Work colleague"
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              className="w-full bg-white dark:bg-[#151A1F] border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-[#0C0F14] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-[#0D4F3C] dark:focus:border-[#156B53] transition-colors"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Add a nickname or note for this recipient
            </p>
          </div>
        </motion.div>
      </main>

      {/* Sticky Bottom Actions */}
      <div className="px-5 pb-8 space-y-3">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full bg-[#0D4F3C] hover:bg-[#156B53] disabled:bg-black/10 dark:disabled:bg-white/10 disabled:text-gray-400 dark:disabled:text-gray-500 text-white font-semibold py-4 rounded-xl transition-colors disabled:cursor-not-allowed"
        >
          Save recipient
        </button>
        <button
          onClick={() => router.back()}
          className="w-full bg-transparent border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[#0C0F14] dark:text-white font-medium py-4 rounded-xl transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
