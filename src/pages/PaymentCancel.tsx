import React from "react";
import { XCircle, ArrowLeft, RefreshCcw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";

const PaymentCancel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] border border-brand-border p-12 text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
        
        <div className="inline-flex items-center justify-center w-24 h-24 bg-red-50 rounded-full mb-8 text-red-500 border-4 border-white shadow-lg">
          <XCircle size={48} />
        </div>
        
        <h1 className="text-4xl font-black text-brand-text uppercase tracking-tighter leading-none mb-4">
          Payment Cancelled
        </h1>
        <p className="text-brand-muted font-medium mb-12">
          Your transaction was not completed. No charges were made to your account.
        </p>
        
        <div className="space-y-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-brand-text text-white rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-brand-primary transition-all group"
          >
            <RefreshCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
            Try Again
          </button>
          
          <Link 
            to="/" 
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-white text-brand-text border border-brand-border rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-gray-50 transition-all"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentCancel;
