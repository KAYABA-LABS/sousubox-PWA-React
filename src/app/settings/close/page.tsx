"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import { useClerk } from "@clerk/nextjs";

export default function CloseAccount() {
  const router = useRouter();
  const { signOut } = useClerk();
  const [confirmation, setConfirmation] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const handleClose = async () => {
    if (confirmation.toLowerCase() !== "close my account") {
      setShowWarning(true);
      return;
    }
    setIsClosing(true);
    // In production, this would trigger account closure workflow
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await signOut();
    router.push("/");
  };

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

        <h1 className="text-2xl font-bold text-white mb-6">Close Account</h1>

        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-6">
          <div className="flex gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
            <div>
              <h3 className="text-white font-semibold mb-2">
                Warning: This action cannot be undone
              </h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• All your data will be permanently deleted</li>
                <li>• Your account balance must be $0.00</li>
                <li>• You will lose access to all services</li>
                <li>• Pending transactions will be cancelled</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-[#151A1F] rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Type &quot;CLOSE MY ACCOUNT&quot; to confirm
            </label>
            <input
              type="text"
              value={confirmation}
              onChange={(e) => {
                setConfirmation(e.target.value);
                setShowWarning(false);
              }}
              className="w-full bg-[#0C0F14] rounded-xl p-3 text-white border border-white/10 focus:border-red-500 focus:outline-none transition-colors"
              placeholder="Type here..."
            />
            {showWarning && (
              <p className="text-red-500 text-sm mt-2">
                Please type the exact phrase to continue
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isClosing || !confirmation}
              className="flex-1 bg-red-500 text-white font-medium py-3 rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isClosing ? (
                <>
                  <Loader2 className="inline-block w-4 h-4 animate-spin mr-2" />
                  Closing...
                </>
              ) : (
                "Close Account"
              )}
            </button>
            <button
              onClick={() => router.push("/settings")}
              className="px-6 bg-white/5 text-white font-medium py-3 rounded-xl hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Need help? Contact support before closing your account.
        </p>
      </div>
    </div>
  );
}
