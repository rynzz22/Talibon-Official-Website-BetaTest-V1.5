import React from "react";

interface StructureData {
  imageUrl: string;
}

interface StructureViewProps {
  data: StructureData;
}

export default function StructureView({ data }: StructureViewProps) {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-3xl border-4 border-white shadow-2xl p-8 overflow-hidden">
        <img 
          src={data.imageUrl} 
          alt="Legislative Organizational Structure" 
          className="w-full h-auto rounded-xl"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}
