import React from "react";

interface ServiceItem {
  name: string;
  description?: string;
}

interface GovernmentServicesViewProps {
  data: ServiceItem[];
}

export default function GovernmentServicesView({ data }: GovernmentServicesViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.isArray(data) && data.map((service: ServiceItem, idx: number) => (
        <div key={`${service.name}-${idx}`} className="civic-card p-8 group">
          <h3 className="text-xl font-bold text-brand-text mb-4 group-hover:text-brand-primary transition-colors">
            {String(service.name)}
          </h3>
          <p className="text-brand-muted text-sm leading-relaxed">
            {String(service?.description || "")}
          </p>
        </div>
      ))}
    </div>
  );
}
