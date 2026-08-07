import React from 'react';
import { motion } from 'motion/react';
import { Briefcase, Download, CreditCard, Laptop } from 'lucide-react';
import { Link } from 'react-router-dom';
import PaymentButton from '../components/PaymentButton';

const BusinessPermitPage: React.FC = () => {
  const pdfUrl = "http://talibon.gov.ph/wp-content/uploads/2025/10/BUSINESS-PERMIT-APPLICATION-FORM.pdf";

  return (
    <div className="pb-10 px-4 max-w-4xl mx-auto bg-brand-bg relative overflow-hidden">
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
          className="absolute -top-24 -left-24 w-[24rem] h-[24rem] bg-brand-primary/5 rounded-full blur-[80px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-white rounded-xl border border-brand-border shadow-xs overflow-hidden relative z-10"
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-brand-primary via-brand-primary/90 to-brand-primary/80 py-6 px-4 sm:px-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
            <div className="absolute bottom-0 right-0 w-52 h-52 bg-brand-secondary rounded-full translate-x-1/3 translate-y-1/3 blur-2xl" />
          </div>
          
          <div className="relative z-10">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white uppercase tracking-tight mb-1 font-display">
              Business Permit
            </h1>
            <p className="text-white/85 text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
              Talibon Municipality – Official Documents
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 sm:p-5">
          <div className="space-y-3.5">
            {/* Application Card */}
            <motion.div 
              whileHover={{ y: -1 }}
              className="p-4 rounded-xl border border-brand-border bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5 hover:border-brand-primary/30 transition-all shadow-xs"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-primary/80 rounded-lg flex items-center justify-center shrink-0 shadow-xs text-white mt-0.5 md:mt-0">
                  <Briefcase size={20} />
                </div>
                
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-brand-text uppercase tracking-tight font-display">
                    Business Permit Application
                  </h3>
                  <p className="text-brand-muted font-medium text-xs mt-0.5 leading-relaxed">
                    Required form for new business registration and renewals.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-brand-border/40">
                <Link 
                  to="/e-services?service=business_permit"
                  className="flex-1 sm:flex-initial px-3.5 py-2 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-[11px] uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-xs whitespace-nowrap"
                >
                  <Laptop size={14} />
                  File Electronically
                </Link>
                <a 
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial px-3.5 py-2 bg-brand-text hover:bg-brand-text/90 text-white font-bold text-[11px] uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-xs whitespace-nowrap"
                >
                  <Download size={14} />
                  Download PDF
                </a>
              </div>
            </motion.div>

            {/* Online Payment Card */}
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-4 rounded-xl border border-brand-primary/20 bg-brand-primary/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-xs border border-brand-border text-brand-primary mt-0.5 md:mt-0">
                  <CreditCard size={20} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-brand-text uppercase tracking-tight font-display">
                    Simplified Online Payment
                  </h3>
                  <p className="text-brand-muted font-medium text-xs mt-0.5 leading-relaxed">
                    Skip the long lines. Pay your processing fees online securely via GCash, Maya, or Cards.
                  </p>
                </div>
              </div>

              <div className="w-full md:w-64 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-brand-border/40">
                <PaymentButton itemName="Business Permit Processing Fee" amount={500} />
              </div>
            </motion.div>

            {/* Process Overview */}
            <div className="pt-2 grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <div className="p-3.5 rounded-lg border border-brand-border bg-gray-50/50 hover:border-brand-primary/30 transition-all">
                <h4 className="text-[10px] font-bold text-brand-primary uppercase tracking-wider mb-1">Step 1: Application</h4>
                <p className="text-brand-muted font-medium text-[11px] leading-relaxed">Fill out the unified application form and submit required documents to the BPLO.</p>
              </div>
              <div className="p-3.5 rounded-lg border border-brand-border bg-gray-50/50 hover:border-brand-primary/30 transition-all">
                <h4 className="text-[10px] font-bold text-brand-primary uppercase tracking-wider mb-1">Step 2: Assessment</h4>
                <p className="text-brand-muted font-medium text-[11px] leading-relaxed">Wait for the assessment of taxes, fees, and other charges by the Municipal Treasurer.</p>
              </div>
              <div className="p-3.5 rounded-lg border border-brand-border bg-gray-50/50 hover:border-brand-primary/30 transition-all">
                <h4 className="text-[10px] font-bold text-brand-primary uppercase tracking-wider mb-1">Step 3: Payment</h4>
                <p className="text-brand-muted font-medium text-[11px] leading-relaxed">Pay the assessed amount and claim your Business Permit and Mayor's Clearance.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BusinessPermitPage;
