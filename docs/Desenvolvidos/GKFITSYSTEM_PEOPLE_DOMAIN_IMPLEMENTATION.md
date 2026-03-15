# GKFitSystem — Domínio de Pessoas e Relacionamentos: Implementação Completa

> **Versão:** 1.0  
> **Data:** Março 2026  
> **Pré-requisito:** Backend foundation da Semana 3 rodando e testado

---

## SEÇÃO 1 — O Que Será Implementado Agora

### Escopo desta etapa

Esta etapa implementa o primeiro domínio real de negócio do GKFitSystem: **Pessoas e Relacionamentos**. Esse domínio é a base sobre a qual todos os módulos futuros (matrículas, turmas, cobranças, presença) serão construídos.

### Entidades implementadas

| Entidade | Propósito |
|----------|-----------|
| **Person** | Registro de uma pessoa física. Já existe no schema, agora ganha CRUD completo com busca |
| **Student** | Papel de aluno vinculado a uma Person. Um aluno é sempre uma Person primeiro |
| **Guardian** | Papel de responsável vinculado a uma Person. Cuida de um ou mais alunos |
| **GuardianStudentLink** | Vínculo muitos-para-muitos entre Guardian e Student. Armazena tipo de parentesco e responsabilidade financeira |

### Regras de negócio cobertas

- Uma Person pode ser Student e Guardian ao mesmo tempo (adulto que treina e tem filhos na academia).
- Um Guardian pode ter múltiplos Students (mãe com 3 filhos).
- Um Student pode ter múltiplos Guardians (mãe e pai vinculados).
- Pelo menos um Guardian no vínculo pode ser marcado como responsável financeiro.
- Não pode existir Student duplicado para a mesma Person no mesmo tenant.
- Não pode existir Guardian duplicado para a mesma Person no mesmo tenant.
- Não pode existir vínculo duplicado entre o mesmo Guardian e Student.
- Toda query filtra por `tenant_id` — isolamento total.

### O que NÃO faz parte desta etapa

- Portal do responsável (GUARDIAN role login).
- Portal do aluno (STUDENT role login).
- Matrículas, turmas, cobranças ou presença.
- Permissões de TEACHER para visualização.

---

## SEÇÃO 2 — Alterações no Prisma Schema

Adicione os modelos abaixo ao final do arquivo `backend/prisma/schema.prisma`, **após** o modelo `Person` existente. Também adicione as relações reversas nos modelos `Tenant` e `Person` existentes.

### Alterações no modelo Tenant existente

Adicione estas linhas dentro do bloco do modelo `Tenant`, junto com as relações `users` e `persons` já existentes:

```prisma
  students             Student[]
  guardians            Guardian[]
  guardianStudentLinks GuardianStudentLink[]
```

### Alterações no modelo Person existente

Adicione estas linhas dentro do bloco do modelo `Person`, junto com as relações `tenant` e `users` já existentes:

```prisma
  students  Student[]
  guardians Guardian[]
```

### Novos modelos a adicionar

```prisma
// =========================
// STUDENT (Aluno)
// =========================
model Student {
  id                 String   @id @default(uuid()) @db.Uuid
  tenantId           String   @map("tenant_id") @db.Uuid
  personId           String   @map("person_id") @db.Uuid
  registrationNumber String?  @map("registration_number") @db.VarChar(50)
  status             String   @default("active") @db.VarChar(20)
  enrollmentDate     DateTime @default(now()) @map("enrollment_date") @db.Date
  notes              String?
  createdAt          DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt          DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  tenant             Tenant                @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  person             Person                @relation(fields: [personId], references: [id], onDelete: Cascade)
  guardianLinks      GuardianStudentLink[]

  @@unique([tenantId, personId])
  @@index([tenantId])
  @@index([tenantId, status])
  @@index([personId])
  @@map("students")
}

// =========================
// GUARDIAN (Responsável)
// =========================
model Guardian {
  id        String   @id @default(uuid()) @db.Uuid
  tenantId  String   @map("tenant_id") @db.Uuid
  personId  String   @map("person_id") @db.Uuid
  notes     String?
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  tenant        Tenant                @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  person        Person                @relation(fields: [personId], references: [id], onDelete: Cascade)
  studentLinks  GuardianStudentLink[]

  @@unique([tenantId, personId])
  @@index([tenantId])
  @@index([personId])
  @@map("guardians")
}

// =========================
// GUARDIAN_STUDENT_LINK (Vínculo Responsável ↔ Aluno)
// =========================
model GuardianStudentLink {
  id                     String   @id @default(uuid()) @db.Uuid
  tenantId               String   @map("tenant_id") @db.Uuid
  guardianId             String   @map("guardian_id") @db.Uuid
  studentId              String   @map("student_id") @db.Uuid
  relationship           String   @default("other") @db.VarChar(30)
  isFinancialResponsible Boolean  @default(false) @map("is_financial_responsible")
  isPrimaryContact       Boolean  @default(false) @map("is_primary_contact")
  createdAt              DateTime @default(now()) @map("created_at") @db.Timestamptz()

  tenant   Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  guardian Guardian @relation(fields: [guardianId], references: [id], onDelete: Cascade)
  student  Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@unique([tenantId, guardianId, studentId])
  @@index([tenantId])
  @@index([guardianId])
  @@index([studentId])
  @@map("guardian_student_links")
}
```

---

## SEÇÃO 3 — Migration e Comandos Prisma

Após salvar as alterações no `schema.prisma`, execute na ordem:

```bash
# Gerar e aplicar a migration
npx prisma migrate dev --name add_student_guardian_links

# Regenerar o Prisma Client com os novos tipos
npx prisma generate
```

Verifique no output que as tabelas `students`, `guardians` e `guardian_student_links` foram criadas sem erros.

---

## SEÇÃO 4 — Estrutura de Pastas

Crie as pastas:

```bash
mkdir -p src/modules/person/dto
mkdir -p src/modules/student/dto
mkdir -p src/modules/guardian/dto
mkdir -p src/modules/guardian-student-link/dto
```

Estrutura final:

```
src/modules/
├── person/
│   ├── dto/
│   │   ├── create-person.dto.ts
│   │   └── update-person.dto.ts
│   ├── person.service.ts
│   ├── person.controller.ts
│   └── person.module.ts
├── student/
│   ├── dto/
│   │   ├── create-student.dto.ts
│   │   └── update-student.dto.ts
│   ├── student.service.ts
│   ├── student.controller.ts
│   └── student.module.ts
├── guardian/
│   ├── dto/
│   │   ├── create-guardian.dto.ts
│   │   └── update-guardian.dto.ts
│   ├── guardian.service.ts
│   ├── guardian.controller.ts
│   └── guardian.module.ts
└── guardian-student-link/
    ├── dto/
    │   ├── create-guardian-student-link.dto.ts
    │   └── update-guardian-student-link.dto.ts
    ├── guardian-student-link.service.ts
    ├── guardian-student-link.controller.ts
    └── guardian-student-link.module.ts
```

---

## SEÇÃO 5 — Módulo Person

### FILE: backend/src/modules/person/dto/create-person.dto.ts

```typescript
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePersonDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome completo é obrigatório' })
  @MaxLength(255)
  fullName: string;

  @IsDateString({}, { message: 'Data de nascimento deve ser uma data válida' })
  @IsOptional()
  birthDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(14)
  cpf?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  rg?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1)
  gender?: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phoneSecondary?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  addressStreet?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  addressNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  addressComplement?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  addressNeighborhood?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  addressCity?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2)
  addressState?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  addressZip?: string;

  @IsString()
  @IsOptional()
  medicalNotes?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  photoUrl?: string;
}
```

### FILE: backend/src/modules/person/dto/update-person.dto.ts

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreatePersonDto } from './create-person.dto';

export class UpdatePersonDto extends PartialType(CreatePersonDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
```

### FILE: backend/src/modules/person/person.service.ts

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

@Injectable()
export class PersonService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreatePersonDto) {
    // Se CPF foi fornecido, verifica duplicidade no tenant
    if (dto.cpf) {
      const existing = await this.prisma.person.findFirst({
        where: { tenantId, cpf: dto.cpf },
      });
      if (existing) {
        throw new ConflictException('Já existe uma pessoa com este CPF nesta academia');
      }
    }

    return this.prisma.person.create({
      data: {
        tenantId,
        ...dto,
      },
    });
  }

  async findAll(tenantId: string, search?: string) {
    const where: any = { tenantId };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.person.findMany({
      where,
      orderBy: { fullName: 'asc' },
      include: {
        students: {
          select: { id: true, status: true },
        },
        guardians: {
          select: { id: true },
        },
      },
    });
  }

  async findById(tenantId: string, id: string) {
    const person = await this.prisma.person.findFirst({
      where: { id, tenantId },
      include: {
        students: {
          select: {
            id: true,
            status: true,
            registrationNumber: true,
            enrollmentDate: true,
          },
        },
        guardians: {
          select: { id: true },
        },
        users: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });
    if (!person) {
      throw new NotFoundException('Pessoa não encontrada');
    }
    return person;
  }

  async update(tenantId: string, id: string, dto: UpdatePersonDto) {
    await this.findById(tenantId, id);

    // Se CPF mudou, verifica duplicidade
    if (dto.cpf) {
      const existing = await this.prisma.person.findFirst({
        where: {
          tenantId,
          cpf: dto.cpf,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException('Já existe outra pessoa com este CPF nesta academia');
      }
    }

    return this.prisma.person.update({
      where: { id },
      data: dto,
    });
  }

  async deactivate(tenantId: string, id: string) {
    await this.findById(tenantId, id);
    return this.prisma.person.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, fullName: true, isActive: true },
    });
  }
}
```

O `PersonService` contém todo o CRUD com filtragem por `tenantId`, validação de CPF duplicado, e busca por nome/CPF/email.

### FILE: backend/src/modules/person/person.controller.ts

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
import { PersonService } from './person.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('persons')
@Roles(Role.TENANT_ADMIN, Role.SECRETARY, Role.FINANCIAL)
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreatePersonDto,
  ) {
    return this.personService.create(tenantId, dto);
  }

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('search') search?: string,
  ) {
    return this.personService.findAll(tenantId, search);
  }

  @Get(':id')
  findById(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.personService.findById(tenantId, id);
  }

  @Patch(':id')
  update(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePersonDto,
  ) {
    return this.personService.update(tenantId, id, dto);
  }

  @Delete(':id')
  deactivate(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.personService.deactivate(tenantId, id);
  }
}
```

O `@Roles()` no nível do controller aplica a restrição a **todos** os endpoints. Apenas TENANT_ADMIN, SECRETARY e FINANCIAL podem acessar.

### FILE: backend/src/modules/person/person.module.ts

```typescript
import { Module } from '@nestjs/common';
import { PersonService } from './person.service';
import { PersonController } from './person.controller';

@Module({
  controllers: [PersonController],
  providers: [PersonService],
  exports: [PersonService],
})
export class PersonModule {}
```

---

## SEÇÃO 6 — Módulo Student

### FILE: backend/src/modules/student/dto/create-student.dto.ts

```typescript
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateStudentDto {
  @IsUUID('4', { message: 'personId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'personId é obrigatório' })
  personId: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  registrationNumber?: string;

  @IsDateString({}, { message: 'Data de matrícula deve ser uma data válida' })
  @IsOptional()
  enrollmentDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
```

### FILE: backend/src/modules/student/dto/update-student.dto.ts

```typescript
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateStudentDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  registrationNumber?: string;

  @IsString()
  @IsOptional()
  @IsIn(['active', 'inactive', 'suspended', 'transferred'], {
    message: 'Status deve ser: active, inactive, suspended ou transferred',
  })
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
```

### FILE: backend/src/modules/student/student.service.ts

```typescript
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateStudentDto) {
    // Verifica se a person existe e pertence ao tenant
    const person = await this.prisma.person.findFirst({
      where: { id: dto.personId, tenantId },
    });
    if (!person) {
      throw new BadRequestException('Pessoa não encontrada nesta academia');
    }

    // Verifica duplicidade: mesma person já é student neste tenant
    const existing = await this.prisma.student.findUnique({
      where: {
        tenantId_personId: {
          tenantId,
          personId: dto.personId,
        },
      },
    });
    if (existing) {
      throw new ConflictException('Esta pessoa já está cadastrada como aluno nesta academia');
    }

    return this.prisma.student.create({
      data: {
        tenantId,
        personId: dto.personId,
        registrationNumber: dto.registrationNumber,
        enrollmentDate: dto.enrollmentDate ? new Date(dto.enrollmentDate) : new Date(),
        notes: dto.notes,
      },
      include: {
        person: {
          select: {
            id: true,
            fullName: true,
            cpf: true,
            birthDate: true,
            phone: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(tenantId: string, status?: string) {
    const where: any = { tenantId };
    if (status) {
      where.status = status;
    }

    return this.prisma.student.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        person: {
          select: {
            id: true,
            fullName: true,
            cpf: true,
            birthDate: true,
            phone: true,
            email: true,
            photoUrl: true,
          },
        },
        guardianLinks: {
          select: {
            id: true,
            relationship: true,
            isFinancialResponsible: true,
            guardian: {
              select: {
                id: true,
                person: {
                  select: {
                    id: true,
                    fullName: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findById(tenantId: string, id: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, tenantId },
      include: {
        person: true,
        guardianLinks: {
          include: {
            guardian: {
              include: {
                person: {
                  select: {
                    id: true,
                    fullName: true,
                    cpf: true,
                    phone: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!student) {
      throw new NotFoundException('Aluno não encontrado');
    }
    return student;
  }

  async update(tenantId: string, id: string, dto: UpdateStudentDto) {
    await this.findById(tenantId, id);
    return this.prisma.student.update({
      where: { id },
      data: dto,
      include: {
        person: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  async deactivate(tenantId: string, id: string) {
    await this.findById(tenantId, id);
    return this.prisma.student.update({
      where: { id },
      data: { status: 'inactive' },
      select: {
        id: true,
        status: true,
        person: {
          select: { fullName: true },
        },
      },
    });
  }
}
```

O `StudentService` valida que a Person referenciada existe e pertence ao mesmo tenant antes de criar o aluno. Usa a constraint `@@unique([tenantId, personId])` via `findUnique` com o campo composto.

### FILE: backend/src/modules/student/student.controller.ts

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
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('students')
@Roles(Role.TENANT_ADMIN, Role.SECRETARY)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateStudentDto,
  ) {
    return this.studentService.create(tenantId, dto);
  }

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('status') status?: string,
  ) {
    return this.studentService.findAll(tenantId, status);
  }

  @Get(':id')
  findById(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.studentService.findById(tenantId, id);
  }

  @Patch(':id')
  update(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentService.update(tenantId, id, dto);
  }

  @Delete(':id')
  deactivate(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.studentService.deactivate(tenantId, id);
  }
}
```

### FILE: backend/src/modules/student/student.module.ts

```typescript
import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';

@Module({
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
```

---

## SEÇÃO 7 — Módulo Guardian

### FILE: backend/src/modules/guardian/dto/create-guardian.dto.ts

```typescript
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateGuardianDto {
  @IsUUID('4', { message: 'personId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'personId é obrigatório' })
  personId: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
```

### FILE: backend/src/modules/guardian/dto/update-guardian.dto.ts

```typescript
import { IsOptional, IsString } from 'class-validator';

export class UpdateGuardianDto {
  @IsString()
  @IsOptional()
  notes?: string;
}
```

### FILE: backend/src/modules/guardian/guardian.service.ts

```typescript
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { UpdateGuardianDto } from './dto/update-guardian.dto';

@Injectable()
export class GuardianService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateGuardianDto) {
    // Verifica se a person existe e pertence ao tenant
    const person = await this.prisma.person.findFirst({
      where: { id: dto.personId, tenantId },
    });
    if (!person) {
      throw new BadRequestException('Pessoa não encontrada nesta academia');
    }

    // Verifica duplicidade
    const existing = await this.prisma.guardian.findUnique({
      where: {
        tenantId_personId: {
          tenantId,
          personId: dto.personId,
        },
      },
    });
    if (existing) {
      throw new ConflictException('Esta pessoa já está cadastrada como responsável nesta academia');
    }

    return this.prisma.guardian.create({
      data: {
        tenantId,
        personId: dto.personId,
        notes: dto.notes,
      },
      include: {
        person: {
          select: {
            id: true,
            fullName: true,
            cpf: true,
            phone: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.guardian.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        person: {
          select: {
            id: true,
            fullName: true,
            cpf: true,
            phone: true,
            email: true,
            photoUrl: true,
          },
        },
        studentLinks: {
          select: {
            id: true,
            relationship: true,
            isFinancialResponsible: true,
            student: {
              select: {
                id: true,
                status: true,
                person: {
                  select: {
                    id: true,
                    fullName: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findById(tenantId: string, id: string) {
    const guardian = await this.prisma.guardian.findFirst({
      where: { id, tenantId },
      include: {
        person: true,
        studentLinks: {
          include: {
            student: {
              include: {
                person: {
                  select: {
                    id: true,
                    fullName: true,
                    cpf: true,
                    birthDate: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!guardian) {
      throw new NotFoundException('Responsável não encontrado');
    }
    return guardian;
  }

  async update(tenantId: string, id: string, dto: UpdateGuardianDto) {
    await this.findById(tenantId, id);
    return this.prisma.guardian.update({
      where: { id },
      data: dto,
      include: {
        person: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  async deactivate(tenantId: string, id: string) {
    const guardian = await this.findById(tenantId, id);

    // Desativa a person associada ao guardian
    await this.prisma.person.update({
      where: { id: guardian.personId },
      data: { isActive: false },
    });

    return {
      id: guardian.id,
      message: 'Responsável desativado com sucesso',
    };
  }
}
```

### FILE: backend/src/modules/guardian/guardian.controller.ts

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { GuardianService } from './guardian.service';
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { UpdateGuardianDto } from './dto/update-guardian.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('guardians')
@Roles(Role.TENANT_ADMIN, Role.SECRETARY, Role.FINANCIAL)
export class GuardianController {
  constructor(private readonly guardianService: GuardianService) {}

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateGuardianDto,
  ) {
    return this.guardianService.create(tenantId, dto);
  }

  @Get()
  findAll(@CurrentTenant() tenantId: string) {
    return this.guardianService.findAll(tenantId);
  }

  @Get(':id')
  findById(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.guardianService.findById(tenantId, id);
  }

  @Patch(':id')
  update(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGuardianDto,
  ) {
    return this.guardianService.update(tenantId, id, dto);
  }

  @Delete(':id')
  deactivate(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.guardianService.deactivate(tenantId, id);
  }
}
```

### FILE: backend/src/modules/guardian/guardian.module.ts

```typescript
import { Module } from '@nestjs/common';
import { GuardianService } from './guardian.service';
import { GuardianController } from './guardian.controller';

@Module({
  controllers: [GuardianController],
  providers: [GuardianService],
  exports: [GuardianService],
})
export class GuardianModule {}
```

---

## SEÇÃO 8 — Módulo GuardianStudentLink

### FILE: backend/src/modules/guardian-student-link/dto/create-guardian-student-link.dto.ts

```typescript
import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateGuardianStudentLinkDto {
  @IsUUID('4', { message: 'guardianId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'guardianId é obrigatório' })
  guardianId: string;

  @IsUUID('4', { message: 'studentId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'studentId é obrigatório' })
  studentId: string;

  @IsString()
  @IsOptional()
  @IsIn(['mother', 'father', 'grandparent', 'uncle_aunt', 'sibling', 'other'], {
    message: 'Parentesco deve ser: mother, father, grandparent, uncle_aunt, sibling ou other',
  })
  relationship?: string;

  @IsBoolean()
  @IsOptional()
  isFinancialResponsible?: boolean;

  @IsBoolean()
  @IsOptional()
  isPrimaryContact?: boolean;
}
```

### FILE: backend/src/modules/guardian-student-link/dto/update-guardian-student-link.dto.ts

```typescript
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateGuardianStudentLinkDto {
  @IsString()
  @IsOptional()
  @IsIn(['mother', 'father', 'grandparent', 'uncle_aunt', 'sibling', 'other'], {
    message: 'Parentesco deve ser: mother, father, grandparent, uncle_aunt, sibling ou other',
  })
  relationship?: string;

  @IsBoolean()
  @IsOptional()
  isFinancialResponsible?: boolean;

  @IsBoolean()
  @IsOptional()
  isPrimaryContact?: boolean;
}
```

### FILE: backend/src/modules/guardian-student-link/guardian-student-link.service.ts

```typescript
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGuardianStudentLinkDto } from './dto/create-guardian-student-link.dto';
import { UpdateGuardianStudentLinkDto } from './dto/update-guardian-student-link.dto';

@Injectable()
export class GuardianStudentLinkService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateGuardianStudentLinkDto) {
    // Verifica se o guardian existe e pertence ao tenant
    const guardian = await this.prisma.guardian.findFirst({
      where: { id: dto.guardianId, tenantId },
    });
    if (!guardian) {
      throw new BadRequestException('Responsável não encontrado nesta academia');
    }

    // Verifica se o student existe e pertence ao tenant
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, tenantId },
    });
    if (!student) {
      throw new BadRequestException('Aluno não encontrado nesta academia');
    }

    // Verifica duplicidade do vínculo
    const existing = await this.prisma.guardianStudentLink.findUnique({
      where: {
        tenantId_guardianId_studentId: {
          tenantId,
          guardianId: dto.guardianId,
          studentId: dto.studentId,
        },
      },
    });
    if (existing) {
      throw new ConflictException('Este vínculo entre responsável e aluno já existe');
    }

    return this.prisma.guardianStudentLink.create({
      data: {
        tenantId,
        guardianId: dto.guardianId,
        studentId: dto.studentId,
        relationship: dto.relationship || 'other',
        isFinancialResponsible: dto.isFinancialResponsible || false,
        isPrimaryContact: dto.isPrimaryContact || false,
      },
      include: {
        guardian: {
          include: {
            person: {
              select: { id: true, fullName: true, phone: true },
            },
          },
        },
        student: {
          include: {
            person: {
              select: { id: true, fullName: true },
            },
          },
        },
      },
    });
  }

  async findByStudent(tenantId: string, studentId: string) {
    // Verifica se o student pertence ao tenant
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
    });
    if (!student) {
      throw new NotFoundException('Aluno não encontrado nesta academia');
    }

    return this.prisma.guardianStudentLink.findMany({
      where: { tenantId, studentId },
      include: {
        guardian: {
          include: {
            person: {
              select: {
                id: true,
                fullName: true,
                cpf: true,
                phone: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async findByGuardian(tenantId: string, guardianId: string) {
    // Verifica se o guardian pertence ao tenant
    const guardian = await this.prisma.guardian.findFirst({
      where: { id: guardianId, tenantId },
    });
    if (!guardian) {
      throw new NotFoundException('Responsável não encontrado nesta academia');
    }

    return this.prisma.guardianStudentLink.findMany({
      where: { tenantId, guardianId },
      include: {
        student: {
          include: {
            person: {
              select: {
                id: true,
                fullName: true,
                cpf: true,
                birthDate: true,
                phone: true,
              },
            },
          },
        },
      },
    });
  }

  async findById(tenantId: string, id: string) {
    const link = await this.prisma.guardianStudentLink.findFirst({
      where: { id, tenantId },
      include: {
        guardian: {
          include: {
            person: {
              select: { id: true, fullName: true, phone: true },
            },
          },
        },
        student: {
          include: {
            person: {
              select: { id: true, fullName: true },
            },
          },
        },
      },
    });
    if (!link) {
      throw new NotFoundException('Vínculo não encontrado');
    }
    return link;
  }

  async update(tenantId: string, id: string, dto: UpdateGuardianStudentLinkDto) {
    await this.findById(tenantId, id);

    return this.prisma.guardianStudentLink.update({
      where: { id },
      data: dto,
      include: {
        guardian: {
          include: {
            person: {
              select: { id: true, fullName: true },
            },
          },
        },
        student: {
          include: {
            person: {
              select: { id: true, fullName: true },
            },
          },
        },
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findById(tenantId, id);

    await this.prisma.guardianStudentLink.delete({
      where: { id },
    });

    return { message: 'Vínculo removido com sucesso' };
  }
}
```

O `GuardianStudentLinkService` é o mais complexo desta etapa: valida que guardian e student pertencem ao mesmo tenant antes de criar o vínculo, e oferece consultas de ambos os lados (alunos de um responsável / responsáveis de um aluno).

### FILE: backend/src/modules/guardian-student-link/guardian-student-link.controller.ts

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { GuardianStudentLinkService } from './guardian-student-link.service';
import { CreateGuardianStudentLinkDto } from './dto/create-guardian-student-link.dto';
import { UpdateGuardianStudentLinkDto } from './dto/update-guardian-student-link.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('guardian-student-links')
@Roles(Role.TENANT_ADMIN, Role.SECRETARY, Role.FINANCIAL)
export class GuardianStudentLinkController {
  constructor(private readonly linkService: GuardianStudentLinkService) {}

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateGuardianStudentLinkDto,
  ) {
    return this.linkService.create(tenantId, dto);
  }

  @Get('by-student/:studentId')
  findByStudent(
    @CurrentTenant() tenantId: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
  ) {
    return this.linkService.findByStudent(tenantId, studentId);
  }

  @Get('by-guardian/:guardianId')
  findByGuardian(
    @CurrentTenant() tenantId: string,
    @Param('guardianId', ParseUUIDPipe) guardianId: string,
  ) {
    return this.linkService.findByGuardian(tenantId, guardianId);
  }

  @Get(':id')
  findById(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.linkService.findById(tenantId, id);
  }

  @Patch(':id')
  update(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGuardianStudentLinkDto,
  ) {
    return this.linkService.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.linkService.remove(tenantId, id);
  }
}
```

Rotas especiais `by-student/:studentId` e `by-guardian/:guardianId` permitem consultar os vínculos de ambos os lados sem precisar de query params complexos.

### FILE: backend/src/modules/guardian-student-link/guardian-student-link.module.ts

```typescript
import { Module } from '@nestjs/common';
import { GuardianStudentLinkService } from './guardian-student-link.service';
import { GuardianStudentLinkController } from './guardian-student-link.controller';

@Module({
  controllers: [GuardianStudentLinkController],
  providers: [GuardianStudentLinkService],
  exports: [GuardianStudentLinkService],
})
export class GuardianStudentLinkModule {}
```

---

## SEÇÃO 9 — Atualização do AppModule

Edite o arquivo `backend/src/app.module.ts` para importar os novos módulos.

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

## SEÇÃO 10 — Checklist de Validação com Postman/curl

### Passo 0 — Obter token de TENANT_ADMIN

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dono@academiateste.com","password":"Admin@123"}'
```

Guarde o `accessToken` retornado. Use-o como `TOKEN` nos passos seguintes.

---

### Passo 1 — Criar uma Person (mãe)

```bash
curl -X POST http://localhost:3000/api/persons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "fullName": "Maria Silva Santos",
    "cpf": "123.456.789-00",
    "email": "maria@email.com",
    "phone": "(34) 99999-5555",
    "birthDate": "1985-03-15",
    "gender": "F",
    "addressCity": "Uberlândia",
    "addressState": "MG"
  }'
```

Resultado esperado: person criada com id. **Guarde o `id` como `PERSON_MAE_ID`.**

---

### Passo 2 — Criar uma Person (criança)

```bash
curl -X POST http://localhost:3000/api/persons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "fullName": "João Silva Santos",
    "birthDate": "2018-07-20",
    "gender": "M",
    "medicalNotes": "Alergia a cloro em concentração alta"
  }'
```

Resultado esperado: person criada sem CPF (é criança). **Guarde o `id` como `PERSON_FILHO_ID`.**

---

### Passo 3 — Buscar persons com filtro

```bash
curl "http://localhost:3000/api/persons?search=Silva" \
  -H "Authorization: Bearer TOKEN"
```

Resultado esperado: ambas as persons retornadas (Maria e João).

---

### Passo 4 — Criar Guardian (mãe como responsável)

```bash
curl -X POST http://localhost:3000/api/guardians \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "personId": "PERSON_MAE_ID",
    "notes": "Mãe do João, contato principal"
  }'
```

Resultado esperado: guardian criado. **Guarde o `id` como `GUARDIAN_MAE_ID`.**

---

### Passo 5 — Tentar criar Guardian duplicado (deve falhar)

```bash
curl -X POST http://localhost:3000/api/guardians \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"personId": "PERSON_MAE_ID"}'
```

Resultado esperado: **409 Conflict** — "Esta pessoa já está cadastrada como responsável nesta academia".

---

### Passo 6 — Criar Student (criança como aluno)

```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "personId": "PERSON_FILHO_ID",
    "registrationNumber": "ALU-2026-001"
  }'
```

Resultado esperado: student criado. **Guarde o `id` como `STUDENT_FILHO_ID`.**

---

### Passo 7 — Tentar criar Student duplicado (deve falhar)

```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"personId": "PERSON_FILHO_ID"}'
```

Resultado esperado: **409 Conflict**.

---

### Passo 8 — Vincular Guardian ao Student

```bash
curl -X POST http://localhost:3000/api/guardian-student-links \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "guardianId": "GUARDIAN_MAE_ID",
    "studentId": "STUDENT_FILHO_ID",
    "relationship": "mother",
    "isFinancialResponsible": true,
    "isPrimaryContact": true
  }'
```

Resultado esperado: link criado com dados do guardian e student incluídos.

---

### Passo 9 — Tentar vínculo duplicado (deve falhar)

```bash
curl -X POST http://localhost:3000/api/guardian-student-links \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "guardianId": "GUARDIAN_MAE_ID",
    "studentId": "STUDENT_FILHO_ID",
    "relationship": "mother"
  }'
```

Resultado esperado: **409 Conflict** — "Este vínculo entre responsável e aluno já existe".

---

### Passo 10 — Listar responsáveis de um aluno

```bash
curl "http://localhost:3000/api/guardian-student-links/by-student/STUDENT_FILHO_ID" \
  -H "Authorization: Bearer TOKEN"
```

Resultado esperado: array com o vínculo da mãe, incluindo dados da person.

---

### Passo 11 — Listar alunos de um responsável

```bash
curl "http://localhost:3000/api/guardian-student-links/by-guardian/GUARDIAN_MAE_ID" \
  -H "Authorization: Bearer TOKEN"
```

Resultado esperado: array com o vínculo do filho, incluindo dados da person.

---

### Passo 12 — Buscar student com guardians incluídos

```bash
curl "http://localhost:3000/api/students/STUDENT_FILHO_ID" \
  -H "Authorization: Bearer TOKEN"
```

Resultado esperado: student com `guardianLinks` populados, mostrando a mãe como financial responsible.

---

### Passo 13 — Teste de isolamento de tenant

Faça login como PLATFORM_ADMIN (que não tem tenant):

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gkfitsystem.com","password":"Admin@123"}'
```

Tente acessar persons:

```bash
curl http://localhost:3000/api/persons \
  -H "Authorization: Bearer TOKEN_PLATFORM_ADMIN"
```

Resultado esperado: **403 Forbidden** — "Usuário não possui tenant associado" (porque PLATFORM_ADMIN não tem tenantId e o `@CurrentTenant()` rejeita).

---

### Passo 14 — Atualizar vínculo (mudar responsável financeiro)

```bash
curl -X PATCH "http://localhost:3000/api/guardian-student-links/LINK_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"isFinancialResponsible": false}'
```

Resultado esperado: link atualizado com `isFinancialResponsible: false`.

---

### Passo 15 — Remover vínculo

```bash
curl -X DELETE "http://localhost:3000/api/guardian-student-links/LINK_ID" \
  -H "Authorization: Bearer TOKEN"
```

Resultado esperado: `{ "message": "Vínculo removido com sucesso" }`.

---

## SEÇÃO 11 — Erros Comuns a Evitar Nesta Etapa

### 1. Esquecer de adicionar relações reversas no Tenant e Person

Se você adicionar `Student`, `Guardian` e `GuardianStudentLink` mas não colocar as relações reversas nos modelos `Tenant` e `Person`, o Prisma vai falhar na geração do client com erro de relação incompleta.

### 2. Não usar o campo composto no findUnique

O Prisma gera campos compostos automaticamente para `@@unique`. O nome segue o padrão `campo1_campo2`. Use:
```typescript
where: { tenantId_personId: { tenantId, personId } }
```
E não:
```typescript
where: { tenantId, personId }  // ERRADO — Prisma não aceita isso em findUnique
```

### 3. Não validar que guardian e student pertencem ao mesmo tenant

Ao criar um GuardianStudentLink, é preciso validar que **ambos** (guardian e student) pertencem ao tenant do user autenticado. Sem essa validação, um atacante poderia enviar IDs de entidades de outro tenant.

### 4. Aceitar personId no body sem validar existência

Criar Student ou Guardian com um `personId` que não existe ou pertence a outro tenant. Sempre faça `findFirst` com `{ id, tenantId }` antes de usar.

### 5. Não rodar `npx prisma generate` após a migration

Após criar a migration, o Prisma Client precisa ser regenerado. Sem isso, o TypeScript não reconhece os novos modelos e os imports falham.

### 6. Usar findUnique com tenant_id em vez de findFirst

O `findUnique` do Prisma só aceita campos marcados como `@unique` ou `@id`. Para buscar por `{ id, tenantId }` onde o tenantId não faz parte da chave única, use `findFirst`:
```typescript
// CORRETO
this.prisma.student.findFirst({ where: { id, tenantId } })

// ERRADO — tenantId não é parte da PK
this.prisma.student.findUnique({ where: { id, tenantId } })
```

### 7. Esquecer o `@Roles()` no controller

Se você criar um controller sem `@Roles()` e sem `@Public()`, ele fica acessível por qualquer user autenticado (incluindo GUARDIAN e STUDENT no futuro). Sempre defina os roles explicitamente.

### 8. Retornar passwordHash em includes de Person → User

Ao usar `include: { users: true }` na Person, o Prisma retorna **todos** os campos do User, incluindo `passwordHash`. Sempre use `select` para escolher campos específicos:
```typescript
users: {
  select: { id: true, email: true, role: true, isActive: true }
}
```

### 9. Fazer hard delete ao invés de soft delete

Students e Guardians devem ser **desativados** (`status: 'inactive'`), não removidos do banco. Hard delete quebra referências futuras em matrículas, cobranças e presença. A exceção é `GuardianStudentLink`, que pode ser removido com `DELETE` pois é apenas um vínculo.

### 10. Não testar o fluxo completo Person → Student → Guardian → Link

O fluxo tem dependências: Person deve existir antes de Student/Guardian, e ambos devem existir antes do Link. Teste na ordem correta ou vai parecer que algo não funciona quando na verdade é só falta de dados.

---

*Este documento implementa o domínio completo de Pessoas e Relacionamentos do GKFitSystem. Com Person, Student, Guardian e GuardianStudentLink funcionando, a base está pronta para os próximos domínios: Modalidades, Turmas, Planos e Matrículas.*
