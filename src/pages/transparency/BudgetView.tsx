import React from "react";
import { Clock, ShieldCheck, Building2, FileText, Download, ExternalLink, Info } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

interface BudgetBreakdownItem {
  category: string;
  amount: string;
}

interface BudgetDocument {
  id: string | number;
  title: string;
  file_url?: string;
  file_size?: string;
  created_at?: string;
}

interface BudgetData {
  annualBudget?: string;
  status?: string;
  message?: string;
  breakdown?: BudgetBreakdownItem[];
  documents?: BudgetDocument[];
}

interface BudgetViewProps {
  data: BudgetData;
}

export default function BudgetView({ data }: BudgetViewProps) {
  const isToBePosted = 
    !data.annualBudget || 
    data.annualBudget === "TO BE POSTED" || 
    data.status === "TO BE POSTED" ||
    (!data.documents?.length && (!data.breakdown || data.breakdown.length === 0));

  return (
    <div className="space-y-6">
      {/* Main Budget Status Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-2xs relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 text-[10px] font-black uppercase tracking-wider border border-amber-500/20">
                <Clock size={11} />
                <span>Publication Status</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                • Municipal Transparency Seal
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight font-display">
              Annual Budget & Financial Appropriations
            </h2>
          </div>

          <div className="shrink-0">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-extrabold text-xs uppercase tracking-wider shadow-2xs">
              <Clock size={14} className="animate-pulse" />
              <span>TO BE POSTED</span>
            </div>
          </div>
        </div>

        {/* Status Body */}
        <div className="mt-6 space-y-4">
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-white border border-slate-200 text-brand-primary shrink-0 mt-0.5">
              <Info size={16} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Official Certification Notice
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                {data.message || "The official Annual Budget, Appropriation Ordinances, and Financial Disclosures for the Municipal Government of Talibon are currently being prepared for posting in compliance with the DILG Full Disclosure Policy and SGLG requirements."}
              </p>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                Office In-Charge
              </span>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Building2 size={13} className="text-brand-primary shrink-0" />
                <span>Municipal Budget Office</span>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                Compliance Standard
              </span>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                <span>DILG Full Disclosure Policy</span>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                Current Fiscal Status
              </span>
              <p className="text-xs font-black text-amber-700 uppercase">
                TO BE POSTED
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Render uploaded documents if published in Supabase */}
      {Array.isArray(data.documents) && data.documents.length > 0 && (
        <div className="space-y-3">
          <div className="px-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-primary block">
              Official Records
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-tight">
              Published Budget Documents
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.documents.map((doc, idx) => (
              <div 
                key={doc.id || idx}
                className="p-3.5 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between shadow-2xs hover:border-brand-primary/40 transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="w-9 h-9 rounded-lg bg-brand-primary/10 group-hover:bg-brand-primary group-hover:text-white flex items-center justify-center text-brand-primary transition-colors shrink-0">
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {doc.title}
                    </h4>
                    <span className="text-[9px] font-medium text-slate-400">
                      Official Budget Publication
                    </span>
                  </div>
                </div>

                {doc.file_url && (
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-slate-50 hover:bg-brand-primary hover:text-white rounded-lg text-slate-600 transition-colors border border-slate-200 shrink-0"
                    title="Download Official Document"
                  >
                    <Download size={13} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cross-navigation to Full Disclosure Policy & Transparency */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <Link
          to="/transparency/disclosure"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-brand-primary hover:border-brand-primary font-bold text-xs uppercase tracking-wider transition-all duration-150 shadow-2xs w-full sm:w-auto justify-center"
        >
          <FileText size={13} />
          <span>View Full Disclosure Policy</span>
        </Link>

        <Link
          to="/downloads"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-brand-primary hover:border-brand-primary font-bold text-xs uppercase tracking-wider transition-all duration-150 shadow-2xs w-full sm:w-auto justify-center"
        >
          <ExternalLink size={13} />
          <span>Browse Public Downloads</span>
        </Link>
      </div>
    </div>
  );
}

