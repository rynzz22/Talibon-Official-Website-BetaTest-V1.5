import React from "react";

interface Report {
  id: string;
  title: string;
  url: string;
}

interface FinanceViewProps {
  data: Report[];
}

export default function FinanceView({ data }: FinanceViewProps) {
  return (
    <div className="grid grid-cols-1 gap-2.5">
      {Array.isArray(data) && data.map((report: Report, idx: number) => (
        <a key={`${report.id}-${idx}`} href={report.url} className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-brand-border bg-white shadow-xs group hover:bg-brand-primary/5 hover:border-brand-primary/30 transition-all duration-200">
          <span className="text-xs sm:text-sm font-bold text-brand-text group-hover:text-brand-primary transition-colors font-display uppercase tracking-tight">
            {String(report.title)}
          </span>
          <span className="text-[9px] font-bold text-brand-primary uppercase tracking-wider bg-brand-primary/10 px-3 py-1 rounded-full shrink-0">
            VIEW REPORT
          </span>
        </a>
      ))}
    </div>
  );
}
