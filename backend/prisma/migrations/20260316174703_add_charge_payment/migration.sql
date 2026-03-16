-- DropIndex
DROP INDEX "enrollment_class_groups_class_group_id_idx";

-- DropIndex
DROP INDEX "enrollment_class_groups_enrollment_id_idx";

-- CreateTable
CREATE TABLE "charges" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "enrollment_id" UUID NOT NULL,
    "payer_person_id" UUID,
    "description" TEXT,
    "amount_cents" INTEGER NOT NULL,
    "paid_amount_cents" INTEGER NOT NULL DEFAULT 0,
    "due_date" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "reference_month" VARCHAR(7),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "charges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "charge_id" UUID NOT NULL,
    "received_by_user_id" UUID NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "payment_date" DATE NOT NULL,
    "payment_method" VARCHAR(30) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "charges_tenant_id_idx" ON "charges"("tenant_id");

-- CreateIndex
CREATE INDEX "charges_tenant_id_enrollment_id_idx" ON "charges"("tenant_id", "enrollment_id");

-- CreateIndex
CREATE INDEX "charges_tenant_id_status_idx" ON "charges"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "charges_tenant_id_due_date_idx" ON "charges"("tenant_id", "due_date");

-- CreateIndex
CREATE INDEX "charges_tenant_id_payer_person_id_idx" ON "charges"("tenant_id", "payer_person_id");

-- CreateIndex
CREATE INDEX "payments_tenant_id_idx" ON "payments"("tenant_id");

-- CreateIndex
CREATE INDEX "payments_tenant_id_charge_id_idx" ON "payments"("tenant_id", "charge_id");

-- CreateIndex
CREATE INDEX "payments_tenant_id_payment_date_idx" ON "payments"("tenant_id", "payment_date");

-- CreateIndex
CREATE INDEX "payments_tenant_id_payment_method_idx" ON "payments"("tenant_id", "payment_method");

-- CreateIndex
CREATE INDEX "payments_tenant_id_received_by_user_id_idx" ON "payments"("tenant_id", "received_by_user_id");

-- CreateIndex
CREATE INDEX "enrollment_class_groups_tenant_id_enrollment_id_idx" ON "enrollment_class_groups"("tenant_id", "enrollment_id");

-- CreateIndex
CREATE INDEX "enrollment_class_groups_tenant_id_class_group_id_idx" ON "enrollment_class_groups"("tenant_id", "class_group_id");

-- AddForeignKey
ALTER TABLE "charges" ADD CONSTRAINT "charges_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charges" ADD CONSTRAINT "charges_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charges" ADD CONSTRAINT "charges_payer_person_id_fkey" FOREIGN KEY ("payer_person_id") REFERENCES "persons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_charge_id_fkey" FOREIGN KEY ("charge_id") REFERENCES "charges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_received_by_user_id_fkey" FOREIGN KEY ("received_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
