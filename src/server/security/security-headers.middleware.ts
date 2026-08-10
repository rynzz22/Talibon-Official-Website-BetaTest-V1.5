import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Prevent MIME type sniffing
    res.setHeader("X-Content-Type-Options", "nosniff");

    // Frame Protection
    res.setHeader("X-Frame-Options", "SAMEORIGIN");

    // Referrer Policy
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

    // Permissions Policy
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");

    // Strict Transport Security (HSTS)
    if (process.env.NODE_ENV === "production") {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    }

    // Content Security Policy
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https: http:",
      "connect-src 'self' https://iuzupzknnuimfyzcdtxl.supabase.co wss://iuzupzknnuimfyzcdtxl.supabase.co https://*.supabase.co https://api.stripe.com",
      "frame-src 'self' https: http:",
      "frame-ancestors 'self' https:"
    ].join("; ");

    res.setHeader("Content-Security-Policy", csp);

    next();
  }
}
