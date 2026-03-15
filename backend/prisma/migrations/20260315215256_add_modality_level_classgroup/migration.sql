-- CreateTable
CREATE TABLE "modalities" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "modalities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "levels" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "modality_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "color" VARCHAR(7),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_groups" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "modality_id" UUID NOT NULL,
    "level_id" UUID,
    "teacher_id" UUID,
    "name" VARCHAR(150) NOT NULL,
    "days_of_week" VARCHAR(30) NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "location" VARCHAR(100),
    "max_capacity" INTEGER NOT NULL DEFAULT 20,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "class_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "modalities_tenant_id_idx" ON "modalities"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "modalities_tenant_id_name_key" ON "modalities"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "levels_tenant_id_idx" ON "levels"("tenant_id");

-- CreateIndex
CREATE INDEX "levels_tenant_id_modality_id_idx" ON "levels"("tenant_id", "modality_id");

-- CreateIndex
CREATE UNIQUE INDEX "levels_tenant_id_modality_id_name_key" ON "levels"("tenant_id", "modality_id", "name");

-- CreateIndex
CREATE INDEX "class_groups_tenant_id_idx" ON "class_groups"("tenant_id");

-- CreateIndex
CREATE INDEX "class_groups_tenant_id_modality_id_idx" ON "class_groups"("tenant_id", "modality_id");

-- CreateIndex
CREATE INDEX "class_groups_tenant_id_is_active_idx" ON "class_groups"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "class_groups_teacher_id_idx" ON "class_groups"("teacher_id");

-- AddForeignKey
ALTER TABLE "modalities" ADD CONSTRAINT "modalities_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "levels" ADD CONSTRAINT "levels_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "levels" ADD CONSTRAINT "levels_modality_id_fkey" FOREIGN KEY ("modality_id") REFERENCES "modalities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_groups" ADD CONSTRAINT "class_groups_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_groups" ADD CONSTRAINT "class_groups_modality_id_fkey" FOREIGN KEY ("modality_id") REFERENCES "modalities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_groups" ADD CONSTRAINT "class_groups_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_groups" ADD CONSTRAINT "class_groups_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
