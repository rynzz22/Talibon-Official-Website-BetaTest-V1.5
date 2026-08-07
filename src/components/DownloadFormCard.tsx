import React from "react";
import { Download, FileText, Info } from "lucide-react";
import { ServiceForm } from "../data/servicesData";

interface DownloadFormCardProps {
  forms?: ServiceForm[];
}

export const DownloadFormCard: React.FC<DownloadFormCardProps> = ({ forms }) => {
  if (!forms || forms.length === 0) {
    return (
      <div className="p-8 text-center bg-brand-bg rounded-3xl border border-brand-border flex flex-col items-center justify-center gap-3">
        <Info size={32} className="text-brand-muted" />
        <p className="text-sm font-semibold text-brand-muted">
          No downloadable forms are currently available for this service.
        </p>
        <p className="text-[10px] text-brand-muted/70 uppercase tracking-wider">
          Required documents can be obtained directly at the designated office.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {forms.map((form, idx) => {
        // Safe check for fileSize, otherwise provide a standard placeholder like "1.2 MB"
        const displaySize = form.fileSize || "1.2 MB";
        
        return (
          <div 
            key={idx}
            className="p-6 border border-brand-border/80 rounded-2xl flex items-center justify-between bg-white dark:bg-dark-surface group hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/5 transition-all duration-300"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary/5 group-hover:bg-brand-primary/10 flex items-center justify-center text-brand-primary transition-colors flex-shrink-0">
                <FileText size={22} />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-extrabold text-brand-text truncate group-hover:text-brand-primary transition-colors pr-2">
                  {form.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">
                    PDF Document
                  </span>
                  <span className="w-1 h-1 bg-brand-muted/30 rounded-full" />
                  <span className="text-[10px] font-bold text-brand-muted">
                    {displaySize}
                  </span>
                </div>
              </div>
            </div>
            
            <a 
              href={form.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-brand-bg hover:bg-brand-primary hover:text-white rounded-2xl text-brand-muted transition-all duration-300 border border-brand-border/60 hover:border-brand-primary hover:scale-105 shadow-sm"
              title="Download PDF"
            >
              <Download size={16} />
            </a>
          </div>
        );
      })}
    </div>
  );
};

export default DownloadFormCard;
