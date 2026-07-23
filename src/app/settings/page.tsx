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
} from "lucide-react";
import { useAuth, useUser, useClerk } from "@clerk/nextjs";
import { isDevMode } from "@/lib/dev";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Settings() {
  const router = useRouter();
  const { isLoaded } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userInitials, setUserInitials] = useState("U");
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified] = useState(true);

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    }

    setIsLoading(false);
  }, [isLoaded, user]);

  const handleLogout = async () => {
    await signOut();
    if (!isDevMode()) {
      router.push("/signin");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main id="main-content" role="main" className="min-h-screen bg-gray-50 flex flex-col px-5 pt-6 pb-32">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Button
          onClick={() => router.push("/settings/profile")}
          className="bg-white rounded-2xl p-5 mb-6 hover:bg-gray-100 transition-colors w-full"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-linear-to-br from-[#00E660] to-[#00B84D] flex items-center justify-center">
              <span className="text-lg font-semibold text-black">
                {userInitials}
              </span>
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <p className="text-base font-semibold text-gray-900">{userName}</p>
                {isVerified && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{userEmail}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </div>
        </Button>
      </motion.div>

      <div className="space-y-6">
        <SettingsSection title="Account">
          <SettingsRow
            icon={<User className="w-5 h-5" />}
            label="Personal Information"
            subtitle="Name, email, phone"
            onClick={() => router.push("/settings/personal")}
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
            label="Security & Privacy Overview"
            subtitle="Manage your security settings"
            onClick={() => router.push("/settings/security-overview")}
          />
          <SettingsRow
            icon={<Eye className="w-5 h-5" />}
            label="Privacy Controls"
            subtitle="Data sharing preferences"
            onClick={() => router.push("/settings/privacy-controls")}
          />
        </SettingsSection>

        <SettingsSection title="Cards & Accounts">
          <SettingsRow
            icon={<CreditCard className="w-5 h-5" />}
            label="Virtual Cards"
            subtitle="Manage digital cards"
            badge="2 Active"
            onClick={() => router.push("/settings/virtual-cards")}
          />
          <SettingsRow
            icon={<CreditCard className="w-5 h-5" />}
            label="Physical Card"
            subtitle="Order or replace card"
            onClick={() => router.push("/settings/physical-card")}
          />
          <SettingsRow
            icon={<Snowflake className="w-5 h-5" />}
            label="Freeze Card"
            subtitle="Temporarily disable card"
            onClick={() => router.push("/settings/freeze")}
          />
          <SettingsRow
            icon={<Landmark className="w-5 h-5" />}
            label="Linked Bank Accounts"
            subtitle="External accounts"
            onClick={() => router.push("/settings/linked-accounts")}
          />
          <SettingsRow
            icon={<Plus className="w-5 h-5" />}
            label="Add Bank Account"
            onClick={() => router.push("/settings/add-account")}
          />
        </SettingsSection>

        <SettingsSection title="Notifications">
          <SettingsRow
            icon={<Bell className="w-5 h-5" />}
            label="Push Notifications"
            subtitle="Transaction alerts, updates"
            badge="On"
            onClick={() => router.push("/settings/push")}
          />
          <SettingsRow
            icon={<Mail className="w-5 h-5" />}
            label="Email Notifications"
            subtitle="Account activity emails"
            onClick={() => router.push("/settings/email-notif")}
          />
          <SettingsRow
            icon={<MessageSquare className="w-5 h-5" />}
            label="SMS Notifications"
            subtitle="Text message alerts"
            onClick={() => router.push("/settings/sms")}
          />
          <SettingsRow
            icon={<Moon className="w-5 h-5" />}
            label="Quiet Hours"
            subtitle="Pause notifications"
            onClick={() => router.push("/settings/quiet-hours")}
          />
        </SettingsSection>

        <SettingsSection title="Limits & Controls">
          <SettingsRow
            icon={<TrendingUp className="w-5 h-5" />}
            label="Spending Limits"
            subtitle="Daily, weekly limits"
            onClick={() => router.push("/settings/spending-limits")}
          />
          <SettingsRow
            icon={<ArrowUpDown className="w-5 h-5" />}
            label="Transfer Limits"
            subtitle="Maximum transfer amounts"
            onClick={() => router.push("/settings/transfer-limits")}
          />
          <SettingsRow
            icon={<Banknote className="w-5 h-5" />}
            label="ATM Withdrawal Limits"
            subtitle="Daily cash withdrawal"
            onClick={() => router.push("/settings/atm-limits")}
          />
          <SettingsRow
            icon={<Store className="w-5 h-5" />}
            label="Merchant Categories"
            subtitle="Block specific categories"
            onClick={() => router.push("/settings/merchant-categories")}
          />
          <SettingsRow
            icon={<Ban className="w-5 h-5" />}
            label="Blocked Merchants"
            subtitle="Prevent specific charges"
            onClick={() => router.push("/settings/blocked-merchants")}
          />
        </SettingsSection>

        <SettingsSection title="Documents">
          <SettingsRow
            icon={<FileCheck className="w-5 h-5" />}
            label="Statements"
            subtitle="Monthly account statements"
            onClick={() => router.push("/settings/statements")}
          />
          <SettingsRow
            icon={<Receipt className="w-5 h-5" />}
            label="Tax Documents"
            subtitle="1099-INT, forms"
            onClick={() => router.push("/settings/tax-docs")}
          />
          <SettingsRow
            icon={<FileSignature className="w-5 h-5" />}
            label="Account Agreements"
            subtitle="Terms, disclosures"
            onClick={() => router.push("/settings/agreements")}
          />
          <SettingsRow
            icon={<Download className="w-5 h-5" />}
            label="Download Data"
            subtitle="Export account data"
            onClick={() => router.push("/settings/download-data")}
          />
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
            subtitle="Dark mode"
            onClick={() => router.push("/settings/theme")}
          />
          <SettingsRow
            icon={<SettingsIcon className="w-5 h-5" />}
            label="Accessibility"
            subtitle="Font size, contrast"
            onClick={() => router.push("/settings/accessibility")}
          />
          <SettingsRow
            icon={<Database className="w-5 h-5" />}
            label="Data Usage"
            subtitle="Cache, storage"
            onClick={() => router.push("/settings/data-usage")}
          />
        </SettingsSection>

        <SettingsSection title="Support & Legal">
          <SettingsRow
            icon={<HelpCircle className="w-5 h-5" />}
            label="Help Center"
            subtitle="FAQs, tutorials"
            onClick={() => router.push("/settings/help")}
          />
          <SettingsRow
            icon={<Phone className="w-5 h-5" />}
            label="Contact Support"
            subtitle="Get assistance"
            onClick={() => router.push("/settings/contact")}
          />
          <SettingsRow
            icon={<AlertCircle className="w-5 h-5" />}
            label="Report a Problem"
            subtitle="Technical issues"
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
            subtitle="Version 1.0.0"
            onClick={() => router.push("/settings/about")}
          />
        </SettingsSection>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={handleLogout}
            className="w-full bg-red-500/10 rounded-2xl p-4 hover:bg-red-500/20 transition-colors mt-6"
          >
            <div className="flex items-center justify-center gap-2">
              <LogOut className="w-5 h-5 text-red-500" strokeWidth={2} />
              <span className="text-sm font-medium text-red-500">Log Out</span>
            </div>
          </Button>
        </motion.div>
      </div>

      <Dock activeItem="" onItemClick={(href) => router.push(href)} />
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
      className="space-y-2"
    >
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1 mb-3">
        {title}
      </h2>
      <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-200">
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
  destructive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  badge?: string;
  destructive?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 hover:bg-gray-100 transition-colors"
    >
      <div
        className={`${destructive ? "text-red-500" : "text-gray-500"} shrink-0`}
      >
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p
          className={`text-sm font-medium ${
            destructive ? "text-red-500" : "text-gray-900"
          }`}
        >
          {label}
        </p>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {badge && (
        <Badge className="px-2 py-1 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-full">
          {badge}
        </Badge>
      )}
      <ChevronRight
        className={`w-5 h-5 shrink-0 ${
          destructive ? "text-red-500/50" : "text-gray-500"
        }`}
      />
    </Button>
  );
}
