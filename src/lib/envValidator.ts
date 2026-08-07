/**
 * Environment Validation Utility
 * Validates presence and format of required public environment variables.
 */

export interface EnvValidationResult {
  isValid: boolean;
  supabaseUrlConfigured: boolean;
  supabaseAnonKeyConfigured: boolean;
  issues: string[];
}

export function validateEnvironment(): EnvValidationResult {
  const issues: string[] = [];
  const url = import.meta.env?.VITE_SUPABASE_URL;
  const anonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

  let urlValid = false;
  let keyValid = false;

  if (!url || typeof url !== 'string' || url.trim() === '') {
    issues.push('VITE_SUPABASE_URL is missing or empty.');
  } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
    issues.push('VITE_SUPABASE_URL must start with http:// or https://');
  } else {
    urlValid = true;
  }

  if (!anonKey || typeof anonKey !== 'string' || anonKey.trim() === '') {
    issues.push('VITE_SUPABASE_ANON_KEY is missing or empty.');
  } else if (anonKey.includes('placeholder')) {
    issues.push('VITE_SUPABASE_ANON_KEY appears to be a placeholder.');
  } else {
    keyValid = true;
  }

  // Ensure no secret keys accidentally exposed in VITE_ variables
  for (const key of Object.keys(import.meta.env || {})) {
    if (key.startsWith('VITE_') && (key.includes('SERVICE_ROLE') || key.includes('SECRET'))) {
      issues.push(`SECURITY DEFECT: Private variable ${key} exposed with VITE_ prefix!`);
    }
  }

  return {
    isValid: urlValid && keyValid && issues.length === 0,
    supabaseUrlConfigured: urlValid,
    supabaseAnonKeyConfigured: keyValid,
    issues,
  };
}
