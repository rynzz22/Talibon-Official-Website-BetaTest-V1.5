import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { History, ArrowLeft, MapPin, Users, Anchor, Fish, Waves, TrendingUp, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';

const HistoryPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg pt-6 sm:pt-8 pb-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-[40rem] h-[40rem] bg-brand-primary/5 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
            x: [0, -50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-24 -right-24 w-[40rem] h-[40rem] bg-brand-secondary/5 rounded-full blur-[120px]"
        />
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 relative z-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-brand-primary font-bold text-[10px] tracking-widest uppercase mb-12 hover:gap-4 transition-all"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2 text-brand-primary text-[11px] font-extrabold uppercase tracking-[0.2em] mb-4">
              <History size={15} />
              <span>Historical Profile</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-extrabold text-brand-text leading-[0.85] mb-8 tracking-tighter font-display">
              HISTORY OF <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">TALIBON</span>
            </h1>
            <p className="text-xl text-brand-muted font-medium leading-relaxed max-w-xl">
              A journey through time, from an early Christian mission to becoming Bohol's thriving Seafood Capital.
            </p>
            <p className="text-xs font-bold text-brand-muted/60 uppercase tracking-widest mt-6">By Yvux A. Apawan</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="aspect-video rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white bg-white flex items-center justify-center relative group"
          >
            <div className="text-brand-muted/20 flex flex-col items-center gap-2">
              <History size={64} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Historical Photo Frame</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="prose prose-lg prose-blue max-w-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <section className="space-y-6 pro-card p-8 md:p-12">
              <h2 className="text-3xl font-extrabold text-brand-text tracking-tight flex items-center gap-4 font-display">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                  <MapPin size={24} />
                </div>
                Geographic Profile
              </h2>
              <p className="text-brand-text/80 leading-relaxed text-lg font-medium">
                Talibon, officially the Municipality of Talibon (Cebuano: Lungsod sa Talibon; Tagalog: Bayan ng Talibon), is a 1st class municipality that lies in the northernmost part of the island Province of Bohol in Central Visayas, Philippines.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="bg-brand-bg p-6 rounded-3xl border border-brand-border">
                  <h4 className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-3">Boundaries</h4>
                  <ul className="text-sm text-brand-muted space-y-2 font-bold">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-brand-primary rounded-full" /> North: Camotes Sea</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-brand-primary rounded-full" /> South: Trinidad</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-brand-primary rounded-full" /> East: Bien Unido</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-brand-primary rounded-full" /> West: Getafe</li>
                  </ul>
                </div>
                <div className="bg-brand-bg p-6 rounded-3xl border border-brand-border">
                  <h4 className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-3">Coordinates</h4>
                  <p className="text-sm text-brand-muted font-bold leading-relaxed">10° 09’ 06” North longitude <br /> 124° 17’ 25” East latitude</p>
                </div>
              </div>
            </section>

            <section className="space-y-6 pro-card p-8 md:p-12">
              <h2 className="text-3xl font-extrabold text-brand-text tracking-tight flex items-center gap-4 font-display">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                  <Waves size={24} />
                </div>
                The Seafood Capital
              </h2>
              <p className="text-brand-text/80 leading-relaxed text-lg font-medium">
                Its coastline has significant patches of the <span className="text-brand-primary font-bold">Danajon Bank</span>, the only documented double barrier reef in the Philippines that is teeming with bountiful natural marine resources. Hence, Talibon is considered as the official <span className="text-brand-primary font-bold">Seafood Capital of Bohol</span>.
              </p>
              <div className="bg-gradient-to-br from-brand-primary to-brand-primary/90 p-8 rounded-[2.5rem] text-white shadow-xl shadow-brand-primary/20">
                <div className="flex items-center gap-4 mb-4">
                  <Fish size={24} className="text-brand-secondary" />
                  <h4 className="font-extrabold tracking-tight font-display uppercase">Marine Bounty</h4>
                </div>
                <p className="text-white/90 leading-relaxed font-medium">
                  Major products include fishculture (bangus, shrimp, and tilapia), coconut, oyster, rice, seaweeds, swine, cassava, corn, and native chicken.
                </p>
              </div>
            </section>

            <section className="space-y-6 pro-card p-8 md:p-12">
              <h2 className="text-3xl font-extrabold text-brand-text tracking-tight flex items-center gap-4 font-display">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                  <Users size={24} />
                </div>
                Demographics
              </h2>
              <p className="text-brand-text/80 leading-relaxed text-lg font-medium">
                The municipality possesses a total land area of 140.46 sq km, of which about 7.97 sq km or 5.7% is classified as urban, while the remaining 132.49 sq km is rural.
              </p>
              <p className="text-brand-text/80 leading-relaxed text-lg font-medium">
                According to the 2020 Philippine Statistics Authority Population Census, it has a population of <span className="text-brand-primary font-extrabold">71,272 people</span>, making it the second-most populous town in Bohol.
              </p>
            </section>

            <section className="space-y-6 pro-card p-8 md:p-12">
              <h2 className="text-3xl font-extrabold text-brand-text tracking-tight flex items-center gap-4 font-display">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                  <TrendingUp size={24} />
                </div>
                Economic Progress
              </h2>
              <p className="text-brand-text/80 leading-relaxed text-lg font-medium">
                Talibon is becoming a leading commercial hub for at least 1,409 registered retailers, wholesalers, and traders.
              </p>
              <div className="bg-brand-bg p-8 rounded-[2.5rem] border border-brand-border">
                <h4 className="text-sm font-extrabold text-brand-primary uppercase tracking-widest mb-4 font-display">CMCI Recognition 2024</h4>
                <p className="text-brand-muted leading-relaxed font-medium">
                  Talibon achieved a significant milestone, securing the <span className="text-brand-text font-extrabold">17th position</span> among 1st and 2nd class municipalities in the entire country on the Cities and Municipalities Competitiveness Index (CMCI) 2024.
                </p>
              </div>
            </section>

            <div className="pt-12 border-t border-brand-border">
              <h4 className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-6">References</h4>
              <ul className="text-xs text-brand-muted/60 space-y-4 leading-relaxed italic font-medium">
                <li>Talibon, Bohol Profile. PhilAtlas. https://www.philatlas.com/visayas/r07/bohol/talibon.html</li>
                <li>Highlights of the Population of the Municipality of Talibon. (2022). Philippine Statistics Authority.</li>
                <li>Agriculture and Fishery Modernization Plan 2024-2028. LGU Talibon.</li>
                <li>Cities and Municipalities Competitiveness Index (CMCI) 2024. DTI.</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
