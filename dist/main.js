"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
const app_module_1 = require("./app.module");
const prisma_service_1 = require("./config/prisma.service");
const logger_service_1 = require("./common/services/logger.service");
const global_exception_filter_1 = require("./common/filters/global-exception.filter");
const express_1 = require("express");
const dotenv_1 = require("dotenv");
const env_validation_1 = require("./config/env.validation");
(0, dotenv_1.config)();
async function bootstrap() {
    await (0, env_validation_1.validateEnv)(process.env);
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['log', 'error', 'warn', 'debug'],
    });
    const loggerService = new logger_service_1.LoggerServiceImpl();
    app.useLogger(loggerService);
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:'],
            },
        },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
        },
        frameguard: {
            action: 'deny',
        },
        xssFilter: true,
        noSniff: true,
    }));
    app.use((0, express_1.json)({ limit: '50mb' }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: '50mb' }));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter(loggerService));
    const allowedOrigins = process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',')
        : ['http://localhost:3001', 'http://localhost:3000'];
    app.enableCors({
        origin: allowedOrigins,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
        maxAge: 86400,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Pagluz API')
        .setDescription('API para gerenciamento de energia renovável e comissões')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
    })
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    const port = parseInt(process.env.PORT || '3000', 10);
    const prismaService = app.get(prisma_service_1.PrismaService);
    await prismaService.enableShutdownHooks(app);
    await app.listen(port, '0.0.0.0');
    loggerService.log(`Application is running on: http://0.0.0.0:${port}`, 'Bootstrap');
    loggerService.log(`Environment: ${process.env.NODE_ENV || 'development'}`, 'Bootstrap');
    loggerService.log(`Swagger documentation: http://0.0.0.0:${port}/api`, 'Bootstrap');
}
bootstrap().catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map