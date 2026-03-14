"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3000),
    database: {
        url: process.env.DATABASE_URL ?? '',
    },
    jwt: {
        secret: process.env.JWT_SECRET ?? '',
        expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    },
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    bcrypt: {
        saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS ?? 12),
    },
    logLevel: process.env.LOG_LEVEL ?? 'debug',
});
//# sourceMappingURL=configuration.js.map