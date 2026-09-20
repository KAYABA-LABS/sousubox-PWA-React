import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";

interface BudgetWidgetProps {
  spent: number;
  total: number;
  dateRange: string;
}

export function BudgetWidget({ spent, total, dateRange }: BudgetWidgetProps) {
  return (
    <Card className="px-5 py-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white">Budget</span>
        <Badge variant="secondary" className="bg-[#2A2F3A] text-gray-400">
          {dateRange}
        </Badge>
      </div>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-lg font-bold text-white">${spent}</span>
        <span className="text-sm text-gray-500">/ ${total}</span>
      </div>
      <ProgressBar value={spent} max={total} color="#0D4F3C" />
    </Card>
  );
}
