import React from "react";

interface IndustryData {
  content: string;
}

interface IndustryViewProps {
  data: IndustryData;
}

export default function IndustryView({ data }: IndustryViewProps) {
  return (
    <p className="text-lg text-brand-muted leading-relaxed font-medium whitespace-pre-line">
      {data.content}
    </p>
  );
}
