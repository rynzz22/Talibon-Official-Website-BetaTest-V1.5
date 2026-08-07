import { motion } from "motion/react";
import { Target, Eye, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  const textShadowStyle = { textShadow: "0 2px 8px rgba(0,0,0,0.75)" };
  const filterShadowStyle = { filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.6))" };

  // Coastal heritage background image representing Talibon (Seafood Capital & Marine Hub of Bohol)
  const heritageBgImg = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80";

  return (
    <section 
      id="about" 
      className="relative w-full overflow-hidden bg-cover bg-center py-20 sm:py-24 lg:py-32 text-white z-20"
      style={{ backgroundImage: `url(${heritageBgImg})` }}
    >
      {/* Full-section gradient overlay to ensure high readability while maintaining full background picture */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none" 
        style={{ background: "linear-gradient(to right, rgba(15, 23, 42, 0.90) 0%, rgba(15, 23, 42, 0.75) 50%, rgba(15, 23, 42, 0.60) 100%)" }} 
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 lg:gap-20 items-center">
          {/* Left Column: Written Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 space-y-10 sm:space-y-12"
          >
            <div className="space-y-4 sm:space-y-6">
              <span 
                className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.25em] text-amber-300 block"
                style={textShadowStyle}
              >
                Our Story
              </span>
              <h2 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight font-display leading-[1.15]"
                style={{ textShadow: "0 4px 12px rgba(0,0,0,0.85)" }}
              >
                Heritage &amp; Progress
              </h2>
              <p 
                className="text-base sm:text-lg lg:text-xl text-sky-100 font-medium leading-[1.65] max-w-2xl"
                style={textShadowStyle}
              >
                Talibon is a testament to resilience and the bounty of the sea. As the Seafood Capital of Bohol, we bridge our rich history with a digital-first future.
              </p>
            </div>

            <div>
              <Link 
                to="/about/history"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg hover:shadow-amber-400/20 active:scale-95"
              >
                Explore History <ArrowUpRight size={18} className="shrink-0" />
              </Link>
            </div>

            {/* Vision & Mission Information Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 pt-8 sm:pt-10 border-t border-white/20">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-white" style={textShadowStyle}>
                  <Eye size={18} className="text-amber-300 shrink-0" style={filterShadowStyle} />
                  <span>Vision</span>
                </div>
                <p className="text-sm sm:text-base text-sky-100/90 font-medium leading-[1.6]" style={textShadowStyle}>
                  To be a premier center of commerce and eco-tourism in Northern Bohol.
                </p>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-white" style={textShadowStyle}>
                  <Target size={18} className="text-amber-300 shrink-0" style={filterShadowStyle} />
                  <span>Mission</span>
                </div>
                <p className="text-sm sm:text-base text-sky-100/90 font-medium leading-[1.6]" style={textShadowStyle}>
                  Empowering citizens through sustainable development and digital governance.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Mayor Profile floating cleanly on background */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 flex flex-col items-center text-center justify-center lg:items-end lg:text-right"
          >
            <div className="flex flex-col items-center lg:items-center text-center max-w-xs group">
              {/* Mayor Portrait Image in a Clean Floating Avatar Circle */}
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 mb-5 rounded-full p-1 bg-gradient-to-tr from-amber-300 via-sky-300 to-amber-400 shadow-2xl">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-900/80 border-2 border-slate-900">
                  <img 
                    src="https://talibon.gov.ph/wp-content/themes/yootheme/cache/28/MUNICIPAL-Mayoe2-28d8fb46.webp" 
                    alt="Hon. Janette Aurestila-Garcia, Municipal Mayor of Talibon" 
                    className="w-full h-full object-cover object-top scale-105 group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Title & Badge Details */}
              <div className="space-y-2">
                <span 
                  className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-400/20 text-amber-300 border border-amber-300/30"
                  style={textShadowStyle}
                >
                  Office of the Municipal Mayor
                </span>
                
                <h3 
                  className="text-lg sm:text-xl font-bold font-display text-white tracking-wide leading-snug pt-1"
                  style={{ textShadow: "0 2px 8px rgba(0,0,0,0.85)" }}
                >
                  Hon. Janette Aurestila-Garcia
                </h3>
                
                <p 
                  className="text-xs sm:text-sm font-semibold text-sky-200 tracking-wider uppercase"
                  style={textShadowStyle}
                >
                  Municipal Mayor • Talibon, Bohol
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

