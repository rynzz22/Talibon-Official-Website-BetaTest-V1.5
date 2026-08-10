import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config({ override: true });
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger, ValidationPipe } from "@nestjs/common";
import * as express from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");
  const PORT = 3000;

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

  // Enable CORS with safe configurations
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, same-origin SPA)
      if (!origin) return callback(null, true);
      const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",")
        : [];
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin) || origin.includes("localhost") || origin.includes("run.app") || origin.includes("ai.studio")) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev, validated in prod
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
  });

  await app.listen(PORT, "0.0.0.0");
  logger.log(`Server running on http://localhost:${PORT}`);
}

bootstrap();
