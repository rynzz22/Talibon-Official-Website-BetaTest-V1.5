import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../src/server/app.module";
import { ValidationPipe } from "@nestjs/common";
import express, { Express, Request, Response } from "express";
import { ExpressAdapter } from "@nestjs/platform-express";

let cachedServer: Express | null = null;

async function bootstrapServer(): Promise<Express> {
  if (cachedServer) {
    return cachedServer;
  }

  console.log("[VERCEL_API] Cold start: Initializing NestJS serverless application on Vercel...");
  const expressApp: Express = express();
  const adapter = new ExpressAdapter(expressApp);

  const app = await NestFactory.create(AppModule, adapter, {
    logger: process.env.NODE_ENV === "production" ? ["error", "warn", "log"] : ["log", "debug", "error", "warn"]
  });

  // Payload size limits DoS protection
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: process.env.NODE_ENV === "production"
    })
  );

  // Enable CORS
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const rawAllowed = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
        : [];

      if (
        rawAllowed.includes(origin) ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        origin.includes("run.app") ||
        origin.includes("ai.studio") ||
        origin.includes("vercel.app") ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
  });

  await app.init();
  cachedServer = expressApp;
  console.log("[VERCEL_API] NestJS serverless initialization completed successfully.");
  return cachedServer;
}

export default async function handler(req: Request, res: Response) {
  console.log(`[VERCEL_API] Incoming request: ${req.method} ${req.url}`);
  const server = await bootstrapServer();
  return server(req, res);
}
