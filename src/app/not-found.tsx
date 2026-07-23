"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <main id="main-content" role="main" className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-5">
      <Card className="bg-white border-gray-200 p-8 text-center max-w-sm w-full">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-bold text-emerald-600">404</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-sm text-gray-500 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => router.back()} className="flex-1">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Button onClick={() => router.push("/dashboard")} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Home className="w-4 h-4" />
            Home
          </Button>
        </div>
      </Card>
    </main>
  );
}
