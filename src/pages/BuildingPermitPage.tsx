import React from 'react';
import { motion } from 'motion/react';
import { HardHat, Download, ShieldCheck, Zap, Ruler, Droplets, FileCheck, FileText, CreditCard, Laptop } from 'lucide-react';
import { Link } from 'react-router-dom';
import PaymentButton from '../components/PaymentButton';

const BuildingPermitPage: React.FC = () => {
  const permitCategories = [
    {
      category: "Primary Application",
      title: "Unified Application Form for Building Permit",
      description: "The main application form required for all building permit requests.",
      url: "http://talibon.gov.ph/wp-content/uploads/2025/10/UNIFIED-APPLICATION-FORM-FOR-BUILDING-PERMIT.pdf",
      icon: <FileCheck className="text-white" size={24} />,
      gradient: "from-brand-primary to-brand-primary/80"
    },
    {
      category: "Electrical",
      title: "Application for Electrical Permit",
      description: "Required for all electrical installations and modifications.",
      url: "http://talibon.gov.ph/wp-content/uploads/2025/10/APPLICATION-FOR-ELECTRICAL-PERMIT.pdf",
      icon: <Zap className="text-white" size={24} />,
      gradient: "from-brand-secondary to-brand-secondary/80"
    },
    {
      category: "Architecture",
      title: "Architectural Permit",
      description: "Required for architectural designs and plans approval.",
      url: "http://talibon.gov.ph/wp-content/uploads/2025/10/ARCHITECTURAL-PERMIT.pdf",
      icon: <Ruler className="text-white" size={24} />,
      gradient: "from-brand-accent to-brand-accent/80"
    },
    {
      category: "Civil Engineering",
      title: "Civil/Structural Permit",
      description: "Required for structural integrity and engineering designs.",
      url: "http://talibon.gov.ph/wp-content/uploads/2025/10/CIVIL_STRUCTURAL-PERMIT.pdf",
      icon: <HardHat className="text-white" size={24} />,
      gradient: "from-brand-primary to-brand-secondary"
    },
    {
      category: "Plumbing",
      title: "Plumbing Permit",
      description: "Required for all plumbing and sanitary system installations.",
      url: "http://talibon.gov.ph/wp-content/uploads/2025/10/PLUMBING-PERMIT.pdf",
      icon: <Droplets className="text-white" size={24} />,
      gradient: "from-brand-secondary to-brand-accent"
    }
  ];

  return (
    <div className="pb-20 px-4 md:px-8 max-w-7xl mx-auto bg-brand-bg relative overflow-hidden">
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
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pro-card overflow-hidden relative z-10"
      >
        {/* Modern Gradient Header */}
        <div className="bg-gradient-to-br from-brand-primary via-brand-primary/90 to-brand-primary/80 p-16 md:p-24 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-secondary rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
          </div>
          
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white uppercase tracking-tight mb-6 font-display">
              Building Permit
            </h1>
            <p className="text-white/80 text-lg md:text-xl font-bold uppercase tracking-[0.3em]">
              Talibon Municipality – Building & Engineering Documents
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 md:p-20">
          <div className="mb-12 text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-brand-text uppercase tracking-tight mb-4 font-display">Construction Permits & Applications</h2>
            <p className="text-xl text-brand-muted font-medium max-w-3xl">
              Download the official forms required for building and engineering projects in the Municipality of Talibon.
            </p>
          </div>

          {/* Electronic Filing Banner */}
          <div className="mb-12 p-8 bg-teal-50 border border-teal-100 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <span className="px-2.5 py-1 text-[9px] font-black bg-teal-100 text-teal-800 border border-teal-200 rounded-md uppercase tracking-wider">e-Services Integration</span>
              <h3 className="text-xl font-black text-brand-text uppercase tracking-tight font-display mt-2">File Electronically</h3>
              <p className="text-sm text-brand-muted font-medium mt-1">Submit your Unified Building Permit application directly online with live tracking.</p>
            </div>
            <Link 
              to="/e-services?service=building_permit"
              className="px-8 py-4 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center gap-2 transition-all shadow-md shadow-teal-600/10 shrink-0"
            >
              <Laptop size={16} /> Apply Online Now
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {permitCategories.map((permit, idx) => (
              <motion.div
                key={permit.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="pro-card p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center hover:border-brand-primary/30 transition-all group"
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${permit.gradient} rounded-3xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  {permit.icon}
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <span className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em]">{permit.category}</span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-brand-text mb-6 leading-tight group-hover:text-brand-primary transition-colors uppercase tracking-tight font-display">
                    {permit.title}
                  </h3>
                  
                  <a 
                    href={permit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pro-button inline-flex items-center gap-3 px-8 py-4"
                  >
                    DOWNLOAD FORM
                    <Download size={16} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Online Payment Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 pro-card p-8 md:p-12 border-2 border-brand-primary/20 bg-brand-primary/5 flex flex-col md:flex-row items-center gap-8"
          >
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center flex-shrink-0 shadow-sm border border-brand-border">
              <CreditCard className="text-brand-primary" size={36} />
            </div>

            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-black text-brand-text uppercase tracking-tight mb-2 font-display">
                Online Permit Fees
              </h3>
              <p className="text-brand-muted font-medium">
                Settle your building permit processing fees online for faster approval and processing.
              </p>
            </div>

            <div className="w-full md:w-72">
              <PaymentButton itemName="Building Permit Processing Fee" amount={1500} />
            </div>
          </motion.div>

          {/* Assistance Section */}
          <div className="mt-20 p-12 bg-brand-text rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-extrabold uppercase tracking-tight mb-6 font-display">Need Assistance?</h3>
                <p className="text-white/70 text-lg font-medium leading-relaxed mb-8">
                  For inquiries regarding building permits and engineering requirements, you may visit the Municipal Engineer's Office or contact us through our official channels.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="px-6 py-3 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md">
                    <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest mb-1">Office Hours</p>
                    <p className="font-bold">Mon - Fri, 8:00 AM - 5:00 PM</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest mb-2">Engineering Dept</p>
                  <p className="text-xl font-extrabold font-display">(038) 422-2895</p>
                </div>
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest mb-2">Official Email</p>
                  <p className="text-sm font-bold truncate">talibonofficial@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BuildingPermitPage;
