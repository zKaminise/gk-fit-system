declare const _default: () => {
    nodeEnv: string;
    port: number;
    database: {
        url: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    frontendUrl: string;
    bcrypt: {
        saltRounds: number;
    };
    logLevel: string;
};
export default _default;
