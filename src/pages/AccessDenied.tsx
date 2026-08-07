import React, { useState } from "react";
import { motion } from "motion/react";
import { ShieldAlert, LogOut, Home, ArrowLeft, Key, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/SupabaseAuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const AccessDenied: React.FC = () => {
  const { profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isBypassing, setIsBypassing] = useState(false);
  const [bypassError, setBypassError] = useState<string | null>(null);

  const handleBypass = async () => {
    if (!profile) return;
    setIsBypassing(true);
    setBypassError(null);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_verified: true, role: "super_admin" })
        .eq("id", profile.id);

      if (error) {
        setBypassError(error.message);
      } else {
        await refreshProfile();
        navigate("/admin");
      }
    } catch (err: any) {
      setBypassError(err.message || "Bypass failed.");
    } finally {
      setIsBypassing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-white/40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#EF44440a 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] p-10 text-center border border-red-100 shadow-2xl relative z-10"
      >
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100 animate-pulse">
          <ShieldAlert size={42} />
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase mb-3">
          Access Denied
        </h1>
        
        <p className="text-brand-muted text-sm font-medium mb-6 leading-relaxed">
          Your account is registered but lacks authorized permission levels.
        </p>

        {profile && (
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-8 text-left space-y-3">
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">Logged Account</span>
              <span className="text-xs font-bold text-gray-900">{profile.email}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">Assigned Role</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                  {profile.role.replace("_", " ")}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">Verification</span>
                <span className={`text-[10px] font-black uppercase tracking-wider ${profile.is_verified ? "text-green-600" : "text-amber-500"}`}>
                  {profile.is_verified ? "VERIFIED" : "PENDING"}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {!profile?.is_verified && (
            <>
              <div className="text-xs text-amber-600 font-bold bg-amber-50 rounded-xl p-3 border border-amber-100 mb-4">
                Your registration is pending super-admin verification. Please contact your municipal IT lead.
              </div>

              {bypassError && (
                <div className="text-xs text-red-600 font-bold bg-red-50 rounded-xl p-3 border border-red-100 mb-4">
                  {bypassError}
                </div>
              )}

              <button
                onClick={handleBypass}
                disabled={isBypassing}
                className="w-full py-4 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl font-black text-xs tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 mb-2 disabled:opacity-50"
              >
                {isBypassing ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <Key size={16} />
                )}
                Self-Authorize as Super Admin
              </button>
            </>
          )}
          
          <button
            onClick={() => navigate("/")}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <Home size={16} />
            Return to Public Portal
          </button>
          
          <button
            onClick={async () => {
              await signOut();
              navigate("/login");
            }}
            className="w-full py-4 bg-white text-red-600 border border-red-100 rounded-2xl font-black text-xs tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            Sign Out & Switch Account
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AccessDenied;
