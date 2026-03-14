-- CreateTable
CREATE TABLE "students" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "person_id" UUID NOT NULL,
    "registration_code" VARCHAR(50),
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guardians" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "person_id" UUID NOT NULL,
    "is_financial_responsible" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "guardians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guardian_student_links" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "guardian_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "relationship_type" VARCHAR(30) NOT NULL,
    "is_primary_contact" BOOLEAN NOT NULL DEFAULT false,
    "is_financial_responsible" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "guardian_student_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "students_tenant_id_idx" ON "students"("tenant_id");

-- CreateIndex
CREATE INDEX "students_tenant_id_status_idx" ON "students"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "students_tenant_id_registration_code_idx" ON "students"("tenant_id", "registration_code");

-- CreateIndex
CREATE UNIQUE INDEX "students_tenant_id_person_id_key" ON "students"("tenant_id", "person_id");

-- CreateIndex
CREATE INDEX "guardians_tenant_id_idx" ON "guardians"("tenant_id");

-- CreateIndex
CREATE INDEX "guardians_tenant_id_is_financial_responsible_idx" ON "guardians"("tenant_id", "is_financial_responsible");

-- CreateIndex
CREATE UNIQUE INDEX "guardians_tenant_id_person_id_key" ON "guardians"("tenant_id", "person_id");

-- CreateIndex
CREATE INDEX "guardian_student_links_tenant_id_idx" ON "guardian_student_links"("tenant_id");

-- CreateIndex
CREATE INDEX "guardian_student_links_guardian_id_idx" ON "guardian_student_links"("guardian_id");

-- CreateIndex
CREATE INDEX "guardian_student_links_student_id_idx" ON "guardian_student_links"("student_id");

-- CreateIndex
CREATE INDEX "guardian_student_links_tenant_id_is_primary_contact_idx" ON "guardian_student_links"("tenant_id", "is_primary_contact");

-- CreateIndex
CREATE INDEX "guardian_student_links_tenant_id_is_financial_responsible_idx" ON "guardian_student_links"("tenant_id", "is_financial_responsible");

-- CreateIndex
CREATE UNIQUE INDEX "guardian_student_links_tenant_id_guardian_id_student_id_key" ON "guardian_student_links"("tenant_id", "guardian_id", "student_id");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardians" ADD CONSTRAINT "guardians_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardians" ADD CONSTRAINT "guardians_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardian_student_links" ADD CONSTRAINT "guardian_student_links_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardian_student_links" ADD CONSTRAINT "guardian_student_links_guardian_id_fkey" FOREIGN KEY ("guardian_id") REFERENCES "guardians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardian_student_links" ADD CONSTRAINT "guardian_student_links_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
