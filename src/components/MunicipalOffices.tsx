import { motion } from "motion/react";
import { Building2, Briefcase, FileText, Calculator, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function MunicipalOffices() {
  const offices = [
    {
      title: "Office of the Municipal Mayor",
      officer: "Hon. Michael I. Doria",
      icon: Building2,
      color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      badgeTextColor: "text-emerald-800 dark:text-emerald-300",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      accentColor: "bg-emerald-600 dark:bg-emerald-500",
      boxBg: "bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800"
    },
    {
      title: "Municipal Planning & Development Coordinator",
      officer: "Elmer B. Magalona",
      icon: Briefcase,
      color: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-800",
      badgeTextColor: "text-blue-800 dark:text-blue-300",
      iconColor: "text-blue-600 dark:text-blue-400",
      accentColor: "bg-blue-600 dark:bg-blue-500",
      boxBg: "bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800"
    },
    {
      title: "Office of the Municipal Local Civil Registrar",
      officer: "Juliet D. Lumbo-an",
      icon: FileText,
      color: "bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400",
      borderColor: "border-sky-200 dark:border-sky-800",
      badgeTextColor: "text-sky-800 dark:text-sky-300",
      iconColor: "text-sky-600 dark:text-sky-400",
      accentColor: "bg-sky-600 dark:bg-sky-500",
      boxBg: "bg-white dark:bg-slate-900 border-sky-200 dark:border-sky-800"
    },
    {
      title: "Office of the Municipal Budget Officer",
      officer: "Rogelia L. Cellan",
      icon: Calculator,
      color: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400",
      borderColor: "border-purple-200 dark:border-purple-800",
      badgeTextColor: "text-purple-800 dark:text-purple-300",
      iconColor: "text-purple-600 dark:text-purple-400",
      accentColor: "bg-purple-600 dark:bg-purple-500",
      boxBg: "bg-white dark:bg-slate-900 border-purple-200 dark:border-purple-800"
    }
  ];

  return (
    <section id="offices" className="py-16 sm:py-20 bg-brand-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-label"
          >
            Abante Talibon!
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-title uppercase mb-6"
          >
            Municipal Offices & Departments
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-brand-muted font-normal text-sm sm:text-base max-w-2xl mx-auto mb-8"
          >
            Dedicated public servants committed to excellence and transparency in local governance.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {offices.map((office, idx) => (
            <motion.div
              key={office.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
              className="group flex flex-col h-full bg-brand-surface rounded-2xl border border-brand-border overflow-hidden hover:shadow-xl hover:shadow-black/5 transition-all duration-300"
            >
              {/* Top Colored Section with Icon Box */}
              <div className={`h-32 flex items-center justify-center ${office.color} transition-colors duration-300 relative`}>
                <div className={`w-14 h-14 rounded-2xl border ${office.boxBg} flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-110`}>
                  <office.icon 
                    size={24} 
                    className={office.iconColor} 
                  />
                </div>
              </div>

              {/* Content Section */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1.5 leading-snug font-display group-hover:text-brand-primary transition-colors">
                  {office.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-4">
                  {office.officer}
                </p>
                
                <div className="mt-auto pt-4 border-t border-brand-border flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${office.badgeTextColor}`}>
                    Department Head
                  </span>
                  <div className={`w-7 h-7 rounded-full ${office.accentColor} flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0`}>
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link 
            to="/executive/directory"
            className="minimal-button-outline inline-flex text-xs py-2.5 px-5"
          >
            View All Offices & Departments <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Background Text - Embossment */}
      <div className="absolute -bottom-12 left-0 text-[20vw] font-black text-brand-primary/[0.02] select-none pointer-events-none leading-none font-display tracking-tighter">
        TALIBON
      </div>
    </section>
  );
}
