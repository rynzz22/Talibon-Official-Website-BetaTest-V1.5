import React from "react";

interface HymnData {
  title?: string;
  author?: string;
  imageUrl?: string;
  lyrics?: string;
}

interface HymnViewProps {
  data: HymnData;
}

export default function HymnView({ data }: HymnViewProps) {
  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold text-brand-text font-display uppercase tracking-tight">
          {data.title || "Talibon Hymn"}
        </h2>
        <p className="text-xs font-bold text-brand-primary uppercase tracking-wider">
          BY: {data.author || "Norman Ingking"}
        </p>
      </div>
      
      {data.imageUrl ? (
        <div className="bg-white rounded-2xl border border-brand-border shadow-md p-3 max-w-md mx-auto overflow-hidden">
          <img 
            src={data.imageUrl} 
            alt="Talibon Hymn Lyrics" 
            className="w-full h-auto max-h-[60vh] object-contain rounded-lg mx-auto"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <div className="civic-card p-6 bg-white text-center max-w-md mx-auto rounded-xl border border-brand-border shadow-sm">
          <div className="prose prose-blue max-w-none mx-auto">
            {data.lyrics?.split('\n\n').map((paragraph: string, idx: number) => (
              <div key={idx} className="mb-4 last:mb-0">
                {paragraph.split('\n').map((line: string, lIdx: number) => (
                  <p key={lIdx} className="text-xs sm:text-sm text-brand-text font-bold leading-tight mb-0.5">
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
