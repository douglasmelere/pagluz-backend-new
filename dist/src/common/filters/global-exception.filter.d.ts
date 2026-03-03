import { ExceptionFilter, ArgumentsHost } from "@nestjs/common";
import { LoggerServiceImpl } from "../services/logger.service";
export declare class GlobalExceptionFilter implements ExceptionFilter {
    private logger;
    constructor(logger: LoggerServiceImpl);
    catch(exception: unknown, host: ArgumentsHost): void;
}
