import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TransactionsListProps {
  onViewAll: () => void;
}

const transactions = [
  {
    id: "1",
    merchant: "ADOBE",
    description: "*ADOBE",
    amount: -100.26,
    date: "9:00am 08 Mar 2025",
    status: "Cleared",
    icon: "A",
    iconBg: "#FF0000",
  },
  {
    id: "2",
    merchant: "Deposit",
    description: "",
    amount: 14.0,
    date: "9:00am 08 Mar 2025",
    status: "Successful",
    icon: "+",
    iconBg: "#2A2F3A",
  },
];

export function TransactionsList({ onViewAll }: TransactionsListProps) {
  return (
    <div className="px-5 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Transactions</h2>
        <button
          onClick={onViewAll}
          className="text-sm text-[#00E660] hover:text-[#00cc55] transition-colors"
        >
          See All
        </button>
      </div>

      {/* Transaction List */}
      <Card className="bg-[#1A1D24] rounded-2xl border border-white/5 divide-y divide-white/5 px-2">
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="py-4 px-2 hover:bg-[#21242B] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: transaction.iconBg }}
              >
                {transaction.icon === "+" ? (
                  <span className="text-2xl">+</span>
                ) : (
                  <span>{transaction.icon}</span>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-white">
                      {transaction.merchant} {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {transaction.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        "text-base font-semibold",
                        transaction.amount > 0 ? "text-[#00E660]" : "text-white"
                      )}
                    >
                      {transaction.amount > 0 ? "+" : "-"}$
                      {Math.abs(transaction.amount).toFixed(2)} USD
                    </p>
                    <Badge
                      variant="secondary"
                      className="mt-1 bg-transparent border-0 text-xs text-gray-500 p-0"
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </Card>
    </div>
  );
}
