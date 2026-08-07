import React from "react";

interface BudgetBreakdownItem {
  category: string;
  amount: string;
}

interface BudgetData {
  annualBudget: string;
  breakdown: BudgetBreakdownItem[];
}

interface BudgetViewProps {
  data: BudgetData;
}

export default function BudgetView({ data }: BudgetViewProps) {
  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-8 bg-brand-primary text-white rounded-2xl shadow-lg relative overflow-hidden group border border-brand-primary/20">
        <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-90">Annual Budget</h3>
        <p className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-none font-display uppercase">{String(data.annualBudget)}</p>
        <span className="absolute -bottom-4 -right-4 text-6xl font-black text-white/10 select-none pointer-events-none group-hover:scale-105 transition-transform duration-500">
          PHP
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {Array.isArray(data.breakdown) && data.breakdown.map((item: BudgetBreakdownItem, idx: number) => (
          <div key={`${item.category}-${idx}`} className="p-4 rounded-xl border border-brand-border bg-white shadow-xs group hover:border-brand-primary/30 transition-all">
            <p className="text-[9px] font-bold text-brand-muted uppercase tracking-wider mb-1 group-hover:text-brand-primary transition-colors">{String(item.category)}</p>
            <p className="text-base sm:text-lg font-bold text-brand-text font-display uppercase">{String(item.amount)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
