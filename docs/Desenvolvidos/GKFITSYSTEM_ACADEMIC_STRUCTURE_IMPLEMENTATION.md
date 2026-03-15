# GKFitSystem — Domínio de Estrutura Acadêmica: Implementação Completa

> **Versão:** 1.0  
> **Data:** Março 2026  
> **Pré-requisito:** Domínio de Pessoas e Relacionamentos implementado e testado

---

## SEÇÃO 1 — O Que Será Implementado Agora

### Escopo desta etapa

Esta etapa implementa o segundo domínio de negócio do GKFitSystem: **Estrutura Acadêmica**. Essas entidades definem o que a academia oferece e como as aulas são organizadas — são a base sobre a qual matrículas, presença e avaliações serão construídas.

### Entidades implementadas

| Entidade | Propósito |
|----------|-----------|
| **Modality** | Tipo de atividade oferecida pela academia: Natação, Hidroginástica, Musculação, etc. |
| **Level** | Estágio de progressão dentro de uma modalidade: Adaptação, Iniciante, Intermediário, Avançado |
| **ClassGroup** | Turma real: combina modalidade + nível + horário + local + professor + capacidade |

### Cadeia de dependência

```
Tenant
  └── Modality
        └── Level
  └── ClassGroup
        ├── → Modality (obrigatório)
        ├── → Level (opcional)
        └── → User/Teacher (opcional)
```

### Regras de negócio cobertas

- Cada tenant define suas próprias modalidades — nomes não se repetem dentro de um tenant.
- Cada modalidade pode ter zero ou mais níveis — nomes de nível não se repetem dentro da mesma modalidade e tenant.
- ClassGroup sempre pertence a uma modalidade, opcionalmente a um nível e opcionalmente a um professor.
- Modalidade, nível e professor referenciados em um ClassGroup devem pertencer ao mesmo tenant.
- Desativação é soft delete (`isActive = false`) — nunca hard delete.
- Toda query filtra por `tenant_id`.

### O que NÃO faz parte desta etapa

- Matrículas (enrollments) e vínculo aluno-turma.
- Presença (attendance).
- Avaliações (evaluations).
- Planos e cobranças.

---

## SEÇÃO 2 — Alterações no Prisma Schema

### Relações reversas a adicionar nos modelos existentes

**No modelo `Tenant`, adicione junto com as relações existentes:**

```prisma
  modalities  Modality[]
  levels      Level[]
  classGroups ClassGroup[]
```

**No modelo `User`, adicione junto com as relações existentes:**

```prisma
  classGroupsAsTeacher ClassGroup[]
```

### Novos modelos a adicionar ao final do schema.prisma

```prisma
// =========================
// MODALITY (Modalidade)
// =========================
model Modality {
  id          String   @id @default(uuid()) @db.Uuid
  tenantId    String   @map("tenant_id") @db.Uuid
  name        String   @db.VarChar(100)
  description String?
  isActive    Boolean  @default(true) @map("is_active")
  sortOrder   Int      @default(0) @map("sort_order")
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt   DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  tenant      Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  levels      Level[]
  classGroups ClassGroup[]

  @@unique([tenantId, name])
  @@index([tenantId])
  @@map("modalities")
}

// =========================
// LEVEL (Nível de Aprendizado)
// =========================
model Level {
  id          String   @id @default(uuid()) @db.Uuid
  tenantId    String   @map("tenant_id") @db.Uuid
  modalityId  String   @map("modality_id") @db.Uuid
  name        String   @db.VarChar(100)
  description String?
  sortOrder   Int      @default(0) @map("sort_order")
  color       String?  @db.VarChar(7)
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt   DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  tenant      Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  modality    Modality     @relation(fields: [modalityId], references: [id], onDelete: Cascade)
  classGroups ClassGroup[]

  @@unique([tenantId, modalityId, name])
  @@index([tenantId])
  @@index([tenantId, modalityId])
  @@map("levels")
}

// =========================
// CLASS GROUP (Turma)
// =========================
model ClassGroup {
  id          String   @id @default(uuid()) @db.Uuid
  tenantId    String   @map("tenant_id") @db.Uuid
  modalityId  String   @map("modality_id") @db.Uuid
  levelId     String?  @map("level_id") @db.Uuid
  teacherId   String?  @map("teacher_id") @db.Uuid
  name        String   @db.VarChar(150)
  daysOfWeek  String   @map("days_of_week") @db.VarChar(30)
  startTime   String   @map("start_time") @db.VarChar(5)
  endTime     String   @map("end_time") @db.VarChar(5)
  location    String?  @db.VarChar(100)
  maxCapacity Int      @default(20) @map("max_capacity")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt   DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  tenant   Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  modality Modality  @relation(fields: [modalityId], references: [id], onDelete: Cascade)
  level    Level?    @relation(fields: [levelId], references: [id], onDelete: SetNull)
  teacher  User?     @relation(fields: [teacherId], references: [id], onDelete: SetNull)

  @@index([tenantId])
  @@index([tenantId, modalityId])
  @@index([tenantId, isActive])
  @@index([teacherId])
  @@map("class_groups")
}
```

**Nota sobre `startTime` e `endTime`:** Usamos `String @db.VarChar(5)` ao invés de tipo `Time` nativo por simplicidade no Prisma. Os valores são armazenados como `"08:00"`, `"14:30"`, etc. Validação de formato é feita no DTO via regex.

---

## SEÇÃO 3 — Migration e Comandos Prisma

Após salvar as alterações no `schema.prisma`:

```bash
npx prisma migrate dev --name add_modality_level_classgroup

npx prisma generate
```

Verifique que as tabelas `modalities`, `levels` e `class_groups` foram criadas sem erros.

---

## SEÇÃO 4 — Estrutura de Pastas

```bash
mkdir -p src/modules/modality/dto
mkdir -p src/modules/level/dto
mkdir -p src/modules/class-group/dto
```

Estrutura final:

```
src/modules/
├── modality/
│   ├── dto/
│   │   ├── create-modality.dto.ts
│   │   └── update-modality.dto.ts
│   ├── modality.service.ts
│   ├── modality.controller.ts
│   └── modality.module.ts
├── level/
│   ├── dto/
│   │   ├── create-level.dto.ts
│   │   └── update-level.dto.ts
│   ├── level.service.ts
│   ├── level.controller.ts
│   └── level.module.ts
└── class-group/
    ├── dto/
    │   ├── create-class-group.dto.ts
    │   └── update-class-group.dto.ts
    ├── class-group.service.ts
    ├── class-group.controller.ts
    └── class-group.module.ts
```

---

## SEÇÃO 5 — Módulo Modality

### FILE: backend/src/modules/modality/dto/create-modality.dto.ts

```typescript
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateModalityDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome da modalidade é obrigatório' })
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}
```

### FILE: backend/src/modules/modality/dto/update-modality.dto.ts

```typescript
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateModalityDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
```

### FILE: backend/src/modules/modality/modality.service.ts

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateModalityDto } from './dto/create-modality.dto';
import { UpdateModalityDto } from './dto/update-modality.dto';

@Injectable()
export class ModalityService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateModalityDto) {
    const existing = await this.prisma.modality.findUnique({
      where: {
        tenantId_name: { tenantId, name: dto.name },
      },
    });
    if (existing) {
      throw new ConflictException('Já existe uma modalidade com este nome nesta academia');
    }

    return this.prisma.modality.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async findAll(tenantId: string, activeOnly?: boolean) {
    const where: any = { tenantId };
    if (activeOnly) {
      where.isActive = true;
    }

    return this.prisma.modality.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: {
            levels: true,
            classGroups: true,
          },
        },
      },
    });
  }

  async findById(tenantId: string, id: string) {
    const modality = await this.prisma.modality.findFirst({
      where: { id, tenantId },
      include: {
        levels: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            classGroups: true,
          },
        },
      },
    });
    if (!modality) {
      throw new NotFoundException('Modalidade não encontrada');
    }
    return modality;
  }

  async update(tenantId: string, id: string, dto: UpdateModalityDto) {
    await this.findById(tenantId, id);

    // Se o nome mudou, verifica duplicidade
    if (dto.name) {
      const existing = await this.prisma.modality.findFirst({
        where: {
          tenantId,
          name: dto.name,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException('Já existe outra modalidade com este nome nesta academia');
      }
    }

    return this.prisma.modality.update({
      where: { id },
      data: dto,
    });
  }

  async deactivate(tenantId: string, id: string) {
    await this.findById(tenantId, id);
    return this.prisma.modality.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, name: true, isActive: true },
    });
  }
}
```

O `findAll` inclui `_count` de levels e classGroups para que o frontend mostre quantos níveis e turmas cada modalidade tem sem queries extras.

### FILE: backend/src/modules/modality/modality.controller.ts

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
import { ModalityService } from './modality.service';
import { CreateModalityDto } from './dto/create-modality.dto';
import { UpdateModalityDto } from './dto/update-modality.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('modalities')
@Roles(Role.TENANT_ADMIN, Role.SECRETARY)
export class ModalityController {
  constructor(private readonly modalityService: ModalityService) {}

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateModalityDto,
  ) {
    return this.modalityService.create(tenantId, dto);
  }

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.modalityService.findAll(tenantId, activeOnly === 'true');
  }

  @Get(':id')
  findById(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.modalityService.findById(tenantId, id);
  }

  @Patch(':id')
  update(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateModalityDto,
  ) {
    return this.modalityService.update(tenantId, id, dto);
  }

  @Delete(':id')
  deactivate(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.modalityService.deactivate(tenantId, id);
  }
}
```

### FILE: backend/src/modules/modality/modality.module.ts

```typescript
import { Module } from '@nestjs/common';
import { ModalityService } from './modality.service';
import { ModalityController } from './modality.controller';

@Module({
  controllers: [ModalityController],
  providers: [ModalityService],
  exports: [ModalityService],
})
export class ModalityModule {}
```

---

## SEÇÃO 6 — Módulo Level

### FILE: backend/src/modules/level/dto/create-level.dto.ts

```typescript
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateLevelDto {
  @IsUUID('4', { message: 'modalityId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'modalityId é obrigatório' })
  modalityId: string;

  @IsString()
  @IsNotEmpty({ message: 'Nome do nível é obrigatório' })
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Cor deve ser um hex válido, ex: #3B82F6' })
  color?: string;
}
```

### FILE: backend/src/modules/level/dto/update-level.dto.ts

```typescript
import { IsInt, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';

export class UpdateLevelDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Cor deve ser um hex válido, ex: #3B82F6' })
  color?: string;
}
```

### FILE: backend/src/modules/level/level.service.ts

```typescript
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';

@Injectable()
export class LevelService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateLevelDto) {
    // Verifica se a modalidade existe e pertence ao tenant
    const modality = await this.prisma.modality.findFirst({
      where: { id: dto.modalityId, tenantId },
    });
    if (!modality) {
      throw new BadRequestException('Modalidade não encontrada nesta academia');
    }

    // Verifica duplicidade de nome dentro da mesma modalidade e tenant
    const existing = await this.prisma.level.findUnique({
      where: {
        tenantId_modalityId_name: {
          tenantId,
          modalityId: dto.modalityId,
          name: dto.name,
        },
      },
    });
    if (existing) {
      throw new ConflictException('Já existe um nível com este nome nesta modalidade');
    }

    return this.prisma.level.create({
      data: {
        tenantId,
        modalityId: dto.modalityId,
        name: dto.name,
        description: dto.description,
        sortOrder: dto.sortOrder ?? 0,
        color: dto.color,
      },
      include: {
        modality: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findAll(tenantId: string, modalityId?: string) {
    const where: any = { tenantId };
    if (modalityId) {
      where.modalityId = modalityId;
    }

    return this.prisma.level.findMany({
      where,
      orderBy: [{ modality: { name: 'asc' } }, { sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        modality: {
          select: { id: true, name: true },
        },
        _count: {
          select: { classGroups: true },
        },
      },
    });
  }

  async findById(tenantId: string, id: string) {
    const level = await this.prisma.level.findFirst({
      where: { id, tenantId },
      include: {
        modality: {
          select: { id: true, name: true },
        },
        _count: {
          select: { classGroups: true },
        },
      },
    });
    if (!level) {
      throw new NotFoundException('Nível não encontrado');
    }
    return level;
  }

  async update(tenantId: string, id: string, dto: UpdateLevelDto) {
    const level = await this.findById(tenantId, id);

    // Se o nome mudou, verifica duplicidade na mesma modalidade
    if (dto.name && dto.name !== level.name) {
      const existing = await this.prisma.level.findFirst({
        where: {
          tenantId,
          modalityId: level.modalityId,
          name: dto.name,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException('Já existe outro nível com este nome nesta modalidade');
      }
    }

    return this.prisma.level.update({
      where: { id },
      data: dto,
      include: {
        modality: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const level = await this.findById(tenantId, id);

    // Verifica se há turmas vinculadas a este nível
    if (level._count.classGroups > 0) {
      throw new ConflictException(
        `Não é possível remover este nível pois existem ${level._count.classGroups} turma(s) vinculada(s)`,
      );
    }

    await this.prisma.level.delete({ where: { id } });
    return { message: 'Nível removido com sucesso' };
  }
}
```

O Level permite hard delete desde que não tenha turmas vinculadas — diferente de modalidade que apenas desativa. Isso porque níveis são mais "configuráveis" e a exclusão de um nível sem turmas não quebra integridade.

### FILE: backend/src/modules/level/level.controller.ts

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
import { LevelService } from './level.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('levels')
@Roles(Role.TENANT_ADMIN, Role.SECRETARY)
export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateLevelDto,
  ) {
    return this.levelService.create(tenantId, dto);
  }

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('modalityId') modalityId?: string,
  ) {
    return this.levelService.findAll(tenantId, modalityId);
  }

  @Get(':id')
  findById(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.levelService.findById(tenantId, id);
  }

  @Patch(':id')
  update(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLevelDto,
  ) {
    return this.levelService.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.levelService.remove(tenantId, id);
  }
}
```

### FILE: backend/src/modules/level/level.module.ts

```typescript
import { Module } from '@nestjs/common';
import { LevelService } from './level.service';
import { LevelController } from './level.controller';

@Module({
  controllers: [LevelController],
  providers: [LevelService],
  exports: [LevelService],
})
export class LevelModule {}
```

---

## SEÇÃO 7 — Módulo ClassGroup

### FILE: backend/src/modules/class-group/dto/create-class-group.dto.ts

```typescript
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateClassGroupDto {
  @IsUUID('4', { message: 'modalityId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'modalityId é obrigatório' })
  modalityId: string;

  @IsUUID('4', { message: 'levelId deve ser um UUID válido' })
  @IsOptional()
  levelId?: string;

  @IsUUID('4', { message: 'teacherId deve ser um UUID válido' })
  @IsOptional()
  teacherId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Nome da turma é obrigatório' })
  @MaxLength(150)
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Dias da semana são obrigatórios' })
  @MaxLength(30)
  @Matches(/^(mon|tue|wed|thu|fri|sat|sun)(,(mon|tue|wed|thu|fri|sat|sun))*$/, {
    message: 'Dias devem ser: mon,tue,wed,thu,fri,sat,sun separados por vírgula',
  })
  daysOfWeek: string;

  @IsString()
  @IsNotEmpty({ message: 'Horário de início é obrigatório' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'Horário de início deve ser no formato HH:mm (ex: 08:00, 14:30)',
  })
  startTime: string;

  @IsString()
  @IsNotEmpty({ message: 'Horário de término é obrigatório' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'Horário de término deve ser no formato HH:mm (ex: 09:00, 15:30)',
  })
  endTime: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;

  @IsInt()
  @Min(1, { message: 'Capacidade mínima é 1' })
  @Max(200, { message: 'Capacidade máxima é 200' })
  @IsOptional()
  maxCapacity?: number;
}
```

Validações por regex garantem que `daysOfWeek` aceita apenas dias válidos separados por vírgula e que horários estejam no formato `HH:mm`.

### FILE: backend/src/modules/class-group/dto/update-class-group.dto.ts

```typescript
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateClassGroupDto {
  @IsUUID('4', { message: 'levelId deve ser um UUID válido' })
  @IsOptional()
  levelId?: string | null;

  @IsUUID('4', { message: 'teacherId deve ser um UUID válido' })
  @IsOptional()
  teacherId?: string | null;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  @Matches(/^(mon|tue|wed|thu|fri|sat|sun)(,(mon|tue|wed|thu|fri|sat|sun))*$/, {
    message: 'Dias devem ser: mon,tue,wed,thu,fri,sat,sun separados por vírgula',
  })
  daysOfWeek?: string;

  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'Horário deve ser no formato HH:mm',
  })
  startTime?: string;

  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'Horário deve ser no formato HH:mm',
  })
  endTime?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;

  @IsInt()
  @Min(1)
  @Max(200)
  @IsOptional()
  maxCapacity?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
```

O `UpdateClassGroupDto` aceita `null` para `levelId` e `teacherId` — permite desassociar nível ou professor de uma turma.

### FILE: backend/src/modules/class-group/class-group.service.ts

```typescript
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClassGroupDto } from './dto/create-class-group.dto';
import { UpdateClassGroupDto } from './dto/update-class-group.dto';

@Injectable()
export class ClassGroupService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateClassGroupDto) {
    // Valida modalidade pertence ao tenant
    const modality = await this.prisma.modality.findFirst({
      where: { id: dto.modalityId, tenantId },
    });
    if (!modality) {
      throw new BadRequestException('Modalidade não encontrada nesta academia');
    }

    // Valida nível pertence ao tenant e à modalidade (se fornecido)
    if (dto.levelId) {
      const level = await this.prisma.level.findFirst({
        where: { id: dto.levelId, tenantId, modalityId: dto.modalityId },
      });
      if (!level) {
        throw new BadRequestException(
          'Nível não encontrado nesta academia ou não pertence à modalidade selecionada',
        );
      }
    }

    // Valida professor pertence ao tenant (se fornecido)
    if (dto.teacherId) {
      const teacher = await this.prisma.user.findFirst({
        where: { id: dto.teacherId, tenantId, role: 'TEACHER', isActive: true },
      });
      if (!teacher) {
        throw new BadRequestException(
          'Professor não encontrado, inativo, ou não pertence a esta academia',
        );
      }
    }

    // Valida que horário de início é antes do término
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException('Horário de início deve ser anterior ao horário de término');
    }

    return this.prisma.classGroup.create({
      data: {
        tenantId,
        modalityId: dto.modalityId,
        levelId: dto.levelId || null,
        teacherId: dto.teacherId || null,
        name: dto.name,
        daysOfWeek: dto.daysOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        location: dto.location,
        maxCapacity: dto.maxCapacity ?? 20,
      },
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
    });
  }

  async findAll(
    tenantId: string,
    filters?: {
      modalityId?: string;
      levelId?: string;
      teacherId?: string;
      isActive?: boolean;
    },
  ) {
    const where: any = { tenantId };

    if (filters?.modalityId) where.modalityId = filters.modalityId;
    if (filters?.levelId) where.levelId = filters.levelId;
    if (filters?.teacherId) where.teacherId = filters.teacherId;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    return this.prisma.classGroup.findMany({
      where,
      orderBy: [{ name: 'asc' }],
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
    });
  }

  async findById(tenantId: string, id: string) {
    const classGroup = await this.prisma.classGroup.findFirst({
      where: { id, tenantId },
      include: {
        modality: { select: { id: true, name: true } },
        level: { select: { id: true, name: true, color: true } },
        teacher: {
          select: {
            id: true,
            email: true,
            person: {
              select: { id: true, fullName: true, phone: true },
            },
          },
        },
      },
    });
    if (!classGroup) {
      throw new NotFoundException('Turma não encontrada');
    }
    return classGroup;
  }

  async update(tenantId: string, id: string, dto: UpdateClassGroupDto) {
    const classGroup = await this.findById(tenantId, id);

    // Valida nível se fornecido (e não null)
    if (dto.levelId) {
      const level = await this.prisma.level.findFirst({
        where: { id: dto.levelId, tenantId, modalityId: classGroup.modalityId },
      });
      if (!level) {
        throw new BadRequestException(
          'Nível não encontrado nesta academia ou não pertence à modalidade da turma',
        );
      }
    }

    // Valida professor se fornecido (e não null)
    if (dto.teacherId) {
      const teacher = await this.prisma.user.findFirst({
        where: { id: dto.teacherId, tenantId, role: 'TEACHER', isActive: true },
      });
      if (!teacher) {
        throw new BadRequestException(
          'Professor não encontrado, inativo, ou não pertence a esta academia',
        );
      }
    }

    // Valida horários se ambos fornecidos
    const startTime = dto.startTime || classGroup.startTime;
    const endTime = dto.endTime || classGroup.endTime;
    if (startTime >= endTime) {
      throw new BadRequestException('Horário de início deve ser anterior ao horário de término');
    }

    // Monta o data object, tratando null explícito para levelId e teacherId
    const data: any = { ...dto };

    // Se levelId é explicitamente null, desvincula o nível
    if (dto.levelId === null) {
      data.levelId = null;
    }
    // Se teacherId é explicitamente null, desvincula o professor
    if (dto.teacherId === null) {
      data.teacherId = null;
    }

    return this.prisma.classGroup.update({
      where: { id },
      data,
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
    });
  }

  async deactivate(tenantId: string, id: string) {
    await this.findById(tenantId, id);
    return this.prisma.classGroup.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, name: true, isActive: true },
    });
  }
}
```

O `ClassGroupService` é o mais complexo desta etapa. Na criação ele faz **quatro validações**: modalidade pertence ao tenant, nível pertence ao tenant E à modalidade, professor pertence ao tenant e está ativo, e horário de início é anterior ao término. No update ele reutiliza as mesmas validações e suporta desassociação via `null`.

### FILE: backend/src/modules/class-group/class-group.controller.ts

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
import { ClassGroupService } from './class-group.service';
import { CreateClassGroupDto } from './dto/create-class-group.dto';
import { UpdateClassGroupDto } from './dto/update-class-group.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('class-groups')
@Roles(Role.TENANT_ADMIN, Role.SECRETARY)
export class ClassGroupController {
  constructor(private readonly classGroupService: ClassGroupService) {}

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateClassGroupDto,
  ) {
    return this.classGroupService.create(tenantId, dto);
  }

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('modalityId') modalityId?: string,
    @Query('levelId') levelId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.classGroupService.findAll(tenantId, {
      modalityId,
      levelId,
      teacherId,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Get(':id')
  findById(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.classGroupService.findById(tenantId, id);
  }

  @Patch(':id')
  update(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClassGroupDto,
  ) {
    return this.classGroupService.update(tenantId, id, dto);
  }

  @Delete(':id')
  deactivate(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.classGroupService.deactivate(tenantId, id);
  }
}
```

Query params permitem filtrar turmas por modalidade, nível, professor e status ativo — o frontend pode montar filtros combinados.

### FILE: backend/src/modules/class-group/class-group.module.ts

```typescript
import { Module } from '@nestjs/common';
import { ClassGroupService } from './class-group.service';
import { ClassGroupController } from './class-group.controller';

@Module({
  controllers: [ClassGroupController],
  providers: [ClassGroupService],
  exports: [ClassGroupService],
})
export class ClassGroupModule {}
```

---

## SEÇÃO 8 — Atualização do AppModule

Edite `backend/src/app.module.ts` para importar os novos módulos:

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

### Passo 0 — Obter token de TENANT_ADMIN

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dono@academiateste.com","password":"Admin@123"}'
```

Use o `accessToken` retornado como `TOKEN` nos passos seguintes.

---

### Teste 1 — Criar modalidade "Natação"

```bash
curl -X POST http://localhost:3000/api/modalities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "name": "Natação",
    "description": "Aulas de natação para todas as idades",
    "sortOrder": 1
  }'
```

Esperado: modalidade criada. **Guarde o `id` como `MODALITY_NATACAO_ID`.**

---

### Teste 2 — Criar modalidade duplicada (deve falhar)

```bash
curl -X POST http://localhost:3000/api/modalities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name": "Natação"}'
```

Esperado: **409 Conflict** — "Já existe uma modalidade com este nome nesta academia".

---

### Teste 3 — Criar segunda modalidade "Hidroginástica"

```bash
curl -X POST http://localhost:3000/api/modalities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "name": "Hidroginástica",
    "description": "Exercícios aquáticos de baixo impacto",
    "sortOrder": 2
  }'
```

Esperado: segunda modalidade criada.

---

### Teste 4 — Listar modalidades

```bash
curl http://localhost:3000/api/modalities \
  -H "Authorization: Bearer TOKEN"
```

Esperado: array com 2 modalidades, cada uma com `_count` de levels e classGroups.

---

### Teste 5 — Criar nível "Adaptação" na Natação

```bash
curl -X POST http://localhost:3000/api/levels \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "modalityId": "MODALITY_NATACAO_ID",
    "name": "Adaptação",
    "description": "Fase de adaptação ao meio aquático",
    "sortOrder": 1,
    "color": "#60A5FA"
  }'
```

Esperado: nível criado. **Guarde o `id` como `LEVEL_ADAPTACAO_ID`.**

---

### Teste 6 — Criar nível "Iniciante" na Natação

```bash
curl -X POST http://localhost:3000/api/levels \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "modalityId": "MODALITY_NATACAO_ID",
    "name": "Iniciante",
    "sortOrder": 2,
    "color": "#34D399"
  }'
```

Esperado: segundo nível criado.

---

### Teste 7 — Criar nível duplicado (deve falhar)

```bash
curl -X POST http://localhost:3000/api/levels \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "modalityId": "MODALITY_NATACAO_ID",
    "name": "Adaptação"
  }'
```

Esperado: **409 Conflict** — "Já existe um nível com este nome nesta modalidade".

---

### Teste 8 — Listar níveis filtrados por modalidade

```bash
curl "http://localhost:3000/api/levels?modalityId=MODALITY_NATACAO_ID" \
  -H "Authorization: Bearer TOKEN"
```

Esperado: array com 2 níveis (Adaptação e Iniciante), cada um com `_count` de classGroups.

---

### Teste 9 — Buscar modalidade por ID (com níveis incluídos)

```bash
curl http://localhost:3000/api/modalities/MODALITY_NATACAO_ID \
  -H "Authorization: Bearer TOKEN"
```

Esperado: modalidade com array `levels` contendo Adaptação e Iniciante.

---

### Teste 10 — Criar turma de Natação

Use o ID do professor do seed (login como TENANT_ADMIN, liste users para pegar o ID do TEACHER):

```bash
curl -X POST http://localhost:3000/api/class-groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "modalityId": "MODALITY_NATACAO_ID",
    "levelId": "LEVEL_ADAPTACAO_ID",
    "teacherId": "TEACHER_USER_ID",
    "name": "Natação Infantil - Seg/Qua 14h",
    "daysOfWeek": "mon,wed",
    "startTime": "14:00",
    "endTime": "15:00",
    "location": "Piscina 1",
    "maxCapacity": 15
  }'
```

Esperado: turma criada com modality, level e teacher incluídos.

---

### Teste 11 — Criar turma sem professor (válido)

```bash
curl -X POST http://localhost:3000/api/class-groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "modalityId": "MODALITY_NATACAO_ID",
    "name": "Natação Adulto - Ter/Qui 19h",
    "daysOfWeek": "tue,thu",
    "startTime": "19:00",
    "endTime": "20:00",
    "location": "Piscina 2"
  }'
```

Esperado: turma criada com `level: null` e `teacher: null`.

---

### Teste 12 — Criar turma com horário inválido (deve falhar)

```bash
curl -X POST http://localhost:3000/api/class-groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "modalityId": "MODALITY_NATACAO_ID",
    "name": "Turma Inválida",
    "daysOfWeek": "mon",
    "startTime": "20:00",
    "endTime": "18:00"
  }'
```

Esperado: **400 Bad Request** — "Horário de início deve ser anterior ao horário de término".

---

### Teste 13 — Criar turma com dias inválidos (deve falhar)

```bash
curl -X POST http://localhost:3000/api/class-groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "modalityId": "MODALITY_NATACAO_ID",
    "name": "Turma Inválida",
    "daysOfWeek": "segunda,quarta",
    "startTime": "08:00",
    "endTime": "09:00"
  }'
```

Esperado: **400 Bad Request** — validação de regex falha.

---

### Teste 14 — Filtrar turmas por modalidade

```bash
curl "http://localhost:3000/api/class-groups?modalityId=MODALITY_NATACAO_ID" \
  -H "Authorization: Bearer TOKEN"
```

Esperado: apenas turmas de Natação.

---

### Teste 15 — Filtrar turmas ativas

```bash
curl "http://localhost:3000/api/class-groups?isActive=true" \
  -H "Authorization: Bearer TOKEN"
```

Esperado: apenas turmas com `isActive: true`.

---

### Teste 16 — Desativar modalidade

```bash
curl -X DELETE http://localhost:3000/api/modalities/MODALITY_NATACAO_ID \
  -H "Authorization: Bearer TOKEN"
```

Esperado: `{ "id": "...", "name": "Natação", "isActive": false }`.

---

### Teste 17 — Remover nível sem turmas vinculadas

Crie um nível temporário e remova:

```bash
# Criar
curl -X POST http://localhost:3000/api/levels \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"modalityId": "MODALITY_NATACAO_ID", "name": "Temporário"}'

# Remover (use o id retornado)
curl -X DELETE http://localhost:3000/api/levels/LEVEL_TEMPORARIO_ID \
  -H "Authorization: Bearer TOKEN"
```

Esperado: `{ "message": "Nível removido com sucesso" }`.

---

### Teste 18 — Tentar remover nível com turmas vinculadas (deve falhar)

```bash
curl -X DELETE http://localhost:3000/api/levels/LEVEL_ADAPTACAO_ID \
  -H "Authorization: Bearer TOKEN"
```

Esperado: **409 Conflict** — "Não é possível remover este nível pois existem X turma(s) vinculada(s)".

---

### Teste 19 — Criar turma com modalityId de outro tenant (deve falhar)

Use um UUID inventado ou de outro tenant:

```bash
curl -X POST http://localhost:3000/api/class-groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "modalityId": "00000000-0000-0000-0000-000000000099",
    "name": "Turma Fantasma",
    "daysOfWeek": "mon",
    "startTime": "08:00",
    "endTime": "09:00"
  }'
```

Esperado: **400 Bad Request** — "Modalidade não encontrada nesta academia".

---

## SEÇÃO 10 — Erros Comuns a Evitar Nesta Etapa

### 1. Esquecer as relações reversas no Tenant e User

Se adicionar `Modality`, `Level` e `ClassGroup` sem adicionar as relações reversas (`modalities Modality[]`, etc.) no modelo `Tenant` e `classGroupsAsTeacher ClassGroup[]` no modelo `User`, o Prisma falha na geração com erro de relação incompleta.

### 2. Validar nível sem verificar que pertence à mesma modalidade

Ao criar um ClassGroup com `levelId`, é preciso validar que o nível pertence **tanto ao tenant quanto à modalidade do ClassGroup**. Sem isso, um nível de "Musculação" poderia ser atribuído a uma turma de "Natação".

### 3. Não validar que o teacher tem role TEACHER

Ao vincular um professor a uma turma, a validação deve checar `role: 'TEACHER'` e `isActive: true`. Sem isso, qualquer user do tenant (secretária, financeiro) poderia ser atribuído como professor.

### 4. Usar tipo Time do PostgreSQL para horários

O tipo `Time` nativo do PostgreSQL causa complexidade desnecessária no Prisma (serialização/deserialização). String no formato `HH:mm` com validação por regex é mais simples, previsível e suficiente para este caso de uso.

### 5. Não tratar null vs undefined no update de levelId/teacherId

No `UpdateClassGroupDto`, `levelId: null` significa "remover o nível", enquanto `levelId: undefined` (campo não enviado) significa "não alterar". O service precisa distinguir os dois casos.

### 6. Fazer hard delete de modalidade

Modalidades podem ter turmas e futuramente matrículas vinculadas. Hard delete quebraria referências. Sempre use soft delete (`isActive: false`). Níveis sem turmas são a exceção — podem ser removidos.

### 7. Permitir daysOfWeek em formato livre

Sem a validação regex, o frontend poderia enviar `"segunda,quarta"` ou `"Monday,Wednesday"`. O padrão `mon,tue,wed,thu,fri,sat,sun` é simples, consistente e fácil de parsear no frontend.

### 8. Não incluir _count nos findAll

Sem `_count`, o frontend precisaria de N+1 queries para mostrar quantas turmas cada modalidade tem. O Prisma `_count` resolve isso em uma única query.

### 9. Esquecer de rodar `npx prisma generate` após a migration

O Prisma Client é gerado a partir do schema. Se você rodar a migration mas esquecer o `generate`, o TypeScript não reconhece os novos modelos e tudo falha na compilação.

### 10. Não testar referências cruzadas entre tenants

É o teste mais importante de segurança: usar um `modalityId` válido de outro tenant na criação de uma turma. A validação `findFirst({ where: { id, tenantId } })` deve rejeitar. Sem esse teste, você não sabe se o isolamento funciona.

---

*Este documento implementa o domínio completo de Estrutura Acadêmica do GKFitSystem. Com Modality, Level e ClassGroup funcionando, a base está pronta para os próximos domínios: Planos, Matrículas e o vínculo aluno-turma que conecta Pessoas a Turmas.*
