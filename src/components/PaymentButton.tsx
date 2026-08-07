import React, { useState, useRef } from "react";
import { CreditCard, Loader2, ArrowRight } from "lucide-react";
import { paymentService } from "../services/paymentService";
import { motion } from "motion/react";

interface PaymentButtonProps {
  itemName: string;
  amount: number;
  className?: string;
  label?: string;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  itemName,
  amount,
  className = "",
  label = "Pay Fee Online",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clickedRef = useRef(false);

  const handlePayment = async () => {
    if (clickedRef.current || isLoading) return;
    clickedRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      await paymentService.createCheckoutSession(itemName, amount);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setError(message);
      setIsLoading(false);
      clickedRef.current = false;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <motion.button
        whileHover={{ scale: isLoading ? 1 : 1.01 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
        onClick={handlePayment}
        disabled={isLoading}
        aria-busy={isLoading}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-brand-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-brand-text transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <div className="flex items-center gap-2 shrink-0">
          {isLoading ? (
            <Loader2 className="animate-spin" size={16} aria-hidden="true" />
          ) : (
            <CreditCard size={16} className="group-hover:rotate-12 transition-transform" aria-hidden="true" />
          )}
          <span>{isLoading ? "Processing..." : label}</span>
        </div>
        {!isLoading && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-white/80 font-mono text-[11px]">
              PHP {amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
          </div>
        )}
      </motion.button>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="text-red-600 text-xs font-bold uppercase tracking-widest text-center bg-red-50 py-2 px-4 rounded-lg border border-red-100"
        >
          {error}
        </motion.p>
      )}

      <p className="text-[10px] text-brand-muted font-bold uppercase tracking-[0.15em] text-center opacity-60">
        Secure payment via Xendit. GCash, Maya, and Cards accepted.
      </p>
    </div>
  );
};

export default PaymentButton;
