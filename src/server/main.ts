import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config({ override: true });
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");
  const PORT = 3000;

  // Enable CORS for frontend
  app.enableCors();

  await app.listen(PORT, "0.0.0.0");
  logger.log(`Server running on http://localhost:${PORT}`);
}

bootstrap();
