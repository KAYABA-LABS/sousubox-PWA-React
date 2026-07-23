import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthTokenProvider } from "@/components/AuthTokenProvider";
import { SWRegistration } from "@/components/SWRegistration";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "@/components/ui/sonner";
import "./Index.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SousuChain - Your Premium Digital Account",
  description:
    "A modern, secure space to manage your funds with clarity and confidence. Bank-level security meets exceptional design.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SousuChain",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FAFAFA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <ThemeProvider>
        <AuthTokenProvider>
          <html lang="en">
            <body
              className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
              <a href="#main-content" className="skip-link">
                Skip to main content
              </a>
              <div id="app-root">
                {children}
              </div>
              <Toaster position="top-center" theme="light" />
              <SWRegistration />
              <SpeedInsights />
            </body>
          </html>
        </AuthTokenProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
