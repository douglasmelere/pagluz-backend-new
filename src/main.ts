import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { PrismaService } from './config/prisma.service';
import { LoggerServiceImpl } from './common/services/logger.service';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { json, urlencoded } from 'express';
import { config as dotenvConfig } from 'dotenv';
import { validateEnv } from './config/env.validation';

// Carrega o .env antes de tudo
dotenvConfig();

async function bootstrap() {
  // Valida variáveis de ambiente antes de iniciar
  await validateEnv(process.env);
  
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  const loggerService = new LoggerServiceImpl();
  app.useLogger(loggerService);

  // Security: Helmet - protege contra ataques comuns
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    frameguard: {
      action: 'deny',
    },
    xssFilter: true,
    noSniff: true,
  }));

  // Configuração para upload de arquivos
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Configuração global de validação
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter(loggerService));

  // Configuração CORS - mais restritiva
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:3001', 'http://localhost:3000'];

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400, // 24 hours
  });

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Pagluz API')
    .setDescription('API para gerenciamento de energia renovável e comissões')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Configuração da porta
  const port = parseInt(process.env.PORT || '3000', 10);
  
  // Habilita fechamento adequado de conexões Prisma
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  await app.listen(port, '0.0.0.0');
  loggerService.log(
    `Application is running on: http://0.0.0.0:${port}`,
    'Bootstrap',
  );
  loggerService.log(
    `Environment: ${process.env.NODE_ENV || 'development'}`,
    'Bootstrap',
  );
  loggerService.log(
    `Swagger documentation: http://0.0.0.0:${port}/api`,
    'Bootstrap',
  );
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

