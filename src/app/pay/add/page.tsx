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
    <div className="min-h-screen bg-[#0C0F14] flex flex-col">
      {/* Header */}
      <header className="bg-[#0C0F14] px-5 pt-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-white">Add biller</h1>
            <p className="text-sm text-gray-400">Enter biller details</p>
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
            <div className="w-20 h-20 rounded-full bg-[#151A1F] border-2 border-white/10 flex items-center justify-center">
              <Building2
                className="w-10 h-10 text-gray-600"
                strokeWidth={1.5}
              />
            </div>
          </div>

          {/* Biller Name */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
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
              className={`w-full bg-[#151A1F] border ${
                errors.name ? "border-red-500" : "border-white/10"
              } rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00E660] transition-colors`}
            />
            {errors.name && (
              <p className="text-xs text-red-400 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Account/Reference Number */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
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
              className={`w-full bg-[#151A1F] border ${
                errors.accountNumber ? "border-red-500" : "border-white/10"
              } rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00E660] transition-colors`}
            />
            {errors.accountNumber && (
              <p className="text-xs text-red-400 mt-1">
                {errors.accountNumber}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full bg-[#151A1F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00E660] transition-colors"
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
          className="w-full bg-[#00E660] hover:bg-[#00cc55] disabled:bg-white/10 disabled:text-gray-500 text-black font-semibold py-4 rounded-xl transition-colors disabled:cursor-not-allowed"
        >
          Save biller
        </button>
        <button
          onClick={() => router.back()}
          className="w-full bg-transparent border border-white/10 hover:bg-white/5 text-white font-medium py-4 rounded-xl transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
