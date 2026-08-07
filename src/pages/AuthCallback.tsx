import React, { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { motion } from "motion/react";
import { CheckCircle2, Loader2 } from "lucide-react";

const AuthCallback: React.FC = () => {
  useEffect(() => {
    const handleAuth = async () => {
      // Supabase automatically handles the hash/query codes if the client is initialized.
      // We just need to wait a small moment for it to process.
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        if (window.opener) {
          window.opener.postMessage({ type: "SUPABASE_AUTH_SUCCESS" }, window.location.origin);
          setTimeout(() => window.close(), 1000);
        } else {
           // Fallback if not in popup
           window.location.href = "/";
        }
      }
      
      if (error) {
        console.error("Auth callback error:", error);
      }
    };

    handleAuth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg p-4 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full minimal-card p-12"
      >
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
          <div>
            <h2 className="text-2xl font-black mb-2">Verifying Credentials</h2>
            <p className="text-brand-muted text-sm font-medium">Securing your session with Talibon Digital Core...</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthCallback;
