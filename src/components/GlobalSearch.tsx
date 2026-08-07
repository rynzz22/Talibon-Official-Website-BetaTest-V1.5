import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, FileText, Newspaper, FileCode, ArrowRight, Loader2, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface SearchResult {
  id: string;
  title: string;
  type: "news" | "ordinance" | "page";
  url: string;
  description?: string;
  date?: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const staticPages: SearchResult[] = [
  { id: "p1", title: "Brief Profile", type: "page", url: "/about/profile", description: "Learn about Talibon's profile and demographics." },
  { id: "p2", title: "Official Seal", type: "page", url: "/about/seal", description: "The symbolism and history of the municipal seal." },
  { id: "p3", title: "Brief History", type: "page", url: "/about/history", description: "The timeline and historical background of Talibon." },
  { id: "p4", title: "Executive Mandate", type: "page", url: "/executive/mandate", description: "The roles and mandates of the executive branch." },
  { id: "p5", title: "Legislative Mandate", type: "page", url: "/legislative/mandate", description: "The roles and mandates of the legislative branch." },
  { id: "p6", title: "Citizen's Charter", type: "page", url: "/transparency/charter", description: "Official service standards and guidelines." },
  { id: "p7", title: "Full Disclosure", type: "page", url: "/transparency/disclosure", description: "Transparency and financial accountability reports." },
  { id: "p8", title: "Infrastructure Projects", type: "page", url: "/transparency/infrastructure", description: "Status of ongoing and completed municipal projects." },
  { id: "p9", title: "Tourist Spots", type: "page", url: "/tourism/spots", description: "Explore the beautiful destinations in Talibon." },
  { id: "p10", title: "GAD-IMS", type: "page", url: "/executive/gad-ims", description: "Integrated Management System for GAD." },
];

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setSearchQuery("");
      setResults([]);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(q);
    }, 300);

    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [searchQuery]);

  const performSearch = async (q: string) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    const lq = q.toLowerCase();

    try {
      const pageResults = staticPages.filter(
        (p) =>
          p.title.toLowerCase().includes(lq) ||
          (p.description?.toLowerCase().includes(lq) ?? false)
      );

      const [newsResponse, ordResponse] = await Promise.all([
        supabase
          .from("news")
          .select("id, title, summary, date, category")
          .is("barangay_id", null)
          .or(`title.ilike.%${q}%,summary.ilike.%${q}%`)
          .limit(8),
        supabase
          .from("ordinances")
          .select("id, title, year, created_at")
          .is("barangay_id", null)
          .ilike("title", `%${q}%`)
          .limit(8),
      ]);

      const newsResults: SearchResult[] = (newsResponse.data ?? []).map((n) => ({
        id: n.id,
        title: n.title,
        type: "news" as const,
        url: `/news/view/${n.id}`,
        description: n.summary,
        date: n.date,
      }));

      const ordResults: SearchResult[] = (ordResponse.data ?? []).map((o) => ({
        id: o.id,
        title: o.title,
        type: "ordinance" as const,
        url: "/legislative/ordinances",
        description: `Year: ${o.year}`,
        date: o.created_at,
      }));

      setResults([...pageResults, ...newsResults, ...ordResults]);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("[GlobalSearch] Error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[105] flex items-start justify-center pt-24 px-4 sm:px-6"
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label="Site search"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-text/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.25)] overflow-hidden border border-gray-100"
          >
            <div className="p-8 pb-4">
              <div className="relative group">
                <Search
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-primary transition-colors"
                  size={24}
                  aria-hidden="true"
                />
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search articles, ordinances, pages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  maxLength={100}
                  aria-label="Search the site"
                  className="w-full bg-brand-bg rounded-2xl py-6 pl-16 pr-16 text-lg font-bold tracking-tight focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all border border-transparent focus:bg-white focus:border-brand-primary/20"
                />
                <button
                  onClick={onClose}
                  aria-label="Close search"
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-xl transition-colors text-brand-muted"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-6 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted px-4">
                <span>
                  {results.length > 0
                    ? `${results.length} result${results.length !== 1 ? 's' : ''} found`
                    : searchQuery.length < 2
                    ? "Type at least 2 characters"
                    : loading
                    ? "Searching..."
                    : "No results found"}
                </span>
                <kbd className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 text-[8px]">
                  ESC
                </kbd>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-4 pb-8">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-20 gap-4"
                    aria-live="polite"
                  >
                    <Loader2 className="w-10 h-10 text-brand-primary animate-spin" aria-label="Searching" />
                    <span className="text-xs font-bold text-brand-muted uppercase tracking-widest">
                      Searching portal data...
                    </span>
                  </motion.div>
                ) : results.length > 0 ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 gap-2"
                    role="listbox"
                    aria-label="Search results"
                  >
                    {results.map((result) => (
                      <Link
                        key={`${result.type}-${result.id}`}
                        to={result.url}
                        onClick={onClose}
                        role="option"
                        aria-selected="false"
                        className="group flex flex-col sm:flex-row sm:items-center gap-4 p-6 hover:bg-brand-primary/5 rounded-3xl border border-transparent hover:border-brand-primary/10 transition-all"
                      >
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 ${
                            result.type === "news"
                              ? "bg-sky-50 text-sky-600"
                              : result.type === "ordinance"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-green-50 text-green-600"
                          }`}
                          aria-hidden="true"
                        >
                          {result.type === "news" ? (
                            <Newspaper size={20} />
                          ) : result.type === "ordinance" ? (
                            <FileCode size={20} />
                          ) : (
                            <Globe size={20} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[8px] font-black uppercase tracking-widest text-brand-muted opacity-60">
                              {result.type}
                            </span>
                            {result.date && (
                              <>
                                <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-brand-muted opacity-60">
                                  {new Date(result.date).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                          <h4 className="text-base font-extrabold text-brand-text truncate group-hover:text-brand-primary transition-colors">
                            {result.title}
                          </h4>
                          {result.description && (
                            <p className="text-xs text-brand-muted line-clamp-1 font-medium mt-0.5">
                              {result.description}
                            </p>
                          )}
                        </div>

                        <ArrowRight
                          size={16}
                          className="text-brand-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                          aria-hidden="true"
                        />
                      </Link>
                    ))}
                  </motion.div>
                ) : searchQuery.length >= 2 && !loading ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20 px-8"
                    role="status"
                  >
                    <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search size={32} className="text-gray-300" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-bold text-brand-text mb-2 tracking-tight">
                      No results for "{searchQuery}"
                    </h3>
                    <p className="text-sm text-brand-muted font-medium">
                      Try broader terms like "Health", "Tourism", or "Permit".
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="suggestions"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8"
                  >
                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] mb-6 border-b border-gray-100 pb-4">
                      Suggestions
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["History", "Ordinances", "Profile", "News", "Charter", "Services"].map(
                        (tag) => (
                          <button
                            key={tag}
                            onClick={() => setSearchQuery(tag)}
                            className="px-6 py-3 bg-brand-surface rounded-xl text-xs font-bold text-brand-text hover:bg-brand-primary hover:text-white transition-all border border-brand-border"
                          >
                            {tag}
                          </button>
                        )
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-gray-50 p-6 flex justify-center items-center border-t border-gray-100">
              <div className="flex items-center gap-2 opacity-50">
                <img
                  src="http://talibon.gov.ph/wp-content/uploads/2025/09/Talibon-Official-Seal-v4-2003-to-2023-.png"
                  alt=""
                  className="h-6 w-6 grayscale"
                  referrerPolicy="no-referrer"
                  aria-hidden="true"
                />
                <span className="text-[8px] font-black uppercase tracking-widest text-brand-text">
                  Talibon Smart Gateway Search
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GlobalSearch;
