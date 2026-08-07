import React from "react";
import { AlertTriangle, RotateCcw, Facebook, ExternalLink } from "lucide-react";
import { OFFICIAL_FACEBOOK_URLS } from "../constants";

interface DataUnavailableStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showFacebookLink?: boolean;
  compact?: boolean;
  className?: string;
}

export default function DataUnavailableState({
  title = "Information Temporarily Unavailable",
  message = "We couldn't retrieve the latest municipal records at this time. Please try again or visit our official social media page.",
  onRetry,
  showFacebookLink = true,
  compact = false,
  className = "",
}: DataUnavailableStateProps) {
  if (compact) {
    return (
      <div className={`p-4 bg-sky-50/80 border border-sky-200/80 rounded-2xl text-sky-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${className}`}>
        <div className="flex items-center gap-2.5">
          <AlertTriangle size={18} className="text-sky-600 shrink-0" />
          <span className="font-semibold leading-tight">{message}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1.5 bg-[#3A8FC2] hover:bg-[#2B82B8] text-white rounded-xl font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 transition-all cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Retry</span>
            </button>
          )}
          {showFacebookLink && (
            <a
              href={OFFICIAL_FACEBOOK_URLS.PIO}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 transition-all cursor-pointer"
            >
              <Facebook size={12} />
              <span>Facebook</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-8 sm:p-12 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto my-6 ${className}`}>
      <div className="w-14 h-14 bg-sky-100 text-sky-700 rounded-2xl flex items-center justify-center shadow-xs">
        <AlertTriangle size={28} />
      </div>

      <div className="space-y-1 max-w-lg">
        <h3 className="text-lg sm:text-xl font-black text-slate-800 uppercase tracking-tight font-display">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          {message}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full sm:w-auto">
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full sm:w-auto px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Try Again</span>
          </button>
        )}

        {showFacebookLink && (
          <a
            href={OFFICIAL_FACEBOOK_URLS.PIO}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Facebook size={14} />
            <span>Official Facebook Page</span>
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
}
