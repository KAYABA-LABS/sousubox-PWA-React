"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dock } from "@/components/dashboard/Dock";
import {
  Send,
  CreditCard,
  ArrowUpDown,
  Plus,
  Wallet,
  ChevronRight,
} from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { isDevMode } from "@/lib/dev";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/context/ThemeContext";

export default function Dashboard() {
  const { theme } = useTheme();
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const initialWasVerified =
    (typeof window !== "undefined" &&
      sessionStorage.getItem("verified") === "true") ||
    false;
  const [showWelcome, setShowWelcome] = useState(initialWasVerified);
  const [balance, setBalance] = useState(3445780.0);
  const [userName, setUserName] = useState("User");
  const [userInitials, setUserInitials] = useState("U");
  const [notificationCount] = useState(2);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "activity" | "details" | "documents"
  >("activity");
  const [currentAccountIndex, setCurrentAccountIndex] = useState(0);
  const accounts = ["Deposit Account", "Savings Account"];

  const getFirstName = (fullName: string) => fullName.split(" ")[0];

  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  useEffect(() => {
    if (!isLoaded) return;

    if (!userId && !isDevMode()) {
      router.push("/signin");
      return;
    }

    let displayName = "User";
    let initials = "U";

    if (user?.firstName) {
      displayName = user.firstName;
      if (user?.lastName) {
        initials = (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
      } else {
        initials = user.firstName.charAt(0).toUpperCase();
      }
    } else if (user?.emailAddresses?.[0]?.emailAddress) {
      const email = user.emailAddresses[0].emailAddress;
      const username = email.split("@")[0];
      displayName = username.split(/[._-]/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
      initials = getInitials(displayName);
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserName(getFirstName(displayName));
    setUserInitials(initials);

    let pending = 0;
    try {
      const p = sessionStorage.getItem("pending_deposit");
      if (p) pending = parseFloat(p) || 0;
    } catch { pending = 0; }
    setBalance(3450780.0 + pending);
    setIsLoading(false);

    if (sessionStorage.getItem("verified") === "true") {
      sessionStorage.removeItem("verified");
    }
  }, [userId, isLoaded, user, router]);

  useEffect(() => {
    if (!showWelcome) return;
    const t = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(t);
  }, [showWelcome]);

  const MIN_BALANCE_REQUIRED = 350.0;
  const hasMinBalance = balance >= MIN_BALANCE_REQUIRED;

  const handleDeposit = () => router.push("/deposit");
  const handleTransfer = () => router.push(hasMinBalance ? "/transfer" : "/deposit?reason=unlock");
  const handleSend = () => router.push(hasMinBalance ? "/send" : "/deposit?reason=unlock");
  const handlePay = () => router.push(hasMinBalance ? "/pay" : "/deposit?reason=unlock");
  const handleManage = () => router.push(hasMinBalance ? "/manage" : "/deposit?reason=unlock");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const beginningBalance = 3450780.0;
  const pendingAmount = -5000.0;

  return (
    <main id="main-content" role="main" className={`min-h-screen ${theme.bg.primary} flex flex-col pb-32`}>
      <motion.header
        role="banner"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`${theme.bg.primary} px-5 pt-6 pb-4`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-full ${theme.accent.primary} border ${theme.border.default} flex items-center justify-center ${theme.accent.primaryText} font-bold text-lg`}>
            {userInitials}
          </div>
          <div className="flex-1">
            <p className={`text-sm ${theme.text.secondary} flex items-center gap-2`}>
              <span className="sr-only">Greeting</span>
              <span>Welcome back,</span>
              <span className={`text-base font-semibold ${theme.text.primary} tracking-tight`}>
                {userName}
              </span>
              <span aria-hidden className="text-sm">
                👋
              </span>
            </p>
            <p className={`text-xs ${theme.text.tertiary} mt-0.5`}>
              {notificationCount} notification
              {notificationCount !== 1 ? "s" : ""} pending
            </p>
          </div>
        </div>
      </motion.header>

      {showWelcome && (
        <div className="fixed inset-x-4 top-6 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/95 text-black rounded-2xl px-5 py-4 shadow-lg max-w-md w-full"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-black mb-1">Account verified</p>
                <p className="text-sm text-gray-500">You&apos;re ready to send and receive money.</p>
              </div>
              <Button onClick={() => setShowWelcome(false)} className="text-gray-500 hover:text-gray-500" aria-label="Close">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            <Button
              onClick={() => { setShowWelcome(false); handleDeposit(); }}
              className="mt-3 w-full bg-emerald-600 text-black font-medium py-2 px-4 rounded-xl hover:bg-[#00FF6A] transition-colors"
            >
              Get started
            </Button>
          </motion.div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 mb-6"
      >
        <div className={`${theme.card.bg} rounded-3xl overflow-hidden border ${theme.border.default} shadow-lg`}>
          <div className={`px-6 pt-5 pb-1 border-b ${theme.border.default}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${theme.accent.primary} flex items-center justify-center`}>
                  <svg className={`w-5 h-5 ${theme.accent.primaryText}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h1 className={`text-base font-semibold ${theme.text.primary}`}>{accounts[currentAccountIndex]}</h1>
                  <p className={`text-xs ${theme.text.tertiary}`}>••••5064</p>
                </div>
              </div>
              <div className={`flex gap-1 ${theme.input.bg} p-1 rounded-lg`}>
                {accounts.map((account, index) => (
                  <Button
                    key={index}
                    onClick={() => setCurrentAccountIndex(index)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      index === currentAccountIndex ? `${theme.input.bg} ${theme.text.primary}` : `${theme.text.tertiary} hover:${theme.text.secondary}`
                    }`}
                  >
                    {account.split(" ")[0]}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className={`px-6 py-8`}>
            <div className="mb-6 text-left">
              <p className={`text-xs font-semibold ${theme.text.tertiary} mb-2 tracking-wider`}>Available Balance</p>
              <h2 className={`text-4xl font-black ${theme.text.primary} mb-2 tracking-tight`}>
                ${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <p className={`text-xs ${theme.text.tertiary} mb-1`}>Beginning Balance</p>
                <p className={`text-lg font-semibold ${theme.text.primary}`}>
                  ${beginningBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className={`w-px h-12 ${theme.border.subtle}`} />
              <div className="flex-1">
                <p className={`text-xs ${theme.text.tertiary} mb-1`}>Pending</p>
                <p className="text-lg font-semibold text-red-500">
                  ${pendingAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-5 mb-6"
      >
        {!hasMinBalance && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl"
          >
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-500 mb-1">Deposit Required</p>
                <p className="text-xs text-yellow-500/80 leading-relaxed">
                  Deposit at least ${MIN_BALANCE_REQUIRED.toFixed(2)} to unlock Send, Pay, Transfer, and Manage features.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex items-center justify-between gap-3">
          <ActionButton icon={Send} label="Send" onClick={handleSend} locked={!hasMinBalance} />
          <ActionButton icon={CreditCard} label="Pay" onClick={handlePay} locked={!hasMinBalance} />
          <ActionButton icon={ArrowUpDown} label="Transfer" onClick={handleTransfer} locked={!hasMinBalance} />
          <ActionButton icon={Plus} label="Deposit" onClick={handleDeposit} locked={false} />
          <ActionButton icon={Wallet} label="Manage" onClick={handleManage} locked={!hasMinBalance} />
        </div>
      </motion.div>

      <div className="px-5 mb-4">
        <div className={`flex items-center gap-1 ${theme.card.bg} rounded-2xl p-1 border ${theme.border.default}`}>
          {(["activity", "details", "documents"] as const).map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab ? `${theme.accent.primary} ${theme.accent.primaryText}` : `${theme.text.tertiary} hover:${theme.text.primary}`
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-auto px-5">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "activity" && (
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`${theme.status.success} rounded-2xl p-4 border`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${theme.text.primary} mb-1`}>Spending Insight</p>
                    <p className={`text-xs ${theme.text.tertiary} leading-relaxed`}>You spent 22% more on shopping this week. Your average is $245/week.</p>
                  </div>
                  <Button className={`${theme.text.link} text-xs font-medium hover:opacity-80`}>Details</Button>
                </div>
              </motion.div>

              <div>
                <h3 className={`text-xs font-medium ${theme.text.tertiary} uppercase tracking-wider mb-3 px-1`}>Pending</h3>
                <Card className={`${theme.card.bg} rounded-2xl overflow-hidden border border-yellow-500/20`}>
                  <TransactionRow title="Mobile Deposit" subtitle="Deposit Hold – 2 Business Days" amount={-150.0} isPending transactionId="pending-mobile-deposit" />
                </Card>
              </div>

              <div>
                <h3 className={`text-xs font-medium ${theme.text.tertiary} uppercase tracking-wider mb-3 px-1`}>Dec 15, 2024</h3>
                <div className={`${theme.card.bg} rounded-2xl overflow-hidden divide-y ${theme.border.subtle}`}>
                  <TransactionRow title="Zelle Sent" subtitle="To: Sarah Johnson" amount={-45.0} transactionId="dec15-2024-zelle-sent" />
                  <TransactionRow title="Direct Deposit" subtitle="From: Employer Inc" amount={2450.0} transactionId="dec15-2024-direct-deposit" />
                  <TransactionRow title="ATM Withdrawal" subtitle="Ref: #ATM12345" amount={-100.0} transactionId="dec15-2024-atm-withdrawal" />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-medium ${theme.text.tertiary} uppercase tracking-wider mb-3 px-1">Aug 22, 2024</h3>
                <div className="${theme.card.bg} rounded-2xl overflow-hidden divide-y ${theme.border.subtle}">
                  <TransactionRow title="Amazon Purchase" subtitle="Ref: #AMZ789456" amount={-89.99} transactionId="aug22-2024-amazon" />
                  <TransactionRow title="Venmo Received" subtitle="From: Mike Chen" amount={25.0} transactionId="aug22-2024-venmo" />
                  <TransactionRow title="Subscription Payment" subtitle="Netflix Premium" amount={-19.99} transactionId="aug22-2024-netflix" />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-medium ${theme.text.tertiary} uppercase tracking-wider mb-3 px-1">Mar 10, 2023</h3>
                <div className="${theme.card.bg} rounded-2xl overflow-hidden divide-y ${theme.border.subtle}">
                  <TransactionRow title="Grocery Store" subtitle="Whole Foods Market" amount={-156.43} transactionId="mar10-2023-grocery" />
                  <TransactionRow title="Gas Station" subtitle="Shell #4523" amount={-52.18} transactionId="mar10-2023-gas" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "details" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Account Details</h3>
                <div className="space-y-3">
                  {[
                    ["Account number", "••••5064"],
                    ["Account type", "Checking"],
                    ["Routing number", "021000021"],
                    ["Daily transfer limit", "$5,000"],
                    ["Monthly fee", "$0.00"],
                  ].map(([label, value], i) => (
                    <div key={label} className={`flex justify-between items-center py-2 ${i > 0 ? "border-t border-gray-200" : ""}`}>
                      <span className="text-sm text-gray-500">{label}</span>
                      <span className={`text-sm font-medium ${label === "Monthly fee" ? "text-emerald-600" : "text-gray-900"}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Security</h3>
                <div className="space-y-3">
                  {["Change PIN", "Biometric authentication", "Linked devices"].map((item, i) => (
                    <Button key={item} className={`w-full flex justify-between items-center py-3 hover:bg-gray-100 rounded-lg px-2 -mx-2 transition-colors ${i > 0 ? "border-t border-gray-200" : ""}`}>
                      <span className="text-sm text-gray-900">{item}</span>
                      <div className="flex items-center gap-2">
                        {item === "Biometric authentication" && <Badge className="text-xs text-emerald-600">Enabled</Badge>}
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Preferences</h3>
                <div className="space-y-3">
                  {["Notifications", "Statement delivery"].map((item, i) => (
                    <Button key={item} className={`w-full flex justify-between items-center py-3 hover:bg-gray-100 rounded-lg px-2 -mx-2 transition-colors ${i > 0 ? "border-t border-gray-200" : ""}`}>
                      <span className="text-sm text-gray-900">{item}</span>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Statements</h3>
                <div className="space-y-3">
                  {[{ name: "January 2025", size: "245 KB" }, { name: "December 2024", size: "238 KB" }].map((doc, i) => (
                    <Button key={doc.name} className={`w-full flex items-center justify-between py-3 hover:bg-gray-100 rounded-lg px-2 -mx-2 transition-colors ${i > 0 ? "border-t border-gray-200" : ""}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.size} • PDF</p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Tax Documents</h3>
                <Button className="w-full flex items-center justify-between py-3 hover:bg-gray-100 rounded-lg px-2 -mx-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">2024 Annual Summary</p>
                      <p className="text-xs text-gray-500">112 KB • PDF</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </Button>
              </div>

              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Other</h3>
                <div className="space-y-3">
                  {[{ name: "Account opening form", size: "89 KB" }, { name: "Terms & conditions", size: "156 KB" }].map((doc, i) => (
                    <Button key={doc.name} className={`w-full flex items-center justify-between py-3 hover:bg-gray-100 rounded-lg px-2 -mx-2 transition-colors ${i > 0 ? "border-t border-gray-200" : ""}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.size} • PDF</p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      <Dock activeItem="home" onItemClick={(href) => router.push(href)} />
    </main>
  );
}

interface ActionButtonProps {
  icon: React.ElementType;
  label: string;
  subtext?: string;
  onClick: () => void;
  locked?: boolean;
}

function ActionButton({ icon: Icon, label, subtext, onClick, locked = false }: ActionButtonProps) {
  return (
    <Button onClick={onClick} className="flex flex-col items-center gap-2 group relative" title={locked ? "Minimum balance required" : undefined}>
      <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${locked ? "bg-gray-1000 cursor-pointer" : "bg-white hover:bg-gray-100 group-active:scale-95"}`}>
        <Icon className={`w-6 h-6 transition-colors ${locked ? "text-gray-500" : "text-gray-900"}`} strokeWidth={1.5} />
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center">
              <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>
      <div className="text-center">
        <span className={`text-xs font-medium transition-colors block ${locked ? "text-gray-500" : "text-gray-500 group-hover:text-gray-900"}`}>{label}</span>
        {subtext && <span className="text-[10px] text-gray-500 block mt-0.5">{subtext}</span>}
        {locked && <span className="text-[9px] text-yellow-500/70 block mt-0.5">Min. balance req.</span>}
      </div>
    </Button>
  );
}

interface TransactionRowProps {
  title: string;
  subtitle: string;
  amount: number;
  isPending?: boolean;
  transactionId: string;
}

function TransactionRow({ title, subtitle, amount, isPending, transactionId }: TransactionRowProps) {
  const router = useRouter();
  const isPositive = amount > 0;

  return (
    <Button
      onClick={() => router.push(`/transaction/${transactionId}`)}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors group"
    >
      <div className="flex-1 text-left">
        <p className="text-sm font-medium text-gray-900 mb-0.5">{title}</p>
        <p className={`text-xs ${isPending ? "text-yellow-500" : "text-gray-500"}`}>{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <p className={`text-base font-semibold ${isPending ? "text-yellow-500" : isPositive ? "text-emerald-600" : "text-gray-900"}`}>
          {isPositive ? "+" : ""}{amount < 0 ? "-" : ""}${Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-500 transition-colors" strokeWidth={2} />
      </div>
    </Button>
  );
}
