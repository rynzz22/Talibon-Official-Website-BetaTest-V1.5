import React from "react";

interface ProfileViewProps {
  data: {
    content: string;
  };
}

export default function ProfileView({ data }: ProfileViewProps) {
  return (
    <p className="text-lg text-brand-muted leading-relaxed font-medium whitespace-pre-line">
      {data.content}
    </p>
  );
}
