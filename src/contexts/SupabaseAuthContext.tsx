import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { User, Session, AuthResponse } from "@supabase/supabase-js";

export type OfficialRole = "super_admin" | "admin" | "editor" | "municipal_admin" | "barangay_admin";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: OfficialRole;
  barangay_id?: string | null;
  department_id?: string | null;
  is_verified: boolean;
  created_at?: string;
}

export type AuthState = "INITIALIZING" | "AUTHENTICATED" | "UNAUTHENTICATED" | "ERROR";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  state: AuthState;
  signInWithEmail: (email: string, password: string) => Promise<AuthResponse>;
  signUpWithEmail: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  refreshProfile: (u?: User) => Promise<UserProfile | null>;
  resetPasswordForEmail: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [state, setState] = useState<AuthState>("INITIALIZING");

  // Loading is derived from state
  const loading = state === "INITIALIZING";

  const refreshProfile = async (u?: User): Promise<UserProfile | null> => {
    try {
      let targetUser = u;
      if (!targetUser) {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) {
          console.warn("[Auth] getUser failed during profile refresh:", error?.message);
          setProfile(null);
          return null;
        }
        targetUser = data.user;
      }

      // Query profile matching auth.users.id
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", targetUser.id)
        .maybeSingle();

      if (error) {
        console.error("[Auth] Profile fetch database error:", error.message);
        setProfile(null);
        return null;
      }

      if (data) {
        const fetchedProfile = data as UserProfile;
        setProfile(fetchedProfile);
        if (import.meta.env.DEV) {
          console.log(`[Auth - DEV] User Profile Loaded: ${fetchedProfile.full_name || fetchedProfile.email}`);
          console.log(`[Auth - DEV] Role Loaded: ${fetchedProfile.role} (Verified: ${fetchedProfile.is_verified})`);
        }
        return fetchedProfile;
      } else {
        console.warn("[Auth] Profile missing in database for user:", targetUser.id);
        setProfile(null);
        return null;
      }
    } catch (err) {
      console.error("[Auth] refreshProfile database exception:", err);
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    let active = true;

    const handleAuthStateChange = async (event: string, session: Session | null) => {
      if (!active) return;
      if (import.meta.env.DEV) {
        console.log(`[Auth - DEV] Auth state change event occurred: ${event} for ${session?.user?.email || "No User"}`);
      }

      try {
        if (event === "SIGNED_OUT" || !session) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setState("UNAUTHENTICATED");
          return;
        }

        const currentUser = session.user;
        setSession(session);
        setUser(currentUser);

        const fetchedProfile = await refreshProfile(currentUser);

        if (active) {
          setState("AUTHENTICATED");
        }
      } catch (err) {
        console.error("[Auth] Error handling auth state change:", err);
        if (active) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setState("ERROR");
        }
      }
    };

    // Initialize state to INITIALIZING
    setState("INITIALIZING");

    // Fetch initial session synchronously on mount
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!active) return;
      if (error) {
        console.warn("[Auth] Failed to retrieve initial session:", error.message);
        setSession(null);
        setUser(null);
        setProfile(null);
        setState("UNAUTHENTICATED");
        return;
      }
      handleAuthStateChange("INITIAL_SESSION", session);
    });

    // Subscribe to changes, but ignore INITIAL_SESSION to prevent race condition/duplicate init
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return;
      handleAuthStateChange(event, session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const res = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (res.error) {
        if (import.meta.env.DEV) {
          console.warn(`[Auth - DEV] Login Failure for ${email}:`, res.error.message);
        }
      } else if (res.data?.user) {
        if (import.meta.env.DEV) {
          console.log(`[Auth - DEV] Login Success for ${email}`);
        }
      }
      return res;
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.warn(`[Auth - DEV] Sign-in error exception:`, err.message || err);
      }
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const res = await supabase.auth.signUp({
        email,
        password,
      });

      if (res.error) {
        if (import.meta.env.DEV) {
          console.error(`[Auth - DEV] Registration Failure for ${email}:`, res.error.message);
        }
      } else if (res.data?.user) {
        if (import.meta.env.DEV) {
          console.log(`[Auth - DEV] Registration Success for ${email}`);
        }
        // Strict Security Compliance: Registration MUST NOT establish or persist an authenticated session.
        // User account is created in pending state and requires administrator approval followed by explicit login.
        try {
          await supabase.auth.signOut();
        } catch {
          // ignore signout errors
        }
        setUser(null);
        setSession(null);
        setProfile(null);
        setState("UNAUTHENTICATED");
      }
      return res;
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error(`[Auth - DEV] Sign-up error exception:`, err.message || err);
      }
      throw err;
    }
  };

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Listen to Escape key to close dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showLogoutConfirm) {
        setShowLogoutConfirm(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showLogoutConfirm]);

  // Listen to storage events for multi-tab logout consistency
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && (e.key.startsWith("sb-") || e.key.includes("supabase.auth.token") || e.key.includes("auth-token"))) {
        if (!e.newValue) {
          console.log("[Auth] Session token cleared in another tab, updating local state...");
          setUser(null);
          setProfile(null);
          setSession(null);
          setState("UNAUTHENTICATED");
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Handle automatic session expiration
  useEffect(() => {
    if (!session || !session.expires_at) return;

    const expiresAtMs = session.expires_at * 1000;
    const timeRemaining = expiresAtMs - Date.now();

    if (timeRemaining <= 0) {
      console.log("[Auth] Session already expired, executing auto-signout...");
      signOut();
      return;
    }

    const timer = setTimeout(() => {
      console.log("[Auth] Session expired, executing auto-signout...");
      signOut();
    }, timeRemaining);

    return () => clearTimeout(timer);
  }, [session]);

  const signOut = async () => {
    try {
      // Immediately and synchronously clear all local React auth states
      setUser(null);
      setSession(null);
      setProfile(null);
      setState("UNAUTHENTICATED");

      // Call Supabase sign out to terminate the server session
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("[Auth] Error during signOut:", err);
    } finally {
      // Redirect to Home page
      window.location.href = "/";
    }
  };

  const resetPasswordForEmail = async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
  };

  const updatePassword = async (password: string) => {
    return await supabase.auth.updateUser({
      password,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        state,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        refreshProfile,
        resetPasswordForEmail,
        updatePassword,
      }}
    >
      {children}

      {/* GLOBAL LOGOUT CONFIRMATION DIALOG */}
      {showLogoutConfirm && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in animate-duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-confirm-title"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div 
            className="bg-white rounded-[2rem] p-8 max-w-sm w-full border border-gray-100 shadow-2xl space-y-6 text-center transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 id="logout-confirm-title" className="text-sm font-black uppercase tracking-widest text-gray-900">
                Confirm Log Out
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed font-bold">
                Are you sure you want to log out?
              </p>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 px-6 bg-gray-50 hover:bg-gray-100 text-gray-950 font-black uppercase tracking-widest text-[10px] rounded-2xl border border-transparent transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowLogoutConfirm(false);
                  await signOut();
                }}
                className="flex-1 py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all shadow-lg shadow-red-600/10 cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
