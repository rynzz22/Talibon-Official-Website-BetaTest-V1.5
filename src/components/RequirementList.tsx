import React from "react";
import { CheckCircle2, ClipboardList, Info } from "lucide-react";
import { motion } from "motion/react";

interface RequirementListProps {
  requirements: string[];
}

export const RequirementList: React.FC<RequirementListProps> = ({ requirements }) => {
  if (!requirements || requirements.length === 0) {
    return (
      <div className="p-6 text-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center justify-center gap-1.5">
        <Info size={22} className="text-slate-300" />
        <p className="text-slate-600 font-semibold text-xs sm:text-sm">
          No specific documentary requirements are listed for this service.
        </p>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Standard municipal identity verification may apply
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
      <div className="bg-slate-50 px-4 sm:px-5 py-2.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-brand-primary/10 text-brand-primary rounded-lg">
            <ClipboardList size={13} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Required Documents & Credentials
            </span>
          </div>
        </div>
        <span className="px-2.5 py-0.5 bg-brand-primary/10 text-brand-primary text-[10px] font-bold rounded-full">
          {requirements.length} {requirements.length === 1 ? "Item" : "Items"}
        </span>
      </div>
      
      <ul className="divide-y divide-slate-100">
        {requirements.map((req, index) => (
          <motion.li 
            key={index} 
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className="px-4 sm:px-5 py-3 flex items-start gap-3 hover:bg-slate-50/60 transition-colors group"
          >
            <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <CheckCircle2 size={11} />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug block">
                {req}
              </span>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

export default RequirementList;

