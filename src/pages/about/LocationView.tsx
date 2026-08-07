import React from "react";
import LocationMap from "../../components/LocationMap";

interface LocationData {
  lat?: number;
  lng?: number;
  logoUrl?: string;
  description: string;
}

interface LocationViewProps {
  data: LocationData;
}

export default function LocationView({ data }: LocationViewProps) {
  return (
    <div className="space-y-8">
      <div className="relative aspect-video bg-brand-surface rounded-3xl border-4 border-white shadow-xl overflow-hidden group z-0">
        <LocationMap 
          lat={data.lat || 10.1517} 
          lng={data.lng || 124.3333} 
          title="Talibon Bohol" 
          logoUrl={data.logoUrl} 
        />
      </div>
      
      <div className="p-8 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
        <p className="text-lg text-brand-muted leading-relaxed font-medium whitespace-pre-line">{data?.description}</p>
      </div>
    </div>
  );
}
