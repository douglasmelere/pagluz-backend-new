# 🚀 PLANO IMEDIATO DE IMPLEMENTAÇÃO

## Prioridade 1: Segurança (HOJE)

### 1. Instalar Helmet.js

```bash
npm install helmet
```

### 2. Implementar Helmet.js no main.ts

Adicione após a criação do app:

```typescript
import helmet from 'helmet';

// Logo após: const app = await NestFactory.create(AppModule);
app.use(helmet());
app.use(helmet.contentSecurityPolicy());
app.use(helmet.crossOriginEmbedderPolicy({ requireCorporateNetwork: false }));
```

### 3. Melhorar CORS

Substitua o CORS atual por:

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL?.split(',') || [
    'http://localhost:3000',
    'http://localhost:5173',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 3600,
});
```

### 4. Adicionar ao .env

```bash
FRONTEND_URL=http://localhost:3000,http://localhost:5173
```

---

## Prioridade 2: Rate Limiting (SEMANA 1)

### 1. Instalar dependências

```bash
npm install @nestjs/throttler
```

### 2. Criar rate-limit.module.ts

```typescript
import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minuto
        limit: 60,  // 60 requisições por minuto
      },
    ]),
  ],
})
export class RateLimitModule {}
```

### 3. Aplicar no app.module.ts

```typescript
import { RateLimitModule } from './common/modules/rate-limit.module';

@Module({
  imports: [
    RateLimitModule,
    // ... resto dos imports
  ],
})
export class AppModule {}
```

### 4. Usar em rotas sensíveis

```typescript
@Post('login')
@Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 tentativas por minuto
async login(@Body() loginDto: LoginDto) {
  // ...
}
```

---

## Prioridade 3: Testes (SEMANA 2)

### 1. Setup inicial

Jest já está instalado! Executar:

```bash
npm test
```

### 2. Criar teste de exemplo

`src/auth/auth.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../config/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('deve retornar token para credenciais válidas', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: '$2a$12$...',
        role: 'ADMIN',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token123');

      const result = await service.login('test@example.com', 'password');

      expect(result).toHaveProperty('access_token');
    });

    it('deve falhar com email inválido', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(
        service.login('notfound@example.com', 'password'),
      ).rejects.toThrow();
    });
  });
});
```

### 3. Executar testes

```bash
npm test
npm run test:cov  # Com coverage
npm run test:watch  # Modo watch
```

---

## Prioridade 4: Health Check (SEMANA 2)

### 1. Instalar pacote

```bash
npm install @nestjs/terminus
```

### 2. Criar health.controller.ts

```typescript
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../config/prisma.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaHealthIndicator,
    private prismaService: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prisma.pingCheck('database', this.prismaService.$queryRaw`SELECT 1`),
    ]);
  }
}
```

### 3. Adicionar ao app.module.ts

```typescript
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health/health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
})
export class AppModule {}
```

### 4. Testar

```bash
curl http://localhost:3000/health
```

---

## Prioridade 5: Logging Estruturado (SEMANA 2-3)

### 1. Instalar Winston

```bash
npm install winston winston-daily-rotate-file
```

### 2. Criar logger.service.ts

```typescript
import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class LoggerServiceImpl implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.File({ 
          filename: 'logs/error.log', 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: 'logs/combined.log' 
        }),
      ],
    });

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.simple(),
      }));
    }
  }

  log(message: string) {
    this.logger.info(message);
  }

  error(message: string, trace: string) {
    this.logger.error(message, { trace });
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }

  verbose(message: string) {
    this.logger.debug(message);
  }
}
```

---

## Prioridade 6: Error Handling (SEMANA 3)

### 1. Criar erro global handler

```typescript
// src/common/filters/all-exceptions.filter.ts
import { Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno do servidor';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    });
  }
}
```

### 2. Adicionar ao main.ts

```typescript
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

// Dentro de bootstrap():
app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));
```

---

## Prioridade 7: Environment Variables (SEMANA 1)

### Criar .env.example

```bash
# Banco de Dados
DATABASE_URL="postgresql://user:password@localhost:5432/pagluz"

# JWT
JWT_SECRET="sua-chave-secreta-muito-segura-aqui"
JWT_EXPIRATION="24h"

# Gemini AI
GEMINI_API_KEY="sua-chave-gemini-aqui"

# Google APIs
GOOGLE_CREDENTIALS="seu-json-credenciais"

# Aplicação
NODE_ENV="development"
PORT=3000
LOG_LEVEL="info"

# Frontend
FRONTEND_URL="http://localhost:3000,http://localhost:5173"

# Supabase
SUPABASE_URL="https://seu-projeto.supabase.co"
SUPABASE_KEY="sua-chave-supabase"
SUPABASE_BUCKET="seu-bucket"
```

### Validar variáveis obrigatórias

```typescript
// src/config/validation.ts
import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsString, validate } from 'class-validator';

class EnvironmentVariables {
  @IsNotEmpty()
  @IsString()
  DATABASE_URL: string;

  @IsNotEmpty()
  @IsString()
  JWT_SECRET: string;

  @IsNotEmpty()
  @IsString()
  GEMINI_API_KEY: string;

  @IsString()
  NODE_ENV: string = 'development';
}

export async function validateEnv(config: Record<string, any>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config);
  const errors = await validate(validatedConfig);

  if (errors.length > 0) {
    throw new Error(`Config validation error: ${JSON.stringify(errors)}`);
  }

  return validatedConfig;
}
```

---

## Checklist de Implementação

### Semana 1
- [ ] Instalar Helmet.js
- [ ] Melhorar CORS
- [ ] Adicionar variáveis de ambiente validadas
- [ ] Setup ci/cd básico

### Semana 2
- [ ] Implementar rate limiting
- [ ] Criar health check
- [ ] Escrever 20+ testes unitários
- [ ] Setup logging estruturado

### Semana 3
- [ ] Escrever 40+ testes unitários
- [ ] Implementar error handling global
- [ ] Melhorar cobertura de testes
- [ ] Documentation

### Semana 4+
- [ ] Implementar cache com Redis
- [ ] Otimizar queries
- [ ] Load testing
- [ ] CI/CD completo

---

## Comandos Úteis

```bash
# Desenvolvimento
npm run start:dev

# Testes
npm test
npm test:watch
npm run test:cov

# Build
npm run build
npm run start:prod

# Linting
npm run lint

# Auditoria de segurança
npm audit
npm audit fix
```

---

## Próximas Reuniões

Recomendo reuniões semanais para:
1. Revisar implementações
2. Discutir bloqueadores
3. Ajustar prioridades
4. Validar qualidade

---

**Início recomendado:** HOJE

**Tempo total estimado:** 2-3 semanas para implementar as prioridades 1-5

**ROI:** Projeto muito mais seguro, testado e profissional

