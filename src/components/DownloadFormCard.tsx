import React from "react";
import { Download, FileText, Info, ExternalLink } from "lucide-react";
import { ServiceForm } from "../data/servicesData";

interface DownloadFormCardProps {
  forms?: ServiceForm[];
}

export const DownloadFormCard: React.FC<DownloadFormCardProps> = ({ forms }) => {
  if (!forms || forms.length === 0) {
    return (
      <div className="p-6 text-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center justify-center gap-1.5">
        <div className="p-2 bg-slate-100 text-slate-400 rounded-xl">
          <Info size={18} />
        </div>
        <p className="text-xs sm:text-sm font-bold text-slate-700">
          No downloadable forms are currently available for this service.
        </p>
        <p className="text-[11px] text-slate-400 font-medium">
          Required physical application forms can be obtained directly at the designated department counter.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {forms.map((form, idx) => {
        const displaySize = form.fileSize || "1.2 MB";
        
        return (
          <div 
            key={idx}
            className="p-3.5 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between shadow-2xs hover:border-brand-primary/40 hover:shadow-sm transition-all duration-200 group"
          >
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="w-9 h-9 rounded-lg bg-brand-primary/10 group-hover:bg-brand-primary group-hover:text-white flex items-center justify-center text-brand-primary transition-colors shrink-0">
                <FileText size={16} />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-brand-primary transition-colors">
                  {form.title}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] font-extrabold text-brand-primary uppercase tracking-wider">
                    Official Form
                  </span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span className="text-[9px] font-medium text-slate-400">
                    PDF ({displaySize})
                  </span>
                </div>
              </div>
            </div>
            
            <a 
              href={form.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-slate-50 hover:bg-brand-primary hover:text-white rounded-lg text-slate-600 transition-all duration-150 border border-slate-200 hover:border-brand-primary shrink-0 flex items-center justify-center"
              title="Download PDF Form"
            >
              <Download size={14} />
            </a>
          </div>
        );
      })}
    </div>
  );
};

export default DownloadFormCard;

