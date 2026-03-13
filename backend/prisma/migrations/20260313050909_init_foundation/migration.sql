-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "document" VARCHAR(20),
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "address_street" VARCHAR(255),
    "address_number" VARCHAR(20),
    "address_complement" VARCHAR(100),
    "address_neighborhood" VARCHAR(100),
    "address_city" VARCHAR(100),
    "address_state" CHAR(2),
    "address_zip" VARCHAR(10),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "subscription_status" VARCHAR(20) NOT NULL DEFAULT 'trial',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "tenant_id" UUID,
    "person_id" UUID,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" VARCHAR(30) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "persons" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "birth_date" DATE,
    "cpf" VARCHAR(14),
    "rg" VARCHAR(20),
    "gender" VARCHAR(1),
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "phone_secondary" VARCHAR(20),
    "address_street" VARCHAR(255),
    "address_number" VARCHAR(20),
    "address_complement" VARCHAR(100),
    "address_neighborhood" VARCHAR(100),
    "address_city" VARCHAR(100),
    "address_state" CHAR(2),
    "address_zip" VARCHAR(10),
    "medical_notes" TEXT,
    "photo_url" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "persons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");

-- CreateIndex
CREATE INDEX "users_tenant_id_role_idx" ON "users"("tenant_id", "role");

-- CreateIndex
CREATE INDEX "persons_tenant_id_idx" ON "persons"("tenant_id");

-- CreateIndex
CREATE INDEX "persons_tenant_id_cpf_idx" ON "persons"("tenant_id", "cpf");

-- CreateIndex
CREATE INDEX "persons_tenant_id_full_name_idx" ON "persons"("tenant_id", "full_name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
