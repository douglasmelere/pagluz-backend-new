"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerServiceImpl = void 0;
const common_1 = require("@nestjs/common");
const winston = require("winston");
const path = require("path");
const fs = require("fs");
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}
let LoggerServiceImpl = class LoggerServiceImpl {
    logger;
    constructor() {
        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || "info",
            format: winston.format.combine(winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston.format.errors({ stack: true }), winston.format.splat(), winston.format.json()),
            defaultMeta: { service: "pagluz-api" },
            transports: [
                new winston.transports.File({
                    filename: path.join(logsDir, "error.log"),
                    level: "error",
                    maxsize: 10485760,
                    maxFiles: 5,
                }),
                new winston.transports.File({
                    filename: path.join(logsDir, "combined.log"),
                    maxsize: 10485760,
                    maxFiles: 10,
                }),
            ],
        });
        if (process.env.NODE_ENV !== "production") {
            this.logger.add(new winston.transports.Console({
                format: winston.format.combine(winston.format.colorize(), winston.format.printf(({ level, message, timestamp, service }) => `[${timestamp}] [${service}] ${level}: ${message}`)),
            }));
        }
    }
    log(message, context) {
        this.logger.info(message, { context });
    }
    error(message, trace, context) {
        this.logger.error(message, { trace, context });
    }
    warn(message, context) {
        this.logger.warn(message, { context });
    }
    debug(message, context) {
        this.logger.debug(message, { context });
    }
    verbose(message, context) {
        this.logger.debug(message, { context });
    }
};
exports.LoggerServiceImpl = LoggerServiceImpl;
exports.LoggerServiceImpl = LoggerServiceImpl = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], LoggerServiceImpl);
//# sourceMappingURL=logger.service.js.map