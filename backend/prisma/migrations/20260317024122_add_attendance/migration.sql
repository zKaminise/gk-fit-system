-- CreateTable
CREATE TABLE "attendances" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "class_group_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "attendance_date" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "recorded_by_user_id" UUID,
    "notes" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attendances_tenant_id_idx" ON "attendances"("tenant_id");

-- CreateIndex
CREATE INDEX "attendances_tenant_id_class_group_id_attendance_date_idx" ON "attendances"("tenant_id", "class_group_id", "attendance_date");

-- CreateIndex
CREATE INDEX "attendances_tenant_id_student_id_idx" ON "attendances"("tenant_id", "student_id");

-- CreateIndex
CREATE INDEX "attendances_tenant_id_class_group_id_idx" ON "attendances"("tenant_id", "class_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_tenant_id_class_group_id_student_id_attendance__key" ON "attendances"("tenant_id", "class_group_id", "student_id", "attendance_date");

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_class_group_id_fkey" FOREIGN KEY ("class_group_id") REFERENCES "class_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_recorded_by_user_id_fkey" FOREIGN KEY ("recorded_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
