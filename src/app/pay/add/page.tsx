"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2 } from "lucide-react";

const categories = [
  "Utilities",
  "Telecom",
  "Insurance",
  "Subscriptions",
  "Other",
];

export default function AddBillerPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    accountNumber: "",
    category: categories[0],
  });
  type FormErrors = { name?: string; accountNumber?: string };
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Biller name is required";
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // In a real app, save biller to database
      router.push("/pay");
    }
  };

  const canSubmit = formData.name.trim() && formData.accountNumber.trim();

  return (
    <div className="min-h-screen bg-sb-canvas flex flex-col">
      {/* Header */}
      <header className="bg-sb-canvas px-5 pt-6 pb-4 border-b border-sb-line">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-sb-surface-2 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-sb-ink" strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-sb-ink">Add biller</h1>
            <p className="text-sm text-sb-ink-2">Enter biller details</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Icon Preview */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-sb-surface border-2 border-sb-line flex items-center justify-center">
              <Building2
                className="w-10 h-10 text-sb-ink-3"
                strokeWidth={1.5}
              />
            </div>
          </div>

          {/* Biller Name */}
          <div>
            <label className="block text-sm font-medium text-sb-ink-2 mb-2">
              Biller name *
            </label>
            <input
              type="text"
              placeholder="e.g., Electric Company"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              className={`w-full bg-sb-surface border ${
                errors.name ? "border-red-500" : "border-sb-line"
              } rounded-xl px-4 py-3 text-sb-ink placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-sb-brand-600 transition-colors`}
            />
            {errors.name && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Account/Reference Number */}
          <div>
            <label className="block text-sm font-medium text-sb-ink-2 mb-2">
              Account/Reference number *
            </label>
            <input
              type="text"
              placeholder="Enter account number"
              value={formData.accountNumber}
              onChange={(e) => {
                setFormData({ ...formData, accountNumber: e.target.value });
                if (errors.accountNumber)
                  setErrors({ ...errors, accountNumber: undefined });
              }}
              className={`w-full bg-sb-surface border ${
                errors.accountNumber ? "border-red-500" : "border-sb-line"
              } rounded-xl px-4 py-3 text-sb-ink placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-sb-brand-600 transition-colors`}
            />
            {errors.accountNumber && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {errors.accountNumber}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-sb-ink-2 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full bg-sb-surface border border-sb-line rounded-xl px-4 py-3 text-sb-ink focus:outline-none focus:border-sb-brand-600 transition-colors"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </motion.div>
      </main>

      {/* Sticky Bottom Actions */}
      <div className="px-5 pb-8 space-y-3">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full bg-sb-brand-800 hover:bg-sb-brand-700 disabled:bg-black/10 dark:disabled:bg-white/10 disabled:text-gray-400 dark:disabled:text-gray-500 text-white font-semibold py-4 rounded-xl transition-colors disabled:cursor-not-allowed"
        >
          Save biller
        </button>
        <button
          onClick={() => router.back()}
          className="w-full bg-transparent border border-sb-line hover:bg-black/5 dark:hover:bg-white/5 text-sb-ink font-medium py-4 rounded-xl transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
