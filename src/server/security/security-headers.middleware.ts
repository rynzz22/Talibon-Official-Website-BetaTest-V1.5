import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Prevent MIME type sniffing
    res.setHeader("X-Content-Type-Options", "nosniff");

    // Referrer policy to prevent leaking full URLs to external third parties
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

    // Permissions policy to restrict browser hardware APIs
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");

    // X-Frame-Options for legacy browsers (modern browsers use CSP frame-ancestors)
    res.setHeader("X-Frame-Options", "SAMEORIGIN");

    // Strict Transport Security (HSTS) when on HTTPS
    if (req.secure || req.headers["x-forwarded-proto"] === "https") {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }

    // Content Security Policy
    const csp = [
      "default-src 'self'",
      "media-src 'self' data: blob: https: http: https://talibon.gov.ph https://*.talibon.gov.ph",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net https://connect.facebook.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https: http:",
      "connect-src 'self' https://*.supabase.co https://*.run.app https://api.stripe.com https://*.google.com https://*.facebook.com wss: ws:",
      "frame-src 'self' https://www.facebook.com https://web.facebook.com https://www.google.com https://maps.google.com https://js.stripe.com",
      "frame-ancestors 'self' https:",
      "base-uri 'self'",
      "form-action 'self'"
    ].join("; ");

    res.setHeader("Content-Security-Policy", csp);

    next();
  }
}
