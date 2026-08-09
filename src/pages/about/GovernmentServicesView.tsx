import React from "react";
import { Link } from "react-router-dom";
import { Clock, Building2, ChevronRight, FileText, Banknote } from "lucide-react";

interface ServiceItem {
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  purpose?: string;
  processing_time?: string;
  fees?: string;
  office_responsible?: string;
  requirements?: string[];
  status?: string;
}

interface GovernmentServicesViewProps {
  data: ServiceItem[];
}

export default function GovernmentServicesView({ data }: GovernmentServicesViewProps) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="civic-card p-12 text-center space-y-3 max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-sky-50 text-brand-primary flex items-center justify-center mx-auto">
          <Building2 size={24} />
        </div>
        <h3 className="text-lg font-bold text-brand-text">No Services Published</h3>
        <p className="text-xs text-brand-muted leading-relaxed">
          There are currently no municipal services published in the database. Services added in the Admin Dashboard will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.map((service: ServiceItem, idx: number) => {
        const linkPath = service.slug || service.id ? `/services/${service.slug || service.id}` : null;

        const cardContent = (
          <div className="civic-card p-6 sm:p-8 group hover:border-brand-primary/40 transition-all flex flex-col justify-between h-full space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-black text-brand-text group-hover:text-brand-primary transition-colors font-display tracking-tight">
                  {String(service.name)}
                </h3>
                {service.status && (
                  <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border border-brand-primary/20 bg-brand-primary/10 text-brand-primary shrink-0">
                    {service.status}
                  </span>
                )}
              </div>

              {service.description && (
                <p className="text-xs text-brand-muted leading-relaxed font-medium line-clamp-3">
                  {String(service.description)}
                </p>
              )}

              <div className="pt-2 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-600 dark:text-slate-300 font-semibold border-t border-brand-border/60">
                {service.office_responsible && (
                  <div className="flex items-center gap-1.5">
                    <Building2 size={13} className="text-brand-primary shrink-0" />
                    <span>{service.office_responsible}</span>
                  </div>
                )}
                {service.processing_time && (
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-amber-500 shrink-0" />
                    <span>{service.processing_time}</span>
                  </div>
                )}
                {service.fees && (
                  <div className="flex items-center gap-1.5">
                    <Banknote size={13} className="text-emerald-600 shrink-0" />
                    <span>{service.fees}</span>
                  </div>
                )}
              </div>
            </div>

            {linkPath && (
              <div className="flex items-center gap-1 text-xs font-black text-brand-primary uppercase tracking-widest pt-2">
                <span>View Full Requirements & Guide</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </div>
        );

        return linkPath ? (
          <Link key={`${service.name}-${idx}`} to={linkPath} className="block h-full">
            {cardContent}
          </Link>
        ) : (
          <div key={`${service.name}-${idx}`} className="block h-full">
            {cardContent}
          </div>
        );
      })}
    </div>
  );
}

