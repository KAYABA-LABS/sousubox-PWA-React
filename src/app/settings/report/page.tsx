"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";

export default function ReportProblem() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] p-6 pb-32">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-[#0C0F14] dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Settings</span>
        </button>
        <h1 className="text-2xl font-bold text-[#0C0F14] dark:text-white mb-6">Report a Problem</h1>
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#151A1F] rounded-2xl p-4">
            <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#0C0F14] rounded-xl p-3 text-[#0C0F14] dark:text-white border border-black/10 dark:border-white/10 focus:border-[#0D4F3C] dark:focus:border-[#156B53] focus:outline-none"
            >
              <option value="">Select a category</option>
              <option value="technical">Technical Issue</option>
              <option value="payment">Payment Problem</option>
              <option value="account">Account Issue</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="bg-white dark:bg-[#151A1F] rounded-2xl p-4">
            <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem..."
              className="w-full bg-gray-50 dark:bg-[#0C0F14] rounded-xl p-3 text-[#0C0F14] dark:text-white h-32 resize-none border border-black/10 dark:border-white/10 focus:border-[#0D4F3C] dark:focus:border-[#156B53] focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
          <button className="w-full bg-[#0D4F3C] text-white font-medium py-3 rounded-xl hover:bg-[#156B53] transition-colors flex items-center justify-center gap-2">
            <Send className="w-4 h-4" />
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}
