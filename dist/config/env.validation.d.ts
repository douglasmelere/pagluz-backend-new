export declare class EnvironmentVariables {
    DATABASE_URL: string;
    JWT_SECRET: string;
    GEMINI_API_KEY: string;
    NODE_ENV: string;
    PORT: string;
    FRONTEND_URL: string;
    LOG_LEVEL: string;
    SUPABASE_URL: string;
    SUPABASE_KEY: string;
    GOOGLE_CREDENTIALS: string;
}
export declare function validateEnv(config: Record<string, any>): Promise<EnvironmentVariables>;
