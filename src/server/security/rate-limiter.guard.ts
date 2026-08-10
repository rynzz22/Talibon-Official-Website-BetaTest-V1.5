import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  SetMetadata,
  Inject
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request, Response } from "express";

export enum RateLimitCategory {
  PUBLIC_READ = "PUBLIC_READ",
  AUTHENTICATION = "AUTHENTICATION",
  CITIZEN_SUBMISSION = "CITIZEN_SUBMISSION",
  TRACKING = "TRACKING",
  ADMIN_MUTATION = "ADMIN_MUTATION",
  FILE_UPLOAD = "FILE_UPLOAD",
  PAYMENT = "PAYMENT"
}

interface RateLimitConfig {
  max: number;
  windowMs: number;
}

const CATEGORY_LIMITS: Record<RateLimitCategory, RateLimitConfig> = {
  [RateLimitCategory.PUBLIC_READ]: { max: 120, windowMs: 60 * 1000 },
  [RateLimitCategory.AUTHENTICATION]: { max: 10, windowMs: 60 * 1000 },
  [RateLimitCategory.CITIZEN_SUBMISSION]: { max: 15, windowMs: 60 * 1000 },
  [RateLimitCategory.TRACKING]: { max: 20, windowMs: 60 * 1000 },
  [RateLimitCategory.ADMIN_MUTATION]: { max: 30, windowMs: 60 * 1000 },
  [RateLimitCategory.FILE_UPLOAD]: { max: 10, windowMs: 60 * 1000 },
  [RateLimitCategory.PAYMENT]: { max: 10, windowMs: 60 * 1000 }
};

export const RATE_LIMIT_KEY = "rate_limit_category";
export const RateLimit = (category: RateLimitCategory) => SetMetadata(RATE_LIMIT_KEY, category);

interface ClientRecord {
  timestamps: number[];
}

@Injectable()
export class RateLimiterGuard implements CanActivate {
  private tracker: Map<string, ClientRecord> = new Map();

  constructor(@Inject(Reflector) private reflector: Reflector) {
    // Periodic cleanup of stale tracking records every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    // Skip non-API requests (static files, SPA routes)
    if (!req.path || !req.path.startsWith("/api")) {
      return true;
    }

    const category = this.reflector.getAllAndOverride<RateLimitCategory>(RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass()
    ]) || RateLimitCategory.PUBLIC_READ;

    const config = CATEGORY_LIMITS[category] || CATEGORY_LIMITS[RateLimitCategory.PUBLIC_READ];

    // Determine client IP accurately
    const clientIp = (
      req.ip ||
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket?.remoteAddress ||
      "unknown"
    ).toString().trim();

    const trackerKey = `${category}:${clientIp}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    let record = this.tracker.get(trackerKey);
    if (!record) {
      record = { timestamps: [] };
      this.tracker.set(trackerKey, record);
    }

    // Filter out timestamps outside current time window
    record.timestamps = record.timestamps.filter(t => t > windowStart);

    const currentCount = record.timestamps.length;

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", config.max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, config.max - currentCount - 1));

    if (currentCount >= config.max) {
      const oldestInWindow = record.timestamps[0] || now;
      const retryAfterSeconds = Math.ceil((oldestInWindow + config.windowMs - now) / 1000) || 60;

      res.setHeader("Retry-After", retryAfterSeconds);

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please wait before submitting additional requests.",
          retryAfter: retryAfterSeconds
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    record.timestamps.push(now);
    return true;
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, record] of this.tracker.entries()) {
      record.timestamps = record.timestamps.filter(t => t > now - 10 * 60 * 1000);
      if (record.timestamps.length === 0) {
        this.tracker.delete(key);
      }
    }
  }
}
