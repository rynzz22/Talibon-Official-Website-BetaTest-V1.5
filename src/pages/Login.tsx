import React, { useState, useEffect } from "react";
import { useAuth, OfficialRole } from "../contexts/SupabaseAuthContext";
import { BARANGAYS } from "../constants/barangayConfig";
import { motion, AnimatePresence } from "motion/react";
import { Globe, Shield, Lock, ArrowRight, CheckCircle2, LayoutDashboard, Eye, EyeOff, Loader2, AlertCircle, Mail, KeyRound } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const { user, profile, signInWithEmail, signUpWithEmail, signOut, refreshProfile, resetPasswordForEmail, updatePassword } = useAuth();
  const navigate = useNavigate();

  // Auth Views
  const [view, setView] = useState<'login' | 'forgot' | 'reset' | 'register'>('login');

  // Login Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Profile Setup Form States
  const [selectedRole, setSelectedRole] = useState<OfficialRole>("barangay_admin");
  const [selectedBarangay, setSelectedBarangay] = useState(BARANGAYS[0].slug);
  const [fullName, setFullName] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Status & Feedback States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    // Populate saved email if Remember Me was checked
    const savedEmail = localStorage.getItem("remember_me_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    // Check for recovery token/query params indicating password recovery
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    if (params.get("type") === "recovery" || hash.includes("type=recovery") || hash.includes("access_token")) {
      setView("reset");
    }

    // Listen to PASSWORD_RECOVERY event
    let subscription: any = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
          setView("reset");
        }
      });
      subscription = data?.subscription;
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (profile) {
      if (profile.is_verified) {
        const timer = setTimeout(() => {
          navigate("/admin");
        }, 1200);
        return () => clearTimeout(timer);
      } else {
        navigate("/admin"); // ProtectRoute will handle the Access Denied display
      }
    }
  }, [profile, navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please provide both email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data, error } = await signInWithEmail(email, password);
      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          setErrorMsg("Email not confirmed. Please check your inbox for the confirmation email, or disable 'Confirm email' under Auth -> Providers -> Email in your Supabase Dashboard.");
        } else {
          setErrorMsg(error.message);
        }
      } else if (data?.user) {
        const userProfile = await refreshProfile(data.user);
        if (userProfile && userProfile.is_verified) {
          setSuccessMsg("Logged in successfully!");
          if (rememberMe) {
            localStorage.setItem("remember_me_email", email);
          } else {
            localStorage.removeItem("remember_me_email");
          }
          navigate("/admin");
        } else {
          // Account exists but is still unverified/pending admin approval
          await signOut();
          setErrorMsg("Your account registration is pending administrator approval. Please wait for an administrator to approve your account before logging in.");
        }
      }
    } catch (err: any) {
      if (err.message?.toLowerCase().includes("email not confirmed")) {
        setErrorMsg("Email not confirmed. Please check your inbox for the confirmation email, or disable 'Confirm email' under Auth -> Providers -> Email in your Supabase Dashboard.");
      } else {
        setErrorMsg(err.message || "Failed to authenticate.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please provide both email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data, error } = await signUpWithEmail(email, password);
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg("Account created successfully! Your registration is pending administrator approval. You will be able to log in with your credentials once approved.");
        setView('login');
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to register account.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { error } = await resetPasswordForEmail(email);
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg("Password reset link has been dispatched to your email.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg("Please enter a new password.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { error } = await updatePassword(password);
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg("Your password has been changed successfully. You can now login.");
        setTimeout(() => {
          setView("login");
          setPassword("");
        }, 2000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Could not update your password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      full_name: fullName,
      role: selectedRole,
      barangay_id: selectedRole === "barangay_admin" ? selectedBarangay : null,
    }, { onConflict: 'id' });

    setIsLoading(false);
    if (!error) {
      await refreshProfile();
      setRegistrationSuccess(true);
    } else {
      setErrorMsg("Error registering profile: " + error.message);
    }
  };

  // Authenticated, verified user state
  if (profile && profile.is_verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg p-4 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full minimal-card p-12"
        >
          <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-black mb-2">Authenticated</h2>
          <p className="text-brand-muted font-medium mb-8">
            Welcome back, <span className="text-brand-text font-bold">{profile.full_name}</span>.
            <br />
            You are being redirected to the 
            <span className="text-brand-primary block font-black uppercase tracking-widest text-[10px] mt-1">CMS Control Dashboard</span>
          </p>
          
          <div className="space-y-4">
            <button 
              onClick={() => navigate("/admin")} 
              className="minimal-button-primary w-full flex items-center justify-center gap-2"
            >
              <LayoutDashboard size={18} /> Go to Dashboard Now
            </button>
            <button onClick={signOut} className="text-[10px] font-black text-brand-muted uppercase tracking-widest hover:text-red-500 transition-colors">
              Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Onboarding screen if user logged in successfully but profile doesn't exist
  if (user && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full minimal-card p-12"
        >
          <div className="text-center mb-10">
            <span className="section-label">One Last Step</span>
            <h2 className="text-4xl font-black tracking-tight">Setup Admin Profile</h2>
            <p className="text-brand-muted font-medium mt-2">Identify your jurisdiction in the Talibon Digital Core.</p>
          </div>

          <div className="space-y-6">
            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-wider">
                <AlertCircle size={16} />
                {errorMsg}
              </div>
            )}

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">Full Name</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Hon. Juan Dela Cruz"
                className="w-full bg-brand-bg border border-brand-border rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-4 block">Assign CMS Level</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setSelectedRole("municipal_admin")}
                  className={`p-6 rounded-3xl border-2 transition-all text-left ${selectedRole === 'municipal_admin' ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-border'}`}
                >
                  <Globe className={`mb-3 ${selectedRole === 'municipal_admin' ? 'text-brand-primary' : 'text-brand-muted'}`} />
                  <p className="font-bold text-sm">Macro CMS</p>
                  <p className="text-[10px] text-brand-muted opacity-60">Whole Municipality</p>
                </button>
                <button 
                  onClick={() => setSelectedRole("barangay_admin")}
                  className={`p-6 rounded-3xl border-2 transition-all text-left ${selectedRole === 'barangay_admin' ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-border'}`}
                >
                  <Shield className={`mb-3 ${selectedRole === 'barangay_admin' ? 'text-brand-primary' : 'text-brand-muted'}`} />
                  <p className="font-bold text-sm">Micro CMS</p>
                  <p className="text-[10px] text-brand-muted opacity-60">Specific Barangay</p>
                </button>
              </div>
            </div>

            {selectedRole === "barangay_admin" && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">Select Barangay</label>
                <select 
                  value={selectedBarangay}
                  onChange={(e) => setSelectedBarangay(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none"
                >
                  {BARANGAYS.map(b => (
                    <option key={b.slug} value={b.slug}>{b.name}</option>
                  ))}
                </select>
              </motion.div>
            )}

            <button 
              disabled={!fullName || isLoading}
              onClick={handleRegisterProfile} 
              className="minimal-button-primary w-full disabled:opacity-30 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Request Access <ArrowRight size={18} /></>}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-white/40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1D4ED81a 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full minimal-card p-10 md:p-12 text-center"
      >
        {/* Consistent Auth Header */}
        <div className="flex items-center justify-between border-b border-brand-border/40 pb-4 mb-6 select-none">
          <button
            type="button"
            onClick={() => {
              if (view !== 'login') {
                setView('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              } else {
                if (window.history.state && window.history.state.idx > 0) {
                  navigate(-1);
                } else {
                  navigate("/", { replace: true });
                }
              }
            }}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-brand-muted hover:text-brand-primary transition-colors cursor-pointer"
          >
            ← Back
          </button>
        </div>

        <div className="flex flex-col text-center">
          {/* FEEDBACK BANNERS */}
          <div className="order-1 md:order-2">
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-100 rounded-2xl text-[11px] font-bold text-left flex items-start gap-2.5 leading-relaxed">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-100 rounded-2xl text-[11px] font-bold text-left flex items-start gap-2.5 leading-relaxed">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>

          {/* BRANDING */}
          <div className="order-3 md:order-1 mb-6 md:mb-10 mt-8 md:mt-0 select-none">
            <img 
              src="http://talibon.gov.ph/wp-content/uploads/2025/09/Talibon-Official-Seal-v4-2003-to-2023-.png" 
              alt="Talibon Seal" 
              className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 drop-shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <h2 className="text-2xl md:text-3xl font-black text-brand-text mb-1 tracking-tight">Admin Portal</h2>
            <p className="text-brand-muted font-bold text-[10px] md:text-xs uppercase tracking-widest">Talibon Digital Governance Core</p>
          </div>

          {/* ACTIVE AUTH VIEW */}
          <div className="order-2 md:order-3">
            {/* LOGIN VIEW */}
            {view === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-6 text-left">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@talibon.gov.ph"
                      required
                      className="w-full bg-brand-bg border border-brand-border rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
                      Password
                    </label>
                    <button 
                      type="button"
                      onClick={() => setView('forgot')}
                      className="text-[10px] font-black uppercase tracking-widest text-brand-primary hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-brand-bg border border-brand-border rounded-2xl py-4 pl-12 pr-12 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-text"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary/20 w-4 h-4"
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Remember Me</span>
                  </label>
                </div>

                {(() => {
                  const isSignInActive = isPasswordFocused || (email.trim() !== "" && password.trim() !== "") || password.trim() !== "";
                  return (
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 text-xs font-black uppercase tracking-widest ${
                        isSignInActive
                          ? "bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-600/30 active:scale-[0.99]"
                          : "bg-sky-100/90 hover:bg-sky-200/80 text-sky-700 border border-sky-300/60 shadow-2xs"
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <span>Sign In to System</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  );
                })()}

                <div className="mt-6 text-center">
                  <p className="text-xs text-brand-muted font-bold">
                    Don't have an administrator account?{" "}
                    <button
                      type="button"
                      onClick={() => { setView('register'); setErrorMsg(null); setSuccessMsg(null); }}
                      className="text-brand-primary hover:underline font-black"
                    >
                      Create Account
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* REGISTER VIEW */}
            {view === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-6 text-left">
                <div className="text-center mb-4">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-1">Create Admin Account</h3>
                  <p className="text-xs text-brand-muted font-semibold leading-relaxed">Sign up below, then set up your profile details in the next step.</p>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@talibon.gov.ph"
                      required
                      className="w-full bg-brand-bg border border-brand-border rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">
                    Choose Password
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-brand-bg border border-brand-border rounded-2xl py-4 pl-12 pr-12 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-text"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="minimal-button-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-brand-primary/10"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <button 
                  type="button"
                  onClick={() => { setView('login'); setErrorMsg(null); setSuccessMsg(null); }}
                  className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-brand-muted hover:text-brand-primary transition-colors text-center cursor-pointer"
                >
                  Back to Login
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD VIEW */}
            {view === 'forgot' && (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-6 text-left">
                <div className="text-center mb-4">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-1">Forgot Password</h3>
                  <p className="text-xs text-brand-muted font-semibold leading-relaxed">Enter your registered administrator email to receive a secure login link.</p>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@talibon.gov.ph"
                      required
                      className="w-full bg-brand-bg border border-brand-border rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="minimal-button-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <button 
                  type="button"
                  onClick={() => { setView('login'); setErrorMsg(null); setSuccessMsg(null); }}
                  className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-brand-muted hover:text-brand-primary transition-colors text-center cursor-pointer"
                >
                  Back to Login
                </button>
              </form>
            )}

            {/* RESET PASSWORD VIEW */}
            {view === 'reset' && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-6 text-left">
                <div className="text-center mb-4">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-1">Reset Password</h3>
                  <p className="text-xs text-brand-muted font-semibold leading-relaxed">Please set your brand new, secure administrator password.</p>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">
                    New Secure Password
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-brand-bg border border-brand-border rounded-2xl py-4 pl-12 pr-12 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-text"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="minimal-button-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Save New Password</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* SECURE FOOTER */}
          <div className="order-4 mt-10 flex items-center justify-center gap-2 text-[8px] font-black text-brand-muted uppercase tracking-[0.2em] select-none">
            <Lock size={12} /> Secure Portal Active
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
