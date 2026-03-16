# GKFitSystem — Domínio Financeiro: Implementação Completa

> **Versão:** 1.0  
> **Data:** Março 2026  
> **Pré-requisito:** Domínios de Pessoas, Estrutura Acadêmica e Planos/Matrículas implementados e testados

---

## SEÇÃO 1 — O Que Será Implementado Agora

### Escopo desta etapa

Esta etapa implementa o quarto domínio de negócio do GKFitSystem: **Financeiro**. Esse domínio é a base operacional de receita da academia — sem ele, não há controle de inadimplência, não há relatórios de faturamento e não há visibilidade sobre a saúde financeira do negócio.

### Entidades implementadas

| Entidade | Propósito |
|----------|-----------|
| **Charge** | Cobrança: um valor devido por uma matrícula, com vencimento, status e referência ao pagador |
| **Payment** | Pagamento: registro de dinheiro recebido contra uma cobrança, suportando pagamentos parciais |

### Cadeia de dependência

```
Tenant
  └── Enrollment
        └── Charge
              ├── → Person (pagador, opcional)
              └── Payment (1 ou mais)
```

### Regras de negócio cobertas

- Uma cobrança nasce de uma matrícula e herda o contexto financeiro (quem paga, quanto deve).
- O pagador (`payerPersonId`) é a pessoa responsável financeiramente — pode ser o próprio aluno adulto ou o responsável de uma criança.
- Valores monetários são armazenados em centavos (inteiro) para eliminar erros de arredondamento.
- Uma cobrança pode receber múltiplos pagamentos parciais.
- O status da cobrança é atualizado automaticamente a cada pagamento: `pending` → `partially_paid` → `paid`.
- Pagamento em cobrança cancelada é rejeitado.
- Pagamento que excede o saldo restante é rejeitado.
- Cobranças nunca são deletadas — são canceladas com `status: 'cancelled'`.
- Pagamentos nunca são deletados — são registros contábeis permanentes.
- Toda query filtra por `tenant_id`.

### O que NÃO faz parte desta etapa

- Geração automática de cobranças a partir do plano (futuro).
- Integração com gateway de pagamento (Stripe, futuro).
- Relatórios e dashboards financeiros (próxima etapa).
- Notas fiscais ou recibos em PDF.
- Régua de cobrança automática (notificações de vencimento).

---

## SEÇÃO 2 — Alterações no Prisma Schema

### Relações reversas a adicionar nos modelos existentes

**No modelo `Tenant`, adicione:**

```prisma
  charges  Charge[]
  payments Payment[]
```

**No modelo `Enrollment`, adicione:**

```prisma
  charges Charge[]
```

**No modelo `Person`, adicione:**

```prisma
  chargesAsPayer Charge[]
```

### Novos modelos a adicionar ao final do schema.prisma

```prisma
// =========================
// CHARGE (Cobrança)
// =========================
model Charge {
  id              String   @id @default(uuid()) @db.Uuid
  tenantId        String   @map("tenant_id") @db.Uuid
  enrollmentId    String   @map("enrollment_id") @db.Uuid
  payerPersonId   String?  @map("payer_person_id") @db.Uuid
  description     String   @db.VarChar(255)
  amountCents     Int      @map("amount_cents")
  dueDate         DateTime @map("due_date") @db.Date
  status          String   @default("pending") @db.VarChar(20)
  paidAmountCents Int      @default(0) @map("paid_amount_cents")
  referenceMonth  String?  @map("reference_month") @db.VarChar(7)
  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt       DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  tenant     Tenant     @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  enrollment Enrollment @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  payerPerson Person?   @relation(fields: [payerPersonId], references: [id], onDelete: SetNull)
  payments   Payment[]

  @@index([tenantId])
  @@index([tenantId, status])
  @@index([tenantId, dueDate])
  @@index([tenantId, enrollmentId])
  @@index([tenantId, payerPersonId])
  @@index([tenantId, status, dueDate])
  @@map("charges")
}

// =========================
// PAYMENT (Pagamento)
// =========================
model Payment {
  id               String   @id @default(uuid()) @db.Uuid
  tenantId         String   @map("tenant_id") @db.Uuid
  chargeId         String   @map("charge_id") @db.Uuid
  amountCents      Int      @map("amount_cents")
  paymentDate      DateTime @map("payment_date") @db.Date
  paymentMethod    String   @map("payment_method") @db.VarChar(30)
  receivedByUserId String?  @map("received_by_user_id") @db.Uuid
  notes            String?
  createdAt        DateTime @default(now()) @map("created_at") @db.Timestamptz()

  tenant     Tenant  @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  charge     Charge  @relation(fields: [chargeId], references: [id], onDelete: Cascade)
  receivedBy User?   @relation(fields: [receivedByUserId], references: [id], onDelete: SetNull)

  @@index([tenantId])
  @@index([chargeId])
  @@index([tenantId, paymentDate])
  @@index([tenantId, paymentMethod])
  @@map("payments")
}
```

**No modelo `User`, adicione a relação reversa:**

```prisma
  paymentsReceived Payment[]
```

### Notas sobre o design

- `paidAmountCents` na Charge é um campo **desnormalizado** que acumula o total pago. Evita somar pagamentos toda vez que exibimos uma cobrança — o custo de mantê-lo atualizado é mínimo e o ganho de performance é significativo.
- O índice composto `[tenantId, status, dueDate]` é otimizado para a query mais frequente do financeiro: "cobranças pendentes/vencidas ordenadas por data".
- `Payment` não tem `updatedAt` — pagamentos são imutáveis. Uma vez registrado, não se altera. Se houver erro, registra-se um estorno como novo registro (futuro).

---

## SEÇÃO 3 — Migration e Comandos Prisma

```bash
npx prisma migrate dev --name add_charge_payment

npx prisma generate
```

Verifique que as tabelas `charges` e `payments` foram criadas.

---

## SEÇÃO 4 — Estrutura de Pastas

```bash
mkdir -p src/modules/charge/dto
mkdir -p src/modules/payment/dto
```

```
src/modules/
├── charge/
│   ├── dto/
│   │   ├── create-charge.dto.ts
│   │   └── update-charge.dto.ts
│   ├── charge.service.ts
│   ├── charge.controller.ts
│   └── charge.module.ts
└── payment/
    ├── dto/
    │   └── create-payment.dto.ts
    ├── payment.service.ts
    ├── payment.controller.ts
    └── payment.module.ts
```

---

## SEÇÃO 5 — Módulo Charge

### FILE: backend/src/modules/charge/dto/create-charge.dto.ts

```typescript
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateChargeDto {
  @IsUUID('4', { message: 'enrollmentId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'enrollmentId é obrigatório' })
  enrollmentId: string;

  @IsUUID('4', { message: 'payerPersonId deve ser um UUID válido' })
  @IsOptional()
  payerPersonId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @MaxLength(255)
  description: string;

  @IsInt({ message: 'Valor deve ser um inteiro (centavos)' })
  @Min(1, { message: 'Valor deve ser pelo menos 1 centavo' })
  amountCents: number;

  @IsDateString({}, { message: 'Data de vencimento deve ser uma data válida' })
  @IsNotEmpty({ message: 'Data de vencimento é obrigatória' })
  dueDate: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'Mês de referência deve ser no formato AAAA-MM (ex: 2026-04)',
  })
  referenceMonth?: string;
}
```

A validação de `referenceMonth` aceita apenas o formato `AAAA-MM` via regex, garantindo consistência para filtros e relatórios futuros.

### FILE: backend/src/modules/charge/dto/update-charge.dto.ts

```typescript
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateChargeDto {
  @IsUUID('4', { message: 'payerPersonId deve ser um UUID válido' })
  @IsOptional()
  payerPersonId?: string | null;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @IsInt({ message: 'Valor deve ser um inteiro (centavos)' })
  @Min(1)
  @IsOptional()
  amountCents?: number;

  @IsDateString({}, { message: 'Data de vencimento deve ser uma data válida' })
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  @IsIn(['pending', 'overdue', 'cancelled'], {
    message: 'Status permitido para edição manual: pending, overdue ou cancelled',
  })
  status?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'Mês de referência deve ser no formato AAAA-MM',
  })
  referenceMonth?: string;
}
```

O `UpdateChargeDto` restringe o `status` a valores que o usuário pode definir manualmente. Os status `paid` e `partially_paid` são gerenciados automaticamente pelo sistema via pagamentos.

### FILE: backend/src/modules/charge/charge.service.ts

```typescript
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChargeDto } from './dto/create-charge.dto';
import { UpdateChargeDto } from './dto/update-charge.dto';

@Injectable()
export class ChargeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateChargeDto) {
    // Valida enrollment pertence ao tenant
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { id: dto.enrollmentId, tenantId },
      include: {
        student: {
          include: {
            person: { select: { id: true, fullName: true } },
          },
        },
      },
    });
    if (!enrollment) {
      throw new BadRequestException('Matrícula não encontrada nesta academia');
    }
    if (enrollment.status === 'cancelled') {
      throw new BadRequestException('Não é possível gerar cobrança para matrícula cancelada');
    }

    // Valida payer person pertence ao tenant se fornecido
    if (dto.payerPersonId) {
      const payer = await this.prisma.person.findFirst({
        where: { id: dto.payerPersonId, tenantId },
      });
      if (!payer) {
        throw new BadRequestException('Pessoa pagadora não encontrada nesta academia');
      }
    }

    return this.prisma.charge.create({
      data: {
        tenantId,
        enrollmentId: dto.enrollmentId,
        payerPersonId: dto.payerPersonId || null,
        description: dto.description,
        amountCents: dto.amountCents,
        dueDate: new Date(dto.dueDate),
        referenceMonth: dto.referenceMonth,
      },
      include: {
        enrollment: {
          select: {
            id: true,
            student: {
              select: {
                id: true,
                person: {
                  select: { id: true, fullName: true },
                },
              },
            },
            plan: {
              select: { id: true, name: true },
            },
          },
        },
        payerPerson: {
          select: { id: true, fullName: true, cpf: true, phone: true },
        },
      },
    });
  }

  async findAll(
    tenantId: string,
    filters?: {
      enrollmentId?: string;
      status?: string;
      payerPersonId?: string;
      dueDateFrom?: string;
      dueDateTo?: string;
      referenceMonth?: string;
    },
  ) {
    const where: any = { tenantId };

    if (filters?.enrollmentId) where.enrollmentId = filters.enrollmentId;
    if (filters?.status) where.status = filters.status;
    if (filters?.payerPersonId) where.payerPersonId = filters.payerPersonId;
    if (filters?.referenceMonth) where.referenceMonth = filters.referenceMonth;

    if (filters?.dueDateFrom || filters?.dueDateTo) {
      where.dueDate = {};
      if (filters.dueDateFrom) where.dueDate.gte = new Date(filters.dueDateFrom);
      if (filters.dueDateTo) where.dueDate.lte = new Date(filters.dueDateTo);
    }

    return this.prisma.charge.findMany({
      where,
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      include: {
        enrollment: {
          select: {
            id: true,
            student: {
              select: {
                id: true,
                person: {
                  select: { id: true, fullName: true, cpf: true },
                },
              },
            },
            plan: {
              select: { id: true, name: true },
            },
          },
        },
        payerPerson: {
          select: { id: true, fullName: true, cpf: true, phone: true },
        },
        _count: {
          select: { payments: true },
        },
      },
    });
  }

  async findById(tenantId: string, id: string) {
    const charge = await this.prisma.charge.findFirst({
      where: { id, tenantId },
      include: {
        enrollment: {
          select: {
            id: true,
            status: true,
            student: {
              select: {
                id: true,
                person: true,
              },
            },
            plan: true,
          },
        },
        payerPerson: {
          select: { id: true, fullName: true, cpf: true, phone: true, email: true },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
          include: {
            receivedBy: {
              select: {
                id: true,
                person: {
                  select: { fullName: true },
                },
              },
            },
          },
        },
      },
    });
    if (!charge) {
      throw new NotFoundException('Cobrança não encontrada');
    }
    return charge;
  }

  async update(tenantId: string, id: string, dto: UpdateChargeDto) {
    const charge = await this.findById(tenantId, id);

    // Não permite edição de cobranças já pagas
    if (charge.status === 'paid') {
      throw new BadRequestException('Não é possível editar uma cobrança já paga');
    }

    // Não permite alterar valor se já há pagamentos parciais
    if (dto.amountCents && charge.paidAmountCents > 0) {
      if (dto.amountCents < charge.paidAmountCents) {
        throw new BadRequestException(
          `Novo valor (${dto.amountCents}) não pode ser menor que o valor já pago (${charge.paidAmountCents})`,
        );
      }
    }

    // Valida payer person se fornecido
    if (dto.payerPersonId) {
      const payer = await this.prisma.person.findFirst({
        where: { id: dto.payerPersonId, tenantId },
      });
      if (!payer) {
        throw new BadRequestException('Pessoa pagadora não encontrada nesta academia');
      }
    }

    const data: any = { ...dto };
    if (dto.dueDate) data.dueDate = new Date(dto.dueDate);
    if (dto.payerPersonId === null) data.payerPersonId = null;

    // Se alterou o valor, recalcula o status
    if (dto.amountCents && charge.paidAmountCents > 0) {
      if (charge.paidAmountCents >= dto.amountCents) {
        data.status = 'paid';
      } else {
        data.status = 'partially_paid';
      }
    }

    return this.prisma.charge.update({
      where: { id },
      data,
      include: {
        enrollment: {
          select: {
            id: true,
            student: {
              select: {
                id: true,
                person: { select: { id: true, fullName: true } },
              },
            },
          },
        },
        payerPerson: {
          select: { id: true, fullName: true },
        },
      },
    });
  }

  async cancel(tenantId: string, id: string) {
    const charge = await this.findById(tenantId, id);

    if (charge.status === 'paid') {
      throw new BadRequestException('Não é possível cancelar uma cobrança já paga integralmente');
    }

    if (charge.status === 'cancelled') {
      throw new BadRequestException('Cobrança já está cancelada');
    }

    // Se tem pagamentos parciais, avisa mas permite cancelar
    const warningMessage =
      charge.paidAmountCents > 0
        ? `Cobrança cancelada. Atenção: existem R$ ${(charge.paidAmountCents / 100).toFixed(2)} em pagamentos registrados.`
        : 'Cobrança cancelada com sucesso';

    await this.prisma.charge.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    return {
      id: charge.id,
      status: 'cancelled',
      message: warningMessage,
    };
  }

  async getSummaryByTenant(tenantId: string) {
    const [pending, overdue, paid, cancelled] = await Promise.all([
      this.prisma.charge.aggregate({
        where: { tenantId, status: 'pending' },
        _sum: { amountCents: true },
        _count: true,
      }),
      this.prisma.charge.aggregate({
        where: { tenantId, status: 'overdue' },
        _sum: { amountCents: true },
        _count: true,
      }),
      this.prisma.charge.aggregate({
        where: { tenantId, status: 'paid' },
        _sum: { amountCents: true },
        _count: true,
      }),
      this.prisma.charge.aggregate({
        where: { tenantId, status: 'cancelled' },
        _sum: { amountCents: true },
        _count: true,
      }),
    ]);

    const partiallyPaid = await this.prisma.charge.aggregate({
      where: { tenantId, status: 'partially_paid' },
      _sum: { amountCents: true, paidAmountCents: true },
      _count: true,
    });

    return {
      pending: {
        count: pending._count,
        totalCents: pending._sum.amountCents || 0,
      },
      overdue: {
        count: overdue._count,
        totalCents: overdue._sum.amountCents || 0,
      },
      partiallyPaid: {
        count: partiallyPaid._count,
        totalCents: partiallyPaid._sum.amountCents || 0,
        paidCents: partiallyPaid._sum.paidAmountCents || 0,
      },
      paid: {
        count: paid._count,
        totalCents: paid._sum.amountCents || 0,
      },
      cancelled: {
        count: cancelled._count,
        totalCents: cancelled._sum.amountCents || 0,
      },
    };
  }
}
```

O `ChargeService` inclui um método `getSummaryByTenant` que agrega dados financeiros por status — é a base para o dashboard futuro. O `cancel` avisa quando há pagamentos parciais na cobrança cancelada, para que a secretaria tome providências (estorno manual, crédito, etc.).

### FILE: backend/src/modules/charge/charge.controller.ts

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
import { ChargeService } from './charge.service';
import { CreateChargeDto } from './dto/create-charge.dto';
import { UpdateChargeDto } from './dto/update-charge.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('charges')
@Roles(Role.TENANT_ADMIN, Role.SECRETARY, Role.FINANCIAL)
export class ChargeController {
  constructor(private readonly chargeService: ChargeService) {}

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateChargeDto,
  ) {
    return this.chargeService.create(tenantId, dto);
  }

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('enrollmentId') enrollmentId?: string,
    @Query('status') status?: string,
    @Query('payerPersonId') payerPersonId?: string,
    @Query('dueDateFrom') dueDateFrom?: string,
    @Query('dueDateTo') dueDateTo?: string,
    @Query('referenceMonth') referenceMonth?: string,
  ) {
    return this.chargeService.findAll(tenantId, {
      enrollmentId,
      status,
      payerPersonId,
      dueDateFrom,
      dueDateTo,
      referenceMonth,
    });
  }

  @Get('summary')
  getSummary(@CurrentTenant() tenantId: string) {
    return this.chargeService.getSummaryByTenant(tenantId);
  }

  @Get(':id')
  findById(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.chargeService.findById(tenantId, id);
  }

  @Patch(':id')
  update(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateChargeDto,
  ) {
    return this.chargeService.update(tenantId, id, dto);
  }

  @Patch(':id/cancel')
  cancel(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.chargeService.cancel(tenantId, id);
  }
}
```

A rota `PATCH :id/cancel` é separada do update genérico para deixar a intenção clara. A rota `GET summary` retorna o resumo financeiro agregado.

### FILE: backend/src/modules/charge/charge.module.ts

```typescript
import { Module } from '@nestjs/common';
import { ChargeService } from './charge.service';
import { ChargeController } from './charge.controller';

@Module({
  controllers: [ChargeController],
  providers: [ChargeService],
  exports: [ChargeService],
})
export class ChargeModule {}
```

---

## SEÇÃO 6 — Módulo Payment

### FILE: backend/src/modules/payment/dto/create-payment.dto.ts

```typescript
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreatePaymentDto {
  @IsUUID('4', { message: 'chargeId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'chargeId é obrigatório' })
  chargeId: string;

  @IsInt({ message: 'Valor deve ser um inteiro (centavos)' })
  @Min(1, { message: 'Valor do pagamento deve ser pelo menos 1 centavo' })
  amountCents: number;

  @IsDateString({}, { message: 'Data do pagamento deve ser uma data válida' })
  @IsNotEmpty({ message: 'Data do pagamento é obrigatória' })
  paymentDate: string;

  @IsString()
  @IsNotEmpty({ message: 'Método de pagamento é obrigatório' })
  @IsIn(['pix', 'cash', 'credit_card', 'debit_card', 'bank_transfer', 'other'], {
    message: 'Método deve ser: pix, cash, credit_card, debit_card, bank_transfer ou other',
  })
  paymentMethod: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
```

### FILE: backend/src/modules/payment/payment.service.ts

```typescript
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreatePaymentDto) {
    // Valida charge pertence ao tenant
    const charge = await this.prisma.charge.findFirst({
      where: { id: dto.chargeId, tenantId },
    });
    if (!charge) {
      throw new BadRequestException('Cobrança não encontrada nesta academia');
    }

    // Rejeita pagamento em cobrança cancelada
    if (charge.status === 'cancelled') {
      throw new BadRequestException('Não é possível registrar pagamento em cobrança cancelada');
    }

    // Rejeita pagamento em cobrança já paga
    if (charge.status === 'paid') {
      throw new BadRequestException('Esta cobrança já está totalmente paga');
    }

    // Calcula saldo restante
    const remainingCents = charge.amountCents - charge.paidAmountCents;

    // Rejeita pagamento que excede o saldo
    if (dto.amountCents > remainingCents) {
      throw new BadRequestException(
        `Valor do pagamento (${dto.amountCents}) excede o saldo restante (${remainingCents} centavos). ` +
        `Valor total: ${charge.amountCents}, já pago: ${charge.paidAmountCents}`,
      );
    }

    // Calcula novos totais
    const newPaidAmount = charge.paidAmountCents + dto.amountCents;
    const newStatus = newPaidAmount >= charge.amountCents ? 'paid' : 'partially_paid';

    // Cria payment e atualiza charge em transação
    const [payment] = await this.prisma.$transaction([
      this.prisma.payment.create({
        data: {
          tenantId,
          chargeId: dto.chargeId,
          amountCents: dto.amountCents,
          paymentDate: new Date(dto.paymentDate),
          paymentMethod: dto.paymentMethod,
          receivedByUserId: userId,
          notes: dto.notes,
        },
        include: {
          charge: {
            select: {
              id: true,
              description: true,
              amountCents: true,
              paidAmountCents: true,
              status: true,
            },
          },
          receivedBy: {
            select: {
              id: true,
              person: {
                select: { fullName: true },
              },
            },
          },
        },
      }),
      this.prisma.charge.update({
        where: { id: dto.chargeId },
        data: {
          paidAmountCents: newPaidAmount,
          status: newStatus,
        },
      }),
    ]);

    // Retorna payment com dados atualizados da charge
    return {
      ...payment,
      charge: {
        ...payment.charge,
        paidAmountCents: newPaidAmount,
        status: newStatus,
        remainingCents: charge.amountCents - newPaidAmount,
      },
    };
  }

  async findAll(
    tenantId: string,
    filters?: {
      chargeId?: string;
      paymentMethod?: string;
      dateFrom?: string;
      dateTo?: string;
    },
  ) {
    const where: any = { tenantId };

    if (filters?.chargeId) where.chargeId = filters.chargeId;
    if (filters?.paymentMethod) where.paymentMethod = filters.paymentMethod;

    if (filters?.dateFrom || filters?.dateTo) {
      where.paymentDate = {};
      if (filters.dateFrom) where.paymentDate.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.paymentDate.lte = new Date(filters.dateTo);
    }

    return this.prisma.payment.findMany({
      where,
      orderBy: { paymentDate: 'desc' },
      include: {
        charge: {
          select: {
            id: true,
            description: true,
            amountCents: true,
            paidAmountCents: true,
            status: true,
            dueDate: true,
            enrollment: {
              select: {
                id: true,
                student: {
                  select: {
                    id: true,
                    person: {
                      select: { id: true, fullName: true, cpf: true },
                    },
                  },
                },
              },
            },
          },
        },
        receivedBy: {
          select: {
            id: true,
            person: {
              select: { fullName: true },
            },
          },
        },
      },
    });
  }

  async findById(tenantId: string, id: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id, tenantId },
      include: {
        charge: {
          include: {
            enrollment: {
              select: {
                id: true,
                student: {
                  select: {
                    id: true,
                    person: true,
                  },
                },
                plan: {
                  select: { id: true, name: true },
                },
              },
            },
            payerPerson: {
              select: { id: true, fullName: true, cpf: true },
            },
          },
        },
        receivedBy: {
          select: {
            id: true,
            email: true,
            person: {
              select: { fullName: true },
            },
          },
        },
      },
    });
    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }
    return payment;
  }

  async getSummaryByTenant(tenantId: string, filters?: { dateFrom?: string; dateTo?: string }) {
    const where: any = { tenantId };

    if (filters?.dateFrom || filters?.dateTo) {
      where.paymentDate = {};
      if (filters.dateFrom) where.paymentDate.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.paymentDate.lte = new Date(filters.dateTo);
    }

    const byMethod = await this.prisma.payment.groupBy({
      by: ['paymentMethod'],
      where,
      _sum: { amountCents: true },
      _count: true,
    });

    const total = await this.prisma.payment.aggregate({
      where,
      _sum: { amountCents: true },
      _count: true,
    });

    return {
      total: {
        count: total._count,
        totalCents: total._sum.amountCents || 0,
      },
      byMethod: byMethod.map((m) => ({
        method: m.paymentMethod,
        count: m._count,
        totalCents: m._sum.amountCents || 0,
      })),
    };
  }
}
```

O `PaymentService` é o mais crítico do projeto. A criação de pagamento usa `$transaction` para garantir atomicidade: o payment é criado e a charge é atualizada na mesma transação. Se qualquer operação falhar, ambas são revertidas.

O `getSummaryByTenant` agrupa pagamentos por método de pagamento — útil para saber quanto entrou via PIX, cartão, dinheiro, etc.

### FILE: backend/src/modules/payment/payment.controller.ts

```typescript
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/interfaces/request-user.interface';
import { Role } from '../../common/enums/role.enum';

@Controller('payments')
@Roles(Role.TENANT_ADMIN, Role.SECRETARY, Role.FINANCIAL)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentService.create(tenantId, user.userId, dto);
  }

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('chargeId') chargeId?: string,
    @Query('paymentMethod') paymentMethod?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.paymentService.findAll(tenantId, {
      chargeId,
      paymentMethod,
      dateFrom,
      dateTo,
    });
  }

  @Get('summary')
  getSummary(
    @CurrentTenant() tenantId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.paymentService.getSummaryByTenant(tenantId, { dateFrom, dateTo });
  }

  @Get(':id')
  findById(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.paymentService.findById(tenantId, id);
  }
}
```

O controller usa `@CurrentUser()` para capturar quem registrou o pagamento (`receivedByUserId`). Sem endpoints `PATCH` ou `DELETE` — pagamentos são imutáveis.

### FILE: backend/src/modules/payment/payment.module.ts

```typescript
import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
```

---

## SEÇÃO 7 — Atualização do AppModule

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
import { ChargeModule } from './modules/charge/charge.module';
import { PaymentModule } from './modules/payment/payment.module';
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
    ChargeModule,
    PaymentModule,
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

## SEÇÃO 8 — Checklist de Validação com Postman/curl

### Passo 0 — Preparar dados

Tenha à mão IDs de: uma enrollment ativa, uma person (para pagador), e faça login como TENANT_ADMIN.

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dono@academiateste.com","password":"Admin@123"}'
```

---

### Teste 1 — Criar cobrança

```bash
curl -X POST http://localhost:3000/api/charges \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "enrollmentId": "ENROLLMENT_ID",
    "payerPersonId": "PERSON_MAE_ID",
    "description": "Mensalidade Abril/2026",
    "amountCents": 15000,
    "dueDate": "2026-04-10",
    "referenceMonth": "2026-04"
  }'
```

Esperado: charge criada com `status: "pending"`, `paidAmountCents: 0`. **Guarde `id` como `CHARGE_ID`.**

---

### Teste 2 — Criar cobrança com enrollment inválido

```bash
curl -X POST http://localhost:3000/api/charges \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "enrollmentId": "00000000-0000-0000-0000-000000000099",
    "description": "Teste",
    "amountCents": 10000,
    "dueDate": "2026-04-10"
  }'
```

Esperado: **400** — "Matrícula não encontrada nesta academia".

---

### Teste 3 — Criar cobrança com payer person inválido

```bash
curl -X POST http://localhost:3000/api/charges \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "enrollmentId": "ENROLLMENT_ID",
    "payerPersonId": "00000000-0000-0000-0000-000000000099",
    "description": "Teste",
    "amountCents": 10000,
    "dueDate": "2026-04-10"
  }'
```

Esperado: **400** — "Pessoa pagadora não encontrada nesta academia".

---

### Teste 4 — Listar cobranças com filtros

```bash
# Por status
curl "http://localhost:3000/api/charges?status=pending" \
  -H "Authorization: Bearer TOKEN"

# Por mês de referência
curl "http://localhost:3000/api/charges?referenceMonth=2026-04" \
  -H "Authorization: Bearer TOKEN"

# Por range de vencimento
curl "http://localhost:3000/api/charges?dueDateFrom=2026-04-01&dueDateTo=2026-04-30" \
  -H "Authorization: Bearer TOKEN"
```

---

### Teste 5 — Ver resumo financeiro

```bash
curl http://localhost:3000/api/charges/summary \
  -H "Authorization: Bearer TOKEN"
```

Esperado: objeto com contagens e totais por status.

---

### Teste 6 — Criar primeiro pagamento (parcial)

```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "chargeId": "CHARGE_ID",
    "amountCents": 5000,
    "paymentDate": "2026-04-08",
    "paymentMethod": "pix",
    "notes": "Pagamento parcial via PIX"
  }'
```

Esperado: payment criado. Na resposta, `charge.status` deve ser `"partially_paid"`, `charge.paidAmountCents` deve ser `5000`, `charge.remainingCents` deve ser `10000`.

---

### Teste 7 — Criar segundo pagamento (parcial)

```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "chargeId": "CHARGE_ID",
    "amountCents": 5000,
    "paymentDate": "2026-04-15",
    "paymentMethod": "cash"
  }'
```

Esperado: `charge.status` ainda `"partially_paid"`, `paidAmountCents: 10000`, `remainingCents: 5000`.

---

### Teste 8 — Criar terceiro pagamento (quita a cobrança)

```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "chargeId": "CHARGE_ID",
    "amountCents": 5000,
    "paymentDate": "2026-04-20",
    "paymentMethod": "debit_card"
  }'
```

Esperado: `charge.status` agora `"paid"`, `paidAmountCents: 15000`, `remainingCents: 0`.

---

### Teste 9 — Tentar pagar cobrança já paga

```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "chargeId": "CHARGE_ID",
    "amountCents": 1000,
    "paymentDate": "2026-04-21",
    "paymentMethod": "pix"
  }'
```

Esperado: **400** — "Esta cobrança já está totalmente paga".

---

### Teste 10 — Criar segunda cobrança e tentar pagamento que excede o saldo

```bash
# Criar cobrança de R$ 100,00
curl -X POST http://localhost:3000/api/charges \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "enrollmentId": "ENROLLMENT_ID",
    "description": "Mensalidade Maio/2026",
    "amountCents": 10000,
    "dueDate": "2026-05-10",
    "referenceMonth": "2026-05"
  }'

# Tentar pagar R$ 150,00 (excede)
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "chargeId": "CHARGE2_ID",
    "amountCents": 15000,
    "paymentDate": "2026-05-08",
    "paymentMethod": "pix"
  }'
```

Esperado: **400** — "Valor do pagamento (15000) excede o saldo restante (10000 centavos)".

---

### Teste 11 — Cancelar cobrança

```bash
curl -X PATCH "http://localhost:3000/api/charges/CHARGE2_ID/cancel" \
  -H "Authorization: Bearer TOKEN"
```

Esperado: `{ "status": "cancelled", "message": "Cobrança cancelada com sucesso" }`.

---

### Teste 12 — Tentar pagar cobrança cancelada

```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "chargeId": "CHARGE2_ID",
    "amountCents": 5000,
    "paymentDate": "2026-05-10",
    "paymentMethod": "cash"
  }'
```

Esperado: **400** — "Não é possível registrar pagamento em cobrança cancelada".

---

### Teste 13 — Listar pagamentos com filtros

```bash
# Por método
curl "http://localhost:3000/api/payments?paymentMethod=pix" \
  -H "Authorization: Bearer TOKEN"

# Por range de data
curl "http://localhost:3000/api/payments?dateFrom=2026-04-01&dateTo=2026-04-30" \
  -H "Authorization: Bearer TOKEN"
```

---

### Teste 14 — Ver resumo de pagamentos

```bash
curl "http://localhost:3000/api/payments/summary?dateFrom=2026-04-01&dateTo=2026-04-30" \
  -H "Authorization: Bearer TOKEN"
```

Esperado: total geral e breakdown por método de pagamento.

---

### Teste 15 — Buscar cobrança por ID (com pagamentos)

```bash
curl "http://localhost:3000/api/charges/CHARGE_ID" \
  -H "Authorization: Bearer TOKEN"
```

Esperado: charge com array `payments` contendo os 3 pagamentos registrados, cada um com `receivedBy`.

---

## SEÇÃO 9 — Erros Comuns a Evitar Nesta Etapa

### 1. Não usar transação ao criar pagamento

A criação do payment e a atualização do `paidAmountCents` + `status` da charge devem ser atômicas. Sem `$transaction`, um crash entre as duas operações deixa o dado inconsistente — payment criado mas charge não atualizada.

### 2. Usar Float ou Decimal para valores monetários

Inteiro em centavos é a única representação segura para dinheiro. `15000` = R$ 150,00. Float causa `149.99999999` em operações acumuladas.

### 3. Permitir edição de pagamentos

Pagamentos são registros contábeis imutáveis. Uma vez criado, não se altera nem deleta. Se houver erro, o fluxo correto é cancelar a cobrança e criar uma nova, ou (em versão futura) registrar um estorno como novo registro.

### 4. Não validar saldo restante antes de aceitar pagamento

Se a cobrança é de R$ 150,00 e já foram pagos R$ 100,00, o próximo pagamento aceita no máximo R$ 50,00. Sem essa validação, `paidAmountCents` ultrapassa `amountCents`.

### 5. Permitir que o usuário defina status `paid` ou `partially_paid` manualmente

Os status `paid` e `partially_paid` são calculados automaticamente pelo sistema a cada pagamento. O `UpdateChargeDto` permite apenas `pending`, `overdue` e `cancelled` como entrada manual.

### 6. Esquecer relações reversas nos modelos existentes

Adicione `charges Charge[]` no `Enrollment`, `chargesAsPayer Charge[]` no `Person`, `paymentsReceived Payment[]` no `User`, e os arrays no `Tenant`. Sem isso o Prisma falha.

### 7. Hard delete de cobranças

Cobranças são documentos financeiros. Mesmo canceladas, devem permanecer no banco para auditoria. Use `status: 'cancelled'`, nunca `DELETE`.

### 8. Não registrar quem recebeu o pagamento

O campo `receivedByUserId` é essencial para auditoria: saber qual secretária ou financeiro registrou cada pagamento. O controller captura isso via `@CurrentUser()`.

### 9. Não incluir payments no findById da charge

Uma cobrança sem o histórico de pagamentos é informação incompleta. O `findById` sempre inclui o array de payments com data, valor, método e quem recebeu.

### 10. Não tratar recálculo de status ao alterar valor da charge

Se uma charge tem `amountCents: 15000`, `paidAmountCents: 10000` e o usuário altera para `amountCents: 10000`, o status deve mudar para `paid`. O `update` do service trata esse caso.

---

## SEÇÃO 10 — Notas para a Próxima Etapa

### Como o financeiro se conecta ao futuro

**Dashboard e relatórios:** Os métodos `getSummaryByTenant` (Charge) e `getSummaryByTenant` (Payment) já fornecem os dados que o dashboard precisa: total pendente, total vencido, total recebido, e breakdown por método de pagamento. O próximo módulo de Dashboard apenas consumirá esses dados e os dos outros domínios.

**Presença (Attendance):** Presença é independente do financeiro — um aluno pode ter presença registrada mesmo com cobrança vencida. A decisão de bloquear aluno inadimplente é uma regra de negócio configurável no futuro, não uma constraint de banco.

**Geração automática de cobranças:** O fluxo atual é manual (secretária cria cobrança). Na próxima iteração, um serviço pode gerar cobranças automaticamente a partir de matrículas ativas + regras do plano (frequência, valor, dia de vencimento).

**Detecção de inadimplência:** Um job periódico pode mudar cobranças `pending` para `overdue` quando `dueDate < hoje`. Isso não foi implementado agora, mas o índice `[tenantId, status, dueDate]` já está otimizado para essa query.

**Stripe/Gateway de pagamento:** Quando integrado, o gateway cria payments automaticamente via webhook ao invés de manualmente. O modelo é o mesmo — apenas a origem do payment muda.

**Portal do responsável:** O GUARDIAN verá as cobranças vinculadas aos seus filhos via `payerPersonId`. O `findAll` do Charge já suporta filtro por `payerPersonId`, pronto para ser consumido pelo portal.

---

*Este documento implementa o domínio financeiro completo do GKFitSystem. Com Charge e Payment funcionando, a academia tem controle operacional sobre sua receita. O próximo passo natural é Attendance (presença) ou Dashboard (visão gerencial).*
