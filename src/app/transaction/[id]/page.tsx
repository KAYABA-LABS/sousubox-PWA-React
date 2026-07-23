"use client";

import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Download,
  Share2,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

// Mock transaction data
type Transaction = {
  title?: string;
  subtitle?: string;
  amount?: number;
  isPending?: boolean;
  status?: string;
  date?: string;
  time?: string;
  reference?: string;
  account?: string;
  description?: string;
  expectedClearance?: string;
  recipient?: string;
  sender?: string;
  merchant?: string;
  location?: string;
};

const transactions: Record<string, Transaction> = {
  "pending-mobile-deposit": {
    title: "Mobile Deposit",
    subtitle: "Deposit Hold – 2 Business Days",
    amount: -150.0,
    isPending: true,
    status: "Pending",
    date: "Jan 4, 2026",
    time: "2:45 PM",
    reference: "#DEP458291",
    account: "Checking ••••1234",
    description: "Check deposit via mobile app",
    expectedClearance: "Jan 6, 2026",
  },
  "dec15-2024-zelle-sent": {
    title: "Zelle Sent",
    subtitle: "To: Sarah Johnson",
    amount: -45.0,
    status: "Completed",
    date: "Dec 15, 2024",
    time: "11:23 AM",
    reference: "#ZEL992847",
    account: "Checking ••••1234",
    description: "Dinner split",
    recipient: "Sarah Johnson (sarah.j@email.com)",
  },
  "dec15-2024-direct-deposit": {
    title: "Direct Deposit",
    subtitle: "From: Employer Inc",
    amount: 2450.0,
    status: "Completed",
    date: "Dec 15, 2024",
    time: "8:00 AM",
    reference: "#DD748392",
    account: "Checking ••••1234",
    description: "Bi-weekly payroll",
    sender: "Employer Inc",
  },
  "dec15-2024-atm-withdrawal": {
    title: "ATM Withdrawal",
    subtitle: "Ref: #ATM12345",
    amount: -100.0,
    status: "Completed",
    date: "Dec 15, 2024",
    time: "6:15 PM",
    reference: "#ATM12345",
    account: "Checking ••••1234",
    description: "Cash withdrawal",
    location: "Chase ATM - 123 Main St, New York, NY",
  },
  "aug22-2024-amazon": {
    title: "Amazon Purchase",
    subtitle: "Ref: #AMZ789456",
    amount: -89.99,
    status: "Completed",
    date: "Aug 22, 2024",
    time: "3:42 PM",
    reference: "#AMZ789456",
    account: "Checking ••••1234",
    description: "Online purchase",
    merchant: "Amazon.com",
  },
  "aug22-2024-venmo": {
    title: "Venmo Received",
    subtitle: "From: Mike Chen",
    amount: 25.0,
    status: "Completed",
    date: "Aug 22, 2024",
    time: "1:18 PM",
    reference: "#VEN384756",
    account: "Checking ••••1234",
    description: "Concert tickets",
    sender: "Mike Chen (@mikechen)",
  },
  "aug22-2024-netflix": {
    title: "Subscription Payment",
    subtitle: "Netflix Premium",
    amount: -19.99,
    status: "Completed",
    date: "Aug 22, 2024",
    time: "12:01 AM",
    reference: "#SUB927461",
    account: "Checking ••••1234",
    description: "Monthly subscription",
    merchant: "Netflix Premium",
  },
  "mar10-2023-grocery": {
    title: "Grocery Store",
    subtitle: "Whole Foods Market",
    amount: -156.43,
    status: "Completed",
    date: "Mar 10, 2023",
    time: "5:32 PM",
    reference: "#POS847293",
    account: "Checking ••••1234",
    description: "In-store purchase",
    merchant: "Whole Foods Market",
    location: "456 Broadway, New York, NY",
  },
  "mar10-2023-gas": {
    title: "Gas Station",
    subtitle: "Shell #4523",
    amount: -52.18,
    status: "Completed",
    date: "Mar 10, 2023",
    time: "9:12 AM",
    reference: "#POS748392",
    account: "Checking ••••1234",
    description: "Fuel purchase",
    merchant: "Shell #4523",
    location: "789 Highway Rd, New York, NY",
  },
};

export default function TransactionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const transactionId = params.id as string;

  const transaction = transactions[transactionId];

  const amount = transaction.amount ?? 0;

  if (!transaction) {
    return (
      <div className="min-h-screen bg-[#0C0F14] flex items-center justify-center px-5">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Transaction not found</p>
          <button
            onClick={() => router.back()}
            className="text-[#00E660] hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const isPositive = amount > 0;
  const isPending = transaction.isPending;

  return (
    <div className="min-h-screen bg-[#0C0F14] flex flex-col">
      {/* Header */}
      <header className="bg-[#0C0F14] px-5 pt-6 pb-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" strokeWidth={2} />
          </button>
          <h1 className="text-xl font-semibold text-white">
            Transaction Details
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 px-5 py-6">
        {/* Amount Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#151A1F] rounded-3xl p-6 mb-6 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            {isPending ? (
              <Clock className="w-5 h-5 text-yellow-500" strokeWidth={2} />
            ) : isPositive ? (
              <CheckCircle className="w-5 h-5 text-[#00E660]" strokeWidth={2} />
            ) : (
              <CheckCircle className="w-5 h-5 text-white" strokeWidth={2} />
            )}
            <span
              className={`text-sm font-medium ${
                isPending ? "text-yellow-500" : "text-gray-400"
              }`}
            >
              {transaction.status}
            </span>
          </div>

          <h2
            className={`text-5xl font-bold mb-2 ${
              isPending
                ? "text-yellow-500"
                : isPositive
                ? "text-[#00E660]"
                : "text-white"
            }`}
          >
            {isPositive ? "+" : ""}${Math.abs(amount).toFixed(2)}
          </h2>

          <p className="text-xl font-semibold text-white mb-1">
            {transaction.title}
          </p>
          <p className="text-sm text-gray-400">{transaction.subtitle}</p>
        </motion.div>

        {/* Transaction Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#151A1F] rounded-2xl overflow-hidden mb-6"
        >
          <div className="p-4 border-b border-white/5">
            <h3 className="text-sm font-medium text-gray-400 mb-3">
              Transaction Information
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Date</span>
                <span className="text-sm font-medium text-white">
                  {transaction.date}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Time</span>
                <span className="text-sm font-medium text-white">
                  {transaction.time}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Reference</span>
                <span className="text-sm font-medium text-white">
                  {transaction.reference}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Account</span>
                <span className="text-sm font-medium text-white">
                  {transaction.account}
                </span>
              </div>

              {transaction.expectedClearance && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">
                    Expected Clearance
                  </span>
                  <span className="text-sm font-medium text-yellow-500">
                    {transaction.expectedClearance}
                  </span>
                </div>
              )}

              {transaction.location && (
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-400">Location</span>
                  <span className="text-sm font-medium text-white text-right max-w-[60%]">
                    {transaction.location}
                  </span>
                </div>
              )}

              {transaction.merchant && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Merchant</span>
                  <span className="text-sm font-medium text-white">
                    {transaction.merchant}
                  </span>
                </div>
              )}

              {transaction.sender && (
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-400">From</span>
                  <span className="text-sm font-medium text-white text-right max-w-[60%]">
                    {transaction.sender}
                  </span>
                </div>
              )}

              {transaction.recipient && (
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-400">To</span>
                  <span className="text-sm font-medium text-white text-right max-w-[60%]">
                    {transaction.recipient}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4">
            <p className="text-xs text-gray-500 mb-1">Description</p>
            <p className="text-sm text-white">{transaction.description}</p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3"
        >
          <button className="bg-[#151A1F] hover:bg-[#1A1F25] rounded-xl p-4 flex flex-col items-center gap-2 transition-colors">
            <Download className="w-6 h-6 text-white" strokeWidth={1.5} />
            <span className="text-sm font-medium text-white">Download</span>
          </button>

          <button className="bg-[#151A1F] hover:bg-[#1A1F25] rounded-xl p-4 flex flex-col items-center gap-2 transition-colors">
            <Share2 className="w-6 h-6 text-white" strokeWidth={1.5} />
            <span className="text-sm font-medium text-white">Share</span>
          </button>
        </motion.div>

        {/* Dispute Button */}
        {!isPending && !isPositive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              className="w-full mt-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl p-4 flex items-center justify-center gap-2 transition-colors"
            >
              <AlertCircle className="w-5 h-5 text-red-400" strokeWidth={2} />
              <span className="text-sm font-medium text-red-400">
                Report Issue
              </span>
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
