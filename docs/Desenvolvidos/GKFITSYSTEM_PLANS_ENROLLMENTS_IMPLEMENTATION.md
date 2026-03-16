# GKFitSystem — Domínio de Planos e Matrículas: Implementação Completa

> **Versão:** 1.0  
> **Data:** Março 2026  
> **Pré-requisito:** Domínios de Pessoas/Relacionamentos e Estrutura Acadêmica implementados e testados

---

## SEÇÃO 1 — O Que Será Implementado Agora

### Escopo desta etapa

Esta etapa implementa o terceiro domínio de negócio do GKFitSystem: **Planos e Matrículas**. Esse domínio conecta alunos à oferta acadêmica da academia e é a base direta para o módulo financeiro (cobranças e pagamentos) que virá na próxima etapa.

### Entidades implementadas

| Entidade | Propósito |
|----------|-----------|
| **Plan** | Configuração comercial: nome, valor, frequência de cobrança, taxa de matrícula |
| **Enrollment** | Matrícula: vincula um aluno a um plano com datas e status de vigência |
| **EnrollmentClassGroup** | Vínculo muitos-para-muitos entre matrícula e turmas — define em quais turmas o aluno está |

### Cadeia de dependência

```
Tenant
  └── Plan
  └── Enrollment
        ├── → Student (obrigatório, mesmo tenant)
        ├── → Plan (obrigatório, mesmo tenant)
        └── EnrollmentClassGroup
              └── → ClassGroup (obrigatório, mesmo tenant, ativo)
```

### Regras de negócio cobertas

- Cada tenant define seus próprios planos — nomes não se repetem dentro de um tenant.
- Preços são armazenados em centavos (inteiro) para evitar problemas de arredondamento.
- Uma matrícula vincula exatamente um aluno a um plano.
- Um aluno pode ter múltiplas matrículas (ex: natação + musculação em planos separados).
- Uma matrícula pode cobrir múltiplas turmas via `EnrollmentClassGroup`.
- Não pode existir vínculo duplicado entre a mesma matrícula e a mesma turma.
- Student, Plan e ClassGroup referenciados devem pertencer ao mesmo tenant.
- ClassGroup deve estar ativo para ser vinculado a uma matrícula.
- Desativação de plano é soft delete (`isActive = false`).
- Status da matrícula segue o ciclo: `active` → `suspended` → `cancelled` / `completed`.

### O que NÃO faz parte desta etapa

- Cobranças (charges) e pagamentos (payments).
- Geração automática de cobranças a partir do plano.
- Presença (attendance) e avaliações (evaluations).
- Verificação de capacidade máxima da turma (será adicionada quando attendance existir).

---

## SEÇÃO 2 — Alterações no Prisma Schema

### Relações reversas a adicionar nos modelos existentes

**No modelo `Tenant`, adicione:**

```prisma
  plans                  Plan[]
  enrollments            Enrollment[]
  enrollmentClassGroups  EnrollmentClassGroup[]
```

**No modelo `Student`, adicione:**

```prisma
  enrollments Enrollment[]
```

**No modelo `ClassGroup`, adicione:**

```prisma
  enrollmentClassGroups EnrollmentClassGroup[]
```

### Novos modelos a adicionar ao final do schema.prisma

```prisma
// =========================
// PLAN (Plano Comercial)
// =========================
model Plan {
  id                 String   @id @default(uuid()) @db.Uuid
  tenantId           String   @map("tenant_id") @db.Uuid
  name               String   @db.VarChar(150)
  description        String?
  priceCents         Int      @map("price_cents")
  billingFrequency   String   @default("monthly") @map("billing_frequency") @db.VarChar(20)
  durationMonths     Int?     @map("duration_months")
  enrollmentFeeCents Int      @default(0) @map("enrollment_fee_cents")
  allowsPause        Boolean  @default(false) @map("allows_pause")
  maxPauseDays       Int?     @map("max_pause_days")
  isActive           Boolean  @default(true) @map("is_active")
  createdAt          DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt          DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  tenant      Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  enrollments Enrollment[]

  @@unique([tenantId, name])
  @@index([tenantId])
  @@index([tenantId, isActive])
  @@map("plans")
}

// =========================
// ENROLLMENT (Matrícula)
// =========================
model Enrollment {
  id                 String    @id @default(uuid()) @db.Uuid
  tenantId           String    @map("tenant_id") @db.Uuid
  studentId          String    @map("student_id") @db.Uuid
  planId             String    @map("plan_id") @db.Uuid
  status             String    @default("active") @db.VarChar(20)
  startDate          DateTime  @map("start_date") @db.Date
  endDate            DateTime? @map("end_date") @db.Date
  cancellationDate   DateTime? @map("cancellation_date") @db.Date
  cancellationReason String?   @map("cancellation_reason")
  notes              String?
  createdAt          DateTime  @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt          DateTime  @updatedAt @map("updated_at") @db.Timestamptz()

  tenant      Tenant                 @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  student     Student                @relation(fields: [studentId], references: [id], onDelete: Cascade)
  plan        Plan                   @relation(fields: [planId], references: [id], onDelete: Restrict)
  classGroups EnrollmentClassGroup[]

  @@index([tenantId])
  @@index([tenantId, studentId])
  @@index([tenantId, status])
  @@index([planId])
  @@map("enrollments")
}

// =========================
// ENROLLMENT_CLASS_GROUP (Turmas da Matrícula)
// =========================
model EnrollmentClassGroup {
  id            String   @id @default(uuid()) @db.Uuid
  tenantId      String   @map("tenant_id") @db.Uuid
  enrollmentId  String   @map("enrollment_id") @db.Uuid
  classGroupId  String   @map("class_group_id") @db.Uuid
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz()

  tenant     Tenant     @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  enrollment Enrollment @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  classGroup ClassGroup @relation(fields: [classGroupId], references: [id], onDelete: Cascade)

  @@unique([enrollmentId, classGroupId])
  @@index([tenantId])
  @@index([enrollmentId])
  @@index([classGroupId])
  @@map("enrollment_class_groups")
}
```

**Nota sobre `onDelete` do Plan → Enrollment:** Usa `Restrict` ao invés de `Cascade`. Isso impede que um plano com matrículas seja excluído acidentalmente — o plano deve ser desativado (`isActive: false`), nunca removido.

---

## SEÇÃO 3 — Migration e Comandos Prisma

Após salvar as alterações no `schema.prisma`:

```bash
npx prisma migrate dev --name add_plan_enrollment

npx prisma generate
```

Verifique que as tabelas `plans`, `enrollments` e `enrollment_class_groups` foram criadas.

---

## SEÇÃO 4 — Estrutura de Pastas

```bash
mkdir -p src/modules/plan/dto
mkdir -p src/modules/enrollment/dto
mkdir -p src/modules/enrollment-class-group/dto
```

Estrutura final:

```
src/modules/
├── plan/
│   ├── dto/
│   │   ├── create-plan.dto.ts
│   │   └── update-plan.dto.ts
│   ├── plan.service.ts
│   ├── plan.controller.ts
│   └── plan.module.ts
├── enrollment/
│   ├── dto/
│   │   ├── create-enrollment.dto.ts
│   │   └── update-enrollment.dto.ts
│   ├── enrollment.service.ts
│   ├── enrollment.controller.ts
│   └── enrollment.module.ts
└── enrollment-class-group/
    ├── dto/
    │   └── create-enrollment-class-group.dto.ts
    ├── enrollment-class-group.service.ts
    ├── enrollment-class-group.controller.ts
    └── enrollment-class-group.module.ts
```

---

## SEÇÃO 5 — Módulo Plan

### FILE: backend/src/modules/plan/dto/create-plan.dto.ts

```typescript
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome do plano é obrigatório' })
  @MaxLength(150)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt({ message: 'Preço deve ser um inteiro (centavos)' })
  @Min(0, { message: 'Preço não pode ser negativo' })
  priceCents: number;

  @IsString()
  @IsOptional()
  @IsIn(['monthly', 'quarterly', 'semiannual', 'annual'], {
    message: 'Frequência deve ser: monthly, quarterly, semiannual ou annual',
  })
  billingFrequency?: string;

  @IsInt()
  @Min(1)
  @Max(120)
  @IsOptional()
  durationMonths?: number;

  @IsInt({ message: 'Taxa de matrícula deve ser um inteiro (centavos)' })
  @Min(0)
  @IsOptional()
  enrollmentFeeCents?: number;

  @IsBoolean()
  @IsOptional()
  allowsPause?: boolean;

  @IsInt()
  @Min(1)
  @Max(365)
  @IsOptional()
  maxPauseDays?: number;
}
```

### FILE: backend/src/modules/plan/dto/update-plan.dto.ts

```typescript
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdatePlanDto {
  @IsString()
  @IsOptional()
  @MaxLength(150)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt({ message: 'Preço deve ser um inteiro (centavos)' })
  @Min(0)
  @IsOptional()
  priceCents?: number;

  @IsString()
  @IsOptional()
  @IsIn(['monthly', 'quarterly', 'semiannual', 'annual'], {
    message: 'Frequência deve ser: monthly, quarterly, semiannual ou annual',
  })
  billingFrequency?: string;

  @IsInt()
  @Min(1)
  @Max(120)
  @IsOptional()
  durationMonths?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  enrollmentFeeCents?: number;

  @IsBoolean()
  @IsOptional()
  allowsPause?: boolean;

  @IsInt()
  @Min(1)
  @Max(365)
  @IsOptional()
  maxPauseDays?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
```

### FILE: backend/src/modules/plan/plan.service.ts

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlanService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreatePlanDto) {
    const existing = await this.prisma.plan.findUnique({
      where: {
        tenantId_name: { tenantId, name: dto.name },
      },
    });
    if (existing) {
      throw new ConflictException('Já existe um plano com este nome nesta academia');
    }

    return this.prisma.plan.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        priceCents: dto.priceCents,
        billingFrequency: dto.billingFrequency ?? 'monthly',
        durationMonths: dto.durationMonths,
        enrollmentFeeCents: dto.enrollmentFeeCents ?? 0,
        allowsPause: dto.allowsPause ?? false,
        maxPauseDays: dto.maxPauseDays,
      },
    });
  }

  async findAll(tenantId: string, activeOnly?: boolean) {
    const where: any = { tenantId };
    if (activeOnly) {
      where.isActive = true;
    }

    return this.prisma.plan.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    });
  }

  async findById(tenantId: string, id: string) {
    const plan = await this.prisma.plan.findFirst({
      where: { id, tenantId },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    });
    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }
    return plan;
  }

  async update(tenantId: string, id: string, dto: UpdatePlanDto) {
    await this.findById(tenantId, id);

    if (dto.name) {
      const existing = await this.prisma.plan.findFirst({
        where: {
          tenantId,
          name: dto.name,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException('Já existe outro plano com este nome nesta academia');
      }
    }

    return this.prisma.plan.update({
      where: { id },
      data: dto,
    });
  }

  async deactivate(tenantId: string, id: string) {
    await this.findById(tenantId, id);
    return this.prisma.plan.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, name: true, isActive: true },
    });
  }
}
```

O `findAll` inclui `_count` de enrollments para que o frontend exiba quantas matrículas cada plano tem.

### FILE: backend/src/modules/plan/plan.controller.ts

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('plans')
@Roles(Role.TENANT_ADMIN, Role.SECRETARY)
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreatePlanDto,
  ) {
    return this.planService.create(tenantId, dto);
  }

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.planService.findAll(tenantId, activeOnly === 'true');
  }

  @Get(':id')
  findById(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.planService.findById(tenantId, id);
  }

  @Patch(':id')
  update(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlanDto,
  ) {
    return this.planService.update(tenantId, id, dto);
  }

  @Delete(':id')
  deactivate(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.planService.deactivate(tenantId, id);
  }
}
```

### FILE: backend/src/modules/plan/plan.module.ts

```typescript
import { Module } from '@nestjs/common';
import { PlanService } from './plan.service';
import { PlanController } from './plan.controller';

@Module({
  controllers: [PlanController],
  providers: [PlanService],
  exports: [PlanService],
})
export class PlanModule {}
```

---

## SEÇÃO 6 — Módulo Enrollment

### FILE: backend/src/modules/enrollment/dto/create-enrollment.dto.ts

```typescript
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateEnrollmentDto {
  @IsUUID('4', { message: 'studentId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'studentId é obrigatório' })
  studentId: string;

  @IsUUID('4', { message: 'planId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'planId é obrigatório' })
  planId: string;

  @IsDateString({}, { message: 'Data de início deve ser uma data válida' })
  @IsNotEmpty({ message: 'Data de início é obrigatória' })
  startDate: string;

  @IsDateString({}, { message: 'Data de término deve ser uma data válida' })
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
```

### FILE: backend/src/modules/enrollment/dto/update-enrollment.dto.ts

```typescript
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateEnrollmentDto {
  @IsString()
  @IsOptional()
  @IsIn(['active', 'suspended', 'cancelled', 'completed'], {
    message: 'Status deve ser: active, suspended, cancelled ou completed',
  })
  status?: string;

  @IsDateString({}, { message: 'Data de término deve ser uma data válida' })
  @IsOptional()
  endDate?: string;

  @IsDateString({}, { message: 'Data de cancelamento deve ser uma data válida' })
  @IsOptional()
  cancellationDate?: string;

  @IsString()
  @IsOptional()
  cancellationReason?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
```

O `UpdateEnrollmentDto` não permite trocar aluno ou plano. Mudar de plano exige cancelar a matrícula atual e criar uma nova — isso preserva o histórico.

### FILE: backend/src/modules/enrollment/enrollment.service.ts

```typescript
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Injectable()
export class EnrollmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateEnrollmentDto) {
    // Valida student pertence ao tenant
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, tenantId },
    });
    if (!student) {
      throw new BadRequestException('Aluno não encontrado nesta academia');
    }
    if (student.status !== 'active') {
      throw new BadRequestException('Aluno não está ativo');
    }

    // Valida plan pertence ao tenant
    const plan = await this.prisma.plan.findFirst({
      where: { id: dto.planId, tenantId },
    });
    if (!plan) {
      throw new BadRequestException('Plano não encontrado nesta academia');
    }
    if (!plan.isActive) {
      throw new BadRequestException('Plano não está ativo');
    }

    // Calcula endDate a partir da duração do plano se não informado
    let endDate: Date | null = null;
    if (dto.endDate) {
      endDate = new Date(dto.endDate);
    } else if (plan.durationMonths) {
      const start = new Date(dto.startDate);
      endDate = new Date(start);
      endDate.setMonth(endDate.getMonth() + plan.durationMonths);
    }

    return this.prisma.enrollment.create({
      data: {
        tenantId,
        studentId: dto.studentId,
        planId: dto.planId,
        startDate: new Date(dto.startDate),
        endDate,
        notes: dto.notes,
      },
      include: {
        student: {
          include: {
            person: {
              select: { id: true, fullName: true, cpf: true },
            },
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            priceCents: true,
            billingFrequency: true,
          },
        },
      },
    });
  }

  async findAll(
    tenantId: string,
    filters?: {
      studentId?: string;
      planId?: string;
      status?: string;
    },
  ) {
    const where: any = { tenantId };
    if (filters?.studentId) where.studentId = filters.studentId;
    if (filters?.planId) where.planId = filters.planId;
    if (filters?.status) where.status = filters.status;

    return this.prisma.enrollment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          include: {
            person: {
              select: { id: true, fullName: true, cpf: true, phone: true },
            },
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            priceCents: true,
            billingFrequency: true,
          },
        },
        classGroups: {
          include: {
            classGroup: {
              select: {
                id: true,
                name: true,
                daysOfWeek: true,
                startTime: true,
                endTime: true,
                location: true,
                modality: { select: { id: true, name: true } },
              },
            },
          },
        },
        _count: {
          select: { classGroups: true },
        },
      },
    });
  }

  async findById(tenantId: string, id: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { id, tenantId },
      include: {
        student: {
          include: {
            person: true,
          },
        },
        plan: true,
        classGroups: {
          include: {
            classGroup: {
              include: {
                modality: { select: { id: true, name: true } },
                level: { select: { id: true, name: true, color: true } },
                teacher: {
                  select: {
                    id: true,
                    person: {
                      select: { id: true, fullName: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!enrollment) {
      throw new NotFoundException('Matrícula não encontrada');
    }
    return enrollment;
  }

  async update(tenantId: string, id: string, dto: UpdateEnrollmentDto) {
    const enrollment = await this.findById(tenantId, id);

    // Se cancelando, exige data de cancelamento
    if (dto.status === 'cancelled' && !dto.cancellationDate && !enrollment.cancellationDate) {
      dto.cancellationDate = new Date().toISOString().split('T')[0];
    }

    const data: any = { ...dto };
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    if (dto.cancellationDate) data.cancellationDate = new Date(dto.cancellationDate);

    return this.prisma.enrollment.update({
      where: { id },
      data,
      include: {
        student: {
          include: {
            person: {
              select: { id: true, fullName: true },
            },
          },
        },
        plan: {
          select: { id: true, name: true },
        },
      },
    });
  }
}
```

O `EnrollmentService` calcula `endDate` automaticamente a partir da `durationMonths` do plano quando o campo não é informado explicitamente. Ao cancelar, se nenhuma data de cancelamento for enviada, preenche com a data atual.

### FILE: backend/src/modules/enrollment/enrollment.controller.ts

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('enrollments')
@Roles(Role.TENANT_ADMIN, Role.SECRETARY)
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateEnrollmentDto,
  ) {
    return this.enrollmentService.create(tenantId, dto);
  }

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('studentId') studentId?: string,
    @Query('planId') planId?: string,
    @Query('status') status?: string,
  ) {
    return this.enrollmentService.findAll(tenantId, { studentId, planId, status });
  }

  @Get(':id')
  findById(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.enrollmentService.findById(tenantId, id);
  }

  @Patch(':id')
  update(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEnrollmentDto,
  ) {
    return this.enrollmentService.update(tenantId, id, dto);
  }
}
```

Sem endpoint `DELETE` — matrículas não são removidas, apenas canceladas via `PATCH` com `status: 'cancelled'`.

### FILE: backend/src/modules/enrollment/enrollment.module.ts

```typescript
import { Module } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentController } from './enrollment.controller';

@Module({
  controllers: [EnrollmentController],
  providers: [EnrollmentService],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
```

---

## SEÇÃO 7 — Módulo EnrollmentClassGroup

### FILE: backend/src/modules/enrollment-class-group/dto/create-enrollment-class-group.dto.ts

```typescript
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateEnrollmentClassGroupDto {
  @IsUUID('4', { message: 'enrollmentId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'enrollmentId é obrigatório' })
  enrollmentId: string;

  @IsUUID('4', { message: 'classGroupId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'classGroupId é obrigatório' })
  classGroupId: string;
}
```

### FILE: backend/src/modules/enrollment-class-group/enrollment-class-group.service.ts

```typescript
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEnrollmentClassGroupDto } from './dto/create-enrollment-class-group.dto';

@Injectable()
export class EnrollmentClassGroupService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateEnrollmentClassGroupDto) {
    // Valida enrollment pertence ao tenant
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { id: dto.enrollmentId, tenantId },
    });
    if (!enrollment) {
      throw new BadRequestException('Matrícula não encontrada nesta academia');
    }
    if (enrollment.status !== 'active') {
      throw new BadRequestException('Matrícula não está ativa');
    }

    // Valida classGroup pertence ao tenant
    const classGroup = await this.prisma.classGroup.findFirst({
      where: { id: dto.classGroupId, tenantId },
    });
    if (!classGroup) {
      throw new BadRequestException('Turma não encontrada nesta academia');
    }
    if (!classGroup.isActive) {
      throw new BadRequestException('Turma não está ativa');
    }

    // Verifica duplicidade
    const existing = await this.prisma.enrollmentClassGroup.findUnique({
      where: {
        enrollmentId_classGroupId: {
          enrollmentId: dto.enrollmentId,
          classGroupId: dto.classGroupId,
        },
      },
    });
    if (existing) {
      throw new ConflictException('Esta turma já está vinculada a esta matrícula');
    }

    return this.prisma.enrollmentClassGroup.create({
      data: {
        tenantId,
        enrollmentId: dto.enrollmentId,
        classGroupId: dto.classGroupId,
      },
      include: {
        classGroup: {
          select: {
            id: true,
            name: true,
            daysOfWeek: true,
            startTime: true,
            endTime: true,
            location: true,
            modality: { select: { id: true, name: true } },
            level: { select: { id: true, name: true, color: true } },
            teacher: {
              select: {
                id: true,
                person: {
                  select: { id: true, fullName: true },
                },
              },
            },
          },
        },
        enrollment: {
          select: {
            id: true,
            status: true,
            student: {
              select: {
                id: true,
                person: {
                  select: { id: true, fullName: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async findByEnrollment(tenantId: string, enrollmentId: string) {
    // Valida enrollment pertence ao tenant
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { id: enrollmentId, tenantId },
    });
    if (!enrollment) {
      throw new NotFoundException('Matrícula não encontrada nesta academia');
    }

    return this.prisma.enrollmentClassGroup.findMany({
      where: { tenantId, enrollmentId },
      include: {
        classGroup: {
          select: {
            id: true,
            name: true,
            daysOfWeek: true,
            startTime: true,
            endTime: true,
            location: true,
            maxCapacity: true,
            isActive: true,
            modality: { select: { id: true, name: true } },
            level: { select: { id: true, name: true, color: true } },
            teacher: {
              select: {
                id: true,
                person: {
                  select: { id: true, fullName: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async findByClassGroup(tenantId: string, classGroupId: string) {
    // Valida classGroup pertence ao tenant
    const classGroup = await this.prisma.classGroup.findFirst({
      where: { id: classGroupId, tenantId },
    });
    if (!classGroup) {
      throw new NotFoundException('Turma não encontrada nesta academia');
    }

    return this.prisma.enrollmentClassGroup.findMany({
      where: { tenantId, classGroupId },
      include: {
        enrollment: {
          include: {
            student: {
              include: {
                person: {
                  select: {
                    id: true,
                    fullName: true,
                    cpf: true,
                    phone: true,
                    birthDate: true,
                  },
                },
              },
            },
            plan: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const link = await this.prisma.enrollmentClassGroup.findFirst({
      where: { id, tenantId },
    });
    if (!link) {
      throw new NotFoundException('Vínculo não encontrado');
    }

    await this.prisma.enrollmentClassGroup.delete({
      where: { id },
    });

    return { message: 'Turma desvinculada da matrícula com sucesso' };
  }
}
```

O `EnrollmentClassGroupService` oferece consultas de ambos os lados: "turmas de uma matrícula" e "alunos matriculados em uma turma". Essa segunda consulta (`findByClassGroup`) é essencial para o professor ver a lista de alunos da sua turma no futuro.

### FILE: backend/src/modules/enrollment-class-group/enrollment-class-group.controller.ts

```typescript
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { EnrollmentClassGroupService } from './enrollment-class-group.service';
import { CreateEnrollmentClassGroupDto } from './dto/create-enrollment-class-group.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('enrollment-class-groups')
@Roles(Role.TENANT_ADMIN, Role.SECRETARY)
export class EnrollmentClassGroupController {
  constructor(
    private readonly ecgService: EnrollmentClassGroupService,
  ) {}

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateEnrollmentClassGroupDto,
  ) {
    return this.ecgService.create(tenantId, dto);
  }

  @Get('by-enrollment/:enrollmentId')
  findByEnrollment(
    @CurrentTenant() tenantId: string,
    @Param('enrollmentId', ParseUUIDPipe) enrollmentId: string,
  ) {
    return this.ecgService.findByEnrollment(tenantId, enrollmentId);
  }

  @Get('by-class-group/:classGroupId')
  findByClassGroup(
    @CurrentTenant() tenantId: string,
    @Param('classGroupId', ParseUUIDPipe) classGroupId: string,
  ) {
    return this.ecgService.findByClassGroup(tenantId, classGroupId);
  }

  @Delete(':id')
  remove(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ecgService.remove(tenantId, id);
  }
}
```

Mesmo padrão de rotas do `GuardianStudentLink`: rotas dedicadas `by-enrollment/:id` e `by-class-group/:id` para consultas de ambos os lados.

### FILE: backend/src/modules/enrollment-class-group/enrollment-class-group.module.ts

```typescript
import { Module } from '@nestjs/common';
import { EnrollmentClassGroupService } from './enrollment-class-group.service';
import { EnrollmentClassGroupController } from './enrollment-class-group.controller';

@Module({
  controllers: [EnrollmentClassGroupController],
  providers: [EnrollmentClassGroupService],
  exports: [EnrollmentClassGroupService],
})
export class EnrollmentClassGroupModule {}
```

---

## SEÇÃO 8 — Atualização do AppModule

### FILE: backend/src/app.module.ts (atualizado)

```typescript
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { UserModule } from './modules/user/user.module';
import { HealthModule } from './modules/health/health.module';
import { PersonModule } from './modules/person/person.module';
import { StudentModule } from './modules/student/student.module';
import { GuardianModule } from './modules/guardian/guardian.module';
import { GuardianStudentLinkModule } from './modules/guardian-student-link/guardian-student-link.module';
import { ModalityModule } from './modules/modality/modality.module';
import { LevelModule } from './modules/level/level.module';
import { ClassGroupModule } from './modules/class-group/class-group.module';
import { PlanModule } from './modules/plan/plan.module';
import { EnrollmentModule } from './modules/enrollment/enrollment.module';
import { EnrollmentClassGroupModule } from './modules/enrollment-class-group/enrollment-class-group.module';
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
    PersonModule,
    StudentModule,
    GuardianModule,
    GuardianStudentLinkModule,
    ModalityModule,
    LevelModule,
    ClassGroupModule,
    PlanModule,
    EnrollmentModule,
    EnrollmentClassGroupModule,
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

---

## SEÇÃO 9 — Checklist de Validação com Postman/curl

### Passo 0 — Obter token e preparar dados

Faça login como TENANT_ADMIN e tenha à mão IDs de: student, classGroup (ativa). Se não tiver, crie usando os módulos anteriores.

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dono@academiateste.com","password":"Admin@123"}'
```

Use o `accessToken` retornado como `TOKEN`.

---

### Teste 1 — Criar plano "Natação Mensal"

```bash
curl -X POST http://localhost:3000/api/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "name": "Natação Mensal",
    "description": "Plano mensal de natação - 3x por semana",
    "priceCents": 15000,
    "billingFrequency": "monthly",
    "enrollmentFeeCents": 5000
  }'
```

Esperado: plano criado com id. **Guarde `id` como `PLAN_NATACAO_ID`.**

---

### Teste 2 — Criar plano duplicado (deve falhar)

```bash
curl -X POST http://localhost:3000/api/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name": "Natação Mensal", "priceCents": 20000}'
```

Esperado: **409 Conflict** — "Já existe um plano com este nome nesta academia".

---

### Teste 3 — Criar plano "Combo Trimestral"

```bash
curl -X POST http://localhost:3000/api/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "name": "Combo Trimestral",
    "description": "Natação + Hidroginástica - trimestral com desconto",
    "priceCents": 35000,
    "billingFrequency": "quarterly",
    "durationMonths": 3,
    "enrollmentFeeCents": 0,
    "allowsPause": true,
    "maxPauseDays": 15
  }'
```

Esperado: plano criado com `durationMonths: 3` e `allowsPause: true`.

---

### Teste 4 — Listar planos

```bash
curl http://localhost:3000/api/plans \
  -H "Authorization: Bearer TOKEN"
```

Esperado: array com 2 planos, cada um com `_count.enrollments`.

---

### Teste 5 — Listar apenas planos ativos

```bash
curl "http://localhost:3000/api/plans?activeOnly=true" \
  -H "Authorization: Bearer TOKEN"
```

Esperado: apenas planos com `isActive: true`.

---

### Teste 6 — Criar matrícula

Precisa de um student ativo. Use o ID de um student criado anteriormente:

```bash
curl -X POST http://localhost:3000/api/enrollments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "studentId": "STUDENT_ID",
    "planId": "PLAN_NATACAO_ID",
    "startDate": "2026-04-01",
    "notes": "Primeira matrícula do aluno"
  }'
```

Esperado: enrollment criado com dados de student e plan incluídos. `endDate` é null porque o plano "Natação Mensal" não tem `durationMonths`. **Guarde `id` como `ENROLLMENT_ID`.**

---

### Teste 7 — Criar matrícula com plano que tem duração

```bash
curl -X POST http://localhost:3000/api/enrollments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "studentId": "STUDENT_ID",
    "planId": "PLAN_COMBO_ID",
    "startDate": "2026-04-01"
  }'
```

Esperado: enrollment criado com `endDate` calculado automaticamente (2026-07-01, 3 meses depois).

---

### Teste 8 — Criar matrícula com student inválido (deve falhar)

```bash
curl -X POST http://localhost:3000/api/enrollments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "studentId": "00000000-0000-0000-0000-000000000099",
    "planId": "PLAN_NATACAO_ID",
    "startDate": "2026-04-01"
  }'
```

Esperado: **400 Bad Request** — "Aluno não encontrado nesta academia".

---

### Teste 9 — Criar matrícula com plan inválido (deve falhar)

```bash
curl -X POST http://localhost:3000/api/enrollments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "studentId": "STUDENT_ID",
    "planId": "00000000-0000-0000-0000-000000000099",
    "startDate": "2026-04-01"
  }'
```

Esperado: **400 Bad Request** — "Plano não encontrado nesta academia".

---

### Teste 10 — Filtrar matrículas por student

```bash
curl "http://localhost:3000/api/enrollments?studentId=STUDENT_ID" \
  -H "Authorization: Bearer TOKEN"
```

Esperado: apenas matrículas daquele aluno.

---

### Teste 11 — Vincular turma à matrícula

```bash
curl -X POST http://localhost:3000/api/enrollment-class-groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "enrollmentId": "ENROLLMENT_ID",
    "classGroupId": "CLASS_GROUP_ID"
  }'
```

Esperado: vínculo criado com dados da turma e da matrícula incluídos. **Guarde `id` como `ECG_LINK_ID`.**

---

### Teste 12 — Vincular mesma turma novamente (deve falhar)

```bash
curl -X POST http://localhost:3000/api/enrollment-class-groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "enrollmentId": "ENROLLMENT_ID",
    "classGroupId": "CLASS_GROUP_ID"
  }'
```

Esperado: **409 Conflict** — "Esta turma já está vinculada a esta matrícula".

---

### Teste 13 — Listar turmas de uma matrícula

```bash
curl "http://localhost:3000/api/enrollment-class-groups/by-enrollment/ENROLLMENT_ID" \
  -H "Authorization: Bearer TOKEN"
```

Esperado: array com o vínculo, incluindo dados completos da turma (modalidade, nível, professor).

---

### Teste 14 — Listar alunos matriculados em uma turma

```bash
curl "http://localhost:3000/api/enrollment-class-groups/by-class-group/CLASS_GROUP_ID" \
  -H "Authorization: Bearer TOKEN"
```

Esperado: array com os vínculos, incluindo dados do aluno e do plano.

---

### Teste 15 — Buscar matrícula por ID (com turmas)

```bash
curl "http://localhost:3000/api/enrollments/ENROLLMENT_ID" \
  -H "Authorization: Bearer TOKEN"
```

Esperado: matrícula completa com student, plan, e array de classGroups.

---

### Teste 16 — Cancelar matrícula

```bash
curl -X PATCH "http://localhost:3000/api/enrollments/ENROLLMENT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "status": "cancelled",
    "cancellationReason": "Mudança de cidade"
  }'
```

Esperado: matrícula com `status: "cancelled"`, `cancellationDate` preenchida automaticamente, e `cancellationReason` salvo.

---

### Teste 17 — Tentar vincular turma a matrícula cancelada (deve falhar)

```bash
curl -X POST http://localhost:3000/api/enrollment-class-groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "enrollmentId": "ENROLLMENT_ID",
    "classGroupId": "OUTRA_CLASS_GROUP_ID"
  }'
```

Esperado: **400 Bad Request** — "Matrícula não está ativa".

---

### Teste 18 — Remover vínculo turma-matrícula

```bash
curl -X DELETE "http://localhost:3000/api/enrollment-class-groups/ECG_LINK_ID" \
  -H "Authorization: Bearer TOKEN"
```

Esperado: `{ "message": "Turma desvinculada da matrícula com sucesso" }`.

---

### Teste 19 — Desativar plano

```bash
curl -X DELETE "http://localhost:3000/api/plans/PLAN_NATACAO_ID" \
  -H "Authorization: Bearer TOKEN"
```

Esperado: `{ "id": "...", "name": "Natação Mensal", "isActive": false }`.

---

### Teste 20 — Criar matrícula com plano desativado (deve falhar)

```bash
curl -X POST http://localhost:3000/api/enrollments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "studentId": "STUDENT_ID",
    "planId": "PLAN_NATACAO_ID",
    "startDate": "2026-05-01"
  }'
```

Esperado: **400 Bad Request** — "Plano não está ativo".

---

## SEÇÃO 10 — Erros Comuns a Evitar Nesta Etapa

### 1. Esquecer as relações reversas nos modelos existentes

Adicione `plans Plan[]`, `enrollments Enrollment[]` e `enrollmentClassGroups EnrollmentClassGroup[]` no `Tenant`, `enrollments Enrollment[]` no `Student`, e `enrollmentClassGroups EnrollmentClassGroup[]` no `ClassGroup`. Sem isso o Prisma falha na geração.

### 2. Usar `Cascade` no onDelete de Plan → Enrollment

Se o plano for deletado (acidentalmente) e usar `Cascade`, **todas as matrículas** daquele plano seriam apagadas. Use `Restrict` para impedir a exclusão de planos com matrículas. Planos devem ser desativados, nunca removidos.

### 3. Armazenar preço como Decimal ou Float

Valores monetários devem ser inteiros em centavos (`priceCents: 15000` = R$ 150,00). Usar `Float` ou `Decimal` causa erros de arredondamento em operações financeiras.

### 4. Permitir troca de plano via update de enrollment

O `UpdateEnrollmentDto` deliberadamente não inclui `planId` nem `studentId`. Mudar de plano exige cancelar a matrícula atual e criar uma nova — isso preserva o histórico completo de cada matrícula.

### 5. Não validar que student e plan estão ativos

Antes de criar uma matrícula, verifique `student.status === 'active'` e `plan.isActive === true`. Sem isso, é possível matricular alunos inativos ou usar planos descontinuados.

### 6. Não validar que a turma está ativa ao vincular

Ao criar um `EnrollmentClassGroup`, valide `classGroup.isActive === true`. Turmas desativadas não devem receber novos alunos.

### 7. Não validar que a matrícula está ativa ao vincular turma

Ao vincular uma turma, valide `enrollment.status === 'active'`. Matrículas canceladas ou suspensas não devem receber novas turmas.

### 8. Hard delete de matrículas

Matrículas são registros históricos que futuramente terão cobranças e pagamentos vinculados. Nunca delete — use `status: 'cancelled'`. O endpoint de matrícula não tem `DELETE`, apenas `PATCH`.

### 9. Não calcular endDate a partir do plano

Quando o plano tem `durationMonths` e o usuário não informa `endDate`, o service deve calcular automaticamente. Esquecer isso gera matrículas sem data de término em planos que deveriam tê-la.

### 10. Não incluir classGroups no findById/findAll de enrollment

A matrícula sem suas turmas é informação incompleta. Sempre inclua o array de `classGroups` com dados da turma (nome, horário, modalidade) para que o frontend monte a tela completa.

---

*Este documento implementa o domínio completo de Planos e Matrículas do GKFitSystem. Com Plan, Enrollment e EnrollmentClassGroup funcionando, a base está pronta para o módulo financeiro (Charges e Payments) e para o módulo operacional (Attendance).*
