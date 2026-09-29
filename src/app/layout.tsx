import type { Metadata, Viewport } from "next";
import { Ubuntu } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthTokenProvider } from "@/components/AuthTokenProvider";
import { SWRegistration } from "@/components/SWRegistration";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "@/components/ui/sonner";
import "./Index.css";

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sousubox - Your Premium Digital Account",
  description:
    "A modern, secure space to manage your funds with clarity and confidence. Bank-level security meets exceptional design.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sousubox",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FAFAFA",
};

const devBypass = process.env.NEXT_PUBLIC_DEV_BYPASS === "true";

if (devBypass && typeof window === "undefined") {
  // Server-side: log that bypass is active
  console.log("[DEV] Clerk authentication bypassed");
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <ThemeProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${ubuntu.variable} antialiased`}
        >
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <div id="app-root">
            {children}
          </div>
          <Toaster position="top-center" />
          <SWRegistration />
          <SpeedInsights />
        </body>
      </html>
    </ThemeProvider>
  );

  // if (devBypass) return content;

  return (
    <ClerkProvider>
      <AuthTokenProvider>{content}</AuthTokenProvider>
    </ClerkProvider>
  );
}
