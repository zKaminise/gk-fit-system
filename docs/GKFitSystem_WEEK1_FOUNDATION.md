# KaminFit — Week 1 Project Foundation

> **Version:** 1.0  
> **Date:** March 2026  
> **Status:** Architecture & Product Definition (Pre-Development)

---

## 1. Product Vision

### What is KaminFit?

KaminFit is a multi-tenant SaaS platform purpose-built for managing gyms, swimming schools, hydro gymnastics centers, and mixed sports academies. It provides academy owners and their staff with a unified system to handle student enrollment, class scheduling, financial management, attendance tracking, and student progress — all under a single subscription with full data isolation per academy.

### What problem does it solve?

Small and mid-sized sports academies — particularly swimming schools and mixed-modality centers — operate with fragmented workflows. They juggle paper attendance sheets, WhatsApp groups for parent communication, spreadsheets for financial control, and ad-hoc scheduling systems. This leads to missed payments, disorganized classes, no visibility into student progress, and heavy administrative overhead.

KaminFit replaces these fragmented tools with a single integrated platform designed specifically for the operational reality of these academies: children who don't have CPFs, guardians managing multiple enrollments, teachers tracking progress across learning levels, and front desk staff handling check-ins and payments.

### Who are the target users?

| User | Role |
|------|------|
| Academy owners | Configure the academy, manage finances, view reports |
| Front desk / secretaries | Register students, handle enrollments and daily operations |
| Teachers / coaches | Take attendance, record evaluations, track student levels |
| Financial staff | Manage charges, payments, overdue tracking |
| Guardians (parents) | View children's progress, schedules, and financial status |
| Adult students | Access their own schedules, attendance history, and payments |

### Why this niche is interesting

Brazil has thousands of swimming schools and small sports academies. Most management software on the market targets large gym chains or generic fitness businesses, leaving the aquatic and mixed-modality niche underserved. Key differentiators for this niche include the guardian-student relationship model (most students are children), multi-modality support (swimming + gym + hydro in a single academy), level-based progression systems unique to aquatic programs, and the high recurring-revenue potential of a SaaS serving a fragmented market with low software adoption.

---

## 2. MVP Scope

### Must exist in the MVP

- Tenant (academy) creation and configuration
- User authentication with JWT + bcrypt
- Role-based access control (RBAC)
- Student and guardian registration with linking
- Modality and class group management
- Learning levels per modality
- Plan creation and enrollment
- Financial charge generation (manual)
- Attendance recording
- Basic guardian/student portal (read-only)
- Basic dashboard with key metrics

### Should come in later phases

- Stripe/payment gateway integration
- Automated charge generation based on plan rules
- Student evaluations and progress tracking
- Notification system (email via Resend, in-app)
- Teacher scheduling and calendar views
- Reports and data export (PDF, Excel)
- Waitlist management
- Trial class booking
- Contract/document signing
- Mobile app (React Native)

### Explicitly NOT for now

- Online class streaming or video features
- E-commerce or product sales
- Marketing automation or CRM
- AI-based recommendations
- Multi-language support (start with pt-BR only)
- White-label or custom domains per tenant
- Public-facing academy website builder
- Biometric or RFID check-in integration

---

## 3. User Roles

### PLATFORM_ADMIN

Scope: Global (cross-tenant).

The superadmin of the KaminFit platform itself. Can create and manage tenant accounts, view platform-wide metrics, impersonate tenant admins for support purposes, and manage platform billing. This role is internal to the KaminFit team and is never exposed to academy customers.

### TENANT_ADMIN

Scope: Single tenant.

The academy owner or primary administrator. Has full control over every aspect of their academy's configuration: modalities, levels, plans, pricing, staff users, and all data. Can access financial reports, manage staff permissions, and configure academy settings. This is the highest-privilege role within a tenant.

### SECRETARY

Scope: Single tenant — operational.

The front desk operator. Can register students and guardians, create and manage enrollments, record attendance, search and view student data, generate charges, and handle daily operational tasks. Cannot configure academy settings, modalities, or pricing. Cannot access full financial reports.

### TEACHER

Scope: Single tenant — limited to assigned classes.

Can view their assigned class groups and enrolled students, take attendance for their classes, record student evaluations and level progress, and view student contact/guardian information relevant to their classes. Cannot access financial data, manage enrollments, or modify academy configuration.

### FINANCIAL

Scope: Single tenant — financial data.

Can view and manage all charges, payments, and financial reports. Can mark payments as received, generate invoices, and track overdue accounts. Cannot modify enrollments, class assignments, or academy configuration beyond financial settings (due dates, payment methods).

### GUARDIAN

Scope: Single tenant — own linked students only.

A parent or legal guardian. Can log in and see all students linked to them across the academy. Can view class schedules, attendance history, evaluations, and financial status (charges and payments) for their children. Cannot modify any data — this is a read-only portal with the exception of profile updates and future messaging.

### STUDENT

Scope: Single tenant — own data only.

An adult student (18+) who manages their own account. Has the same portal view as a guardian but scoped to their own data: schedule, attendance, evaluations, financial status. Children do not have direct login — they are accessed through their guardian's account.

---

## 4. Core Business Entities

### Tenant

Represents a single academy (the tenant in the multi-tenant model). Stores academy name, address, contact info, configuration preferences, subscription status, and branding. Every other entity in the system belongs to exactly one tenant.

### User

An authentication record. Stores email, hashed password, role, and a reference to the tenant. A user is the login identity — it is linked to a Person record that holds the human's actual data. Platform admins have users without a tenant reference.

### Person

A human being in the system. Stores name, date of birth, CPF (optional — children may not have one), phone, email, address, and gender. A Person can be associated with one or more roles: student, guardian, teacher, or staff member. This separation from User allows people who don't log in (e.g., young children) to still exist in the system.

### Student

A role record linking a Person to a tenant as a student. Stores enrollment-specific metadata such as registration date, current status (active, inactive, suspended), medical notes, and any academy-specific fields. The actual personal data lives in Person.

### Guardian

A role record linking a Person to a tenant as a guardian. A guardian is typically a parent who is responsible for one or more students. The guardian may or may not also be a student themselves. Stores guardian-specific flags such as `is_financial_responsible`.

### GuardianStudentLink

A join table representing the many-to-many relationship between guardians and students. A guardian can have multiple students; a student can have multiple guardians (e.g., mother and father). This link also carries metadata: relationship type (mother, father, other) and whether this guardian is the primary financial responsible for this student.

### Modality

A type of activity offered by the academy. Examples: "Swimming", "Hydro Gymnastics", "Gym / Fitness", "Water Polo". Each tenant defines their own modalities. Modalities are the top-level organizational unit for classes.

### Level

A progression stage within a modality. Examples: for Swimming — "Adaptation", "Beginner", "Intermediate", "Advanced". Levels are tenant-specific and modality-specific. They define the skill progression path for students.

### ClassGroup

A specific class offering. Combines a modality, a level, a schedule (days/times), a location (pool 1, pool 2, gym floor), a teacher, and a maximum capacity. Examples: "Swimming — Beginner — Mon/Wed 14:00 — Pool A — Coach Maria". Students are enrolled into class groups.

### Plan

A pricing and billing configuration. Defines the cost structure for enrolling in the academy. A plan may cover one or more modalities, specify billing frequency (monthly, quarterly, annually), include discounts (sibling discount, multi-modality discount), and define payment terms. Plans are tenant-specific.

### Enrollment

The binding record between a student and the academy's offerings. Links a student to one or more class groups under a specific plan. Stores start date, expected end date, status (active, cancelled, suspended, completed), and references to the plan and class groups. Enrollments are the basis for generating financial charges.

### Charge

A financial obligation generated from an enrollment. Represents a single billing event: the amount due, due date, status (pending, paid, overdue, cancelled), and the enrollment it belongs to. A charge may correspond to a monthly tuition payment, a registration fee, or any other billable item defined by the plan.

### Payment

A record of money received against a charge. Stores the amount paid, payment date, payment method (cash, PIX, card, bank transfer), and a reference to the charge it settles. A charge may have multiple partial payments or a single full payment.

### Attendance

A per-session record of whether a student was present. Links a student, a class group, and a date. Stores attendance status (present, absent, justified absence, late). Teachers record attendance per class session.

### Evaluation

A teacher's assessment of a student's progress. Links a student, a modality, a level, and a teacher. Contains the evaluation date, qualitative or quantitative scores, observations, and optionally a recommendation (e.g., "ready to advance to next level"). Used to track skill progression over time.

### Notification

A message sent to users within the system. Can be targeted to specific roles, individual users, or groups (all guardians of a class group). Stores sender, recipients, subject, body, channel (in-app, email), read status, and sent date. Notifications are tenant-scoped.

---

## 5. Core Business Rules

### People and Relationships

- A guardian can be linked to multiple students (one parent, many children).
- A student can have multiple guardians (mother and father both linked).
- At least one guardian must be flagged as the financial responsible for each minor student.
- A person can be both a guardian and a student simultaneously (a parent who also trains at the academy).
- Children (minors) do not have their own login. They are accessed exclusively through their guardian's account.
- Adult students (18+) may have their own login and manage their own account.
- A student's CPF is optional; a guardian's CPF is required for financial purposes.

### Enrollment and Plans

- An enrollment links exactly one student to one plan and one or more class groups.
- A student may have multiple active enrollments (e.g., swimming + gym).
- Plans define billing rules; charges are generated from enrollments.
- Changing a student's plan mid-cycle creates a new enrollment and closes the old one.
- Class groups have a maximum capacity; enrollment is blocked when a group is full.

### Financial

- Financial charges belong to enrollments, not directly to students.
- The financially responsible person for a charge is determined by the GuardianStudentLink (for minors) or the student themselves (for adults).
- A single charge can be settled by one or more payments.
- Overdue charges are determined by comparing the due date against the current date and payment status.
- Each academy configures its own due dates, payment methods, and pricing.

### Attendance and Evaluations

- Attendance is recorded per student per class session.
- Only teachers assigned to a class group can record attendance for that group.
- Evaluations are optional and created at the teacher's discretion.
- Level advancement is a manual process initiated by the teacher (not automatic).

### Multi-Tenancy and Isolation

- All data is scoped by `tenant_id`. Every database query must filter by the tenant of the current user.
- Users, students, guardians, modalities, plans, charges — everything belongs to a tenant.
- No cross-tenant data access is ever permitted (except for PLATFORM_ADMIN).
- Tenant configuration (modalities, levels, plans, roles) is fully independent per academy.
- Deleting a tenant must cascade or soft-delete all related data.

---

## 6. System Modules

### Authentication & Access Control

Handles user login (email + password), JWT token issuance and validation, password hashing with bcrypt, role-based route protection, and session management. All API endpoints pass through an auth guard that verifies the token, extracts the tenant context, and checks role permissions.

### Tenant Management

Allows PLATFORM_ADMINs to create, update, suspend, and delete tenants. Stores academy configuration including name, branding, contact info, and subscription status. Provides the TENANT_ADMIN with settings screens to configure their academy's preferences.

### Internal Users

Management of staff accounts within a tenant: secretaries, teachers, financial users, and additional admins. TENANT_ADMINs can invite users, assign roles, deactivate accounts, and reset passwords. Each internal user is linked to a Person record.

### People & Relationships

The central registry of all people (students, guardians, staff) within a tenant. Handles CRUD for Person records, creation of Student and Guardian role records, and management of GuardianStudentLink associations. Includes search, filtering, and deduplication logic.

### Modalities & Classes

Configuration and management of modalities (swimming, gym, etc.), levels within each modality, and class groups. Handles scheduling (days, times, locations), teacher assignment, and capacity tracking. Provides the operational structure that enrollments and attendance depend on.

### Plans & Enrollments

Definition of pricing plans (monthly fees, discounts, billing frequency) and management of student enrollments. Handles the lifecycle of an enrollment: creation, activation, suspension, cancellation, and plan changes. Enrollment creation triggers downstream processes like charge generation.

### Financial Management

Generation, tracking, and settlement of financial charges. Manages the billing cycle: charge creation from enrollments, payment recording, overdue detection, and receipt generation. Provides financial reports and summaries for the TENANT_ADMIN and FINANCIAL roles.

### Attendance

Recording and viewing of student attendance per class session. Teachers open a class session, mark each enrolled student as present/absent, and save. Guardians and students can view attendance history. Supports filtering by date range, class group, and student.

### Evaluations & Progress

Teacher-driven assessments of student skill development. Teachers create evaluations tied to a student, modality, and level. Supports qualitative notes and structured scoring. Tracks progression over time and surfaces level-advancement recommendations. Guardians can view evaluations through the portal.

### Student/Guardian Portal

A read-only (initially) interface for guardians and adult students. Guardians see a unified view of all linked children: upcoming classes, recent attendance, evaluation history, and financial status. Adult students see the same for their own account. Future iterations add messaging, document downloads, and re-enrollment requests.

### Notifications

In-app and email notifications to users. Supports targeted messaging (all guardians of a class, a specific user, all teachers) and system-generated alerts (payment overdue, class cancelled, evaluation published). Email delivery via Resend. In-app notifications stored in the database with read/unread status.

### Dashboard & Reports

Aggregated views and metrics for academy management. TENANT_ADMINs see: total active students, enrollment trends, revenue summary, overdue charges, class occupancy rates, and attendance rates. FINANCIAL role sees financial-specific dashboards. Future phases add exportable reports (PDF, Excel).

---

## 7. SaaS Architecture Vision

### What multi-tenant architecture means here

KaminFit uses logical multi-tenancy with a shared database. All tenants (academies) share the same PostgreSQL database hosted on Supabase, but every table that holds tenant-specific data includes a `tenant_id` column. This column is the partition key that ensures each academy only ever sees its own data. There is no separate database per tenant — isolation is enforced at the application layer through query filtering and middleware.

### How tenant isolation works

Every authenticated API request carries a JWT that includes the user's `tenant_id`. A NestJS middleware or guard extracts this `tenant_id` and injects it into the request context. Every database query that touches tenant-scoped data must include a `WHERE tenant_id = :tenantId` clause. This is enforced at the repository/service layer — ideally through a base repository class or a global query scope so that developers cannot accidentally forget it. Row-Level Security (RLS) in PostgreSQL/Supabase can serve as an additional safety net, but the primary enforcement lives in the application code.

### How backend, frontend, and database interact

The frontend is a React SPA (built with Vite) deployed on Vercel. It communicates exclusively with the backend via REST API calls over HTTPS. The backend is a NestJS application deployed on Railway (or Fly/Render). It handles all business logic, authentication, authorization, and data access. The backend connects to a PostgreSQL database hosted on Supabase using a connection string. Supabase is used purely as a managed Postgres provider — the application does not use Supabase Auth, Supabase Realtime, or Supabase client libraries on the frontend. All data flows through the NestJS API.

```
[React SPA on Vercel] → HTTPS → [NestJS API on Railway] → TCP → [PostgreSQL on Supabase]
```

### How authentication works

A user submits email + password to the `/auth/login` endpoint. The backend verifies the password against the bcrypt hash stored in the database. On success, it issues a JWT containing the user's `id`, `tenant_id`, and `role`. The frontend stores this token (in memory or a secure httpOnly cookie) and sends it as a Bearer token in the Authorization header on every subsequent request. The backend validates the JWT on each request using a global auth guard, extracts the user context, and makes it available to controllers and services.

### How permissions work

The system uses Role-Based Access Control (RBAC). Each user has exactly one role per tenant. Roles define a set of permissions (which endpoints/actions they can access). A custom NestJS decorator (`@Roles('TENANT_ADMIN', 'SECRETARY')`) on each controller method specifies which roles are allowed. A RolesGuard reads this metadata, compares it with the authenticated user's role, and allows or denies access. For finer-grained control (e.g., "a teacher can only see their own class groups"), service-layer logic checks ownership in addition to role membership.

---

## 8. Suggested Project Structure

```
kaminfit/
│
├── backend/                        # NestJS application
│   ├── src/
│   │   ├── main.ts                 # Bootstrap
│   │   ├── app.module.ts           # Root module
│   │   │
│   │   ├── common/                 # Shared utilities
│   │   │   ├── decorators/         # @Roles, @CurrentUser, @TenantId
│   │   │   ├── guards/             # AuthGuard, RolesGuard, TenantGuard
│   │   │   ├── interceptors/       # Logging, response transform
│   │   │   ├── filters/            # Global exception filters
│   │   │   ├── pipes/              # Validation pipes
│   │   │   ├── middleware/          # Tenant context middleware
│   │   │   └── utils/              # Helper functions
│   │   │
│   │   ├── config/                 # Environment and app configuration
│   │   │   ├── database.config.ts
│   │   │   ├── jwt.config.ts
│   │   │   └── app.config.ts
│   │   │
│   │   ├── database/               # TypeORM / Prisma setup
│   │   │   ├── migrations/
│   │   │   ├── seeds/
│   │   │   └── entities/           # Shared entity definitions (if TypeORM)
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/               # Login, JWT, password reset
│   │   │   ├── tenant/             # Tenant CRUD, config
│   │   │   ├── user/               # Internal user management
│   │   │   ├── person/             # Person registry
│   │   │   ├── student/            # Student role + operations
│   │   │   ├── guardian/           # Guardian role + linking
│   │   │   ├── modality/           # Modalities, levels
│   │   │   ├── class-group/        # Class group scheduling
│   │   │   ├── plan/               # Plans and pricing
│   │   │   ├── enrollment/         # Enrollment lifecycle
│   │   │   ├── charge/             # Financial charges
│   │   │   ├── payment/            # Payment recording
│   │   │   ├── attendance/         # Attendance tracking
│   │   │   ├── evaluation/         # Student evaluations
│   │   │   ├── notification/       # Notifications
│   │   │   └── dashboard/          # Aggregated metrics
│   │   │
│   │   └── shared/                 # Shared DTOs, interfaces, enums
│   │       ├── dto/
│   │       ├── interfaces/
│   │       └── enums/
│   │
│   ├── test/                       # E2E and integration tests
│   ├── .env.example
│   ├── nest-cli.json
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/                       # React + Vite application
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── routes/                 # Route definitions
│   │   ├── pages/                  # Page components (by module)
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── students/
│   │   │   ├── guardians/
│   │   │   ├── classes/
│   │   │   ├── enrollments/
│   │   │   ├── financial/
│   │   │   ├── attendance/
│   │   │   ├── evaluations/
│   │   │   ├── settings/
│   │   │   └── portal/             # Guardian/student portal
│   │   │
│   │   ├── components/             # Reusable UI components
│   │   │   ├── ui/                 # Buttons, inputs, modals
│   │   │   ├── layout/             # Sidebar, header, page shell
│   │   │   └── data/               # Tables, cards, lists
│   │   │
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── services/               # API client functions
│   │   ├── stores/                 # State management (Zustand or Context)
│   │   ├── types/                  # TypeScript interfaces
│   │   ├── utils/                  # Helpers, formatters
│   │   └── assets/                 # Images, fonts
│   │
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── docs/                           # Project documentation
│   └── (see Section 9)
│
├── docker/                         # Docker configuration
│   ├── docker-compose.yml          # Local dev: Postgres + backend
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
│
├── scripts/                        # Utility scripts
│   ├── seed-dev.ts                 # Seed local DB with test data
│   ├── create-tenant.ts            # CLI to create a tenant
│   └── reset-db.ts                 # Drop and recreate local DB
│
├── .github/
│   └── workflows/
│       ├── ci-backend.yml          # Lint + test backend on PR
│       └── ci-frontend.yml         # Lint + build frontend on PR
│
├── .gitignore
├── README.md
└── package.json                    # Root workspace (optional monorepo)
```

---

## 9. Documentation Structure

All files live in the `/docs` directory.

### `/docs/PRODUCT_VISION.md`

Product definition, target market, competitive landscape, and long-term roadmap narrative. The "why" document. Includes the value proposition, user personas, and key differentiators.

### `/docs/MVP_SCOPE.md`

Explicit list of what is in and out of the MVP. Used to prevent scope creep. Every feature request gets checked against this document before being added to a sprint.

### `/docs/ARCHITECTURE.md`

Technical architecture overview: the multi-tenant strategy, system component diagram (frontend → API → DB), authentication flow, tenant isolation approach, and deployment topology. The single most important technical document.

### `/docs/DATABASE_SCHEMA.md`

Entity-relationship descriptions, table definitions, column types, foreign keys, indexes, and constraints. Updated as the schema evolves. Should include an ER diagram (even ASCII is fine initially).

### `/docs/API_CONTRACTS.md`

REST API endpoint documentation. For each module: URL, method, request body, response shape, required role, and example payloads. Starts as a planning document and becomes the living API reference.

### `/docs/ROLES_AND_PERMISSIONS.md`

Matrix of all roles and what each can access. Formatted as a table: rows are actions/endpoints, columns are roles, cells are allow/deny. The authoritative reference for implementing guards.

### `/docs/BUSINESS_RULES.md`

Documented business rules organized by domain: enrollment rules, financial rules, attendance rules, relationship rules. Each rule has a unique identifier (e.g., BIZ-ENROLL-001) for traceability in code comments and tests.

### `/docs/ENVIRONMENT_SETUP.md`

Step-by-step guide to set up a local development environment from scratch. Covers: cloning the repo, installing dependencies, setting up Docker, configuring environment variables, running migrations, seeding data, and starting the dev servers.

### `/docs/DEPLOYMENT.md`

Instructions for deploying to production: Vercel (frontend), Railway (backend), Supabase (database). Includes environment variable management, CI/CD pipeline configuration, and rollback procedures.

### `/docs/BACKLOG.md`

The development backlog organized by module and priority. Living document updated weekly. Each item has a short description, estimated complexity (S/M/L), dependencies, and status.

### `/docs/GLOSSARY.md`

Definitions of domain-specific terms: tenant, modality, class group, enrollment, charge, guardian link, etc. Ensures the entire team uses consistent terminology in code, docs, and conversations.

### `/docs/CHANGELOG.md`

A running log of significant changes: schema migrations, API changes, feature releases. Follows Keep a Changelog format.

---

## 10. Initial Development Backlog

Items are organized by module and roughly ordered by dependency. Complexity: **S** (Small, < 1 day), **M** (Medium, 1–3 days), **L** (Large, 3–5 days).

---

### Phase 0 — Project Bootstrap

| # | Item | Complexity |
|---|------|-----------|
| 0.1 | Initialize NestJS backend project with TypeScript | S |
| 0.2 | Initialize React + Vite frontend project with TypeScript | S |
| 0.3 | Set up Docker Compose for local PostgreSQL | S |
| 0.4 | Configure TypeORM (or Prisma) with PostgreSQL connection | S |
| 0.5 | Set up ESLint + Prettier for both projects | S |
| 0.6 | Create GitHub repo with branch protection rules | S |
| 0.7 | Set up CI pipelines (lint + test on PR) | M |
| 0.8 | Write ENVIRONMENT_SETUP.md | S |

---

### Phase 1 — Authentication & Tenant Foundation

| # | Item | Complexity |
|---|------|-----------|
| 1.1 | Create Tenant entity and migration | S |
| 1.2 | Create User entity with role, tenant_id, hashed password | S |
| 1.3 | Implement `/auth/login` endpoint (JWT issuance) | M |
| 1.4 | Implement JWT validation guard (global) | M |
| 1.5 | Implement TenantGuard (inject tenant_id into request context) | M |
| 1.6 | Implement RolesGuard and `@Roles()` decorator | M |
| 1.7 | Create seed script for a test tenant + admin user | S |
| 1.8 | Frontend: login page, token storage, auth context | M |
| 1.9 | Frontend: protected route wrapper, redirect to login | M |
| 1.10 | Implement `/auth/me` endpoint (return current user profile) | S |

---

### Phase 2 — Tenant Management & Internal Users

| # | Item | Complexity |
|---|------|-----------|
| 2.1 | CRUD endpoints for Tenant (PLATFORM_ADMIN only) | M |
| 2.2 | Tenant settings endpoint (TENANT_ADMIN) | M |
| 2.3 | Create Person entity and migration | S |
| 2.4 | CRUD endpoints for internal users (TENANT_ADMIN) | M |
| 2.5 | Invite user flow (create user + send temp password) | M |
| 2.6 | Frontend: tenant settings page | M |
| 2.7 | Frontend: internal user management page (list, create, edit) | M |

---

### Phase 3 — People & Relationships

| # | Item | Complexity |
|---|------|-----------|
| 3.1 | Create Student entity and migration | S |
| 3.2 | Create Guardian entity and migration | S |
| 3.3 | Create GuardianStudentLink entity and migration | S |
| 3.4 | CRUD endpoints for Person (with search and filtering) | M |
| 3.5 | Student registration endpoint (create Person + Student) | M |
| 3.6 | Guardian registration endpoint (create Person + Guardian) | M |
| 3.7 | Link/unlink guardian to student endpoint | M |
| 3.8 | Endpoint: get all students for a guardian | S |
| 3.9 | Endpoint: get all guardians for a student | S |
| 3.10 | Frontend: student registration form | M |
| 3.11 | Frontend: guardian registration form with child linking | M |
| 3.12 | Frontend: student list with search and filters | M |

---

### Phase 4 — Modalities & Classes

| # | Item | Complexity |
|---|------|-----------|
| 4.1 | Create Modality entity and migration | S |
| 4.2 | Create Level entity and migration | S |
| 4.3 | Create ClassGroup entity and migration | S |
| 4.4 | CRUD endpoints for Modality | M |
| 4.5 | CRUD endpoints for Level (scoped to modality) | M |
| 4.6 | CRUD endpoints for ClassGroup (with schedule, teacher, capacity) | M |
| 4.7 | Endpoint: list class groups with occupancy count | S |
| 4.8 | Frontend: modality and level configuration page | M |
| 4.9 | Frontend: class group management page | M |

---

### Phase 5 — Plans & Enrollments

| # | Item | Complexity |
|---|------|-----------|
| 5.1 | Create Plan entity and migration | S |
| 5.2 | Create Enrollment entity and migration | M |
| 5.3 | CRUD endpoints for Plan | M |
| 5.4 | Enrollment creation endpoint (validate capacity, link plan + class groups) | L |
| 5.5 | Enrollment lifecycle endpoints (suspend, cancel, reactivate) | M |
| 5.6 | Endpoint: list enrollments for a student | S |
| 5.7 | Endpoint: list students enrolled in a class group | S |
| 5.8 | Frontend: plan configuration page | M |
| 5.9 | Frontend: enrollment creation flow (select student → plan → class group) | L |
| 5.10 | Frontend: enrollment list and status management | M |

---

### Phase 6 — Financial Management

| # | Item | Complexity |
|---|------|-----------|
| 6.1 | Create Charge entity and migration | S |
| 6.2 | Create Payment entity and migration | S |
| 6.3 | Manual charge generation endpoint (from enrollment) | M |
| 6.4 | Payment recording endpoint | M |
| 6.5 | Endpoint: list charges with filters (status, date range, student) | M |
| 6.6 | Endpoint: list overdue charges | S |
| 6.7 | Frontend: charge list and filtering page | M |
| 6.8 | Frontend: payment recording modal | M |
| 6.9 | Frontend: financial summary view | M |

---

### Phase 7 — Attendance

| # | Item | Complexity |
|---|------|-----------|
| 7.1 | Create Attendance entity and migration | S |
| 7.2 | Bulk attendance recording endpoint (teacher submits a class session) | M |
| 7.3 | Endpoint: attendance history for a student | S |
| 7.4 | Endpoint: attendance summary for a class group on a date | S |
| 7.5 | Frontend: attendance recording page (teacher view) | M |
| 7.6 | Frontend: attendance history view (admin/secretary) | M |

---

### Phase 8 — Guardian/Student Portal

| # | Item | Complexity |
|---|------|-----------|
| 8.1 | Guardian login flow (create User for guardian with GUARDIAN role) | M |
| 8.2 | Adult student login flow (create User with STUDENT role) | M |
| 8.3 | Portal dashboard: linked children overview (guardian) | M |
| 8.4 | Portal: view class schedule | M |
| 8.5 | Portal: view attendance history | S |
| 8.6 | Portal: view financial status (charges + payments) | M |
| 8.7 | Frontend: portal layout (separate from admin layout) | M |

---

### Phase 9 — Dashboard & Reports (Basic)

| # | Item | Complexity |
|---|------|-----------|
| 9.1 | Endpoint: key metrics (active students, revenue, overdue count) | M |
| 9.2 | Endpoint: enrollment trend (last 6 months) | M |
| 9.3 | Endpoint: class occupancy rates | S |
| 9.4 | Frontend: admin dashboard with metric cards and charts | L |

---

### Future Phases (Post-MVP)

| Phase | Focus |
|-------|-------|
| 10 | Evaluations & Progress tracking |
| 11 | Notification system (in-app + email via Resend) |
| 12 | Stripe payment integration |
| 13 | Automated charge generation from plan rules |
| 14 | Reports export (PDF, Excel) |
| 15 | Mobile app (React Native) |

---

*This document serves as the complete Week 1 foundation for KaminFit. It should be reviewed, refined, and updated as development progresses. All architectural decisions documented here are starting points — they should evolve based on real implementation experience.*
