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
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const logger_service_1 = require("../services/logger.service");
let GlobalExceptionFilter = class GlobalExceptionFilter {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = "Internal Server Error";
        let error = {};
        const exceptionObject = exception;
        if (exceptionObject?.code === "P2002") {
            status = common_1.HttpStatus.CONFLICT;
            message = `Unique constraint failed on field: ${exceptionObject?.meta?.target}`;
            error = { code: "UNIQUE_CONSTRAINT_FAILED" };
        }
        else if (exceptionObject?.code === "P2025") {
            status = common_1.HttpStatus.NOT_FOUND;
            message = "Record not found";
            error = { code: "RECORD_NOT_FOUND" };
        }
        else if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === "object") {
                message = exceptionResponse["message"] || exceptionResponse["error"];
                if (exceptionResponse["error"] && !message) {
                    message = exceptionResponse["error"];
                }
            }
            else {
                message = exceptionResponse;
            }
            if (exception instanceof common_1.BadRequestException) {
                const res = exception.getResponse();
                message = res.message || message;
            }
        }
        else if (exception instanceof Error) {
            message = exception.message;
            if (process.env.NODE_ENV !== "production") {
                error = {
                    stack: exception.stack,
                    name: exception.name,
                };
            }
        }
        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message,
            ...(Object.keys(error).length > 0 && { error }),
            requestId: request.id,
        };
        this.logger.error(`${request.method} ${request.url} - ${status}`, JSON.stringify({
            ...errorResponse,
            exception: exception instanceof Error ? exception.message : String(exception),
        }), "GlobalExceptionFilter");
        response.status(status).json(errorResponse);
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [logger_service_1.LoggerServiceImpl])
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map