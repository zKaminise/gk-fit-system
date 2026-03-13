# GKFitSystem — Semana 3: Bootstrap do Backend e Estrutura Técnica Inicial

> **Versão:** 1.0  
> **Data:** Março 2026  
> **Status:** Fundação Técnica do Backend (Pré-Implementação de Módulos de Negócio)  
> **Nome do Projeto:** GKFitSystem

---

## Seção 1 — Objetivo da Semana 3

### O que deve ser conquistado nesta semana

A Semana 3 tem um único propósito: **construir a fundação técnica do backend de forma que todo código futuro já nasça dentro de uma arquitetura sólida, segura e multi-tenant desde o primeiro dia.**

Isso significa que ao final desta semana, o backend do GKFitSystem deve:

- Estar rodando como um projeto NestJS funcional conectado a um PostgreSQL via Prisma.
- Possuir autenticação completa com JWT e bcrypt.
- Possuir guards de autenticação e autorização por roles.
- Extrair automaticamente o `tenant_id` do token JWT em toda requisição autenticada.
- Ter um módulo Prisma encapsulado e reutilizável, preparado para injetar o contexto de tenant.
- Ter um health check funcional para monitoramento.
- Ter variáveis de ambiente configuradas e validadas.
- Ter o schema Prisma com as tabelas fundacionais (`tenants`, `users`, `persons`) migradas e com seed de desenvolvimento.
- Ter uma estrutura de pastas profissional que acomode dezenas de módulos sem virar bagunça.

**O que NÃO é objetivo desta semana:** implementar módulos de negócio como alunos, matrículas, turmas, cobranças ou portal do responsável. Esses vêm nas semanas seguintes, sobre a fundação construída agora.

Pense nesta semana como construir o alicerce, encanamento e elétrica de um prédio — nada visível para o morador final, mas sem isso nada funciona.

---

## Seção 2 — Decisões de Arquitetura do Backend

### 2.1 — Por que NestJS

O NestJS foi escolhido por quatro razões práticas:

**Estrutura opinada.** Diferente do Express puro, o NestJS impõe uma organização em módulos, controllers, services e providers desde o início. Para um SaaS multi-tenant com dezenas de entidades, essa estrutura evita que o projeto vire um monólito desorganizado à medida que cresce.

**TypeScript nativo.** O NestJS foi construído com TypeScript, não adaptado depois. Isso garante tipagem forte em todo o stack — dos DTOs de entrada até as respostas da API — e pega erros em tempo de compilação ao invés de em produção.

**Ecossistema maduro.** Guards, interceptors, pipes, decorators customizados, módulos dinâmicos — tudo que precisamos para autenticação, autorização multi-tenant e validação de dados já existe como conceito de primeira classe no framework, sem gambiarras.

**Escalabilidade organizacional.** Quando o time crescer de 1 para 3-5 desenvolvedores, a convenção de módulos do NestJS permite que cada pessoa trabalhe em seu módulo sem conflitos constantes de merge.

### 2.2 — Por que Prisma como ORM

**Type-safety automática.** O Prisma gera tipos TypeScript a partir do schema do banco. Quando você escreve `prisma.student.findMany()`, o retorno já é tipado — sem interfaces manuais que ficam desatualizadas.

**Migrations declarativas.** O schema.prisma é a fonte da verdade. Você declara o modelo e o Prisma gera o SQL de migration automaticamente, mantendo o schema do banco sincronizado com o código.

**Query builder intuitivo.** Para 90% das queries que o GKFitSystem precisa (CRUD com filtros, includes e paginação), o Prisma Client é mais legível e menos propenso a erros que SQL raw ou query builders genéricos.

**Prisma Studio.** Ferramenta visual gratuita para inspecionar e editar dados durante desenvolvimento — acelera debugging significativamente.

**Ressalva conhecida:** Para queries muito complexas com múltiplos joins e agregações (relatórios financeiros avançados), usaremos `prisma.$queryRaw` pontualmente. Isso é esperado e aceitável.

### 2.3 — Como o backend será organizado

O backend segue o padrão modular do NestJS com separação clara entre:

- **Módulos de infraestrutura** (`prisma`, `config`, `auth`, `common`) — existem para servir os módulos de negócio.
- **Módulos de negócio** (`tenant`, `user`, e futuramente `student`, `enrollment`, etc.) — cada um encapsula uma entidade/domínio completo.
- **Elementos transversais** (`guards`, `decorators`, `interceptors`, `filters`, `pipes`) — vivem na pasta `common` e são usados por todos os módulos.

Cada módulo de negócio segue a mesma estrutura interna: `module`, `controller`, `service`, `dto/`, e opcionalmente `interfaces/`. Isso cria previsibilidade — qualquer desenvolvedor sabe onde encontrar qualquer coisa.

### 2.4 — Como o multi-tenant é preparado desde o início

O `tenant_id` não é adicionado depois como remendo — ele é parte da arquitetura desde o primeiro commit:

- O JWT contém `tenantId` no payload.
- O `AuthGuard` valida o token e injeta `tenantId` no objeto `request.user`.
- Um decorator `@CurrentTenant()` permite extrair o `tenantId` em qualquer controller.
- Todo service que acessa dados de negócio recebe o `tenantId` como parâmetro e o inclui em toda query Prisma.
- Um `TenantGuard` opcional pode ser criado para validar que o tenant existe e está ativo antes de processar a request.

Essa abordagem garante que é **impossível** escrever uma query de negócio sem passar pelo filtro de tenant — o esquecimento vira erro de compilação, não vazamento de dados.

---

## Seção 3 — Estrutura de Pastas Inicial do Backend

```
gkfitsystem/
├── backend/
│   ├── src/
│   │   ├── main.ts                          # Bootstrap da aplicação
│   │   ├── app.module.ts                    # Módulo raiz
│   │   │
│   │   ├── common/                          # Elementos transversais
│   │   │   ├── decorators/
│   │   │   │   ├── current-user.decorator.ts    # Extrai user do request
│   │   │   │   ├── current-tenant.decorator.ts  # Extrai tenantId do request
│   │   │   │   └── roles.decorator.ts           # Define roles permitidas
│   │   │   │
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts            # Valida JWT
│   │   │   │   ├── roles.guard.ts               # Verifica role do user
│   │   │   │   └── tenant.guard.ts              # Valida tenant ativo
│   │   │   │
│   │   │   ├── interceptors/
│   │   │   │   └── transform.interceptor.ts     # Padroniza resposta da API
│   │   │   │
│   │   │   ├── filters/
│   │   │   │   └── http-exception.filter.ts     # Tratamento global de erros
│   │   │   │
│   │   │   ├── pipes/
│   │   │   │   └── validation.pipe.ts           # Validação com class-validator
│   │   │   │
│   │   │   ├── interfaces/
│   │   │   │   ├── jwt-payload.interface.ts     # Shape do payload JWT
│   │   │   │   └── request-user.interface.ts    # Shape do user no request
│   │   │   │
│   │   │   ├── enums/
│   │   │   │   └── role.enum.ts                 # PLATFORM_ADMIN, TENANT_ADMIN, etc.
│   │   │   │
│   │   │   ├── dto/
│   │   │   │   └── pagination.dto.ts            # DTO reutilizável de paginação
│   │   │   │
│   │   │   └── utils/
│   │   │       └── hash.util.ts                 # Wrapper para bcrypt
│   │   │
│   │   ├── config/                          # Configuração da aplicação
│   │   │   ├── config.module.ts
│   │   │   ├── env.validation.ts                # Schema Joi/Zod de validação
│   │   │   └── configuration.ts                 # Factory de configuração
│   │   │
│   │   ├── prisma/                          # Módulo Prisma
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts                # Client encapsulado
│   │   │
│   │   └── modules/                         # Módulos de negócio
│   │       ├── auth/
│   │       │   ├── auth.module.ts
│   │       │   ├── auth.controller.ts
│   │       │   ├── auth.service.ts
│   │       │   ├── strategies/
│   │       │   │   └── jwt.strategy.ts          # Passport JWT strategy
│   │       │   └── dto/
│   │       │       ├── login.dto.ts
│   │       │       └── auth-response.dto.ts
│   │       │
│   │       ├── tenant/
│   │       │   ├── tenant.module.ts
│   │       │   ├── tenant.controller.ts
│   │       │   ├── tenant.service.ts
│   │       │   └── dto/
│   │       │       ├── create-tenant.dto.ts
│   │       │       └── update-tenant.dto.ts
│   │       │
│   │       ├── user/
│   │       │   ├── user.module.ts
│   │       │   ├── user.controller.ts
│   │       │   ├── user.service.ts
│   │       │   └── dto/
│   │       │       ├── create-user.dto.ts
│   │       │       └── update-user.dto.ts
│   │       │
│   │       └── health/
│   │           ├── health.module.ts
│   │           └── health.controller.ts
│   │
│   ├── prisma/
│   │   ├── schema.prisma                    # Schema do banco de dados
│   │   ├── migrations/                      # Migrations geradas pelo Prisma
│   │   └── seed.ts                          # Script de seed
│   │
│   ├── test/
│   │   ├── app.e2e-spec.ts
│   │   └── jest-e2e.json
│   │
│   ├── .env                                 # Variáveis locais (gitignored)
│   ├── .env.example                         # Template de variáveis
│   ├── .eslintrc.js
│   ├── .prettierrc
│   ├── nest-cli.json
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   └── package.json
│
├── docs/
│   ├── PRODUCT_VISION.md
│   ├── DATABASE_SCHEMA.md
│   ├── ARCHITECTURE.md
│   ├── API_CONTRACTS.md
│   ├── ROLES_AND_PERMISSIONS.md
│   ├── BUSINESS_RULES.md
│   ├── ENVIRONMENT_SETUP.md
│   └── BACKLOG.md
│
├── docker/
│   └── docker-compose.yml                   # PostgreSQL local para dev
│
├── .gitignore
└── README.md
```

### Princípios da organização

**`common/` não é módulo NestJS** — é uma pasta de utilitários puros (decorators, guards, pipes, interfaces, enums). Sem `common.module.ts`. Os guards são registrados globalmente no `app.module.ts` ou usados pontualmente com `@UseGuards()`.

**`config/` é um módulo** — usa o `@nestjs/config` para carregar e validar variáveis de ambiente de forma centralizada. É importado como `ConfigModule.forRoot()` no módulo raiz.

**`prisma/` é um módulo** — encapsula o `PrismaClient` como um service injetável. Todo módulo que precisa acessar o banco importa o `PrismaModule` e injeta o `PrismaService`.

**`modules/` agrupa os módulos de negócio** — cada pasta dentro de `modules/` é um módulo NestJS completo e autocontido. As pastas futuras (`student/`, `enrollment/`, `charge/`, etc.) seguirão exatamente o mesmo padrão.

---

## Seção 4 — Módulos Iniciais a Criar Nesta Semana

### 4.1 — `PrismaModule`

**Propósito:** Encapsular o Prisma Client como um provider global reutilizável.

O `PrismaService` estende o `PrismaClient` e implementa os hooks de lifecycle do NestJS (`onModuleInit` para conectar, `onModuleDestroy` para desconectar). Todo módulo que precisa do banco injeta `PrismaService` ao invés de instanciar um client próprio.

Este módulo é marcado como `@Global()` para evitar que cada módulo de negócio precise importá-lo explicitamente. Uma única instância do client é compartilhada por toda a aplicação.

### 4.2 — `ConfigModule`

**Propósito:** Carregar, validar e expor variáveis de ambiente.

Usa o `@nestjs/config` com `ConfigModule.forRoot()` e um schema de validação (Joi ou Zod) que impede a aplicação de iniciar se alguma variável obrigatória estiver ausente ou inválida. As variáveis são acessadas em qualquer service via `ConfigService.get()`, nunca via `process.env` diretamente.

### 4.3 — `AuthModule`

**Propósito:** Login, emissão de JWT e validação de tokens.

Contém o `AuthService` (valida credenciais, gera token), o `AuthController` (endpoints `/auth/login` e `/auth/me`), e a `JwtStrategy` (Passport strategy que decodifica o token e injeta o payload no request).

O JWT emitido contém: `sub` (user ID), `email`, `role`, `tenantId` e `personId`. Esse payload é a base de toda autorização subsequente.

### 4.4 — `TenantModule`

**Propósito:** CRUD básico de tenants (academias).

Nesta semana, apenas as operações fundamentais: criar tenant, buscar por ID, buscar por slug, listar tenants (PLATFORM_ADMIN), e atualizar configurações. O endpoint de criar tenant é protegido por role PLATFORM_ADMIN. Os demais endpoints de leitura são usados internamente pelo `TenantGuard` para validar se o tenant existe e está ativo.

### 4.5 — `UserModule`

**Propósito:** CRUD de usuários internos do tenant.

Endpoints para criar usuário (com senha hash), listar usuários do tenant, buscar por ID, atualizar, desativar. Todos filtrados por `tenant_id`. O endpoint de criação gera o hash bcrypt da senha antes de salvar.

### 4.6 — `HealthModule`

**Propósito:** Endpoint de health check para monitoramento.

Um único endpoint `GET /health` que retorna status da aplicação e conectividade com o banco. Usado por ferramentas de deploy (Railway, Render) para saber se a instância está viva. Não requer autenticação.

### 4.7 — `common/` (não é módulo)

**Propósito:** Centralizar guards, decorators, pipes, filters, enums e interfaces compartilhados.

Elementos essenciais desta semana:

| Elemento | Arquivo | Função |
|----------|---------|--------|
| JwtAuthGuard | `guards/jwt-auth.guard.ts` | Valida JWT em rotas protegidas |
| RolesGuard | `guards/roles.guard.ts` | Verifica se o role do user permite acessar o endpoint |
| TenantGuard | `guards/tenant.guard.ts` | Valida que o tenant existe e está ativo |
| @Roles() | `decorators/roles.decorator.ts` | Metadata decorator que define roles permitidas |
| @CurrentUser() | `decorators/current-user.decorator.ts` | Extrai o user do request |
| @CurrentTenant() | `decorators/current-tenant.decorator.ts` | Extrai o tenantId do request |
| Role enum | `enums/role.enum.ts` | PLATFORM_ADMIN, TENANT_ADMIN, SECRETARY, TEACHER, FINANCIAL, GUARDIAN, STUDENT |
| JwtPayload | `interfaces/jwt-payload.interface.ts` | Shape do payload do token |
| RequestUser | `interfaces/request-user.interface.ts` | Shape do user após validação |
| HttpExceptionFilter | `filters/http-exception.filter.ts` | Padroniza respostas de erro |
| ValidationPipe | `pipes/validation.pipe.ts` | Validação de DTOs com class-validator |

---

## Seção 5 — Variáveis de Ambiente

### Arquivo `.env.example`

```env
# =========================
# GKFITSYSTEM - VARIÁVEIS DE AMBIENTE
# =========================

# Ambiente
NODE_ENV=development
PORT=3000

# Banco de Dados (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# JWT
JWT_SECRET="gkfit-dev-secret-trocar-em-producao-obrigatoriamente"
JWT_EXPIRES_IN="7d"

# Frontend (para CORS)
FRONTEND_URL="http://localhost:5173"

# Bcrypt
BCRYPT_SALT_ROUNDS=12

# Logging
LOG_LEVEL="debug"
```

### Descrição de cada variável

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `NODE_ENV` | Sim | Ambiente: `development`, `staging`, `production` |
| `PORT` | Sim | Porta HTTP do backend. Default: 3000 |
| `DATABASE_URL` | Sim | Connection string do PostgreSQL. Formato Prisma |
| `JWT_SECRET` | Sim | Chave secreta para assinar tokens JWT. Mínimo 32 caracteres em produção |
| `JWT_EXPIRES_IN` | Sim | Tempo de expiração do token: `7d`, `24h`, `1h` |
| `FRONTEND_URL` | Sim | URL do frontend para configuração de CORS |
| `BCRYPT_SALT_ROUNDS` | Não | Rounds do bcrypt. Default: 12. Aumentar para produção se necessário |
| `LOG_LEVEL` | Não | Nível de log: `debug`, `log`, `warn`, `error`. Default: `debug` em dev |

### Validação obrigatória

A aplicação **não deve iniciar** se `DATABASE_URL`, `JWT_SECRET` ou `FRONTEND_URL` estiverem ausentes. O `ConfigModule` deve validar isso no bootstrap e lançar erro explícito com a variável faltante.

---

## Seção 6 — Setup Inicial do Prisma

### 6.1 — Onde o schema vive

O arquivo `schema.prisma` fica em `backend/prisma/schema.prisma`. Essa é a localização padrão que o Prisma CLI reconhece automaticamente.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 6.2 — Modelos iniciais (apenas fundação)

Nesta semana, apenas os três modelos fundacionais são definidos no schema:

```prisma
model Tenant {
  id                 String   @id @default(uuid()) @db.Uuid
  name               String   @db.VarChar(255)
  slug               String   @unique @db.VarChar(100)
  document           String?  @db.VarChar(20)
  email              String   @db.VarChar(255)
  phone              String?  @db.VarChar(20)
  addressStreet      String?  @map("address_street") @db.VarChar(255)
  addressNumber      String?  @map("address_number") @db.VarChar(20)
  addressComplement  String?  @map("address_complement") @db.VarChar(100)
  addressNeighborhood String? @map("address_neighborhood") @db.VarChar(100)
  addressCity        String?  @map("address_city") @db.VarChar(100)
  addressState       String?  @map("address_state") @db.Char(2)
  addressZip         String?  @map("address_zip") @db.VarChar(10)
  isActive           Boolean  @default(true) @map("is_active")
  subscriptionStatus String   @default("trial") @map("subscription_status") @db.VarChar(20)
  settings           Json     @default("{}")
  createdAt          DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt          DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  users   User[]
  persons Person[]

  @@map("tenants")
}

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

model Person {
  id                  String   @id @default(uuid()) @db.Uuid
  tenantId            String   @map("tenant_id") @db.Uuid
  fullName            String   @map("full_name") @db.VarChar(255)
  birthDate           DateTime? @map("birth_date") @db.Date
  cpf                 String?  @db.VarChar(14)
  rg                  String?  @db.VarChar(20)
  gender              String?  @db.VarChar(1)
  email               String?  @db.VarChar(255)
  phone               String?  @db.VarChar(20)
  phoneSecondary      String?  @map("phone_secondary") @db.VarChar(20)
  addressStreet       String?  @map("address_street") @db.VarChar(255)
  addressNumber       String?  @map("address_number") @db.VarChar(20)
  addressComplement   String?  @map("address_complement") @db.VarChar(100)
  addressNeighborhood String?  @map("address_neighborhood") @db.VarChar(100)
  addressCity         String?  @map("address_city") @db.VarChar(100)
  addressState        String?  @map("address_state") @db.Char(2)
  addressZip          String?  @map("address_zip") @db.VarChar(10)
  medicalNotes        String?  @map("medical_notes")
  photoUrl            String?  @map("photo_url") @db.VarChar(500)
  isActive            Boolean  @default(true) @map("is_active")
  createdAt           DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt           DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  users  User[]

  @@index([tenantId])
  @@index([tenantId, cpf])
  @@index([tenantId, fullName])
  @@map("persons")
}
```

### 6.3 — Convenção de nomes

| Contexto | Convenção | Exemplo |
|----------|-----------|---------|
| Nomes de tabela no banco | snake_case plural | `guardian_student_links` |
| Nomes de coluna no banco | snake_case | `tenant_id`, `full_name` |
| Nomes de model no Prisma | PascalCase singular | `GuardianStudentLink` |
| Nomes de campo no Prisma | camelCase | `tenantId`, `fullName` |
| Mapeamento | `@map()` no campo, `@@map()` no model | `@map("tenant_id")` / `@@map("tenants")` |

Essa convenção garante que o banco siga o padrão PostgreSQL (snake_case) enquanto o código TypeScript segue o padrão JavaScript (camelCase), com mapeamento explícito entre os dois.

### 6.4 — Comandos de migration

```bash
# Criar migration a partir de mudanças no schema
npx prisma migrate dev --name init_foundation

# Aplicar migrations em produção
npx prisma migrate deploy

# Gerar o Prisma Client após mudanças no schema
npx prisma generate

# Abrir Prisma Studio para inspecionar dados
npx prisma studio

# Reset completo do banco (dev only)
npx prisma migrate reset
```

### 6.5 — Seed de desenvolvimento

O arquivo `backend/prisma/seed.ts` cria dados mínimos para desenvolvimento:

**O que o seed deve criar:**

1. Um tenant de desenvolvimento ("Academia Teste GKFit", slug: `academia-teste`).
2. Um user PLATFORM_ADMIN (email: `admin@gkfitsystem.com`, senha hash).
3. Um user TENANT_ADMIN vinculado ao tenant (email: `dono@academiateste.com`).
4. Uma person vinculada ao TENANT_ADMIN.
5. Um user SECRETARY vinculado ao tenant (email: `secretaria@academiateste.com`).
6. Um user TEACHER vinculado ao tenant (email: `professor@academiateste.com`).

**Configuração no `package.json`:**

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

**Execução:**

```bash
npx prisma db seed
```

O seed deve ser **idempotente** — rodar múltiplas vezes sem duplicar dados. Use `upsert` ao invés de `create`.

---

## Seção 7 — Fundação de Autenticação

### 7.1 — Visão geral do fluxo

```
[Cliente]                      [Backend]                    [Banco]
   │                              │                            │
   │── POST /auth/login ─────────>│                            │
   │   { email, password }        │── busca user por email ───>│
   │                              │<── retorna user + hash ────│
   │                              │                            │
   │                              │── bcrypt.compare() ────────│
   │                              │                            │
   │                              │── gera JWT ────────────────│
   │<── { access_token, user } ───│                            │
   │                              │                            │
   │── GET /auth/me ──────────────>│                            │
   │   Authorization: Bearer xxx  │── valida JWT ──────────────│
   │                              │── extrai payload ──────────│
   │<── { user profile } ─────────│                            │
```

### 7.2 — Payload do JWT

```typescript
interface JwtPayload {
  sub: string;       // user.id (UUID)
  email: string;     // user.email
  role: string;      // user.role (enum Role)
  tenantId: string | null;  // user.tenantId (nulo para PLATFORM_ADMIN)
  personId: string | null;  // user.personId
}
```

O `tenantId` no token é a peça central do multi-tenant. Todo guard e service usa esse campo para filtrar dados.

### 7.3 — Hash de senha com bcrypt

```typescript
// hash.util.ts — wrapper simples
import * as bcrypt from 'bcrypt';

export async function hashPassword(password: string, rounds: number = 12): Promise<string> {
  return bcrypt.hash(password, rounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

Senhas nunca são armazenadas em texto. O salt rounds (12) é configurável via variável de ambiente. Em produção, 12 é o mínimo recomendado.

### 7.4 — JwtAuthGuard

O `JwtAuthGuard` estende o `AuthGuard('jwt')` do Passport. Ele é aplicado globalmente via `APP_GUARD` ou pontualmente com `@UseGuards(JwtAuthGuard)`. Rotas públicas (login, health) usam um decorator `@Public()` que o guard reconhece e permite passagem.

```typescript
// Decorator @Public()
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// No guard: se a rota tem @Public(), permite sem token
const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
  context.getHandler(),
  context.getClass(),
]);
if (isPublic) return true;
```

### 7.5 — RolesGuard

O `RolesGuard` lê o metadata `@Roles('TENANT_ADMIN', 'SECRETARY')` do controller/method e compara com o `role` do user autenticado.

```typescript
// Uso no controller
@Roles(Role.TENANT_ADMIN, Role.SECRETARY)
@Get('students')
findAll() { ... }
```

Se nenhum `@Roles()` está definido, o guard permite qualquer user autenticado. Se `@Roles()` está presente, apenas os roles listados passam.

### 7.6 — Decorator @CurrentUser()

```typescript
// current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as RequestUser;
    return data ? user?.[data] : user;
  },
);

// Uso no controller
@Get('me')
getProfile(@CurrentUser() user: RequestUser) {
  return user;
}

@Get('my-tenant')
getTenant(@CurrentUser('tenantId') tenantId: string) {
  return this.tenantService.findById(tenantId);
}
```

### 7.7 — Decorator @CurrentTenant()

Atalho para `@CurrentUser('tenantId')` que também valida que o tenantId existe (não é null):

```typescript
export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const tenantId = request.user?.tenantId;
    if (!tenantId) {
      throw new ForbiddenException('Usuário não possui tenant associado');
    }
    return tenantId;
  },
);
```

### 7.8 — Endpoints de autenticação (Semana 3)

| Método | Rota | Autenticação | Descrição |
|--------|------|-------------|-----------|
| POST | `/auth/login` | Pública | Login com email + senha, retorna JWT |
| GET | `/auth/me` | JWT | Retorna perfil do user autenticado |
| POST | `/auth/change-password` | JWT | Altera senha do próprio user |

Endpoints futuros (pós Semana 3): `/auth/forgot-password`, `/auth/reset-password`, `/auth/refresh-token`.

---

## Seção 8 — Fundação Multi-Tenant

### 8.1 — Princípio: tenant_id está em tudo

Todo service que acessa dados de negócio segue esse padrão:

```typescript
// student.service.ts (exemplo futuro — mesmo padrão para todos)
@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.student.findMany({
      where: { tenantId },  // SEMPRE presente
    });
  }

  async findById(tenantId: string, id: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, tenantId },  // SEMPRE filtra por tenant
    });
    if (!student) throw new NotFoundException('Aluno não encontrado');
    return student;
  }

  async create(tenantId: string, dto: CreateStudentDto) {
    return this.prisma.student.create({
      data: { ...dto, tenantId },  // SEMPRE injeta tenant
    });
  }
}
```

### 8.2 — Fluxo do tenant_id em cada request

```
Request HTTP com Bearer Token
       │
       ▼
JwtAuthGuard → decodifica JWT → injeta user no request
       │
       ▼
request.user = {
  sub: "uuid-do-user",
  email: "user@example.com",
  role: "TENANT_ADMIN",
  tenantId: "uuid-do-tenant",   ◄── aqui está o tenant
  personId: "uuid-da-person"
}
       │
       ▼
Controller extrai tenantId via @CurrentTenant()
       │
       ▼
Service recebe tenantId como parâmetro
       │
       ▼
Prisma query inclui WHERE tenant_id = tenantId
```

### 8.3 — TenantGuard (validação adicional)

Além de extrair o `tenantId` do JWT, um `TenantGuard` opcional pode validar que o tenant realmente existe e está ativo no banco. Isso protege contra tokens válidos de tenants que foram desativados entre a emissão do token e a request.

```typescript
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private tenantService: TenantService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.user?.tenantId;

    // PLATFORM_ADMIN não tem tenant — permite
    if (!tenantId && request.user?.role === Role.PLATFORM_ADMIN) {
      return true;
    }

    if (!tenantId) {
      throw new ForbiddenException('Tenant não identificado');
    }

    const tenant = await this.tenantService.findActiveById(tenantId);
    if (!tenant) {
      throw new ForbiddenException('Tenant inativo ou inexistente');
    }

    // Injeta o tenant completo no request para uso posterior
    request.tenant = tenant;
    return true;
  }
}
```

### 8.4 — Regras para PLATFORM_ADMIN

O PLATFORM_ADMIN é o único role que opera sem `tenantId`. Seus endpoints são protegidos por `@Roles(Role.PLATFORM_ADMIN)` e não passam pelo `TenantGuard`. Ele pode listar todos os tenants, criar novos tenants e, no futuro, impersonar outros users para suporte.

### 8.5 — Validação cruzada de referências

Quando um service cria ou atualiza um registro que referencia outra entidade (ex: enrollment referencia plan_id), ele deve validar que a entidade referenciada pertence ao mesmo tenant:

```typescript
async createEnrollment(tenantId: string, dto: CreateEnrollmentDto) {
  // Valida que o plano existe E pertence ao mesmo tenant
  const plan = await this.prisma.plan.findFirst({
    where: { id: dto.planId, tenantId },
  });
  if (!plan) throw new BadRequestException('Plano não encontrado neste tenant');

  // ... cria enrollment
}
```

Essa validação previne que um atacante manipule IDs no payload para referenciar dados de outro tenant.

---

## Seção 9 — Ordem de Implementação Passo a Passo

A ordem abaixo é prática e sequencial — cada passo depende do anterior.

### Dia 1 — Scaffold e Infraestrutura

| Passo | Ação |
|-------|------|
| 1 | Criar o projeto NestJS com `nest new backend` |
| 2 | Instalar dependências: `@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `bcrypt`, `class-validator`, `class-transformer`, `@prisma/client`, `prisma` |
| 3 | Instalar dev deps: `@types/bcrypt`, `@types/passport-jwt` |
| 4 | Configurar `.env.example` e `.env` com todas as variáveis |
| 5 | Configurar `ConfigModule` com validação de env vars |
| 6 | Configurar ESLint e Prettier |

### Dia 2 — Prisma e Banco

| Passo | Ação |
|-------|------|
| 7 | Inicializar Prisma com `npx prisma init` |
| 8 | Definir os modelos `Tenant`, `User` e `Person` no schema |
| 9 | Criar o `PrismaModule` e `PrismaService` |
| 10 | Rodar `npx prisma migrate dev --name init_foundation` |
| 11 | Criar e rodar o seed com tenant, users e persons de teste |
| 12 | Configurar o `docker-compose.yml` com PostgreSQL local (alternativa ao Supabase para dev) |

### Dia 3 — Autenticação

| Passo | Ação |
|-------|------|
| 13 | Criar o enum `Role` em `common/enums/` |
| 14 | Criar as interfaces `JwtPayload` e `RequestUser` em `common/interfaces/` |
| 15 | Criar o `hash.util.ts` com funções bcrypt |
| 16 | Criar o `AuthModule` com `JwtModule.registerAsync()` |
| 17 | Implementar a `JwtStrategy` (Passport) |
| 18 | Implementar o `AuthService` com login e validação |
| 19 | Implementar o `AuthController` com `POST /auth/login` e `GET /auth/me` |
| 20 | Testar login manualmente com curl ou Postman |

### Dia 4 — Guards e Decorators

| Passo | Ação |
|-------|------|
| 21 | Criar o decorator `@Public()` |
| 22 | Criar o `JwtAuthGuard` com suporte a `@Public()` |
| 23 | Registrar o `JwtAuthGuard` como guard global no `AppModule` |
| 24 | Criar o decorator `@Roles()` |
| 25 | Criar o `RolesGuard` |
| 26 | Registrar o `RolesGuard` como guard global |
| 27 | Criar os decorators `@CurrentUser()` e `@CurrentTenant()` |
| 28 | Criar o `TenantGuard` |
| 29 | Criar o `HttpExceptionFilter` e registrar globalmente |
| 30 | Criar o `ValidationPipe` global para DTOs |

### Dia 5 — Módulos Fundacionais

| Passo | Ação |
|-------|------|
| 31 | Implementar o `HealthModule` com `GET /health` |
| 32 | Implementar o `TenantModule` (CRUD básico, protegido por roles) |
| 33 | Implementar o `UserModule` (CRUD com tenant_id, criação com hash) |
| 34 | Implementar DTOs com validação (class-validator) para todos os endpoints |
| 35 | Criar o `TransformInterceptor` para padronizar respostas |

### Dia 6 — Integração e Testes

| Passo | Ação |
|-------|------|
| 36 | Configurar CORS no `main.ts` usando `FRONTEND_URL` |
| 37 | Testar fluxo completo: login → token → request autenticada → filtro por tenant |
| 38 | Testar guards: acesso sem token, com role errado, com tenant inativo |
| 39 | Escrever pelo menos 1 teste e2e para o fluxo de login |
| 40 | Documentar endpoints no `API_CONTRACTS.md` |

### Dia 7 — Limpeza e Documentação

| Passo | Ação |
|-------|------|
| 41 | Revisar e limpar todo o código |
| 42 | Atualizar `ENVIRONMENT_SETUP.md` com instruções completas |
| 43 | Atualizar `ARCHITECTURE.md` com decisões tomadas |
| 44 | Fazer commit e push com mensagens descritivas |
| 45 | Validar que `npm run build` compila sem erros |

---

## Seção 10 — Entregáveis do Final da Semana 3

Ao final da Semana 3, os seguintes itens devem estar **completos e funcionando:**

### Infraestrutura

- [ ] Projeto NestJS inicializado e compilando sem erros
- [ ] Prisma configurado com schema fundacional (Tenant, User, Person)
- [ ] Migration inicial aplicada com sucesso
- [ ] Seed de desenvolvimento criando dados de teste
- [ ] Docker Compose funcional com PostgreSQL local
- [ ] Variáveis de ambiente validadas no startup
- [ ] ESLint + Prettier configurados e passando

### Autenticação

- [ ] `POST /auth/login` — retorna JWT para credenciais válidas
- [ ] `GET /auth/me` — retorna perfil do user autenticado
- [ ] `POST /auth/change-password` — altera senha com validação
- [ ] Senhas armazenadas com bcrypt (12 rounds)
- [ ] JWT com payload contendo sub, email, role, tenantId, personId
- [ ] Token com expiração configurável via variável de ambiente

### Guards e Autorização

- [ ] JwtAuthGuard global — toda rota protegida por padrão
- [ ] Decorator @Public() para rotas sem autenticação
- [ ] RolesGuard funcional com decorator @Roles()
- [ ] TenantGuard validando existência e status do tenant
- [ ] @CurrentUser() e @CurrentTenant() extraindo dados do request

### Módulos

- [ ] HealthModule — `GET /health` retornando status e db connectivity
- [ ] TenantModule — CRUD básico (criar, listar, buscar, atualizar)
- [ ] UserModule — CRUD com tenant_id (criar com hash, listar, buscar, atualizar, desativar)

### Qualidade

- [ ] HttpExceptionFilter padronizando erros
- [ ] ValidationPipe validando DTOs em todos os endpoints
- [ ] Pelo menos 1 teste e2e do fluxo de login
- [ ] Documentação atualizada (ENVIRONMENT_SETUP.md, API_CONTRACTS.md)

### Formato de resposta padronizado

Todas as respostas da API devem seguir o formato:

```json
// Sucesso
{
  "statusCode": 200,
  "message": "Operação realizada com sucesso",
  "data": { ... }
}

// Erro
{
  "statusCode": 400,
  "message": "Dados inválidos",
  "error": "Bad Request",
  "details": [
    { "field": "email", "message": "Email inválido" }
  ]
}
```

### Endpoints disponíveis ao final da semana

| Método | Rota | Auth | Role | Descrição |
|--------|------|------|------|-----------|
| GET | `/health` | Não | — | Health check |
| POST | `/auth/login` | Não | — | Login |
| GET | `/auth/me` | JWT | Qualquer | Perfil do user |
| POST | `/auth/change-password` | JWT | Qualquer | Alterar senha |
| POST | `/tenants` | JWT | PLATFORM_ADMIN | Criar tenant |
| GET | `/tenants` | JWT | PLATFORM_ADMIN | Listar tenants |
| GET | `/tenants/:id` | JWT | PLATFORM_ADMIN, TENANT_ADMIN | Buscar tenant |
| PATCH | `/tenants/:id` | JWT | PLATFORM_ADMIN, TENANT_ADMIN | Atualizar tenant |
| POST | `/users` | JWT | TENANT_ADMIN | Criar user no tenant |
| GET | `/users` | JWT | TENANT_ADMIN | Listar users do tenant |
| GET | `/users/:id` | JWT | TENANT_ADMIN | Buscar user |
| PATCH | `/users/:id` | JWT | TENANT_ADMIN | Atualizar user |
| DELETE | `/users/:id` | JWT | TENANT_ADMIN | Desativar user (soft delete) |

---

*Este documento é o guia prático para a Semana 3 do GKFitSystem. Cada passo foi pensado para construir uma fundação sólida que os módulos de negócio das próximas semanas vão usar sem precisar refatorar. O investimento em guards, decorators e padrões agora economiza semanas de debugging depois.*
