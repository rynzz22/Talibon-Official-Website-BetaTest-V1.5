import { Module, MiddlewareConsumer, NestModule, RequestMethod } from "@nestjs/common";
import { APP_GUARD, APP_FILTER } from "@nestjs/core";
import * as path from "path";
import * as express from "express";

import { AboutController } from "./api/about/about.controller";
import { AboutService } from "./api/about/about.service";
import { ExecutiveController } from "./api/executive/executive.controller";
import { ExecutiveService } from "./api/executive/executive.service";
import { LegislativeController } from "./api/legislative/legislative.controller";
import { LegislativeService } from "./api/legislative/legislative.service";
import { NewsController } from "./api/news/news.controller";
import { NewsService } from "./api/news/news.service";
import { TransparencyController } from "./api/transparency/transparency.controller";
import { TransparencyService } from "./api/transparency/transparency.service";
import { TourismController } from "./api/tourism/tourism.controller";
import { TourismService } from "./api/tourism/tourism.service";
import { FormsController } from "./api/forms/forms.controller";
import { FormsService } from "./api/forms/forms.service";
import { PaymentsModule } from "./api/payments/payments.module";
import { PaymentsController } from "./api/payments/payments.controller";
import { PaymentsService } from "./api/payments/payments.service";
import { NotificationsModule } from "./api/notifications/notification.module";
import { EmailNotificationService } from "./api/notifications/email-notification.service";
import { SupabaseService } from "./supabase.service";
import { RateLimiterGuard } from "./security/rate-limiter.guard";
import { AuthGuard } from "./security/auth.guard";
import { SecurityHeadersMiddleware } from "./security/security-headers.middleware";
import { CacheControlMiddleware } from "./security/cache-control.middleware";
import { AllExceptionsFilter } from "./security/all-exceptions.filter";

@Module({
  imports: [PaymentsModule, NotificationsModule],
  controllers: [
    AboutController,
    ExecutiveController,
    LegislativeController,
    NewsController,
    TransparencyController,
    TourismController,
    FormsController,
    PaymentsController,
  ],
  providers: [
    SupabaseService,
    EmailNotificationService,
    AboutService,
    ExecutiveService,
    LegislativeService,
    NewsService,
    TransparencyService,
    TourismService,
    FormsService,
    PaymentsService,
    {
      provide: APP_GUARD,
      useClass: RateLimiterGuard
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter
    }
  ],
})
export class AppModule implements NestModule {
  async configure(consumer: MiddlewareConsumer) {
    // Apply security headers & cache control to all routes
    consumer
      .apply(SecurityHeadersMiddleware, CacheControlMiddleware)
      .forRoutes({ path: "*", method: RequestMethod.ALL });

    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      consumer
        .apply(vite.middlewares)
        .exclude({ path: "api/(.*)", method: RequestMethod.ALL })
        .forRoutes({ path: "*", method: RequestMethod.ALL });
    } else {
      const distPath = path.join(process.cwd(), "dist");
      consumer
        .apply(express.static(distPath))
        .forRoutes({ path: "*", method: RequestMethod.ALL });
      
      // Serve index.html for SPA fallback
      consumer
        .apply((req: express.Request, res: express.Response, next: express.NextFunction) => {
          if (!req.path.startsWith("/api")) {
            res.sendFile(path.join(distPath, "index.html"));
          } else {
            next();
          }
        })
        .forRoutes({ path: "*", method: RequestMethod.ALL });
    }
  }
}
