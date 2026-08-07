import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, RefreshCw, Calendar, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { newsService } from "../services/newsService";
import { NewsItem } from "../services/cmsService";

export default function OrtsUpdatesSection() {
  const [ortsItems, setOrtsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrts() {
      try {
        const allNews = await newsService.getNews();
        const filtered = allNews.filter((item) => {
          const cat = (item.category || "").toUpperCase();
          const title = (item.title || "").toUpperCase();
          return cat === "UPDATE" || cat.includes("ORTS") || title.includes("ORTS");
        });
        setOrtsItems(filtered.slice(0, 3));
      } catch (err) {
        console.warn("Error fetching ORTS Updates:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrts();
  }, []);

  if (loading) return null;
  if (ortsItems.length === 0) return null;

  return (
    <section className="py-8 sm:py-10 bg-brand-surface border-t border-brand-border/40" id="orts-updates">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-brand-text uppercase tracking-tight font-display">
              ORTS UPDATES
            </h2>
            <p className="text-xs text-brand-muted font-medium max-w-lg mt-1">
              Operational reforms, tracking progress, administrative circulars, and departmental updates from Talibon LGU.
            </p>
          </div>

          <Link
            to="/news/updates"
            className="px-3.5 py-1.5 bg-[#3A8FC2] text-white hover:bg-[#2B82B8] rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all inline-flex items-center gap-1.5 self-start md:self-auto shadow-2xs"
          >
            <span>View All Updates</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {ortsItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-brand-bg rounded-xl sm:rounded-2xl border border-brand-border p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between space-y-2.5 sm:space-y-3 hover:border-sky-500/50 transition-all group"
            >
              <div className="space-y-2 sm:space-y-2.5">
                <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-sky-600">
                  <span className="flex items-center gap-1">
                    <Tag size={10} />
                    {item.category || "ORTS Update"}
                  </span>
                  <span className="text-brand-muted flex items-center gap-1 text-[9px]">
                    <Calendar size={10} />
                    {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-brand-text font-display tracking-tight leading-snug group-hover:text-sky-600 transition-colors">
                  {item.title}
                </h3>

                <p className="text-[11px] text-brand-muted font-normal leading-normal line-clamp-2">
                  {item.summary || item.content}
                </p>
              </div>

              <Link
                to={`/news/view/${item.id}`}
                className="pt-2 border-t border-brand-border/60 text-[10px] sm:text-[11px] font-black text-sky-600 hover:text-sky-700 uppercase tracking-widest inline-flex items-center gap-1.5 transition-all group-hover:gap-2.5"
              >
                <span>Read Full Update</span>
                <ArrowRight size={12} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
