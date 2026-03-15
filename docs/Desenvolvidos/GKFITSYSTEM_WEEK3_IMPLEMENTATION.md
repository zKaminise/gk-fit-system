# GKFitSystem — Semana 3: Implementação Real do Backend

> **Versão:** 1.0  
> **Data:** Março 2026  
> **Status:** Guia de Implementação Prática (Copiar, Colar e Executar)

---

## SEÇÃO 1 — Ordem de Execução

Siga esta sequência exata no seu terminal e editor:

```
 1. Criar projeto NestJS
 2. Instalar dependências
 3. Inicializar Prisma
 4. Criar pastas da estrutura
 5. Configurar variáveis de ambiente (.env)
 6. Escrever schema.prisma (Tenant, User, Person)
 7. Rodar migration + generate do Prisma
 8. Criar módulo Config
 9. Criar módulo Prisma
10. Criar common/ (enums, interfaces, decorators, guards, filters, utils)
11. Criar módulo Auth (JWT strategy, service, controller)
12. Criar módulo Tenant
13. Criar módulo User
14. Criar módulo Health
15. Montar o AppModule raiz
16. Configurar main.ts (CORS, prefix, validation pipe)
17. Escrever seed.ts
18. Rodar seed
19. Testar tudo
```

---

## SEÇÃO 2 — Estrutura de Pastas Final

```
backend/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/          (gerada automaticamente)
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/
│   │   ├── config.module.ts
│   │   ├── configuration.ts
│   │   └── env.validation.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── common/
│   │   ├── enums/
│   │   │   └── role.enum.ts
│   │   ├── interfaces/
│   │   │   ├── jwt-payload.interface.ts
│   │   │   └── request-user.interface.ts
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── current-tenant.decorator.ts
│   │   │   └── public.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   └── utils/
│   │       └── hash.util.ts
│   └── modules/
│       ├── auth/
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── strategies/
│       │   │   └── jwt.strategy.ts
│       │   └── dto/
│       │       ├── login.dto.ts
│       │       └── change-password.dto.ts
│       ├── tenant/
│       │   ├── tenant.module.ts
│       │   ├── tenant.controller.ts
│       │   ├── tenant.service.ts
│       │   └── dto/
│       │       ├── create-tenant.dto.ts
│       │       └── update-tenant.dto.ts
│       ├── user/
│       │   ├── user.module.ts
│       │   ├── user.controller.ts
│       │   ├── user.service.ts
│       │   └── dto/
│       │       ├── create-user.dto.ts
│       │       └── update-user.dto.ts
│       └── health/
│           ├── health.module.ts
│           └── health.controller.ts
├── .env
├── .env.example
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
└── package.json
```

---

## SEÇÃO 3 — Comandos para Criar o Projeto

### 3.1 — Criar o projeto NestJS

```bash
npx @nestjs/cli new backend --package-manager npm --strict
cd backend
```

Quando perguntado pelo package manager, selecione **npm**.

### 3.2 — Instalar dependências de produção

```bash
npm install @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt class-validator class-transformer @prisma/client
```

### 3.3 — Instalar dependências de desenvolvimento

```bash
npm install -D prisma @types/bcrypt @types/passport-jwt
```

### 3.4 — Inicializar Prisma

```bash
npx prisma init
```

Isso cria a pasta `prisma/` com `schema.prisma` e adiciona `DATABASE_URL` ao `.env`.

### 3.5 — Criar pastas da estrutura

```bash
mkdir -p src/config
mkdir -p src/prisma
mkdir -p src/common/enums
mkdir -p src/common/interfaces
mkdir -p src/common/decorators
mkdir -p src/common/guards
mkdir -p src/common/filters
mkdir -p src/common/utils
mkdir -p src/modules/auth/dto
mkdir -p src/modules/auth/strategies
mkdir -p src/modules/tenant/dto
mkdir -p src/modules/user/dto
mkdir -p src/modules/health
```

### 3.6 — Remover arquivos desnecessários do scaffold

```bash
rm -f src/app.controller.ts src/app.controller.spec.ts src/app.service.ts
```

---

## SEÇÃO 4 — Variáveis de Ambiente

### FILE: backend/.env.example

```env
# =========================
# GKFitSystem — Variáveis de Ambiente
# =========================

# Ambiente
NODE_ENV=development
PORT=3000

# Banco de Dados (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gkfitsystem?schema=public"

# JWT
JWT_SECRET="TROCAR_EM_PRODUCAO_chave_minimo_32_caracteres_aqui"
JWT_EXPIRES_IN="7d"

# Frontend (CORS)
FRONTEND_URL="http://localhost:5173"

# Bcrypt
BCRYPT_SALT_ROUNDS=12

# Logging
LOG_LEVEL="debug"
```

### FILE: backend/.env

Crie com o mesmo conteúdo do `.env.example`, ajustando a `DATABASE_URL` para a sua conexão real:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gkfitsystem?schema=public"
JWT_SECRET="gkfit-dev-secret-2026-trocar-em-producao-obrigatoriamente"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:5173"
BCRYPT_SALT_ROUNDS=12
LOG_LEVEL="debug"
```

**Explicação das variáveis:**

| Variável | Descrição |
|----------|-----------|
| `NODE_ENV` | Ambiente de execução. Nunca `production` localmente |
| `PORT` | Porta do servidor HTTP |
| `DATABASE_URL` | Connection string do PostgreSQL no formato Prisma |
| `JWT_SECRET` | Chave secreta para assinar JWTs. Mínimo 32 chars em produção |
| `JWT_EXPIRES_IN` | Tempo de vida do token. Exemplos: `1h`, `7d`, `30d` |
| `FRONTEND_URL` | Origem permitida no CORS |
| `BCRYPT_SALT_ROUNDS` | Custo do hash bcrypt. 12 é o mínimo recomendado |
| `LOG_LEVEL` | Nível de log: `debug`, `log`, `warn`, `error` |

---

## SEÇÃO 5 — Prisma: Schema Inicial

### FILE: backend/prisma/schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// =========================
// TENANT (Academia)
// =========================
model Tenant {
  id                  String   @id @default(uuid()) @db.Uuid
  name                String   @db.VarChar(255)
  slug                String   @unique @db.VarChar(100)
  document            String?  @db.VarChar(20)
  email               String   @db.VarChar(255)
  phone               String?  @db.VarChar(20)
  addressStreet       String?  @map("address_street") @db.VarChar(255)
  addressNumber       String?  @map("address_number") @db.VarChar(20)
  addressComplement   String?  @map("address_complement") @db.VarChar(100)
  addressNeighborhood String?  @map("address_neighborhood") @db.VarChar(100)
  addressCity         String?  @map("address_city") @db.VarChar(100)
  addressState        String?  @map("address_state") @db.Char(2)
  addressZip          String?  @map("address_zip") @db.VarChar(10)
  isActive            Boolean  @default(true) @map("is_active")
  subscriptionStatus  String   @default("trial") @map("subscription_status") @db.VarChar(20)
  settings            Json     @default("{}")
  createdAt           DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt           DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  users   User[]
  persons Person[]

  @@map("tenants")
}

// =========================
// USER (Credenciais de Login)
// =========================
model User {
  id           String    @id @default(uuid()) @db.Uuid
  tenantId     String?   @map("tenant_id") @db.Uuid
  personId     String?   @map("person_id") @db.Uuid
  email        String    @unique @db.VarChar(255)
  passwordHash String    @map("password_hash") @db.VarChar(255)
  role         String    @db.VarChar(30)
  isActive     Boolean   @default(true) @map("is_active")
  lastLoginAt  DateTime? @map("last_login_at") @db.Timestamptz()
  createdAt    DateTime  @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt    DateTime  @updatedAt @map("updated_at") @db.Timestamptz()

  tenant Tenant? @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  person Person? @relation(fields: [personId], references: [id], onDelete: SetNull)

  @@index([tenantId])
  @@index([tenantId, role])
  @@map("users")
}

// =========================
// PERSON (Pessoa física)
// =========================
model Person {
  id                  String    @id @default(uuid()) @db.Uuid
  tenantId            String    @map("tenant_id") @db.Uuid
  fullName            String    @map("full_name") @db.VarChar(255)
  birthDate           DateTime? @map("birth_date") @db.Date
  cpf                 String?   @db.VarChar(14)
  rg                  String?   @db.VarChar(20)
  gender              String?   @db.VarChar(1)
  email               String?   @db.VarChar(255)
  phone               String?   @db.VarChar(20)
  phoneSecondary      String?   @map("phone_secondary") @db.VarChar(20)
  addressStreet       String?   @map("address_street") @db.VarChar(255)
  addressNumber       String?   @map("address_number") @db.VarChar(20)
  addressComplement   String?   @map("address_complement") @db.VarChar(100)
  addressNeighborhood String?   @map("address_neighborhood") @db.VarChar(100)
  addressCity         String?   @map("address_city") @db.VarChar(100)
  addressState        String?   @map("address_state") @db.Char(2)
  addressZip          String?   @map("address_zip") @db.VarChar(10)
  medicalNotes        String?   @map("medical_notes")
  photoUrl            String?   @map("photo_url") @db.VarChar(500)
  isActive            Boolean   @default(true) @map("is_active")
  createdAt           DateTime  @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt           DateTime  @updatedAt @map("updated_at") @db.Timestamptz()

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  users  User[]

  @@index([tenantId])
  @@index([tenantId, cpf])
  @@index([tenantId, fullName])
  @@map("persons")
}
```

### Comandos para migration e geração do client

Certifique-se de que o PostgreSQL está rodando e o banco `gkfitsystem` existe. Se não existir, crie:

```bash
# Se necessário, crie o banco no psql:
# createdb gkfitsystem

# Gerar a migration e aplicar
npx prisma migrate dev --name init_foundation

# Gerar o Prisma Client
npx prisma generate
```

---

## SEÇÃO 6 — Bootstrap Principal do NestJS

### FILE: backend/src/main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Prefixo global da API
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL'),
    credentials: true,
  });

  // Pipe de validação global
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

  // Filtro de exceções global
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  logger.log(`GKFitSystem backend rodando na porta ${port}`);
  logger.log(`Ambiente: ${configService.get<string>('NODE_ENV')}`);
}
bootstrap();
```

O `main.ts` configura CORS, prefixo `/api`, validação automática de DTOs e o filtro de exceções padronizado.

### FILE: backend/src/app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { UserModule } from './modules/user/user.module';
import { HealthModule } from './modules/health/health.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    AuthModule,
    TenantModule,
    UserModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
```

O `AppModule` registra o `JwtAuthGuard` e `RolesGuard` como guards **globais**. Toda rota é protegida por padrão. Rotas públicas usam `@Public()`.

---

## SEÇÃO 7 — Módulo de Configuração

### FILE: backend/src/config/configuration.ts

```typescript
export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
  },
  logLevel: process.env.LOG_LEVEL || 'debug',
});
```

### FILE: backend/src/config/env.validation.ts

```typescript
import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Min(1)
  PORT: number;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_EXPIRES_IN: string;

  @IsString()
  @IsNotEmpty()
  FRONTEND_URL: string;

  @IsNumber()
  @IsOptional()
  BCRYPT_SALT_ROUNDS: number;

  @IsString()
  @IsOptional()
  LOG_LEVEL: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Validação de variáveis de ambiente falhou:\n${errors.toString()}`);
  }
  return validatedConfig;
}
```

### FILE: backend/src/config/config.module.ts

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { validate } from './env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
  ],
})
export class AppConfigModule {}
```

O `AppConfigModule` carrega e valida todas as variáveis de ambiente no startup. Se alguma variável obrigatória estiver ausente, a aplicação **não inicia**.

---

## SEÇÃO 8 — Módulo Prisma

### FILE: backend/src/prisma/prisma.service.ts

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma conectado ao banco de dados');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma desconectado do banco de dados');
  }
}
```

### FILE: backend/src/prisma/prisma.module.ts

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

O `PrismaModule` é `@Global()`, portanto qualquer módulo pode injetar `PrismaService` sem importar o módulo explicitamente.

---

## SEÇÃO 9 — Common (Enums, Interfaces, Decorators, Guards, Filters, Utils)

### FILE: backend/src/common/enums/role.enum.ts

```typescript
export enum Role {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  SECRETARY = 'SECRETARY',
  TEACHER = 'TEACHER',
  FINANCIAL = 'FINANCIAL',
  GUARDIAN = 'GUARDIAN',
  STUDENT = 'STUDENT',
}
```

### FILE: backend/src/common/interfaces/jwt-payload.interface.ts

```typescript
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tenantId: string | null;
  personId: string | null;
}
```

### FILE: backend/src/common/interfaces/request-user.interface.ts

```typescript
export interface RequestUser {
  userId: string;
  email: string;
  role: string;
  tenantId: string | null;
  personId: string | null;
}
```

### FILE: backend/src/common/decorators/public.decorator.ts

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

Marca uma rota como pública, ignorando o `JwtAuthGuard`.

### FILE: backend/src/common/decorators/roles.decorator.ts

```typescript
import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

### FILE: backend/src/common/decorators/current-user.decorator.ts

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUser } from '../interfaces/request-user.interface';

export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as RequestUser;
    return data ? user?.[data] : user;
  },
);
```

### FILE: backend/src/common/decorators/current-tenant.decorator.ts

```typescript
import { createParamDecorator, ExecutionContext, ForbiddenException } from '@nestjs/common';

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const tenantId = request.user?.tenantId;
    if (!tenantId) {
      throw new ForbiddenException('Usuário não possui tenant associado');
    }
    return tenantId;
  },
);
```

### FILE: backend/src/common/guards/jwt-auth.guard.ts

```typescript
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }
}
```

### FILE: backend/src/common/guards/roles.guard.ts

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se nenhum @Roles() definido, qualquer user autenticado passa
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user?.role === role);
  }
}
```

### FILE: backend/src/common/filters/http-exception.filter.ts

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno do servidor';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as any;
        message = res.message || message;
        details = res.message !== message ? res.message : null;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`Erro não tratado: ${exception.message}`, exception.stack);
    }

    response.status(status).json({
      statusCode: status,
      message: Array.isArray(message) ? 'Erro de validação' : message,
      details: Array.isArray(message) ? message : details,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

### FILE: backend/src/common/utils/hash.util.ts

```typescript
import * as bcrypt from 'bcrypt';

export async function hashPassword(password: string, saltRounds = 12): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

---

## SEÇÃO 10 — Módulo Auth

### FILE: backend/src/modules/auth/dto/login.dto.ts

```typescript
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string;
}
```

### FILE: backend/src/modules/auth/dto/change-password.dto.ts

```typescript
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Senha atual é obrigatória' })
  currentPassword: string;

  @IsString()
  @IsNotEmpty({ message: 'Nova senha é obrigatória' })
  @MinLength(6, { message: 'Nova senha deve ter no mínimo 6 caracteres' })
  newPassword: string;
}
```

### FILE: backend/src/modules/auth/strategies/jwt.strategy.ts

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { RequestUser } from '../../../common/interfaces/request-user.interface';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuário inativo ou inexistente');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
      personId: payload.personId,
    };
  }
}
```

A `JwtStrategy` decodifica o token, verifica que o user ainda existe e está ativo no banco, e retorna o `RequestUser` que é injetado em `request.user`.

### FILE: backend/src/modules/auth/auth.service.ts

```typescript
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { comparePassword, hashPassword } from '../../common/utils/hash.util';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuário desativado. Contate o administrador');
    }

    const passwordValid = await comparePassword(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Atualiza último login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      personId: user.personId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        personId: user.personId,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        personId: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        person: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            photoUrl: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return user;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const currentPasswordValid = await comparePassword(dto.currentPassword, user.passwordHash);
    if (!currentPasswordValid) {
      throw new BadRequestException('Senha atual incorreta');
    }

    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS') || 12;
    const newHash = await hashPassword(dto.newPassword, saltRounds);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return { message: 'Senha alterada com sucesso' };
  }
}
```

### FILE: backend/src/modules/auth/auth.controller.ts

```typescript
import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/interfaces/request-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  async getProfile(@CurrentUser() user: RequestUser) {
    return this.authService.getProfile(user.userId);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: RequestUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.userId, dto);
  }
}
```

### FILE: backend/src/modules/auth/auth.module.ts

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '7d',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
```

---

## SEÇÃO 11 — Módulo Tenant

### FILE: backend/src/modules/tenant/dto/create-tenant.dto.ts

```typescript
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Slug é obrigatório' })
  @MaxLength(100)
  slug: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  document?: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @IsOptional()
  addressStreet?: string;

  @IsString()
  @IsOptional()
  addressNumber?: string;

  @IsString()
  @IsOptional()
  addressComplement?: string;

  @IsString()
  @IsOptional()
  addressNeighborhood?: string;

  @IsString()
  @IsOptional()
  addressCity?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2)
  addressState?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  addressZip?: string;
}
```

### FILE: backend/src/modules/tenant/dto/update-tenant.dto.ts

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { CreateTenantDto } from './create-tenant.dto';

export class UpdateTenantDto extends PartialType(CreateTenantDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  subscriptionStatus?: string;
}
```

### FILE: backend/src/modules/tenant/tenant.service.ts

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTenantDto) {
    const existingSlug = await this.prisma.tenant.findUnique({
      where: { slug: dto.slug },
    });
    if (existingSlug) {
      throw new ConflictException('Já existe uma academia com este slug');
    }

    return this.prisma.tenant.create({ data: dto });
  }

  async findAll() {
    return this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }
    return tenant;
  }

  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }
    return tenant;
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.findById(id);
    return this.prisma.tenant.update({
      where: { id },
      data: dto,
    });
  }
}
```

### FILE: backend/src/modules/tenant/tenant.controller.ts

```typescript
import { Controller, Get, Post, Patch, Param, Body, ParseUUIDPipe } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @Roles(Role.PLATFORM_ADMIN)
  create(@Body() dto: CreateTenantDto) {
    return this.tenantService.create(dto);
  }

  @Get()
  @Roles(Role.PLATFORM_ADMIN)
  findAll() {
    return this.tenantService.findAll();
  }

  @Get(':id')
  @Roles(Role.PLATFORM_ADMIN, Role.TENANT_ADMIN)
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantService.findById(id);
  }

  @Patch(':id')
  @Roles(Role.PLATFORM_ADMIN, Role.TENANT_ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTenantDto,
  ) {
    return this.tenantService.update(id, dto);
  }
}
```

### FILE: backend/src/modules/tenant/tenant.module.ts

```typescript
import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';

@Module({
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}
```

---

## SEÇÃO 12 — Módulo User

### FILE: backend/src/modules/user/dto/create-user.dto.ts

```typescript
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string;

  @IsEnum(Role, { message: 'Role inválida' })
  @IsNotEmpty({ message: 'Role é obrigatória' })
  role: Role;

  @IsString()
  @IsOptional()
  personId?: string;
}
```

### FILE: backend/src/modules/user/dto/update-user.dto.ts

```typescript
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

export class UpdateUserDto {
  @IsEnum(Role, { message: 'Role inválida' })
  @IsOptional()
  role?: Role;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  personId?: string;
}
```

### FILE: backend/src/modules/user/user.service.ts

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashPassword } from '../../common/utils/hash.util';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async create(tenantId: string, dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Já existe um usuário com este email');
    }

    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS') || 12;
    const passwordHash = await hashPassword(dto.password, saltRounds);

    return this.prisma.user.create({
      data: {
        tenantId,
        email: dto.email,
        passwordHash,
        role: dto.role,
        personId: dto.personId || null,
      },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        personId: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async findAllByTenant(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        person: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        personId: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        person: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async update(tenantId: string, id: string, dto: UpdateUserDto) {
    await this.findById(tenantId, id);
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        personId: true,
        updatedAt: true,
      },
    });
  }

  async deactivate(tenantId: string, id: string) {
    await this.findById(tenantId, id);
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        isActive: true,
      },
    });
  }
}
```

### FILE: backend/src/modules/user/user.controller.ts

```typescript
import { Controller, Get, Post, Patch, Delete, Param, Body, ParseUUIDPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(Role.TENANT_ADMIN)
  create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateUserDto,
  ) {
    return this.userService.create(tenantId, dto);
  }

  @Get()
  @Roles(Role.TENANT_ADMIN)
  findAll(@CurrentTenant() tenantId: string) {
    return this.userService.findAllByTenant(tenantId);
  }

  @Get(':id')
  @Roles(Role.TENANT_ADMIN)
  findById(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.userService.findById(tenantId, id);
  }

  @Patch(':id')
  @Roles(Role.TENANT_ADMIN)
  update(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(Role.TENANT_ADMIN)
  deactivate(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.userService.deactivate(tenantId, id);
  }
}
```

### FILE: backend/src/modules/user/user.module.ts

```typescript
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

---

## SEÇÃO 13 — Módulo Health

### FILE: backend/src/modules/health/health.controller.ts

```typescript
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  async check() {
    let dbStatus = 'ok';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'error';
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'GKFitSystem API',
      database: dbStatus,
    };
  }
}
```

### FILE: backend/src/modules/health/health.module.ts

```typescript
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
```

---

## SEÇÃO 14 — Seed Script

### FILE: backend/prisma/seed.ts

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  // 1. Criar tenant de desenvolvimento
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'academia-teste' },
    update: {},
    create: {
      name: 'Academia Teste GKFit',
      slug: 'academia-teste',
      document: '12.345.678/0001-90',
      email: 'contato@academiateste.com',
      phone: '(34) 99999-0000',
      addressCity: 'Uberlândia',
      addressState: 'MG',
      isActive: true,
      subscriptionStatus: 'active',
    },
  });
  console.log(`Tenant criado: ${tenant.name} (${tenant.id})`);

  // 2. Criar person do admin do tenant
  const adminPerson = await prisma.person.upsert({
    where: {
      id: '00000000-0000-0000-0000-000000000001',
    },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      tenantId: tenant.id,
      fullName: 'Administrador da Academia',
      email: 'dono@academiateste.com',
      phone: '(34) 99999-1111',
      cpf: '111.222.333-44',
    },
  });
  console.log(`Person criada: ${adminPerson.fullName}`);

  // 3. Hash da senha padrão
  const passwordHash = await bcrypt.hash('Admin@123', 12);

  // 4. Criar user PLATFORM_ADMIN (sem tenant)
  const platformAdmin = await prisma.user.upsert({
    where: { email: 'admin@gkfitsystem.com' },
    update: {},
    create: {
      email: 'admin@gkfitsystem.com',
      passwordHash,
      role: 'PLATFORM_ADMIN',
      tenantId: null,
      personId: null,
      isActive: true,
    },
  });
  console.log(`PLATFORM_ADMIN criado: ${platformAdmin.email}`);

  // 5. Criar user TENANT_ADMIN
  const tenantAdmin = await prisma.user.upsert({
    where: { email: 'dono@academiateste.com' },
    update: {},
    create: {
      email: 'dono@academiateste.com',
      passwordHash,
      role: 'TENANT_ADMIN',
      tenantId: tenant.id,
      personId: adminPerson.id,
      isActive: true,
    },
  });
  console.log(`TENANT_ADMIN criado: ${tenantAdmin.email}`);

  // 6. Criar person + user SECRETARY
  const secretaryPerson = await prisma.person.upsert({
    where: {
      id: '00000000-0000-0000-0000-000000000002',
    },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      tenantId: tenant.id,
      fullName: 'Secretária Teste',
      email: 'secretaria@academiateste.com',
      phone: '(34) 99999-2222',
    },
  });

  await prisma.user.upsert({
    where: { email: 'secretaria@academiateste.com' },
    update: {},
    create: {
      email: 'secretaria@academiateste.com',
      passwordHash,
      role: 'SECRETARY',
      tenantId: tenant.id,
      personId: secretaryPerson.id,
      isActive: true,
    },
  });
  console.log('SECRETARY criado: secretaria@academiateste.com');

  // 7. Criar person + user TEACHER
  const teacherPerson = await prisma.person.upsert({
    where: {
      id: '00000000-0000-0000-0000-000000000003',
    },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      tenantId: tenant.id,
      fullName: 'Professor Teste',
      email: 'professor@academiateste.com',
      phone: '(34) 99999-3333',
    },
  });

  await prisma.user.upsert({
    where: { email: 'professor@academiateste.com' },
    update: {},
    create: {
      email: 'professor@academiateste.com',
      passwordHash,
      role: 'TEACHER',
      tenantId: tenant.id,
      personId: teacherPerson.id,
      isActive: true,
    },
  });
  console.log('TEACHER criado: professor@academiateste.com');

  console.log('\n✅ Seed concluído com sucesso!');
  console.log('\nCredenciais de teste:');
  console.log('  PLATFORM_ADMIN: admin@gkfitsystem.com / Admin@123');
  console.log('  TENANT_ADMIN:   dono@academiateste.com / Admin@123');
  console.log('  SECRETARY:      secretaria@academiateste.com / Admin@123');
  console.log('  TEACHER:        professor@academiateste.com / Admin@123');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

O seed é **idempotente** — usa `upsert` para não duplicar dados ao ser rodado múltiplas vezes.

---

## SEÇÃO 15 — Ajustes no package.json

Adicione ou ajuste a seção `scripts` e `prisma` no `backend/package.json`:

```json
{
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "prisma:generate": "npx prisma generate",
    "prisma:migrate": "npx prisma migrate dev",
    "prisma:migrate:prod": "npx prisma migrate deploy",
    "prisma:studio": "npx prisma studio",
    "prisma:seed": "npx prisma db seed",
    "prisma:reset": "npx prisma migrate reset"
  },
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

### Comando para rodar o seed

```bash
npm run prisma:seed
```

---

## SEÇÃO 16 — Checklist Final de Validação

Execute cada teste na ordem. Se qualquer passo falhar, pare e resolva antes de prosseguir.

### 16.1 — Projeto compila

```bash
npm run build
```

Resultado esperado: sem erros de compilação.

### 16.2 — Banco conectado e migration aplicada

```bash
npx prisma migrate dev --name init_foundation
```

Resultado esperado: tabelas `tenants`, `users`, `persons` criadas.

### 16.3 — Seed executado

```bash
npm run prisma:seed
```

Resultado esperado: mensagem "Seed concluído com sucesso" com 4 credenciais listadas.

### 16.4 — Servidor inicia

```bash
npm run start:dev
```

Resultado esperado: "GKFitSystem backend rodando na porta 3000".

### 16.5 — Health check funciona

```bash
curl http://localhost:3000/api/health
```

Resultado esperado:
```json
{
  "status": "ok",
  "timestamp": "...",
  "service": "GKFitSystem API",
  "database": "ok"
}
```

### 16.6 — Login funciona

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dono@academiateste.com","password":"Admin@123"}'
```

Resultado esperado: JSON com `accessToken` e dados do `user`.

### 16.7 — /auth/me funciona

Use o `accessToken` retornado no passo anterior:

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

Resultado esperado: perfil completo do user com dados do tenant e person.

### 16.8 — Guard de autenticação funciona

```bash
curl http://localhost:3000/api/auth/me
```

Resultado esperado: **401 Unauthorized** (sem token).

### 16.9 — Guard de roles funciona

Faça login como TENANT_ADMIN e tente acessar a lista de tenants (que requer PLATFORM_ADMIN):

```bash
curl http://localhost:3000/api/tenants \
  -H "Authorization: Bearer TOKEN_DO_TENANT_ADMIN"
```

Resultado esperado: **403 Forbidden**.

Agora faça login como PLATFORM_ADMIN e repita:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gkfitsystem.com","password":"Admin@123"}'

curl http://localhost:3000/api/tenants \
  -H "Authorization: Bearer TOKEN_DO_PLATFORM_ADMIN"
```

Resultado esperado: lista de tenants retornada.

### 16.10 — CRUD de users funciona

Logado como TENANT_ADMIN, crie um user:

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_DO_TENANT_ADMIN" \
  -d '{"email":"novo@academiateste.com","password":"Teste@123","role":"FINANCIAL"}'
```

Resultado esperado: user criado com id, email, role, tenantId.

---

## SEÇÃO 17 — Erros Comuns a Evitar

### 1. Esquecer de criar o banco de dados

O Prisma não cria o banco automaticamente. Antes de rodar `migrate dev`, garanta que o banco `gkfitsystem` existe no PostgreSQL:

```bash
createdb gkfitsystem
```

### 2. Variável DATABASE_URL com formato errado

O formato correto para Prisma com PostgreSQL é:
```
postgresql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO?schema=public
```

Atenção especial se usar Supabase — a connection string do Supabase tem um formato diferente do padrão local.

### 3. Não rodar `npx prisma generate` após alterar o schema

Sempre que alterar `schema.prisma`, rode `npx prisma generate` para atualizar o client TypeScript. Sem isso, o TypeScript não reconhece as mudanças.

### 4. Importar `ConfigModule` ao invés de `AppConfigModule`

O nome do módulo de configuração é `AppConfigModule` (para evitar conflito com o `ConfigModule` do NestJS). Use sempre `AppConfigModule` no `app.module.ts`.

### 5. Esquecer o decorator @Public() em rotas abertas

Com o `JwtAuthGuard` global, **toda rota é protegida por padrão**. Se você criar um novo endpoint público e esquecer do `@Public()`, ele vai retornar 401.

### 6. Usar `@Req()` ao invés dos decorators customizados

Nunca faça `request.user.tenantId` diretamente. Sempre use `@CurrentTenant()` e `@CurrentUser()`. Os decorators centralizam a extração e validação.

### 7. Não filtrar por tenant_id nos services

Este é o erro mais crítico. Todo método de service que acessa dados de negócio **deve** receber `tenantId` como primeiro parâmetro e incluí-lo no `where` da query Prisma. Sem isso, dados de um tenant vazam para outro.

### 8. Hash de senha no controller ao invés do service

O hash da senha deve acontecer exclusivamente no `UserService.create()`, nunca no controller. O controller recebe a senha plain-text e o service faz o hash antes de salvar.

### 9. Não usar `ParseUUIDPipe` nos Params

Todo `@Param('id')` que espera um UUID deve usar `@Param('id', ParseUUIDPipe)`. Sem isso, strings inválidas chegam ao Prisma e geram erros feios de banco.

### 10. Colocar lógica de negócio no controller

Controllers são finos — apenas recebem request, extraem dados e chamam o service. Toda validação de negócio, acesso a banco e lógica condicional fica no service.

### 11. Esquecer o `ts-node` no script de seed

A configuração `prisma.seed` no `package.json` precisa do `ts-node` com `--compiler-options {"module":"CommonJS"}`. Sem isso, o TypeScript não consegue rodar o seed.

### 12. JWT_SECRET fraco em produção

Em desenvolvimento, qualquer string serve. Em produção, use no mínimo 64 caracteres aleatórios gerados por um gerador de senha seguro. Nunca reutilize o secret de dev em prod.

---

*Este documento contém o código completo e funcional da fundação do backend do GKFitSystem. Siga as seções na ordem e ao final você terá um backend NestJS rodando com autenticação JWT, multi-tenant por tenant_id, RBAC por roles, e CRUD de tenants e users — pronto para receber os módulos de negócio nas próximas semanas.*
