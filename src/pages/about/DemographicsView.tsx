import React from "react";

interface DemographicsData {
  content: string;
  images?: string[];
}

interface DemographicsViewProps {
  data: DemographicsData;
}

export default function DemographicsView({ data }: DemographicsViewProps) {
  return (
    <div className="space-y-12">
      <p className="text-lg text-brand-muted leading-relaxed font-medium">{data?.content}</p>
      {data?.images && Array.isArray(data.images) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.images.map((img: string, i: number) => (
            <div key={i} className="aspect-square bg-brand-surface rounded-3xl border-4 border-white shadow-xl overflow-hidden hover:scale-105 transition-transform duration-500">
              <img src={img} alt={`Demographics ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
