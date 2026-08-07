import React from "react";
import { Phone, Building2 } from "lucide-react";

interface DirectoryEntry {
  department: string;
  contact: string;
}

interface DirectoryViewProps {
  data: DirectoryEntry[];
}

export default function DirectoryView({ data }: DirectoryViewProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-3">
      {Array.isArray(data) && data.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.map((dept: DirectoryEntry, idx: number) => (
            <div 
              key={`${dept.department}-${idx}`} 
              className="flex justify-between items-center gap-3 p-4 bg-white border border-brand-border rounded-xl shadow-xs hover:border-brand-primary/40 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-lg bg-brand-primary/5 border border-brand-primary/10 flex items-center justify-center shrink-0 text-brand-primary">
                  <Building2 size={18} />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-brand-text group-hover:text-brand-primary transition-colors leading-snug">
                  {dept.department}
                </h3>
              </div>
              <a 
                href={`tel:${dept.contact}`}
                className="flex items-center gap-1.5 text-xs font-bold text-brand-primary bg-brand-primary/5 hover:bg-brand-primary hover:text-white px-3 py-2 rounded-lg border border-brand-primary/10 transition-all shrink-0"
              >
                <Phone size={13} />
                <span className="font-mono">{dept.contact}</span>
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-brand-muted font-bold text-xs uppercase tracking-wider">
          No directory entries found.
        </div>
      )}
    </div>
  );
}

