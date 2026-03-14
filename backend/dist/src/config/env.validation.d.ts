declare enum Environment {
    Development = "development",
    Staging = "staging",
    Production = "production"
}
declare class EnvironmentVariables {
    NODE_ENV: Environment;
    PORT: number;
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    FRONTEND_URL: string;
    BCRYPT_SALT_ROUNDS: number;
    LOG_LEVEL: string;
}
export declare function validate(config: Record<string, unknown>): EnvironmentVariables;
export {};
