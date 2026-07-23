"use client";

import { motion } from "framer-motion";
import { Dock } from "@/components/dashboard/Dock";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowUpDown,
  Loader2,
  Search,
  Download,
  ShoppingCart,
  Coffee,
  Utensils,
  Fuel,
  Plane,
  Home,
  Heart,
  Smartphone,
  Zap,
  CreditCard,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { isDevMode } from "@/lib/dev";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
interface Transaction {
  id: string;
  transaction_type: "debit" | "credit";
  category: string;
  amount: number;
  description: string;
  merchant_name: string | null;
  recipient_name: string | null;
  sender_name: string | null;
  status: string;
  created_at: string;
}

type FilterType = "all" | "income" | "expenses";

export default function ActivityPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadTransactions = useCallback(async () => {
    if (!isLoaded) return;
    if (!userId && !isDevMode()) {
      router.push("/signin");
      return;
    }

    setTransactions([]);
    setIsLoading(false);
  }, [userId, isLoaded, router]);

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  void loadTransactions();
  }, [loadTransactions]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getTransactionIcon = (type: string, category: string) => {
    const iconClass = "w-5 h-5";

    if (category === "shopping") return <ShoppingCart className={iconClass} />;
    if (category === "food" || category === "dining")
      return <Utensils className={iconClass} />;
    if (category === "coffee") return <Coffee className={iconClass} />;
    if (category === "gas" || category === "fuel")
      return <Fuel className={iconClass} />;
    if (category === "travel") return <Plane className={iconClass} />;
    if (category === "rent" || category === "housing")
      return <Home className={iconClass} />;
    if (category === "health") return <Heart className={iconClass} />;
    if (category === "phone" || category === "mobile")
      return <Smartphone className={iconClass} />;
    if (category === "utilities") return <Zap className={iconClass} />;
    if (category === "transfer") return <ArrowUpDown className={iconClass} />;
    if (category === "card_payment" || category === "payment")
      return <CreditCard className={iconClass} />;

    if (type === "credit" || category === "receive" || category === "deposit") {
      return <ArrowDownLeft className={iconClass} />;
    }
    return <ArrowUpRight className={iconClass} />;
  };

  const getTransactionIconBg = (type: string, category: string) => {
    if (type === "credit" || category === "receive" || category === "deposit") {
      return "bg-emerald-50";
    }
    return "bg-white";
  };

  const getTransactionColor = (type: string, category: string) => {
    if (type === "credit" || category === "receive" || category === "deposit") {
      return "text-emerald-600";
    }
    return "text-gray-900";
  };

  const groupTransactionsByDate = (transactions: Transaction[]) => {
    const groups: { [key: string]: Transaction[] } = {};

    transactions.forEach((transaction) => {
      const date = formatDate(transaction.created_at);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
    });

    return groups;
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === "income" && transaction.transaction_type !== "credit")
      return false;
    if (filter === "expenses" && transaction.transaction_type !== "debit")
      return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchableText = `${transaction.merchant_name || ""} ${
        transaction.recipient_name || ""
      } ${transaction.sender_name || ""} ${transaction.description || ""} ${
        transaction.category || ""
      }`.toLowerCase();
      return searchableText.includes(query);
    }

    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }
  return (
    <main id="main-content" role="main" className="min-h-screen bg-gray-50 flex flex-col pb-32">
      <motion.header
        role="banner"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-6 pb-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Activity</h1>
          <Button className="w-10 h-10 rounded-xl bg-white hover:bg-gray-100 flex items-center justify-center transition-colors" aria-label="Download">
            <Download className="w-5 h-5 text-gray-500" strokeWidth={2} />
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative mb-3"
        >
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
            strokeWidth={2}
          />
          <Input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white rounded-xl pl-12 pr-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00E660]/20"
          />
        </motion.div>

        <div className="flex items-center gap-2">
          <FilterPill
            label="All"
            active={filter === "all"}
            onClick={() => setFilter("all")}
            count={transactions.length}
          />
          <FilterPill
            label="Income"
            active={filter === "income"}
            onClick={() => setFilter("income")}
            count={
              transactions.filter((t) => t.transaction_type === "credit").length
            }
          />
          <FilterPill
            label="Expenses"
            active={filter === "expenses"}
            onClick={() => setFilter("expenses")}
            count={
              transactions.filter((t) => t.transaction_type === "debit").length
            }
          />
        </div>
      </motion.header>

      <main className="flex-1 overflow-auto px-5 py-2">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {!error && filteredTransactions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4">
              {searchQuery ? (
                <Search className="w-8 h-8 text-gray-500" />
              ) : (
                <ArrowUpRight className="w-8 h-8 text-gray-500" />
              )}
            </div>
            <p className="text-gray-500 text-base">
              {searchQuery ? "No results found" : "No transactions yet"}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {searchQuery
                ? "Try adjusting your search"
                : "Your transaction history will appear here"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {Object.entries(groupTransactionsByDate(filteredTransactions)).map(
              ([date, dateTransactions]) => (
                <div key={date}>
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1 mb-3">
                    {date}
                  </h2>
                  <div className="space-y-2">
                    {dateTransactions.map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <Card className="bg-white rounded-2xl p-4 hover:bg-gray-100 transition-colors cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-11 h-11 rounded-xl flex items-center justify-center ${getTransactionIconBg(
                                  transaction.transaction_type,
                                  transaction.category
                                )}`}
                              >
                                <div
                                  className={getTransactionColor(
                                    transaction.transaction_type,
                                    transaction.category
                                  )}
                                >
                                  {getTransactionIcon(
                                    transaction.transaction_type,
                                    transaction.category
                                  )}
                                </div>
                              </div>
                              <div>
                                <p className="text-gray-900 font-semibold text-sm">
                                  {transaction.merchant_name ||
                                    transaction.recipient_name ||
                                    transaction.sender_name ||
                                    transaction.description}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <p className="text-gray-500 text-xs capitalize">
                                    {transaction.category.replace(/_/g, " ")}
                                  </p>
                                  <span className="text-gray-500">•</span>
                                  <p className="text-gray-500 text-xs">
                                    {formatTime(transaction.created_at)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                className={`font-bold text-base ${getTransactionColor(
                                  transaction.transaction_type,
                                  transaction.category
                                )}`}
                              >
                                {transaction.transaction_type === "credit"
                                  ? "+"
                                  : "-"}
                                ${transaction.amount.toFixed(2)}
                              </p>
                              <Badge
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium mt-1 ${
                                  transaction.status === "completed"
                                    ? "bg-emerald-50 text-emerald-600"
                                    : transaction.status === "pending"
                                    ? "bg-yellow-500/10 text-yellow-500"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {transaction.status}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )
            )}
          </motion.div>
        )}
      </main>

      <Dock activeItem="" onItemClick={(href) => router.push(href)} />
    </main>
  );
}

function FilterPill({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count: number;
}) {
  return (
    <Button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
        active
          ? "bg-emerald-600 text-black"
          : "bg-white text-gray-500 hover:bg-gray-100"
      }`}
    >
      {label}
      {count > 0 && (
        <span
          className={`ml-1.5 ${active ? "text-black/70" : "text-gray-500"}`}
        >
          ({count})
        </span>
      )}
    </Button>
  );
}
