import React from "react";
import { Quote } from "lucide-react";

interface Mayor {
  name: string;
  term?: string;
}

interface Commentary {
  content: string;
  source: string;
}

interface MayorSection {
  section: string;
  mayors: Mayor[];
  commentary?: Commentary;
}

interface MayorsViewProps {
  data: MayorSection[];
}

export default function MayorsView({ data }: MayorsViewProps) {
  return (
    <div className="space-y-12">
      {Array.isArray(data) && data.length > 0 ? (
        data.map((section: MayorSection, idx: number) => (
          <div key={idx} className="space-y-6">
            <div className="border-b-2 border-brand-primary/20 pb-4">
              <h2 className="text-3xl font-extrabold text-brand-text font-display">
                {section.section}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.mayors.map((mayor: Mayor, mIdx: number) => (
                <div key={mIdx} className="civic-card p-6 group">
                  <h3 className="text-xl font-bold text-brand-text group-hover:text-brand-primary transition-colors">
                    {mayor.name}
                  </h3>
                  {mayor.term && (
                    <p className="text-xs font-bold text-brand-primary uppercase tracking-widest mt-2 bg-brand-primary/5 inline-block px-2 py-1 rounded">
                      TERM: {mayor.term}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {section.commentary && (
              <div className="p-8 bg-brand-primary/5 border-l-4 border-brand-primary rounded-r-2xl relative overflow-hidden group">
                <Quote size={48} className="absolute -top-4 -left-4 text-brand-primary/10" />
                <p className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-4">
                  Historical Commentary
                </p>
                <p className="text-xl text-brand-text font-medium leading-relaxed italic">
                  "{section.commentary.content}"
                </p>
                <p className="text-sm font-bold text-brand-muted text-right mt-6">
                  — {section.commentary.source}
                </p>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-center py-24 text-brand-muted font-bold uppercase tracking-widest">
          No data available.
        </div>
      )}
    </div>
  );
}
