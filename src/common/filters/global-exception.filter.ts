import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { Response } from "express";
import { LoggerServiceImpl } from "../services/logger.service";

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string | string[];
  error?: any;
  requestId?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private logger: LoggerServiceImpl) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = "Internal Server Error";
    let error: any = {};

    const exceptionObject = exception as any;

    // Handle Prisma exceptions
    if (exceptionObject?.code === "P2002") {
      status = HttpStatus.CONFLICT;
      message = `Unique constraint failed on field: ${exceptionObject?.meta?.target}`;
      error = { code: "UNIQUE_CONSTRAINT_FAILED" };
    }
    // Handle Prisma record not found
    else if (exceptionObject?.code === "P2025") {
      status = HttpStatus.NOT_FOUND;
      message = "Record not found";
      error = { code: "RECORD_NOT_FOUND" };
    }
    // Handle NestJS HTTP exceptions
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "object") {
        message = exceptionResponse["message"] || exceptionResponse["error"];
        if (exceptionResponse["error"] && !message) {
          message = exceptionResponse["error"];
        }
      } else {
        message = exceptionResponse;
      }

      // Specific handling for BadRequestException (validation errors)
      if (exception instanceof BadRequestException) {
        const res = exception.getResponse() as any;
        message = res.message || message;
      }
    }
    // Handle unknown exceptions
    else if (exception instanceof Error) {
      message = exception.message;
      if (process.env.NODE_ENV !== "production") {
        error = {
          stack: exception.stack,
          name: exception.name,
        };
      }
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      ...(Object.keys(error).length > 0 && { error }),
      requestId: request.id,
    };

    // Log error
    this.logger.error(
      `${request.method} ${request.url} - ${status}`,
      JSON.stringify({
        ...errorResponse,
        exception:
          exception instanceof Error ? exception.message : String(exception),
      }),
      "GlobalExceptionFilter",
    );

    response.status(status).json(errorResponse);
  }
}
