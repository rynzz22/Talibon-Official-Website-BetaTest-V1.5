import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { AlertTriangle, Bell, ArrowRight, ShieldAlert, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { newsService } from "../services/newsService";
import { NewsItem } from "../services/cmsService";

export default function AdvisoriesBanner() {
  const [advisories, setAdvisories] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdvisories() {
      try {
        const allNews = await newsService.getNews();
        // Filter for advisories / announcements / urgent updates
        const filtered = allNews.filter((item) => {
          const cat = (item.category || "").toUpperCase();
          const title = (item.title || "").toUpperCase();
          const summary = (item.summary || "").toUpperCase();
          return (
            cat === "ANNOUNCEMENT" ||
            cat === "ADVISORY" ||
            cat === "URGENT" ||
            title.includes("ADVISORY") ||
            summary.includes("ADVISORY") ||
            title.includes("WARNING") ||
            summary.includes("WARNING")
          );
        });
        setAdvisories(filtered);
      } catch (err) {
        console.warn("Failed to load advisories:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAdvisories();
  }, []);

  if (loading) return null;

  return (
    <section className="py-6 bg-brand-bg relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {advisories.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-red-950 via-sky-950 to-slate-900 border-2 border-sky-500/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-white"
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 flex-1">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-red-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-full shadow-lg border border-red-400 animate-pulse">
                  <AlertTriangle size={14} className="stroke-[3]" />
                  <span>⚠ IMPORTANT MUNICIPAL ADVISORY</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white mt-1">
                  {advisories[0].title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 max-w-3xl font-medium leading-relaxed">
                  {advisories[0].summary || advisories[0].content}
                </p>

                <div className="flex items-center gap-4 text-[10px] text-sky-300 font-bold uppercase tracking-wider pt-1">
                  <span>Updated: {new Date(advisories[0].date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                  {advisories[0].author && <span>• Issued by: {advisories[0].author}</span>}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-3 w-full lg:w-auto">
                <Link
                  to={`/news/view/${advisories[0].id}`}
                  className="w-full lg:w-auto px-6 py-3.5 bg-[#3A8FC2] hover:bg-[#4FA8D8] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 border border-sky-300"
                >
                  <span>Read Full Advisory</span>
                  <ArrowRight size={16} />
                </Link>

                <Link
                  to="/news/advisories"
                  className="w-full lg:w-auto px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-widest rounded-2xl border border-white/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>View All ({advisories.length})</span>
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="bg-slate-900/40 border border-slate-700/60 rounded-2xl p-4 text-center text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <CheckCircle size={16} className="text-emerald-400" />
            <span>No active municipal advisories at this time.</span>
          </div>
        )}
      </div>
    </section>
  );
}
