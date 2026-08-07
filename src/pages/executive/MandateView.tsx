import React from "react";

interface MandateData {
  content: string;
}

interface MandateViewProps {
  data: MandateData;
}

export default function MandateView({ data }: MandateViewProps) {
  return (
    <p className="text-lg text-brand-muted leading-relaxed font-medium">
      {data.content}
    </p>
  );
}
