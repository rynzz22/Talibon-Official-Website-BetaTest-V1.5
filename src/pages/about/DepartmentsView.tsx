import React from "react";
import { motion } from "motion/react";
import { User, Phone, ExternalLink, Building2 } from "lucide-react";

interface Department {
  name: string;
  officialName: string;
  description: string;
  logoUrl?: string;
  type: string;
  head?: string;
  contact?: string;
  serviceLink?: string;
}

interface DepartmentsViewProps {
  data: Department[];
}

export default function DepartmentsView({ data }: DepartmentsViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.isArray(data) && data.length > 0 ? (
          data.map((dept: Department, idx: number) => {
            return (
              <motion.div 
                key={`${dept.name}-${idx}`} 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.03 }}
                className="group relative overflow-hidden bg-white border border-brand-border rounded-xl p-4 hover:border-brand-primary/40 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-3">
                      {dept.logoUrl ? (
                        <div className="w-10 h-10 bg-white rounded-lg p-1 shadow-xs border border-brand-border shrink-0">
                          <img 
                            src={dept.logoUrl} 
                            alt="" 
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-brand-surface rounded-lg flex items-center justify-center border border-brand-border shrink-0">
                          <Building2 size={16} className="text-brand-primary" />
                        </div>
                      )}
                      <div className="px-2 py-0.5 bg-brand-primary/5 text-brand-primary text-[8px] font-bold rounded-full border border-brand-primary/10 tracking-wider uppercase ml-auto">
                        {dept.type}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-brand-text uppercase tracking-tight leading-snug mb-1 group-hover:text-brand-primary transition-colors">
                        {dept.name}
                      </h3>
                      <p className="text-[9.5px] font-mono font-medium text-brand-muted uppercase tracking-wider mb-2 border-l-2 border-brand-primary/20 pl-2">
                        {dept.officialName}
                      </p>
                      <p className="text-xs text-brand-muted leading-relaxed mb-4 opacity-90 line-clamp-3">
                        {dept.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-brand-border/60 mt-auto">
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-bold text-brand-muted uppercase tracking-wider block opacity-70">Director / Head</span>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-brand-text uppercase tracking-tight group-hover:text-brand-primary transition-colors">
                          <User size={11} className="shrink-0 text-brand-primary/80" />
                          <span className="truncate">{dept.head || "OIC"}</span>
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-bold text-brand-muted uppercase tracking-wider block opacity-70">Operations</span>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-brand-text uppercase tracking-tight">
                          <Phone size={11} className="shrink-0 text-brand-primary" />
                          <span className="truncate">{dept.contact || "-"}</span>
                        </div>
                      </div>
                    </div>

                    <a 
                      href={dept.serviceLink || "/about/services"}
                      className="w-full flex items-center justify-between gap-2 text-[9px] font-bold uppercase tracking-wider px-3 py-2 bg-gray-50 hover:bg-brand-text hover:text-white rounded-lg transition-all border border-brand-border/40"
                    >
                      <span>Access Services</span> <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                {/* Background Icon */}
                <div className="absolute -bottom-4 -right-4 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity pointer-events-none select-none">
                  <Building2 size={120} />
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-brand-muted font-bold text-xs uppercase tracking-wider">
            No departments found in technical database.
          </div>
        )}
      </div>
    </div>
  );
}
