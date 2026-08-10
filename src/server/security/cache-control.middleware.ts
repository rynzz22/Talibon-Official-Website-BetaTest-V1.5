import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class CacheControlMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const path = req.path.toLowerCase();

    // Sensitive, citizen-specific, certificate, tracking, or payment endpoints MUST NOT be publicly cached
    if (
      path.startsWith("/api/forms/certificate") ||
      path.startsWith("/api/payments") ||
      req.method !== "GET"
    ) {
      res.setHeader("Cache-Control", "private, no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    } else if (path.startsWith("/api/")) {
      // Public semi-static data (e.g. news, about, tourism, legislative, executive, transparency, downloadable forms)
      res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=60");
    }

    next();
  }
}
