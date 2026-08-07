/**
 * Safe, structured logger for municipal services.
 * Automatically redacts sensitive fields like passwords, secrets, tokens, and keys.
 */

type LogLevel = 'info' | 'warn' | 'error';

const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'key',
  'apiKey',
  'api_key',
  'service_role',
  'authorization',
  'auth_token',
  'ssn',
  'credit_card'
];

function sanitize(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    if (obj.length > 200) return obj.substring(0, 200) + '...[TRUNCATED]';
    return obj;
  }
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.slice(0, 20).map(sanitize);
  }

  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    const isSensitive = SENSITIVE_KEYS.some(sk => k.toLowerCase().includes(sk));
    if (isSensitive) {
      clean[k] = '[REDACTED]';
    } else {
      clean[k] = sanitize(v);
    }
  }
  return clean;
}

export function logServiceEvent(
  moduleName: string,
  operation: string,
  level: LogLevel,
  message: string,
  details?: any
): void {
  const timestamp = new Date().toISOString();
  const safeDetails = details ? sanitize(details) : undefined;

  const prefix = `[${timestamp}] [${moduleName}:${operation}]`;

  if (level === 'error') {
    console.error(`${prefix} ERROR: ${message}`, safeDetails || '');
  } else if (level === 'warn') {
    console.warn(`${prefix} WARN: ${message}`, safeDetails || '');
  } else {
    console.log(`${prefix} INFO: ${message}`, safeDetails || '');
  }
}
