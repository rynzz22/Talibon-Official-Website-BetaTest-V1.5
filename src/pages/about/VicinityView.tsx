import React from "react";
import { MapPin } from "lucide-react";

interface VicinityData {
  url?: string;
  title?: string;
  description?: string;
}

interface VicinityViewProps {
  data?: VicinityData;
}

export default function VicinityView({ data }: VicinityViewProps) {
  const mapUrl = data?.url || "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Ph_locator_bohol_talibon.png/800px-Ph_locator_bohol_talibon.png";
  const mapTitle = data?.title || "Vicinity Map of Talibon, Bohol";
  const mapDesc = data?.description || "Located in the northern coast of the province of Bohol, Talibon serves as a major commercial and administrative hub bounded by the Camotes Sea and Danajon Bank.";

  return (
    <div className="space-y-8">
      <div className="aspect-video bg-brand-surface rounded-3xl border-4 border-white shadow-xl overflow-hidden relative flex items-center justify-center p-4">
        <img 
          src={mapUrl} 
          alt={mapTitle} 
          className="max-h-full max-w-full object-contain rounded-2xl" 
          referrerPolicy="no-referrer" 
        />
        <div className="absolute top-4 left-4 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
          <MapPin size={12} />
          <span>{mapTitle}</span>
        </div>
      </div>
      <p className="text-lg text-brand-muted leading-relaxed font-medium bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        {mapDesc}
      </p>
    </div>
  );
}
