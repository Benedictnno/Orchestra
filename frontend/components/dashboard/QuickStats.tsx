"use client";
import { CreditCard, Layers, TrendingUp, Sparkles } from "lucide-react";
import { toNaira } from "@/utils/format";

interface QuickStatsProps {
  totalCards: number;
  virtualCards: number;
  monthlySpend: number;
  savedThisMonth: number;
}

export default function QuickStats({
  totalCards,
  virtualCards,
  monthlySpend,
  savedThisMonth,
}: QuickStatsProps) {
  const stats = [
    {
      label: "Physical Cards",
      value: String(totalCards),
      subtext: "Active in wallet",
      icon: CreditCard,
    },
    {
      label: "Virtual Cards",
      value: String(virtualCards),
      subtext: "Subscriptions & online",
      icon: Layers,
    },
    {
      label: "Monthly Spend",
      value: toNaira(monthlySpend),
      subtext: "Month to date",
      icon: TrendingUp,
    },
    {
      label: "Smart Optimization",
      value: toNaira(savedThisMonth),
      subtext: "AI routing yield",
      icon: Sparkles,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map(({ label, value, subtext, icon: Icon }) => (
        <div
          key={label}
          className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-medium text-slate-500 truncate">{label}</span>
            <Icon size={16} className="text-slate-400 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 font-mono tabular-nums truncate">
            {value}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-normal truncate">{subtext}</p>
        </div>
      ))}
    </div>
  );
}

