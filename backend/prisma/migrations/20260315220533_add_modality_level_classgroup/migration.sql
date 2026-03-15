-- AlterTable
ALTER TABLE "levels" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "levels_tenant_id_is_active_idx" ON "levels"("tenant_id", "is_active");
