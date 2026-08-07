/**
 * Rate Limiting & Abuse Resistance Helper (UX Throttling)
 * 
 * NOTE FOR PRODUCTION SECURITY:
 * Client-side debouncing and throttling improve user experience and reduce accidental multi-clicks,
 * but do NOT replace server-side rate limiting or API gateway protection.
 * Server-side rate limiting (e.g. NGINX limit_req, Supabase Edge Functions / Postgres RLS rate limits)
 * is required for true abuse prevention against malicious API calls.
 */

import { useCallback, useRef } from 'react';

/**
 * Custom hook to throttle async action calls on the client side
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delayMs: number = 1000
): (...args: Parameters<T>) => void {
  const lastRun = useRef<number>(0);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRun.current >= delayMs) {
        lastRun.current = now;
        callback(...args);
      }
    },
    [callback, delayMs]
  );
}

/**
 * Standard debounce function for search or input handlers
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, waitMs);
  };
}
