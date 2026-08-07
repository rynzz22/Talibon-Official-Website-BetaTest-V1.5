import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowUpRight, MapPin, Users, User, Compass } from "lucide-react";
import { INITIAL_BARANGAYS } from "../services/cmsService";

const BarangaySelector: React.FC = () => {
  // Show 15 barangays as requested, rest (10) in explore view
  const previewBarangays = INITIAL_BARANGAYS.slice(0, 15);
  const totalCount = INITIAL_BARANGAYS.length;
  const remainingCount = totalCount - previewBarangays.length;

  return (
    <section className="py-10 sm:py-14 bg-brand-bg relative overflow-hidden border-t border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6 sm:mb-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <Compass size={15} className="text-brand-primary" />
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-brand-primary">
                LOCAL GOVERNMENT UNITS
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-brand-text uppercase tracking-tight font-display">
              Barangays of Talibon
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted font-medium mt-1">
              Official profiles and directories for Talibon's {totalCount} local barangays. Showing top 15 units below.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-brand-muted bg-white px-3.5 py-1.5 rounded-xl border border-brand-border shadow-2xs shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>15 Active Profiles</span>
            <span className="text-brand-border">•</span>
            <span className="text-brand-primary font-black">+{remainingCount} More</span>
          </div>
        </div>

        {/* 15 Barangays Grid - 5 cols on lg, 3 on md, 2 on sm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
          {previewBarangays.map((brgy, idx) => {
            const isPoblacion = brgy.id === "poblacion";
            return (
              <motion.div
                key={brgy.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                viewport={{ once: true }}
              >
                <Link 
                  to="/about/barangays"
                  className={`group block p-3 sm:p-3.5 bg-white rounded-xl border transition-all duration-300 text-left h-full flex flex-col justify-between ${
                    isPoblacion 
                      ? "border-brand-primary/70 shadow-sm shadow-brand-primary/10 bg-gradient-to-b from-sky-50/40 to-white" 
                      : "border-brand-border/80 hover:border-brand-primary/60 hover:shadow-md hover:shadow-brand-primary/10"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div 
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all border ${
                          isPoblacion
                            ? "bg-brand-primary text-white border-brand-primary"
                            : "bg-brand-primary/5 border-brand-primary/10 text-brand-primary group-hover:bg-brand-primary group-hover:text-white"
                        }`}
                      >
                        <MapPin size={14} />
                      </div>
                      <ArrowUpRight 
                        className="text-brand-primary transition-all opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" 
                        size={14} 
                      />
                    </div>

                    <div>
                      <h3 className={`text-xs sm:text-sm font-bold transition-colors font-display uppercase tracking-tight truncate ${
                        isPoblacion 
                          ? "text-brand-primary" 
                          : "text-brand-text group-hover:text-brand-primary"
                      }`}>
                        {brgy.name}
                      </h3>
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-brand-muted mt-0.5">
                        <User size={10} className="text-brand-primary/70 shrink-0" />
                        <span className="truncate">{brgy.captain ? brgy.captain.replace("Hon. ", "") : "Unspecified"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-brand-border/40 flex justify-between items-center text-[10px]">
                    <span className="font-mono font-medium text-brand-muted flex items-center gap-1">
                      <Users size={10} className="text-brand-primary/70" /> {brgy.population.toLocaleString()}
                    </span>
                    <span className="font-black text-brand-primary uppercase tracking-wider group-hover:underline">
                      View
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 sm:mt-8 text-center">
          <Link 
            to="/about/barangays" 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-brand-primary text-brand-primary font-black text-xs tracking-widest rounded-xl hover:bg-brand-primary hover:text-white active:scale-95 transition-all duration-300 uppercase shadow-xs group"
          >
            <span>Explore All 25 Barangays (+{remainingCount} More)</span>
            <ArrowUpRight size={14} className="text-brand-primary group-hover:text-white transition-colors" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BarangaySelector;

