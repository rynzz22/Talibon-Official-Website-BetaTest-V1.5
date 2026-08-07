import React from "react";
import { CheckCircle2, ClipboardList } from "lucide-react";
import { motion } from "motion/react";

interface RequirementListProps {
  requirements: string[];
}

export const RequirementList: React.FC<RequirementListProps> = ({ requirements }) => {
  if (!requirements || requirements.length === 0) {
    return (
      <div className="p-8 text-center bg-brand-bg rounded-2xl border border-brand-border text-brand-muted font-medium">
        No specific requirements are listed for this service.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-surface border border-brand-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="bg-brand-bg px-8 py-5 border-b border-brand-border flex items-center gap-3">
        <ClipboardList size={18} className="text-brand-primary" />
        <span className="text-xs font-black text-brand-text uppercase tracking-widest">
          Required Documents & Credentials
        </span>
      </div>
      <ul className="divide-y divide-brand-border/60">
        {requirements.map((req, index) => (
          <motion.li 
            key={index} 
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="px-8 py-5 flex items-start gap-4 hover:bg-brand-bg/30 transition-colors"
          >
            <CheckCircle2 className="text-brand-primary mt-0.5 flex-shrink-0" size={18} />
            <span className="text-sm font-semibold text-brand-text leading-relaxed">
              {req}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

export default RequirementList;
