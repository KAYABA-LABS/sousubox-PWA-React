import { Card } from "@/components/ui/card";

interface TransactionsListProps {
  onViewAll: () => void;
}

export function TransactionsList({ onViewAll }: TransactionsListProps) {
  return (
    <div className="px-5 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Transactions</h2>
        <button
          onClick={onViewAll}
          className="text-sm text-[#0D4F3C] dark:text-[#156B53] hover:text-[#156B53] transition-colors"
        >
          See All
        </button>
      </div>

      <Card className="bg-[#1A1D24] rounded-2xl border border-white/5 px-4 py-8 text-center">
        <p className="text-sm text-gray-400">No transactions available yet.</p>
      </Card>
    </div>
  );
}
