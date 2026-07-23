import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CardsSectionProps {
  onCardClick: (id: string) => void;
}

const currencies = [
  { id: "usd", name: "USD", balance: 6500.5, symbol: "$" },
  { id: "eur", name: "EURO", balance: 1368.63, symbol: "$" },
];

export function CardsSection({ onCardClick }: CardsSectionProps) {
  return (
    <div className="px-5 py-4">
      <div className="grid grid-cols-2 gap-3">
        {currencies.map((currency, index) => (
          <motion.div
            key={currency.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              onClick={() => onCardClick(currency.id)}
              className="relative bg-[#2A2F3A] rounded-2xl p-4 text-left hover:bg-[#323842] transition-colors w-full h-auto justify-start"
            >
              <div className="absolute top-4 right-4">
                <ArrowUpRight
                  className="w-4 h-4 text-[#00E660]"
                  strokeWidth={2}
                />
              </div>
              <div className="mt-8">
                <h3 className="text-3xl font-bold text-white mb-1">
                  {currency.name}
                </h3>
                <p className="text-sm text-gray-400">
                  {currency.symbol}
                  {currency.balance.toFixed(2)} USD
                </p>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
