import { Injectable, LoggerService } from "@nestjs/common";
import * as winston from "winston";
import * as path from "path";
import * as fs from "fs";

const logsDir = path.join(process.cwd(), "logs");

// Criar diretório de logs se não existir
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

@Injectable()
export class LoggerServiceImpl implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(),
      ),
      defaultMeta: { service: "pagluz-api" },
      transports: [
        new winston.transports.File({
          filename: path.join(logsDir, "error.log"),
          level: "error",
          maxsize: 10485760, // 10MB
          maxFiles: 5,
        }),
        new winston.transports.File({
          filename: path.join(logsDir, "combined.log"),
          maxsize: 10485760,
          maxFiles: 10,
        }),
      ],
    });

    // Console output em desenvolvimento
    if (process.env.NODE_ENV !== "production") {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(
              ({ level, message, timestamp, service }) =>
                `[${timestamp}] [${service}] ${level}: ${message}`,
            ),
          ),
        }),
      );
    }
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.debug(message, { context });
  }
}
