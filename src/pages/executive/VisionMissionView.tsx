import React from "react";
import { Eye, Target } from "lucide-react";

interface VisionMissionData {
  vision: string;
  mission: string;
}

interface VisionMissionViewProps {
  data: VisionMissionData;
}

export default function VisionMissionView({ data }: VisionMissionViewProps) {
  return (
    <div className="space-y-12">
      <div className="p-10 civic-card bg-brand-primary/5 border-l-8 border-brand-primary relative overflow-hidden">
        <Eye size={48} className="absolute -top-4 -left-4 text-brand-primary/10" />
        <h3 className="text-xs font-extrabold text-brand-primary mb-6 uppercase tracking-[0.3em]">Vision</h3>
        <p className="text-2xl text-brand-text font-bold leading-tight italic">"{data.vision}"</p>
      </div>
      <div className="p-10 civic-card bg-brand-accent/5 border-l-8 border-brand-accent relative overflow-hidden">
        <Target size={48} className="absolute -top-4 -left-4 text-brand-accent/10" />
        <h3 className="text-xs font-extrabold text-brand-accent mb-6 uppercase tracking-[0.3em]">Mission</h3>
        <p className="text-2xl text-brand-text font-bold leading-tight italic">"{data.mission}"</p>
      </div>
    </div>
  );
}
