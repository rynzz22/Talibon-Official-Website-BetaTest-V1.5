import React from "react";
import { Calendar, Clock, MapPin } from "lucide-react";

interface Festivity {
  name: string;
  date: string;
  description: string;
  banner_image?: string;
  venue?: string;
  time?: string;
}

interface FestivitiesViewProps {
  data: Festivity[];
}

export default function FestivitiesView({ data }: FestivitiesViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 pb-8">
      {Array.isArray(data) && data.map((fest: Festivity, idx: number) => (
        <div 
          key={`${fest.name}-${idx}`} 
          className="bg-brand-surface rounded-xl sm:rounded-2xl border border-brand-border p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between space-y-3 hover:border-brand-primary/40 transition-all group"
        >
          <div className="space-y-2.5">
            <div className="aspect-[16/9] max-h-44 sm:max-h-48 relative overflow-hidden rounded-lg sm:rounded-xl border border-brand-border/50 bg-white">
              <img 
                src={fest.banner_image || `https://picsum.photos/seed/${encodeURIComponent(fest.name)}/800/600`} 
                alt={fest.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                referrerPolicy="no-referrer" 
              />
              <div className="absolute top-2 left-2 bg-brand-primary text-white px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shadow-xs">
                {fest.date}
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm sm:text-base font-bold text-brand-text group-hover:text-brand-primary transition-colors font-display tracking-tight leading-snug">
                {fest.name}
              </h3>
              
              <p className="text-[11px] sm:text-xs text-brand-muted leading-relaxed font-normal line-clamp-3">
                {fest?.description}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-brand-border/60 text-[10px] sm:text-[11px] font-medium text-brand-text space-y-1">
            {fest.venue && (
              <div className="flex items-center gap-1.5 text-brand-muted">
                <MapPin size={12} className="text-brand-primary shrink-0" />
                <span className="line-clamp-1">{fest.venue}</span>
              </div>
            )}
            {fest.time && (
              <div className="flex items-center gap-1.5 text-brand-muted">
                <Clock size={12} className="text-brand-primary shrink-0" />
                <span>{fest.time}</span>
              </div>
            )}
            {!fest.venue && !fest.time && (
              <div className="flex items-center gap-1.5 text-brand-muted">
                <Calendar size={12} className="text-brand-primary shrink-0" />
                <span>Annual Municipal Celebration</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
