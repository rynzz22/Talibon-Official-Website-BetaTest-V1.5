import React, { useRef } from "react";
import { CheckCircle2, ArrowLeft, Download } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();

  const receiptRef = useRef<string>(
    searchParams.get("reference") ??
    `TBN-${new Date().getFullYear()}-${String(Date.now()).slice(-6).padStart(6, '0')}`
  );

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] border border-brand-border p-12 text-center shadow-2xl shadow-brand-primary/10 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-green-500" />

        <div className="inline-flex items-center justify-center w-24 h-24 bg-green-50 rounded-full mb-8 text-green-500 border-4 border-white shadow-lg">
          <CheckCircle2 size={48} aria-hidden="true" />
        </div>

        <h1 className="text-4xl font-black text-brand-text uppercase tracking-tighter leading-none mb-4">
          Payment Successful
        </h1>
        <p className="text-brand-muted font-medium mb-4">
          Thank you! Your transaction has been completed successfully.
        </p>
        <p className="text-sm text-brand-muted font-medium mb-12">
          A confirmation will be sent to your registered contact details.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => window.print()}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-brand-text text-white rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-brand-primary transition-all group"
          >
            <Download size={20} className="group-hover:translate-y-1 transition-transform" aria-hidden="true" />
            Print Receipt
          </button>

          <Link
            to="/"
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-white text-brand-text border border-brand-border rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-gray-50 transition-all"
          >
            <ArrowLeft size={20} aria-hidden="true" />
            Back to Home
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-brand-border italic text-xs text-brand-muted font-bold opacity-60">
          OFFICIAL RECEIPT REF: {receiptRef.current}
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
