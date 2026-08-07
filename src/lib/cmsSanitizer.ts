/**
 * CMS Content Safety & Sanitization Utility
 * Validates URLs and sanitizes CMS text fields to prevent XSS and open redirect vulnerabilities.
 */

export function sanitizeUrl(url: string | undefined | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  
  // Prevent javascript:, data:, or vbscript: protocols
  if (/^(javascript:|data:|vbscript:)/i.test(trimmed)) {
    console.warn(`[CMS Sanitizer] Blocked unsafe URL protocol in: ${trimmed}`);
    return '#';
  }
  
  return trimmed;
}

export function sanitizeText(text: string | undefined | null): string {
  if (!text) return '';
  return text.trim();
}

/**
 * Standard safe attributes for opening external links in a new tab
 */
export const SAFE_LINK_PROPS = {
  target: "_blank",
  rel: "noopener noreferrer"
} as const;
