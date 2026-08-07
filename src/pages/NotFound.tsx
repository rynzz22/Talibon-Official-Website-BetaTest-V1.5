import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-brand-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-white/40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#94a3b80a 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] p-10 text-center border border-slate-100 shadow-2xl relative z-10"
      >
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-100 shadow-inner">
          <FileQuestion size={40} />
        </div>
        
        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 inline-block mb-3">
          Error 404 — Page Not Found
        </span>

        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-3">
          Municipal Resource Missing
        </h1>
        
        <p className="text-brand-muted text-xs font-medium mb-8 leading-relaxed">
          The requested page or municipal record URL does not exist or has been relocated within the Digital Talibon portal network.
        </p>

        <div className="space-y-3">
          <Link
            to="/"
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <Home size={16} />
            Return to Homepage
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="w-full py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-black text-xs tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
