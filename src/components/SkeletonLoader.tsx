import React from "react";

interface SkeletonLoaderProps {
  count?: number;
  type?: "text" | "card" | "image";
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ count = 1, type = "text" }) => {
  const items = Array.from({ length: count });

  if (type === "card") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-2xl mb-4" />
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "image") {
    return (
      <div className="animate-pulse">
        <div className="aspect-video bg-gray-200 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-pulse">
      {items.map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
      ))}
    </div>
  );
};
