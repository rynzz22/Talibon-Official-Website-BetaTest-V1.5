import React from "react";

interface Project {
  id: string;
  title: string;
  status: string;
  budget: string;
}

interface InfrastructureViewProps {
  data: Project[];
}

export default function InfrastructureView({ data }: InfrastructureViewProps) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {Array.isArray(data) && data.map((project: Project, idx: number) => (
        <div key={`${project.id}-${idx}`} className="p-3.5 sm:p-4 rounded-xl border border-brand-border bg-white shadow-xs group">
          <div className="flex justify-between items-start gap-3 mb-2">
            <h3 className="text-xs sm:text-sm font-bold text-brand-text group-hover:text-brand-primary transition-colors font-display uppercase tracking-tight">
              {String(project.title)}
            </h3>
            <span className="px-2.5 py-0.5 bg-brand-primary/10 text-brand-primary rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0">
              {String(project.status)}
            </span>
          </div>
          <p className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">
            BUDGET: <span className="text-brand-primary">{String(project.budget)}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
