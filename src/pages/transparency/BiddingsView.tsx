import React from "react";

interface BidItem {
  id: string;
  title: string;
  deadline: string;
}

interface BiddingsViewProps {
  data: BidItem[];
}

export default function BiddingsView({ data }: BiddingsViewProps) {
  return (
    <div className="grid grid-cols-1 gap-2.5">
      {Array.isArray(data) && data.map((bid: BidItem, idx: number) => (
        <div key={`${bid.id}-${idx}`} className="p-3.5 sm:p-4 rounded-xl border border-brand-border bg-white shadow-xs group space-y-1 hover:border-brand-primary/30 transition-all">
          <h3 className="text-xs sm:text-sm font-bold text-brand-text group-hover:text-brand-primary transition-colors font-display tracking-tight">
            {String(bid.title)}
          </h3>
          <p className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">
            DEADLINE: {String(bid.deadline)}
          </p>
        </div>
      ))}
    </div>
  );
}
