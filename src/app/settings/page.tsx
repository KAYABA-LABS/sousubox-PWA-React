"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dock } from "@/components/dashboard/Dock";
import {
  User,
  UserX,
  Lock,
  Eye,
  CreditCard,
  Snowflake,
  Landmark,
  Plus,
  Bell,
  Mail,
  MessageSquare,
  Moon,
  TrendingUp,
  ArrowUpDown,
  Banknote,
  Store,
  Ban,
  FileCheck,
  Receipt,
  FileSignature,
  Download,
  Languages,
  DollarSign,
  Palette,
  Settings as SettingsIcon,
  Database,
  HelpCircle,
  Phone,
  AlertCircle,
  ScrollText,
  ShieldCheck,
  Info,
  LogOut,
  ChevronRight,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { useAuth, useUser, useClerk } from "@clerk/nextjs";
import { isDevMode } from "@/lib/dev";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useKycService } from "@/services/kycService";

export default function Settings() {
  const router = useRouter();
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const kycService = useKycService();

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userInitials, setUserInitials] = useState("U");
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [kycStatusStr, setKycStatusStr] = useState("NOT_SUBMITTED");

  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(" ");
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  useEffect(() => {
    if (!isLoaded) return;

    if (user) {
      const email = user.emailAddresses?.[0]?.emailAddress || "";
      setUserEmail(email);

      let displayName = "User";
      let initials = "U";

      if (user.firstName) {
        displayName = user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.firstName;
        initials = getInitials(displayName);
      } else if (email) {
        const username = email.split("@")[0];
        displayName = username
          .split(/[._-]/)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ");
        initials = getInitials(displayName);
      }

      setUserName(displayName);
      setUserInitials(initials);

      // Load actual KYC status from the backend
      const loadKyc = async () => {
        try {
          const kycRes = await kycService.getStatus(user.id);
          setIsVerified(kycRes.status === "VERIFIED");
          setKycStatusStr(kycRes.status);
        } catch (err) {
          console.error("Failed to load KYC status in settings:", err);
        }
      };
      loadKyc();
    }

    setIsLoading(false);
  }, [isLoaded, user, kycService]);

  const handleLogout = async () => {
    await signOut();
    if (!isDevMode()) {
      router.push("/signin");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0C0F14] flex items-center justify-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,230,96,0.05),transparent_60%)]" />
        <div className="w-8 h-8 border-2 border-[#00E660] border-t-transparent rounded-full animate-spin z-10" />
      </div>
    );
  }

  return (
    <main
      id="main-content"
      role="main"
      className="min-h-screen bg-[#0C0F14] text-white flex flex-col px-6 pt-8 pb-32 relative overflow-hidden"
    >
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,230,96,0.06),transparent_60%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-zinc-500 text-sm">Manage your profile, cards, notifications and application preferences.</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-8"
      >
        <div
          onClick={() => router.push("/settings/profile")}
          className="bg-white/[0.02] border border-white/[0.08] backdrop-blur-md rounded-2xl p-6 hover:bg-white/[0.05] transition-all duration-300 w-full flex items-center justify-between cursor-pointer group hover:shadow-[0_0_30px_rgba(0,230,96,0.08)]"
        >
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00E660] to-[#00B84D] flex items-center justify-center shadow-[0_0_20px_rgba(0,230,96,0.3)] group-hover:scale-105 transition-transform duration-300">
              <span className="text-xl font-bold text-black select-none">
                {userInitials}
              </span>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2.5">
                <p className="text-lg font-bold text-white tracking-tight">{userName}</p>
                {isVerified ? (
                  <div className="flex items-center gap-1 bg-[#00E660]/10 border border-[#00E660]/20 rounded-full px-2 py-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00E660]" />
                    <span className="text-[10px] text-[#00E660] font-semibold uppercase tracking-wider">Verified</span>
                  </div>
                ) : (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push("/kyc");
                    }}
                    className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 rounded-full px-2 py-0.5 cursor-pointer hover:bg-rose-500/20 transition-all"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-[10px] text-rose-500 font-semibold uppercase tracking-wider">Verify Identity</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-zinc-400 mt-1 font-medium">{userEmail}</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
        </div>
      </motion.div>

      {/* Settings Sections */}
      <div className="space-y-8 max-w-4xl">
        <SettingsSection title="Account">
          <SettingsRow
            icon={<User className="w-5 h-5" />}
            label="Personal Information"
            subtitle="Update your name, email, phone, and address"
            onClick={() => router.push("/settings/profile")}
          />
          <SettingsRow
            icon={<CheckCircle2 className="w-5 h-5" />}
            label="Identity Verification (KYC)"
            subtitle="Unlock exclusive features & limits"
            badge={isVerified ? "Verified" : kycStatusStr === "NOT_SUBMITTED" ? "Get Started" : kycStatusStr}
            badgeColor={isVerified ? "emerald" : kycStatusStr === "NOT_SUBMITTED" ? "amber" : "neutral"}
            onClick={() => router.push("/kyc")}
          />
          <SettingsRow
            icon={<UserX className="w-5 h-5" />}
            label="Close Account"
            destructive
            onClick={() => router.push("/settings/close")}
          />
        </SettingsSection>

        <SettingsSection title="Security & Privacy">
          <SettingsRow
            icon={<Lock className="w-5 h-5" />}
            label="Security Overview"
            subtitle="Manage your credentials and security protocols"
            onClick={() => router.push("/settings/security-overview")}
          />
          <SettingsRow
            icon={<Eye className="w-5 h-5" />}
            label="Privacy Controls"
            subtitle="Preferences for sharing data"
            onClick={() => router.push("/settings/privacy-controls")}
          />
        </SettingsSection>

        <SettingsSection title="Cards & Accounts">
          {/* <SettingsRow
            icon={<CreditCard className="w-5 h-5" />}
            label="Virtual Cards"
            subtitle="Manage digital transaction cards"
            badge="2 Active"
            badgeColor="emerald"
            onClick={() => router.push("/settings/virtual-cards")}
          /> */}
          {/* <SettingsRow
            icon={<CreditCard className="w-5 h-5" />}
            label="Physical Card"
            subtitle="Order, activate, or replace your card"
            onClick={() => router.push("/settings/physical-card")}
          /> */}
          {/* <SettingsRow
            icon={<Snowflake className="w-5 h-5" />}
            label="Freeze Card"
            subtitle="Temporarily pause all transactions"
            onClick={() => router.push("/settings/freeze")}
          /> */}
          <SettingsRow
            icon={<Landmark className="w-5 h-5" />}
            label="Linked Payment Accounts"
            subtitle="View connected deposits and withdrawals payment accounts"
            onClick={() => router.push("/settings/linked-accounts")}
          />
          {/* <SettingsRow
            icon={<Plus className="w-5 h-5" />}
            label="Add Bank Account"
            onClick={() => router.push("/settings/add-account")}
          /> */}
        </SettingsSection>

        <SettingsSection title="Notifications">
          <SettingsRow
            icon={<Bell className="w-5 h-5" />}
            label="Push Notifications"
            subtitle="Configure transaction alerts"
            badge="Enabled"
            badgeColor="emerald"
            onClick={() => router.push("/settings/push")}
          />
          <SettingsRow
            icon={<Mail className="w-5 h-5" />}
            label="Email Notifications"
            subtitle="Activity updates and statements"
            onClick={() => router.push("/settings/email-notif")}
          />
          <SettingsRow
            icon={<MessageSquare className="w-5 h-5" />}
            label="SMS Notifications"
            subtitle="Text message security codes"
            onClick={() => router.push("/settings/sms")}
          />
          {/* <SettingsRow
            icon={<Moon className="w-5 h-5" />}
            label="Quiet Hours"
            subtitle="Schedule notification blackout"
            onClick={() => router.push("/settings/quiet-hours")}
          /> */}
        </SettingsSection>

        {/* <SettingsSection title="Limits & Controls">
          <SettingsRow
            icon={<TrendingUp className="w-5 h-5" />}
            label="Spending Limits"
            subtitle="Set daily and weekly caps"
            onClick={() => router.push("/settings/spending-limits")}
          />
          <SettingsRow
            icon={<ArrowUpDown className="w-5 h-5" />}
            label="Transfer Limits"
            subtitle="Set deposit and withdrawal bounds"
            onClick={() => router.push("/settings/transfer-limits")}
          />
          <SettingsRow
            icon={<Banknote className="w-5 h-5" />}
            label="ATM Withdrawal Limits"
            subtitle="Daily cash withdrawal thresholds"
            onClick={() => router.push("/settings/atm-limits")}
          />
          <SettingsRow
            icon={<Store className="w-5 h-5" />}
            label="Merchant Categories"
            subtitle="Allow or block merchant types"
            onClick={() => router.push("/settings/merchant-categories")}
          />
          <SettingsRow
            icon={<Ban className="w-5 h-5" />}
            label="Blocked Merchants"
            subtitle="Prevent specific vendors from charging you"
            onClick={() => router.push("/settings/blocked-merchants")}
          />
        </SettingsSection> */}

        <SettingsSection title="Documents">
          <SettingsRow
            icon={<FileCheck className="w-5 h-5" />}
            label="Statements"
            subtitle="Download monthly statement papers"
            onClick={() => router.push("/settings/statements")}
          />
          {/* <SettingsRow
            icon={<Receipt className="w-5 h-5" />}
            label="Tax Documents"
            subtitle="View 1099 interest statements"
            onClick={() => router.push("/settings/tax-docs")}
          /> */}
          <SettingsRow
            icon={<FileSignature className="w-5 h-5" />}
            label="Account Agreements"
            subtitle="Disclosures and legal terms"
            onClick={() => router.push("/settings/agreements")}
          />
          {/* <SettingsRow
            icon={<Download className="w-5 h-5" />}
            label="Download Data"
            subtitle="Export and download all telemetry and history"
            onClick={() => router.push("/settings/download-data")}
          /> */}
        </SettingsSection>

        <SettingsSection title="App Preferences">
          <SettingsRow
            icon={<Languages className="w-5 h-5" />}
            label="Language"
            subtitle="English (US)"
            onClick={() => router.push("/settings/language")}
          />
          <SettingsRow
            icon={<DollarSign className="w-5 h-5" />}
            label="Currency"
            subtitle="USD ($)"
            onClick={() => router.push("/settings/currency")}
          />
          <SettingsRow
            icon={<Palette className="w-5 h-5" />}
            label="App Theme"
            subtitle="Dark Mode (Impeccable)"
            onClick={() => router.push("/settings/theme")}
          />
          {/* <SettingsRow
            icon={<SettingsIcon className="w-5 h-5" />}
            label="Accessibility"
            subtitle="Contrast, motion, and font customization"
            onClick={() => router.push("/settings/accessibility")}
          />
          <SettingsRow
            icon={<Database className="w-5 h-5" />}
            label="Data Usage"
            subtitle="Cache storage controls"
            onClick={() => router.push("/settings/data-usage")}
          /> */}
        </SettingsSection>

        <SettingsSection title="Support & Legal">
          <SettingsRow
            icon={<HelpCircle className="w-5 h-5" />}
            label="Help Center"
            subtitle="Browse documentation and video tutorials"
            onClick={() => router.push("/settings/help")}
          />
          <SettingsRow
            icon={<Phone className="w-5 h-5" />}
            label="Contact Support"
            subtitle="Live chat and compliance specialists"
            onClick={() => router.push("/settings/contact")}
          />
          <SettingsRow
            icon={<AlertCircle className="w-5 h-5" />}
            label="Report a Problem"
            subtitle="Submit bug reports or feedback"
            onClick={() => router.push("/settings/report")}
          />
          <SettingsRow
            icon={<ScrollText className="w-5 h-5" />}
            label="Terms of Service"
            onClick={() => router.push("/terms")}
          />
          <SettingsRow
            icon={<ShieldCheck className="w-5 h-5" />}
            label="Privacy Policy"
            onClick={() => router.push("/privacy")}
          />
          <SettingsRow
            icon={<Info className="w-5 h-5" />}
            label="About"
            subtitle="SusuChain Client v1.0.0"
            onClick={() => router.push("/settings/about")}
          />
        </SettingsSection>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={handleLogout}
            className="w-full bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all rounded-2xl py-6 mt-4 flex items-center justify-center gap-3 cursor-pointer text-rose-500 font-bold"
          >
            <LogOut className="w-5 h-5" strokeWidth={2} />
            <span className="text-sm tracking-wide">Log Out</span>
          </Button>
        </motion.div>
      </div>

      <Dock activeItem="settings" onItemClick={(href) => router.push(href)} />
    </main>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">
        {title}
      </h2>
      <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-md rounded-2xl overflow-hidden divide-y divide-white/[0.04]">
        {children}
      </div>
    </motion.div>
  );
}

function SettingsRow({
  icon,
  label,
  subtitle,
  badge,
  badgeColor = "neutral",
  destructive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: "emerald" | "amber" | "neutral";
  destructive?: boolean;
  onClick: () => void;
}) {
  const getBadgeClass = () => {
    switch (badgeColor) {
      case "emerald":
        return "bg-[#00E660]/10 text-[#00E660] border border-[#00E660]/20";
      case "amber":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default:
        return "bg-zinc-800 text-zinc-300 border border-zinc-700";
    }
  };

  return (
    <div
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4.5 hover:bg-white/[0.04] transition-all duration-200 cursor-pointer group"
    >
      <div
        className={`${destructive ? "text-rose-500" : "text-zinc-400 group-hover:text-white"} shrink-0 transition-colors duration-200`}
      >
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p
          className={`text-sm font-semibold tracking-tight ${
            destructive ? "text-rose-500" : "text-white"
          }`}
        >
          {label}
        </p>
        {subtitle && <p className="text-xs text-zinc-400 mt-1 font-medium">{subtitle}</p>}
      </div>
      {badge && (
        <Badge className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getBadgeClass()}`}>
          {badge}
        </Badge>
      )}
      <ChevronRight
        className={`w-5 h-5 shrink-0 transition-all duration-200 ${
          destructive ? "text-rose-500/50" : "text-zinc-500 group-hover:text-white group-hover:translate-x-0.5"
        }`}
      />
    </div>
  );
}
