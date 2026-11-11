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
    <main id="main-content" role="main" className="min-h-screen bg-sb-canvas flex flex-col items-center justify-center px-5">
      <Card className="bg-sb-surface border-sb-line p-8 text-center max-w-sm w-full">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-sb-ink mb-2">Something Went Wrong</h1>
        <p className="text-sm text-sb-ink-2 mb-6">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => reset()} className="flex-1">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button onClick={() => router.push("/dashboard")} className="flex-1 bg-sb-brand-800 hover:bg-sb-brand-700 text-white">
            <Home className="w-4 h-4" />
            Home
          </Button>
        </div>
      </Card>
    </main>
  );
}
