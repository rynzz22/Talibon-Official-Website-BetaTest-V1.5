import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, ArrowUpRight, Shield, CheckCircle2, Zap } from 'lucide-react';

const CitizenCharterPage: React.FC = () => {
  const pdfUrl = "http://talibon.gov.ph/wp-content/uploads/2026/02/2025-CITIZENS-CHARTER-FINALE.pdf";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pb-16 px-4 md:px-6 max-w-5xl mx-auto relative">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10"
      >
        <div className="mb-8">
          <span className="section-label">Official Publication</span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-text uppercase tracking-tight leading-none font-display mt-1">
            Citizen Charter
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-4">
          <div className="lg:col-span-7 flex flex-col justify-center">
            <h2 className="text-xl md:text-2xl font-bold text-brand-text mb-3 uppercase tracking-tight leading-tight font-display">
              Citizen's Charter 2025 Edition
            </h2>
            <p className="text-sm text-brand-muted font-normal mb-6 leading-relaxed">
              The Citizen's Charter is an official document of commitments made by the Municipal Government of Talibon to its citizens, detailing public service standards, processing times, requirements, and procedures for all municipal services.
            </p>
            
            <div>
              <a 
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pro-button inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                VIEW PDF
                <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
          
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div 
              className="flex flex-col items-center justify-center p-8 text-center cursor-pointer group"
              onClick={() => window.open(pdfUrl, '_blank')}
            >
              <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-brand-primary transition-all duration-300 group-hover:scale-110">
                <FileText size={32} className="text-brand-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-extrabold text-brand-text mb-1 uppercase tracking-tight font-display">2025 Edition</h3>
              <p className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Official Publication</p>
              <span className="text-[11px] font-bold text-brand-primary uppercase tracking-widest flex items-center gap-1 group-hover:underline">
                Click to Open PDF <ArrowUpRight size={13} />
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-brand-border/60 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-brand-primary font-bold uppercase tracking-wider text-xs mb-2">
              <Shield size={16} />
              <span>Transparency</span>
            </div>
            <p className="text-xs text-brand-muted leading-relaxed">Ensuring open and honest communication between the LGU and the people of Talibon.</p>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-brand-primary font-bold uppercase tracking-wider text-xs mb-2">
              <CheckCircle2 size={16} />
              <span>Accountability</span>
            </div>
            <p className="text-xs text-brand-muted leading-relaxed">Holding our government officials responsible for the quality of services provided.</p>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-brand-primary font-bold uppercase tracking-wider text-xs mb-2">
              <Zap size={16} />
              <span>Efficiency</span>
            </div>
            <p className="text-xs text-brand-muted leading-relaxed">Streamlining processes to serve our citizens faster and more effectively.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CitizenCharterPage;
