import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger
} from "@nestjs/common";
import { Request, Response } from "express";

@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger("SecurityExceptionsFilter");

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = "An unexpected error occurred. Please try again later.";
    let errorType = "Internal Server Error";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === "string") {
        message = res;
      } else if (typeof res === "object" && res !== null) {
        const obj = res as any;
        message = obj.message || obj.error || message;
        errorType = obj.error || errorType;
      }
    }

    // Log full technical stack trace server-side ONLY
    this.logger.error(
      `[API Error ${status}] ${request.method} ${request.url} - Client IP: ${request.ip}`,
      exception instanceof Error ? exception.stack : String(exception)
    );

    // Sanitize response body to avoid leaking internal DB/stack trace details in 500 errors
    let clientMessage = message;
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      clientMessage = "An internal server error occurred. Please contact the administrator if this persists.";
    }

    response.status(status).json({
      statusCode: status,
      error: errorType,
      message: clientMessage,
      timestamp: new Date().toISOString()
    });
  }
}
import { Injectable } from "@nestjs/common";
