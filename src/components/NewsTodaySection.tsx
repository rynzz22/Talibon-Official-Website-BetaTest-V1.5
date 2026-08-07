import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Newspaper, User, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { newsService } from "../services/newsService";
import { NewsItem } from "../services/cmsService";

export default function NewsTodaySection() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const data = await newsService.getNews();
        // Exclude pure advisories if desired, or show top published items
        const published = data.filter((item) => item.status === "published" || !item.status);
        setNewsList(published.slice(0, 3));
      } catch (err) {
        console.warn("Error fetching News Today:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, []);

  if (loading) {
    return (
      <section className="py-8 bg-brand-surface">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-bold text-brand-muted uppercase tracking-widest animate-pulse">Loading News Today...</p>
        </div>
      </section>
    );
  }

  if (newsList.length === 0) return null;

  return (
    <section 
      className="relative py-12 sm:py-16 text-white overflow-hidden bg-cover bg-center" 
      id="news-today"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=2000')`
      }}
    >
      {/* Immersive Dark Gradient & Ambient Light Overlay */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none" 
        style={{ 
          background: "linear-gradient(180deg, rgba(15, 23, 42, 0.90) 0%, rgba(15, 23, 42, 0.95) 100%)" 
        }} 
      />

      {/* Decorative Ambient Glows */}
      <div className="absolute -top-24 right-1/4 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Newspaper size={15} className="text-sky-300" />
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-300">
                MUNICIPAL PRESS & OFFICIAL ANNOUNCEMENTS
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-white via-sky-100 to-amber-200 bg-clip-text text-transparent uppercase tracking-tight font-display drop-shadow-sm">
              NEWS TODAY
            </h2>
            <p className="text-xs sm:text-sm text-sky-100/90 font-medium max-w-xl mt-1.5 leading-relaxed drop-shadow-2xs">
              Official press releases, governance accomplishments, and community news from the Municipality of Talibon.
            </p>
          </div>

          <Link
            to="/news/articles"
            className="px-4 py-2.5 bg-[#3A8FC2] hover:bg-[#2B82B8] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all inline-flex items-center gap-2 self-start md:self-auto shadow-lg border border-sky-300/30 hover:scale-105 active:scale-95"
          >
            <span>View All News</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {newsList.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-xl flex flex-col justify-between space-y-4 hover:border-sky-400/40 hover:shadow-sky-500/10 transition-all duration-300 group hover:-translate-y-1"
            >
              <Link to={`/news/view/${item.id}`} className="block space-y-3 h-full flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="aspect-[16/9] max-h-44 relative overflow-hidden rounded-xl border border-white/10 shadow-inner bg-slate-950">
                    <img
                      src={item.image_url || "http://talibon.gov.ph/wp-content/uploads/2025/09/Talibon-Official-Seal-v4-2003-to-2023-.png"}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-slate-950/80 backdrop-blur-md border border-white/15 rounded-lg text-[10px] font-black text-amber-300 tracking-wider uppercase shadow-md flex items-center gap-1">
                      <Calendar size={10} className="text-amber-300" />
                      {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-[10px] font-bold text-sky-200/80 uppercase tracking-wider">
                    {item.author && (
                      <span className="flex items-center gap-1">
                        <User size={11} className="text-sky-400" />
                        {item.author}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-sky-300 transition-colors font-display tracking-tight leading-snug line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-300 font-normal leading-relaxed line-clamp-2">
                    {item.summary || item.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center gap-1.5 text-xs font-black text-sky-400 uppercase tracking-widest group-hover:text-sky-300 group-hover:gap-2.5 transition-all">
                  <span>Read Article</span>
                  <ArrowRight size={13} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
