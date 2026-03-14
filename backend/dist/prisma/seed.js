"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL não definida no ambiente.');
}
const pool = new pg_1.Pool({
    connectionString: databaseUrl,
});
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({
    adapter,
});
async function main() {
    console.log('Iniciando seed...');
    const tenant = await prisma.tenant.upsert({
        where: { slug: 'academia-teste' },
        update: {},
        create: {
            name: 'Academia Teste GKFit',
            slug: 'academia-teste',
            document: '12.345.678/0001-90',
            email: 'contato@academiateste.com',
            phone: '(34) 99999-0000',
            addressCity: 'Uberlândia',
            addressState: 'MG',
            isActive: true,
            subscriptionStatus: 'active',
        },
    });
    console.log(`Tenant criado: ${tenant.name} (${tenant.id})`);
    const adminPerson = await prisma.person.upsert({
        where: {
            id: '00000000-0000-0000-0000-000000000001',
        },
        update: {},
        create: {
            id: '00000000-0000-0000-0000-000000000001',
            tenantId: tenant.id,
            fullName: 'Administrador da Academia',
            email: 'dono@academiateste.com',
            phone: '(34) 99999-1111',
            cpf: '111.222.333-44',
        },
    });
    console.log(`Person criada: ${adminPerson.fullName}`);
    const passwordHash = await bcrypt.hash('Admin@123', 12);
    const platformAdmin = await prisma.user.upsert({
        where: { email: 'admin@gkfitsystem.com' },
        update: {},
        create: {
            email: 'admin@gkfitsystem.com',
            passwordHash,
            role: 'PLATFORM_ADMIN',
            tenantId: null,
            personId: null,
            isActive: true,
        },
    });
    console.log(`PLATFORM_ADMIN criado: ${platformAdmin.email}`);
    const tenantAdmin = await prisma.user.upsert({
        where: { email: 'dono@academiateste.com' },
        update: {},
        create: {
            email: 'dono@academiateste.com',
            passwordHash,
            role: 'TENANT_ADMIN',
            tenantId: tenant.id,
            personId: adminPerson.id,
            isActive: true,
        },
    });
    console.log(`TENANT_ADMIN criado: ${tenantAdmin.email}`);
    const secretaryPerson = await prisma.person.upsert({
        where: {
            id: '00000000-0000-0000-0000-000000000002',
        },
        update: {},
        create: {
            id: '00000000-0000-0000-0000-000000000002',
            tenantId: tenant.id,
            fullName: 'Secretária Teste',
            email: 'secretaria@academiateste.com',
            phone: '(34) 99999-2222',
        },
    });
    await prisma.user.upsert({
        where: { email: 'secretaria@academiateste.com' },
        update: {},
        create: {
            email: 'secretaria@academiateste.com',
            passwordHash,
            role: 'SECRETARY',
            tenantId: tenant.id,
            personId: secretaryPerson.id,
            isActive: true,
        },
    });
    console.log('SECRETARY criado: secretaria@academiateste.com');
    const teacherPerson = await prisma.person.upsert({
        where: {
            id: '00000000-0000-0000-0000-000000000003',
        },
        update: {},
        create: {
            id: '00000000-0000-0000-0000-000000000003',
            tenantId: tenant.id,
            fullName: 'Professor Teste',
            email: 'professor@academiateste.com',
            phone: '(34) 99999-3333',
        },
    });
    await prisma.user.upsert({
        where: { email: 'professor@academiateste.com' },
        update: {},
        create: {
            email: 'professor@academiateste.com',
            passwordHash,
            role: 'TEACHER',
            tenantId: tenant.id,
            personId: teacherPerson.id,
            isActive: true,
        },
    });
    console.log('TEACHER criado: professor@academiateste.com');
    console.log('\n✅ Seed concluído com sucesso!');
    console.log('\nCredenciais de teste:');
    console.log('  PLATFORM_ADMIN: admin@gkfitsystem.com / Admin@123');
    console.log('  TENANT_ADMIN:   dono@academiateste.com / Admin@123');
    console.log('  SECRETARY:      secretaria@academiateste.com / Admin@123');
    console.log('  TEACHER:        professor@academiateste.com / Admin@123');
}
main()
    .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
});
//# sourceMappingURL=seed.js.map