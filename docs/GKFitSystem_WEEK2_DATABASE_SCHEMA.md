# GKFitSystem — Semana 2: Modelagem de Banco de Dados

> **Versão:** 1.0  
> **Data:** Março 2026  
> **Status:** Modelagem Relacional Completa (Pré-Implementação)

---

## Seção 1 — Explicação do Relacionamento entre Entidades

### Visão geral do modelo

O banco de dados do GKFitSystem é organizado em torno de um princípio central: **isolamento lógico por tenant**. Toda tabela que armazena dados de negócio possui uma coluna `tenant_id` que referencia a academia proprietária daquela informação. Isso garante que nenhuma academia jamais acesse dados de outra.

O modelo se divide em seis domínios principais:

---

### 1.1 — Infraestrutura e Autenticação

```
tenants ──────────────< users
                         │
                         └──── referencia ──── persons
```

A tabela `tenants` é a raiz de tudo. Cada academia é um tenant. A tabela `users` armazena credenciais de login (email, senha hash, role) e referencia tanto o `tenant_id` quanto um `person_id`. A tabela `persons` guarda os dados humanos reais (nome, CPF, telefone, data de nascimento) — separada de `users` porque nem toda pessoa faz login (crianças, por exemplo).

---

### 1.2 — Pessoas e Relacionamentos

```
persons ──────────────< students
persons ──────────────< guardians

guardians >────────────< students
              (via guardian_student_links)
```

Uma `Person` pode ter um registro de `Student` (aluno) e/ou um registro de `Guardian` (responsável). Isso permite que um adulto seja aluno e responsável ao mesmo tempo. A tabela `guardian_student_links` é a ponte muitos-para-muitos: um responsável pode ter vários filhos, e uma criança pode ter vários responsáveis (mãe e pai). O link também armazena quem é o responsável financeiro.

---

### 1.3 — Estrutura Acadêmica

```
tenants ──────< modalities ──────< levels
tenants ──────< class_groups >──── modalities
                     │
                     └──── referencia ──── levels (nível da turma)
                     └──── referencia ──── users  (professor)
```

Cada academia configura suas próprias `modalities` (natação, hidroginástica, musculação) e, dentro de cada modalidade, seus `levels` (adaptação, iniciante, intermediário, avançado). As `class_groups` são as turmas reais: combinam uma modalidade, um nível, um horário, um local e um professor.

---

### 1.4 — Planos e Matrículas

```
tenants ──────< plans

students ──────< enrollments >──── plans
                      │
                      └────< enrollment_class_groups >──── class_groups
```

`Plans` definem regras de cobrança (valor, frequência, descontos). `Enrollments` vinculam um aluno a um plano. Como uma matrícula pode cobrir várias turmas (aluno que faz natação + musculação no mesmo plano), existe a tabela intermediária `enrollment_class_groups`.

---

### 1.5 — Financeiro

```
enrollments ──────< charges ──────< payments
```

Cada matrícula gera `charges` (cobranças). Cada cobrança pode ser quitada por um ou mais `payments` (pagamentos parciais são permitidos). A cobrança carrega a informação de quem é o responsável financeiro (`payer_person_id`), permitindo que o mesmo responsável receba cobranças de vários filhos.

---

### 1.6 — Operacional

```
class_groups ──────< attendances >──── students
class_groups ──────< evaluations >──── students
tenants ──────< notifications
```

`Attendances` registram presença por aluno por sessão de aula. `Evaluations` registram avaliações do professor sobre o progresso do aluno. `Notifications` são mensagens enviadas dentro do tenant.

---

### 1.7 — Diagrama de Relacionamentos (ER simplificado)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              TENANTS                                     │
│                           (academia raiz)                                │
└──────┬──────────┬──────────┬──────────┬──────────┬───────────┬───────────┘
       │          │          │          │          │           │
       ▼          ▼          ▼          ▼          ▼           ▼
    users      persons   modalities   plans   class_groups  notifications
       │          │          │                    │
       │          ├──→ students                   │
       │          │      │                        │
       │          ├──→ guardians                  │
       │          │      │                        │
       │          │      └──→ guardian_student_links
       │          │                               │
       │          │          levels ◄── modalities │
       │          │                               │
       │          │      enrollments ◄── plans    │
       │          │          │                    │
       │          │          ├──→ enrollment_class_groups ──→ class_groups
       │          │          │
       │          │          └──→ charges ──→ payments
       │          │
       │          │      attendances ◄──── class_groups + students
       │          │      evaluations ◄──── class_groups + students
       │          │
```

---

## Seção 2 — Definição das Tabelas

### 2.1 — `tenants` (Academias)

Representa cada academia cadastrada na plataforma. É a raiz do isolamento multi-tenant.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| name | VARCHAR(255) | NOT NULL | Nome da academia |
| slug | VARCHAR(100) | NOT NULL, UNIQUE | Identificador URL-friendly |
| document | VARCHAR(20) | NULL | CNPJ da academia |
| email | VARCHAR(255) | NOT NULL | Email de contato |
| phone | VARCHAR(20) | NULL | Telefone |
| address_street | VARCHAR(255) | NULL | Logradouro |
| address_number | VARCHAR(20) | NULL | Número |
| address_complement | VARCHAR(100) | NULL | Complemento |
| address_neighborhood | VARCHAR(100) | NULL | Bairro |
| address_city | VARCHAR(100) | NULL | Cidade |
| address_state | CHAR(2) | NULL | UF |
| address_zip | VARCHAR(10) | NULL | CEP |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Se o tenant está ativo |
| subscription_status | VARCHAR(20) | NOT NULL, DEFAULT 'trial' | Status da assinatura (trial, active, suspended, cancelled) |
| settings | JSONB | DEFAULT '{}' | Configurações específicas da academia |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Última atualização |

---

### 2.2 — `users` (Credenciais de Login)

Armazena as credenciais de autenticação. Cada user pertence a um tenant (exceto PLATFORM_ADMIN) e referencia uma pessoa.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| tenant_id | UUID | FK → tenants(id), NULL | Tenant (nulo para PLATFORM_ADMIN) |
| person_id | UUID | FK → persons(id), NULL | Pessoa vinculada |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Email de login |
| password_hash | VARCHAR(255) | NOT NULL | Senha hash (bcrypt) |
| role | VARCHAR(30) | NOT NULL | Role: PLATFORM_ADMIN, TENANT_ADMIN, SECRETARY, TEACHER, FINANCIAL, GUARDIAN, STUDENT |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Se o usuário pode fazer login |
| last_login_at | TIMESTAMPTZ | NULL | Data do último login |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Última atualização |

---

### 2.3 — `persons` (Pessoas)

O registro de uma pessoa real. Separado de `users` porque crianças existem no sistema sem login.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| tenant_id | UUID | FK → tenants(id), NOT NULL | Tenant proprietário |
| full_name | VARCHAR(255) | NOT NULL | Nome completo |
| birth_date | DATE | NULL | Data de nascimento |
| cpf | VARCHAR(14) | NULL | CPF (opcional para crianças) |
| rg | VARCHAR(20) | NULL | RG |
| gender | VARCHAR(1) | NULL | M, F, O |
| email | VARCHAR(255) | NULL | Email pessoal |
| phone | VARCHAR(20) | NULL | Telefone / celular |
| phone_secondary | VARCHAR(20) | NULL | Telefone secundário |
| address_street | VARCHAR(255) | NULL | Logradouro |
| address_number | VARCHAR(20) | NULL | Número |
| address_complement | VARCHAR(100) | NULL | Complemento |
| address_neighborhood | VARCHAR(100) | NULL | Bairro |
| address_city | VARCHAR(100) | NULL | Cidade |
| address_state | CHAR(2) | NULL | UF |
| address_zip | VARCHAR(10) | NULL | CEP |
| medical_notes | TEXT | NULL | Observações médicas (alergias, restrições) |
| photo_url | VARCHAR(500) | NULL | URL da foto de perfil |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Registro ativo |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Última atualização |

---

### 2.4 — `students` (Alunos)

Papel de aluno vinculado a uma pessoa. Uma pessoa vira aluno quando é matriculada na academia.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| tenant_id | UUID | FK → tenants(id), NOT NULL | Tenant proprietário |
| person_id | UUID | FK → persons(id), NOT NULL | Pessoa vinculada |
| registration_number | VARCHAR(50) | NULL | Matrícula interna da academia |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'active' | active, inactive, suspended, transferred |
| enrollment_date | DATE | NOT NULL, DEFAULT CURRENT_DATE | Data de ingresso |
| notes | TEXT | NULL | Observações internas |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Última atualização |

**Constraint:** UNIQUE(tenant_id, person_id) — uma pessoa só pode ser aluno uma vez por tenant.

---

### 2.5 — `guardians` (Responsáveis)

Papel de responsável vinculado a uma pessoa. Um responsável cuida de um ou mais alunos.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| tenant_id | UUID | FK → tenants(id), NOT NULL | Tenant proprietário |
| person_id | UUID | FK → persons(id), NOT NULL | Pessoa vinculada |
| notes | TEXT | NULL | Observações internas |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Última atualização |

**Constraint:** UNIQUE(tenant_id, person_id) — uma pessoa só pode ser responsável uma vez por tenant.

---

### 2.6 — `guardian_student_links` (Vínculo Responsável ↔ Aluno)

Tabela associativa muitos-para-muitos entre responsáveis e alunos.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| tenant_id | UUID | FK → tenants(id), NOT NULL | Tenant proprietário |
| guardian_id | UUID | FK → guardians(id), NOT NULL | Responsável |
| student_id | UUID | FK → students(id), NOT NULL | Aluno |
| relationship | VARCHAR(30) | NOT NULL, DEFAULT 'other' | Tipo: mother, father, grandparent, uncle_aunt, sibling, other |
| is_financial_responsible | BOOLEAN | NOT NULL, DEFAULT false | Se é o responsável financeiro |
| is_primary_contact | BOOLEAN | NOT NULL, DEFAULT false | Se é o contato principal |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data de criação |

**Constraint:** UNIQUE(tenant_id, guardian_id, student_id) — sem vínculo duplicado.

---

### 2.7 — `modalities` (Modalidades)

Tipos de atividade que a academia oferece.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| tenant_id | UUID | FK → tenants(id), NOT NULL | Tenant proprietário |
| name | VARCHAR(100) | NOT NULL | Nome: "Natação", "Hidroginástica", "Musculação" |
| description | TEXT | NULL | Descrição da modalidade |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Se está disponível para novas matrículas |
| sort_order | INTEGER | NOT NULL, DEFAULT 0 | Ordem de exibição |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Última atualização |

**Constraint:** UNIQUE(tenant_id, name) — nomes não se repetem dentro de um tenant.

---

### 2.8 — `levels` (Níveis de Aprendizado)

Estágios de progressão dentro de uma modalidade.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| tenant_id | UUID | FK → tenants(id), NOT NULL | Tenant proprietário |
| modality_id | UUID | FK → modalities(id), NOT NULL | Modalidade pai |
| name | VARCHAR(100) | NOT NULL | Nome: "Adaptação", "Iniciante", "Intermediário", "Avançado" |
| description | TEXT | NULL | Descrição do nível e critérios |
| sort_order | INTEGER | NOT NULL, DEFAULT 0 | Ordem de progressão (0 = mais básico) |
| color | VARCHAR(7) | NULL | Código de cor hex para UI (ex: #3B82F6) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Última atualização |

**Constraint:** UNIQUE(tenant_id, modality_id, name)

---

### 2.9 — `class_groups` (Turmas)

Uma turma é a unidade operacional: modalidade + nível + horário + professor + local.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| tenant_id | UUID | FK → tenants(id), NOT NULL | Tenant proprietário |
| modality_id | UUID | FK → modalities(id), NOT NULL | Modalidade |
| level_id | UUID | FK → levels(id), NULL | Nível (nulo se a modalidade não usa níveis) |
| teacher_id | UUID | FK → users(id), NULL | Professor responsável |
| name | VARCHAR(150) | NOT NULL | Nome da turma: "Natação Infantil - Seg/Qua 14h" |
| days_of_week | VARCHAR(20) | NOT NULL | Dias: "mon,wed,fri" |
| start_time | TIME | NOT NULL | Horário de início |
| end_time | TIME | NOT NULL | Horário de término |
| location | VARCHAR(100) | NULL | Local: "Piscina 1", "Sala de Musculação" |
| max_capacity | INTEGER | NOT NULL, DEFAULT 20 | Capacidade máxima |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Se aceita novos alunos |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Última atualização |

---

### 2.10 — `plans` (Planos de Pagamento)

Definem regras de cobrança para matrículas.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| tenant_id | UUID | FK → tenants(id), NOT NULL | Tenant proprietário |
| name | VARCHAR(150) | NOT NULL | Nome: "Natação Mensal", "Combo Natação + Musculação" |
| description | TEXT | NULL | Descrição do plano |
| price_cents | INTEGER | NOT NULL | Valor em centavos (ex: 15000 = R$ 150,00) |
| billing_frequency | VARCHAR(20) | NOT NULL, DEFAULT 'monthly' | monthly, quarterly, semiannual, annual |
| duration_months | INTEGER | NULL | Duração em meses (nulo = sem prazo) |
| enrollment_fee_cents | INTEGER | NOT NULL, DEFAULT 0 | Taxa de matrícula em centavos |
| allows_pause | BOOLEAN | NOT NULL, DEFAULT false | Se permite trancamento |
| max_pause_days | INTEGER | NULL | Máximo de dias de trancamento |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Disponível para novas matrículas |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Última atualização |

---

### 2.11 — `plan_modalities` (Modalidades do Plano)

Quais modalidades um plano cobre. Um plano "Combo" pode cobrir natação + musculação.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| plan_id | UUID | FK → plans(id), NOT NULL | Plano |
| modality_id | UUID | FK → modalities(id), NOT NULL | Modalidade coberta |

**Constraint:** UNIQUE(plan_id, modality_id)

---

### 2.12 — `enrollments` (Matrículas)

Vincula um aluno a um plano. A matrícula é o registro central que conecta aluno → plano → turmas → cobranças.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| tenant_id | UUID | FK → tenants(id), NOT NULL | Tenant proprietário |
| student_id | UUID | FK → students(id), NOT NULL | Aluno matriculado |
| plan_id | UUID | FK → plans(id), NOT NULL | Plano contratado |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'active' | active, suspended, cancelled, completed |
| start_date | DATE | NOT NULL | Data de início |
| end_date | DATE | NULL | Data de término prevista |
| cancellation_date | DATE | NULL | Data de cancelamento efetivo |
| cancellation_reason | TEXT | NULL | Motivo do cancelamento |
| notes | TEXT | NULL | Observações |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Última atualização |

---

### 2.13 — `enrollment_class_groups` (Turmas da Matrícula)

Quais turmas a matrícula cobre. Uma matrícula combo vincula o aluno a múltiplas turmas.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| enrollment_id | UUID | FK → enrollments(id), NOT NULL | Matrícula |
| class_group_id | UUID | FK → class_groups(id), NOT NULL | Turma |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data de vínculo |

**Constraint:** UNIQUE(enrollment_id, class_group_id)

---

### 2.14 — `charges` (Cobranças)

Uma obrigação financeira gerada a partir de uma matrícula.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| tenant_id | UUID | FK → tenants(id), NOT NULL | Tenant proprietário |
| enrollment_id | UUID | FK → enrollments(id), NOT NULL | Matrícula geradora |
| payer_person_id | UUID | FK → persons(id), NOT NULL | Pessoa responsável pelo pagamento |
| description | VARCHAR(255) | NOT NULL | Descrição: "Mensalidade Janeiro/2026" |
| amount_cents | INTEGER | NOT NULL | Valor em centavos |
| due_date | DATE | NOT NULL | Data de vencimento |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | pending, paid, overdue, cancelled, partially_paid |
| paid_amount_cents | INTEGER | NOT NULL, DEFAULT 0 | Total já pago em centavos |
| reference_month | VARCHAR(7) | NULL | Mês referência: "2026-03" |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Última atualização |

---

### 2.15 — `payments` (Pagamentos)

Registro de cada pagamento recebido contra uma cobrança.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| tenant_id | UUID | FK → tenants(id), NOT NULL | Tenant proprietário |
| charge_id | UUID | FK → charges(id), NOT NULL | Cobrança quitada |
| amount_cents | INTEGER | NOT NULL | Valor pago em centavos |
| payment_date | DATE | NOT NULL | Data do pagamento |
| payment_method | VARCHAR(30) | NOT NULL | pix, cash, credit_card, debit_card, bank_transfer, other |
| received_by_user_id | UUID | FK → users(id), NULL | Quem registrou o recebimento |
| notes | TEXT | NULL | Observações (número do comprovante, etc.) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data de criação |

---

### 2.16 — `attendances` (Presenças)

Registro de presença por aluno por sessão de aula.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| tenant_id | UUID | FK → tenants(id), NOT NULL | Tenant proprietário |
| class_group_id | UUID | FK → class_groups(id), NOT NULL | Turma |
| student_id | UUID | FK → students(id), NOT NULL | Aluno |
| class_date | DATE | NOT NULL | Data da aula |
| status | VARCHAR(20) | NOT NULL | present, absent, justified, late |
| recorded_by_user_id | UUID | FK → users(id), NULL | Professor que registrou |
| notes | VARCHAR(255) | NULL | Observação (motivo da falta, etc.) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Última atualização |

**Constraint:** UNIQUE(tenant_id, class_group_id, student_id, class_date) — uma presença por aluno por turma por dia.

---

### 2.17 — `evaluations` (Avaliações)

Avaliação do professor sobre o progresso do aluno.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| tenant_id | UUID | FK → tenants(id), NOT NULL | Tenant proprietário |
| student_id | UUID | FK → students(id), NOT NULL | Aluno avaliado |
| class_group_id | UUID | FK → class_groups(id), NULL | Turma (contexto da avaliação) |
| modality_id | UUID | FK → modalities(id), NOT NULL | Modalidade avaliada |
| level_id | UUID | FK → levels(id), NULL | Nível atual do aluno |
| evaluator_user_id | UUID | FK → users(id), NOT NULL | Professor avaliador |
| evaluation_date | DATE | NOT NULL | Data da avaliação |
| score | DECIMAL(5,2) | NULL | Nota numérica (opcional) |
| observations | TEXT | NULL | Observações qualitativas |
| recommendation | VARCHAR(30) | NULL | maintain_level, advance_level, needs_attention |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Última atualização |

---

### 2.18 — `notifications` (Notificações)

Mensagens enviadas dentro do sistema.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| tenant_id | UUID | FK → tenants(id), NOT NULL | Tenant proprietário |
| sender_user_id | UUID | FK → users(id), NULL | Quem enviou (nulo = sistema) |
| title | VARCHAR(255) | NOT NULL | Título da notificação |
| body | TEXT | NOT NULL | Corpo da mensagem |
| channel | VARCHAR(20) | NOT NULL, DEFAULT 'in_app' | in_app, email, both |
| target_type | VARCHAR(30) | NOT NULL | all, role, class_group, individual |
| target_value | VARCHAR(255) | NULL | ID do alvo (role name, class_group_id, user_id) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data de envio |

---

### 2.19 — `notification_recipients` (Destinatários de Notificação)

Controle individual de leitura por destinatário.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| notification_id | UUID | FK → notifications(id), NOT NULL | Notificação |
| user_id | UUID | FK → users(id), NOT NULL | Destinatário |
| is_read | BOOLEAN | NOT NULL, DEFAULT false | Se já foi lida |
| read_at | TIMESTAMPTZ | NULL | Quando foi lida |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Data de criação |

**Constraint:** UNIQUE(notification_id, user_id)

---

## Seção 3 — Schema SQL Completo

```sql
-- ============================================================
-- GKFitSystem — SCHEMA POSTGRESQL COMPLETO
-- Versão: 1.0
-- Convenções:
--   • Todos os IDs são UUID com gen_random_uuid()
--   • Valores monetários em centavos (INTEGER)
--   • Timestamps com timezone (TIMESTAMPTZ)
--   • tenant_id em toda tabela de negócio
-- ============================================================

-- =========================
-- EXTENSÕES
-- =========================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()

-- =========================
-- TABELA: tenants
-- =========================
CREATE TABLE tenants (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                 VARCHAR(255)  NOT NULL,
    slug                 VARCHAR(100)  NOT NULL UNIQUE,
    document             VARCHAR(20),
    email                VARCHAR(255)  NOT NULL,
    phone                VARCHAR(20),
    address_street       VARCHAR(255),
    address_number       VARCHAR(20),
    address_complement   VARCHAR(100),
    address_neighborhood VARCHAR(100),
    address_city         VARCHAR(100),
    address_state        CHAR(2),
    address_zip          VARCHAR(10),
    is_active            BOOLEAN       NOT NULL DEFAULT true,
    subscription_status  VARCHAR(20)   NOT NULL DEFAULT 'trial',
    settings             JSONB         DEFAULT '{}',
    created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- =========================
-- TABELA: persons
-- =========================
CREATE TABLE persons (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id            UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    full_name            VARCHAR(255)  NOT NULL,
    birth_date           DATE,
    cpf                  VARCHAR(14),
    rg                   VARCHAR(20),
    gender               VARCHAR(1),
    email                VARCHAR(255),
    phone                VARCHAR(20),
    phone_secondary      VARCHAR(20),
    address_street       VARCHAR(255),
    address_number       VARCHAR(20),
    address_complement   VARCHAR(100),
    address_neighborhood VARCHAR(100),
    address_city         VARCHAR(100),
    address_state        CHAR(2),
    address_zip          VARCHAR(10),
    medical_notes        TEXT,
    photo_url            VARCHAR(500),
    is_active            BOOLEAN       NOT NULL DEFAULT true,
    created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- =========================
-- TABELA: users
-- =========================
CREATE TABLE users (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id         UUID          REFERENCES tenants(id) ON DELETE CASCADE,
    person_id         UUID          REFERENCES persons(id) ON DELETE SET NULL,
    email             VARCHAR(255)  NOT NULL UNIQUE,
    password_hash     VARCHAR(255)  NOT NULL,
    role              VARCHAR(30)   NOT NULL,
    is_active         BOOLEAN       NOT NULL DEFAULT true,
    last_login_at     TIMESTAMPTZ,
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_user_role CHECK (
        role IN ('PLATFORM_ADMIN','TENANT_ADMIN','SECRETARY','TEACHER','FINANCIAL','GUARDIAN','STUDENT')
    )
);

-- =========================
-- TABELA: students
-- =========================
CREATE TABLE students (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id            UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    person_id            UUID          NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    registration_number  VARCHAR(50),
    status               VARCHAR(20)   NOT NULL DEFAULT 'active',
    enrollment_date      DATE          NOT NULL DEFAULT CURRENT_DATE,
    notes                TEXT,
    created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_student_tenant_person UNIQUE (tenant_id, person_id),
    CONSTRAINT chk_student_status CHECK (
        status IN ('active','inactive','suspended','transferred')
    )
);

-- =========================
-- TABELA: guardians
-- =========================
CREATE TABLE guardians (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    person_id   UUID          NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    notes       TEXT,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_guardian_tenant_person UNIQUE (tenant_id, person_id)
);

-- =========================
-- TABELA: guardian_student_links
-- =========================
CREATE TABLE guardian_student_links (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    guardian_id              UUID          NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
    student_id               UUID          NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    relationship             VARCHAR(30)   NOT NULL DEFAULT 'other',
    is_financial_responsible BOOLEAN       NOT NULL DEFAULT false,
    is_primary_contact       BOOLEAN       NOT NULL DEFAULT false,
    created_at               TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_guardian_student UNIQUE (tenant_id, guardian_id, student_id),
    CONSTRAINT chk_relationship CHECK (
        relationship IN ('mother','father','grandparent','uncle_aunt','sibling','other')
    )
);

-- =========================
-- TABELA: modalities
-- =========================
CREATE TABLE modalities (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name        VARCHAR(100)  NOT NULL,
    description TEXT,
    is_active   BOOLEAN       NOT NULL DEFAULT true,
    sort_order  INTEGER       NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_modality_tenant_name UNIQUE (tenant_id, name)
);

-- =========================
-- TABELA: levels
-- =========================
CREATE TABLE levels (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id    UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    modality_id  UUID          NOT NULL REFERENCES modalities(id) ON DELETE CASCADE,
    name         VARCHAR(100)  NOT NULL,
    description  TEXT,
    sort_order   INTEGER       NOT NULL DEFAULT 0,
    color        VARCHAR(7),
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_level_tenant_modality_name UNIQUE (tenant_id, modality_id, name)
);

-- =========================
-- TABELA: class_groups
-- =========================
CREATE TABLE class_groups (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id    UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    modality_id  UUID          NOT NULL REFERENCES modalities(id) ON DELETE CASCADE,
    level_id     UUID          REFERENCES levels(id) ON DELETE SET NULL,
    teacher_id   UUID          REFERENCES users(id) ON DELETE SET NULL,
    name         VARCHAR(150)  NOT NULL,
    days_of_week VARCHAR(20)   NOT NULL,
    start_time   TIME          NOT NULL,
    end_time     TIME          NOT NULL,
    location     VARCHAR(100),
    max_capacity INTEGER       NOT NULL DEFAULT 20,
    is_active    BOOLEAN       NOT NULL DEFAULT true,
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- =========================
-- TABELA: plans
-- =========================
CREATE TABLE plans (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id            UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name                 VARCHAR(150)  NOT NULL,
    description          TEXT,
    price_cents          INTEGER       NOT NULL,
    billing_frequency    VARCHAR(20)   NOT NULL DEFAULT 'monthly',
    duration_months      INTEGER,
    enrollment_fee_cents INTEGER       NOT NULL DEFAULT 0,
    allows_pause         BOOLEAN       NOT NULL DEFAULT false,
    max_pause_days       INTEGER,
    is_active            BOOLEAN       NOT NULL DEFAULT true,
    created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_billing_frequency CHECK (
        billing_frequency IN ('monthly','quarterly','semiannual','annual')
    ),
    CONSTRAINT chk_price_positive CHECK (price_cents >= 0),
    CONSTRAINT chk_fee_positive CHECK (enrollment_fee_cents >= 0)
);

-- =========================
-- TABELA: plan_modalities
-- =========================
CREATE TABLE plan_modalities (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id      UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    modality_id  UUID NOT NULL REFERENCES modalities(id) ON DELETE CASCADE,

    CONSTRAINT uq_plan_modality UNIQUE (plan_id, modality_id)
);

-- =========================
-- TABELA: enrollments
-- =========================
CREATE TABLE enrollments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    student_id          UUID          NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    plan_id             UUID          NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    status              VARCHAR(20)   NOT NULL DEFAULT 'active',
    start_date          DATE          NOT NULL,
    end_date            DATE,
    cancellation_date   DATE,
    cancellation_reason TEXT,
    notes               TEXT,
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_enrollment_status CHECK (
        status IN ('active','suspended','cancelled','completed')
    )
);

-- =========================
-- TABELA: enrollment_class_groups
-- =========================
CREATE TABLE enrollment_class_groups (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id   UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    class_group_id  UUID NOT NULL REFERENCES class_groups(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_enrollment_class_group UNIQUE (enrollment_id, class_group_id)
);

-- =========================
-- TABELA: charges
-- =========================
CREATE TABLE charges (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id         UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    enrollment_id     UUID          NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    payer_person_id   UUID          NOT NULL REFERENCES persons(id) ON DELETE RESTRICT,
    description       VARCHAR(255)  NOT NULL,
    amount_cents      INTEGER       NOT NULL,
    due_date          DATE          NOT NULL,
    status            VARCHAR(20)   NOT NULL DEFAULT 'pending',
    paid_amount_cents INTEGER       NOT NULL DEFAULT 0,
    reference_month   VARCHAR(7),
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_charge_status CHECK (
        status IN ('pending','paid','overdue','cancelled','partially_paid')
    ),
    CONSTRAINT chk_amount_positive CHECK (amount_cents > 0),
    CONSTRAINT chk_paid_not_negative CHECK (paid_amount_cents >= 0)
);

-- =========================
-- TABELA: payments
-- =========================
CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    charge_id           UUID          NOT NULL REFERENCES charges(id) ON DELETE CASCADE,
    amount_cents        INTEGER       NOT NULL,
    payment_date        DATE          NOT NULL,
    payment_method      VARCHAR(30)   NOT NULL,
    received_by_user_id UUID          REFERENCES users(id) ON DELETE SET NULL,
    notes               TEXT,
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_payment_positive CHECK (amount_cents > 0),
    CONSTRAINT chk_payment_method CHECK (
        payment_method IN ('pix','cash','credit_card','debit_card','bank_transfer','other')
    )
);

-- =========================
-- TABELA: attendances
-- =========================
CREATE TABLE attendances (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    class_group_id      UUID          NOT NULL REFERENCES class_groups(id) ON DELETE CASCADE,
    student_id          UUID          NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_date          DATE          NOT NULL,
    status              VARCHAR(20)   NOT NULL,
    recorded_by_user_id UUID          REFERENCES users(id) ON DELETE SET NULL,
    notes               VARCHAR(255),
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_attendance UNIQUE (tenant_id, class_group_id, student_id, class_date),
    CONSTRAINT chk_attendance_status CHECK (
        status IN ('present','absent','justified','late')
    )
);

-- =========================
-- TABELA: evaluations
-- =========================
CREATE TABLE evaluations (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id          UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    student_id         UUID          NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_group_id     UUID          REFERENCES class_groups(id) ON DELETE SET NULL,
    modality_id        UUID          NOT NULL REFERENCES modalities(id) ON DELETE CASCADE,
    level_id           UUID          REFERENCES levels(id) ON DELETE SET NULL,
    evaluator_user_id  UUID          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    evaluation_date    DATE          NOT NULL,
    score              DECIMAL(5,2),
    observations       TEXT,
    recommendation     VARCHAR(30),
    created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_recommendation CHECK (
        recommendation IS NULL OR
        recommendation IN ('maintain_level','advance_level','needs_attention')
    )
);

-- =========================
-- TABELA: notifications
-- =========================
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    sender_user_id  UUID          REFERENCES users(id) ON DELETE SET NULL,
    title           VARCHAR(255)  NOT NULL,
    body            TEXT          NOT NULL,
    channel         VARCHAR(20)   NOT NULL DEFAULT 'in_app',
    target_type     VARCHAR(30)   NOT NULL,
    target_value    VARCHAR(255),
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_channel CHECK (
        channel IN ('in_app','email','both')
    ),
    CONSTRAINT chk_target_type CHECK (
        target_type IN ('all','role','class_group','individual')
    )
);

-- =========================
-- TABELA: notification_recipients
-- =========================
CREATE TABLE notification_recipients (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID          NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    user_id         UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_read         BOOLEAN       NOT NULL DEFAULT false,
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_notification_recipient UNIQUE (notification_id, user_id)
);

-- =========================
-- TRIGGER: updated_at automático
-- =========================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplica o trigger em todas as tabelas com updated_at
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN
        SELECT table_name FROM information_schema.columns
        WHERE column_name = 'updated_at'
          AND table_schema = 'public'
          AND table_name != 'information_schema'
    LOOP
        EXECUTE format(
            'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()',
            t
        );
    END LOOP;
END;
$$;
```

---

## Seção 4 — Índices Recomendados

### 4.1 — Índices de tenant_id (obrigatórios)

Toda consulta filtra por `tenant_id`. Estes índices são a base da performance multi-tenant.

```sql
-- Persons
CREATE INDEX idx_persons_tenant ON persons(tenant_id);
CREATE INDEX idx_persons_tenant_cpf ON persons(tenant_id, cpf) WHERE cpf IS NOT NULL;
CREATE INDEX idx_persons_tenant_name ON persons(tenant_id, full_name);

-- Users
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_tenant_role ON users(tenant_id, role);

-- Students
CREATE INDEX idx_students_tenant ON students(tenant_id);
CREATE INDEX idx_students_tenant_status ON students(tenant_id, status);
CREATE INDEX idx_students_person ON students(person_id);

-- Guardians
CREATE INDEX idx_guardians_tenant ON guardians(tenant_id);
CREATE INDEX idx_guardians_person ON guardians(person_id);

-- Guardian-Student Links
CREATE INDEX idx_gsl_tenant ON guardian_student_links(tenant_id);
CREATE INDEX idx_gsl_guardian ON guardian_student_links(guardian_id);
CREATE INDEX idx_gsl_student ON guardian_student_links(student_id);
```

### 4.2 — Índices de estrutura acadêmica

```sql
-- Modalities
CREATE INDEX idx_modalities_tenant ON modalities(tenant_id);

-- Levels
CREATE INDEX idx_levels_tenant_modality ON levels(tenant_id, modality_id);

-- Class Groups
CREATE INDEX idx_class_groups_tenant ON class_groups(tenant_id);
CREATE INDEX idx_class_groups_modality ON class_groups(tenant_id, modality_id);
CREATE INDEX idx_class_groups_teacher ON class_groups(teacher_id);
```

### 4.3 — Índices de matrículas e planos

```sql
-- Plans
CREATE INDEX idx_plans_tenant ON plans(tenant_id);

-- Enrollments
CREATE INDEX idx_enrollments_tenant ON enrollments(tenant_id);
CREATE INDEX idx_enrollments_student ON enrollments(tenant_id, student_id);
CREATE INDEX idx_enrollments_status ON enrollments(tenant_id, status);
CREATE INDEX idx_enrollments_plan ON enrollments(plan_id);

-- Enrollment-ClassGroup links
CREATE INDEX idx_ecg_enrollment ON enrollment_class_groups(enrollment_id);
CREATE INDEX idx_ecg_class_group ON enrollment_class_groups(class_group_id);
```

### 4.4 — Índices financeiros

```sql
-- Charges
CREATE INDEX idx_charges_tenant ON charges(tenant_id);
CREATE INDEX idx_charges_enrollment ON charges(enrollment_id);
CREATE INDEX idx_charges_payer ON charges(tenant_id, payer_person_id);
CREATE INDEX idx_charges_status ON charges(tenant_id, status);
CREATE INDEX idx_charges_due_date ON charges(tenant_id, due_date);
CREATE INDEX idx_charges_overdue ON charges(tenant_id, status, due_date)
    WHERE status IN ('pending', 'overdue');

-- Payments
CREATE INDEX idx_payments_tenant ON payments(tenant_id);
CREATE INDEX idx_payments_charge ON payments(charge_id);
CREATE INDEX idx_payments_date ON payments(tenant_id, payment_date);
```

### 4.5 — Índices operacionais

```sql
-- Attendances
CREATE INDEX idx_attendances_tenant ON attendances(tenant_id);
CREATE INDEX idx_attendances_class_date ON attendances(tenant_id, class_group_id, class_date);
CREATE INDEX idx_attendances_student ON attendances(tenant_id, student_id);

-- Evaluations
CREATE INDEX idx_evaluations_tenant ON evaluations(tenant_id);
CREATE INDEX idx_evaluations_student ON evaluations(tenant_id, student_id);
CREATE INDEX idx_evaluations_modality ON evaluations(tenant_id, modality_id);

-- Notifications
CREATE INDEX idx_notifications_tenant ON notifications(tenant_id);
CREATE INDEX idx_notification_recipients_user ON notification_recipients(user_id);
CREATE INDEX idx_notification_recipients_unread ON notification_recipients(user_id, is_read)
    WHERE is_read = false;
```

---

## Seção 5 — Notas sobre Isolamento Multi-Tenant

### 5.1 — Princípio fundamental

Todo dado de negócio pertence a exatamente um tenant. A coluna `tenant_id` está presente em todas as tabelas que armazenam dados de academia. As únicas exceções são:

- `tenants` (é a tabela raiz — não tem `tenant_id`)
- `plan_modalities` e `enrollment_class_groups` (tabelas intermediárias cujos registros pais já possuem `tenant_id`)
- `notification_recipients` (herda o contexto do `notification_id`)

### 5.2 — Camadas de proteção

O isolamento funciona em três camadas complementares:

**Camada 1 — Middleware da aplicação (NestJS).** Todo request autenticado passa por um `TenantGuard` que extrai o `tenant_id` do JWT e injeta no contexto do request. Serviços e repositórios recebem o `tenant_id` automaticamente e incluem o filtro em toda query.

**Camada 2 — Base repository pattern.** Um repositório base (ou um interceptor de queries no ORM) adiciona `WHERE tenant_id = :tenantId` a toda operação de leitura, atualização e exclusão. Isso previne que um desenvolvedor esqueça de filtrar manualmente.

**Camada 3 — Row-Level Security (RLS) no PostgreSQL.** Política de segurança a nível de banco que garante isolamento mesmo se a aplicação falhar. Implementação recomendada:

```sql
-- Exemplo para a tabela students
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_students ON students
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- No NestJS, antes de cada transação:
-- SET LOCAL app.current_tenant_id = '<uuid-do-tenant>';
```

### 5.3 — Regras para desenvolvedores

- **Nunca** fazer query sem `tenant_id` no WHERE (exceto para PLATFORM_ADMIN).
- **Nunca** permitir que um endpoint aceite `tenant_id` como parâmetro do request. O tenant vem exclusivamente do JWT.
- **Nunca** criar joins que cruzem dados de tenants diferentes.
- **Sempre** validar que entidades referenciadas (ex: `plan_id` em uma matrícula) pertencem ao mesmo tenant antes de criar o registro.
- **Sempre** usar soft delete (`is_active = false` ou `status = 'cancelled'`) antes de considerar hard delete, para manter integridade referencial.

### 5.4 — Performance em escala

O modelo compartilhado (shared database) funciona bem para centenas de tenants com milhares de registros cada. Quando a base crescer significativamente:

- Os índices compostos com `tenant_id` como primeiro campo garantem que o planner do PostgreSQL faça index scans eficientes por tenant.
- O índice parcial em `charges` para status `pending`/`overdue` acelera o caso de uso mais frequente (ver cobranças em aberto).
- O índice parcial em `notification_recipients` para `is_read = false` acelera a contagem de notificações não lidas.
- Se necessário no futuro, particionamento por `tenant_id` pode ser adicionado sem mudar a aplicação.

### 5.5 — Exclusão de tenant

Todas as foreign keys usam `ON DELETE CASCADE` a partir de `tenants`. Isso significa que excluir um tenant remove automaticamente todos os dados relacionados. Em produção, recomenda-se um soft delete (marcar `is_active = false`) seguido de um job de limpeza que faça o hard delete após um período de retenção (30-90 dias), permitindo recuperação em caso de erro.

---

*Este documento serve como referência completa da modelagem de banco de dados do GKFitSystem. Deve ser mantido atualizado conforme o schema evolui. As migrations no código devem refletir exatamente o que está documentado aqui.*
