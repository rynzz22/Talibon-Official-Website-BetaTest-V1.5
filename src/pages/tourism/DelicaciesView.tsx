import React from "react";

interface Delicacy {
  name: string;
  description: string;
  featured_image?: string;
}

interface DelicaciesViewProps {
  data: Delicacy[];
}

export default function DelicaciesView({ data }: DelicaciesViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.isArray(data) && data.map((item: Delicacy, idx: number) => (
        <div key={`${item.name}-${idx}`} className="civic-card p-8 group hover:-translate-y-2">
          <div className="aspect-square bg-brand-bg rounded-[2rem] mb-6 overflow-hidden border-2 border-brand-primary/5 shadow-inner relative">
            <img 
              src={item.featured_image || `https://picsum.photos/seed/${encodeURIComponent(item.name)}/400/400`} 
              alt={item.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
              referrerPolicy="no-referrer" 
            />
          </div>
          <h3 className="text-xl font-black text-brand-text mb-3 group-hover:text-brand-primary transition-colors font-display uppercase tracking-tight">
            {item.name}
          </h3>
          <p className="text-brand-muted text-sm font-medium leading-relaxed line-clamp-3">
            {item?.description}
          </p>
        </div>
      ))}
    </div>
  );
}
