import { ReactNode } from "react";
import { Shield } from "lucide-react";
import Link from "next/link";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1C1C1E] p-4 relative overflow-hidden">
      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(#2C2C2E 1px, transparent 1px), linear-gradient(90deg, #2C2C2E 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Radial Gradients */}
      <div
        className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-[#00E660]/10 blur-3xl animate-pulse"
        style={{ animationDuration: "8s" }}
      />
      <div
        className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full bg-[#00E660]/5 blur-3xl animate-pulse"
        style={{ animationDuration: "10s", animationDelay: "2s" }}
      />
      <div className="absolute top-1/2 left-10 w-64 h-64 rounded-full bg-[#00E660]/5 blur-3xl" />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-12 relative z-10" aria-label="Vaulta home">
        <div className="w-10 h-10 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <span className="font-semibold text-xl text-white">Vaulta</span>
      </Link>

      {/* Content */}
      <div className="w-full max-w-md relative z-10">{children}</div>

      {/* Footer */}
      <div className="mt-16 text-center relative z-10">
        <p className="text-sm text-muted-foreground">
          Protected by 256-bit encryption • SOC 2 Compliant
        </p>
      </div>
    </div>
  );
}
