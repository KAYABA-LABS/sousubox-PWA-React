"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { toast } from "sonner";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    toast.error(error.message || "Something went wrong");
  }, [error]);

  return (
    <main id="main-content" role="main" className="min-h-screen bg-[#FBF6EF] dark:bg-[#0C0F14] flex flex-col items-center justify-center px-5">
      <Card className="bg-white dark:bg-[#151A1F] border-gray-200 dark:border-white/10 p-8 text-center max-w-sm w-full">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-[#0C0F14] dark:text-white mb-2">Something Went Wrong</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => reset()} className="flex-1">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button onClick={() => router.push("/dashboard")} className="flex-1 bg-[#0D4F3C] hover:bg-[#156B53] text-white">
            <Home className="w-4 h-4" />
            Home
          </Button>
        </div>
      </Card>
    </main>
  );
}
