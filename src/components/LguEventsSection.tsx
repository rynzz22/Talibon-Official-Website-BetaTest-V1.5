import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Calendar, Clock, MapPin, ArrowRight, PartyPopper } from "lucide-react";
import { Link } from "react-router-dom";
import { eventService } from "../services/eventService";
import { EventItem } from "../services/cmsService";

export default function LguEventsSection() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await eventService.getEvents();
        setEvents(data.slice(0, 3));
      } catch (err) {
        console.warn("Error fetching LGU Events:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (loading) return null;
  if (events.length === 0) return null;

  return (
    <section 
      className="relative py-12 sm:py-16 text-white overflow-hidden bg-cover bg-center" 
      id="lgu-events"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=2000')`
      }}
    >
      {/* Immersive Dark Gradient & Ambient Light Overlay */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none" 
        style={{ 
          background: "linear-gradient(180deg, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.94) 100%)" 
        }} 
      />

      {/* Festive Ambient Glow Effects */}
      <div className="absolute -top-24 left-1/4 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <PartyPopper size={15} className="text-amber-300" />
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-300">
                TALIBON FESTIVITIES & CIVIC GATHERINGS
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-white via-sky-100 to-amber-200 bg-clip-text text-transparent uppercase tracking-tight font-display drop-shadow-sm">
              LGU EVENTS & FESTIVITIES
            </h2>
            <p className="text-xs sm:text-sm text-sky-100/90 font-medium max-w-xl mt-1.5 leading-relaxed drop-shadow-2xs">
              Upcoming municipal gatherings, cultural festivals, public hearings, and civic events in Talibon.
            </p>
          </div>

          <Link
            to="/tourism/festivities"
            className="px-4 py-2.5 bg-[#3A8FC2] hover:bg-[#2B82B8] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all inline-flex items-center gap-2 self-start md:self-auto shadow-lg border border-sky-300/30 hover:scale-105 active:scale-95"
          >
            <span>View All Events</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {events.map((evt, idx) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-xl flex flex-col justify-between space-y-4 hover:border-sky-400/40 hover:shadow-sky-500/10 transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="aspect-[16/9] max-h-44 relative overflow-hidden rounded-xl border border-white/10 shadow-inner">
                  <img
                    src={evt.banner_image || "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800"}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-slate-950/80 backdrop-blur-md border border-white/15 rounded-lg text-[10px] font-black text-amber-300 tracking-wider uppercase shadow-md">
                    {new Date(evt.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-sm sm:text-base font-bold text-white font-display tracking-tight leading-snug group-hover:text-sky-300 transition-colors">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-slate-300 font-normal leading-relaxed line-clamp-2">
                    {evt.description}
                  </p>
                </div>

                <div className="pt-2 space-y-1.5 border-t border-white/10 text-xs font-medium text-slate-200">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar size={13} className="text-sky-400 shrink-0" />
                    <span className="line-clamp-1">{new Date(evt.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>

                  {evt.time && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock size={13} className="text-sky-400 shrink-0" />
                      <span>{evt.time}</span>
                    </div>
                  )}

                  {evt.venue && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin size={13} className="text-sky-400 shrink-0" />
                      <span className="line-clamp-1">{evt.venue}</span>
                    </div>
                  )}
                </div>
              </div>

              <Link
                to="/tourism/festivities"
                className="pt-2 text-xs font-black text-sky-400 hover:text-sky-300 uppercase tracking-widest inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Event Details</span>
                <ArrowRight size={13} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
