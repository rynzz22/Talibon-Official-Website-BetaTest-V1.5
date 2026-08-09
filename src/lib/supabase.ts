import { createClient } from '@supabase/supabase-js';

// Retrieve environment variables safely
const rawUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL || (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL || process.env?.SUPABASE_URL : undefined);
const rawKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_ANON_KEY || process.env?.SUPABASE_SERVICE_ROLE_KEY : undefined);

// Extract project ID from URL if possible
const extractProjectId = (url: string | undefined): string => {
  if (!url) return "unknown";
  try {
    const trimmed = url.trim();
    if (trimmed.includes("supabase.co")) {
      const match = trimmed.match(/https?:\/\/([^.]+)\.supabase\.co/);
      if (match && match[1]) return match[1];
    }
  } catch (e) {
    // Ignore error
  }
  return "custom-or-unknown";
};

// Clean and sanitize URL
const sanitizeUrl = (url: string | undefined): string => {
  if (!url) {
    // Return production fallback if undefined
    return 'https://vifrifxpugdqbwccoyxe.supabase.co';
  }
  
  let trimmed = url.trim();
  
  // Remove trailing slashes
  while (trimmed.endsWith('/')) {
    trimmed = trimmed.slice(0, -1);
  }
  
  // Strip /rest/v1 if it is at the end of the URL
  if (trimmed.endsWith('/rest/v1')) {
    trimmed = trimmed.slice(0, -8);
  }
  
  while (trimmed.endsWith('/')) {
    trimmed = trimmed.slice(0, -1);
  }
  
  // Force correct production project URL if placeholder or invalid local host
  if (
    !trimmed || 
    trimmed.includes('placeholder-project') || 
    trimmed.includes('localhost') || 
    trimmed.includes('127.0.0.1')
  ) {
    return 'https://vifrifxpugdqbwccoyxe.supabase.co';
  }
  
  return trimmed;
};

const supabaseUrl = sanitizeUrl(rawUrl);
// Default to empty or placeholder to avoid client crash, but throw during action if missing
const supabaseAnonKey = rawKey ? rawKey.trim() : 'placeholder-anon-key';

export const isSupabaseConfigured = 
  !!supabaseUrl && 
  !supabaseUrl.includes('placeholder-project') && 
  !!supabaseAnonKey && 
  supabaseAnonKey !== 'placeholder-anon-key';

// Enhanced Diagnostics logger
export function logSupabaseDiagnostics(context: string, errorDetail?: any): void {
  const currentProjectId = extractProjectId(supabaseUrl);
  const maskKey = (key: string | undefined): string => {
    if (!key || key === 'placeholder-anon-key') return "MISSING/PLACEHOLDER";
    if (key.length <= 10) return "***";
    return `${key.substring(0, 5)}...${key.substring(key.length - 5)}`;
  };

  console.group(`%c[Supabase Diagnostics - ${context}]`, "color: #3ecf8e; font-weight: bold;");
  console.log("Current Supabase URL :", supabaseUrl);
  console.log("Environment Keys Exist:", {
    urlExist: !!rawUrl,
    keyExist: !!rawKey,
    isConfigured: isSupabaseConfigured
  });
  console.log("Current Project ID   :", currentProjectId);
  console.log("Network Status       :", navigator.onLine ? "ONLINE" : "OFFLINE");
  console.log("API Key Masked       :", maskKey(supabaseAnonKey));
  
  // Safe initialization check
  let isClientInit = false;
  try {
    isClientInit = typeof supabase !== 'undefined' && !!supabase;
  } catch (e) {
    // Ignore error in TDZ
  }
  console.log("Is Client Initialized:", isClientInit);
  
  // Attempt to check session
  try {
    const sessionStr = typeof localStorage !== 'undefined' ? (localStorage.getItem("sb-vifrifxpugdqbwccoyxe-auth-token") || localStorage.getItem(`sb-${currentProjectId}-auth-token`)) : null;
    console.log("Auth Session Exists :", !!sessionStr);
  } catch (err) {
    console.log("Auth Session Error  :", err);
  }

  if (errorDetail) {
    console.error("Diagnostic Error Info:", errorDetail);
  }
  console.groupEnd();
}

// Log warning if env variables are missing or placeholders, allowing offline/mock fallback
if (!isSupabaseConfigured) {
  const warnMsg = 
    `[Supabase Configuration Warning] Missing or invalid database credentials.\n` +
    `Expected VITE_SUPABASE_URL (currently: "${rawUrl || 'undefined'}") and VITE_SUPABASE_ANON_KEY to be configured in settings.\n` +
    `Application is running in offline/mock fallback mode.`;
  
  console.warn(warnMsg);
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// Perform initial log AFTER client initialization
logSupabaseDiagnostics("Initialization Check");
