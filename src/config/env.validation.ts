import { plainToInstance } from "class-transformer";
import { IsNotEmpty, IsString, IsOptional, validate } from "class-validator";

export class EnvironmentVariables {
  @IsNotEmpty({ message: "DATABASE_URL é obrigatório" })
  @IsString()
  DATABASE_URL: string;

  @IsNotEmpty({ message: "JWT_SECRET é obrigatório" })
  @IsString()
  JWT_SECRET: string;

  @IsNotEmpty({ message: "GEMINI_API_KEY é obrigatório" })
  @IsString()
  GEMINI_API_KEY: string;

  @IsOptional()
  @IsString()
  NODE_ENV: string = "development";

  @IsOptional()
  @IsString()
  PORT: string = "3000";

  @IsOptional()
  @IsString()
  FRONTEND_URL: string = "http://localhost:3000";

  @IsOptional()
  @IsString()
  LOG_LEVEL: string = "info";

  @IsOptional()
  @IsString()
  SUPABASE_URL: string = "";

  @IsOptional()
  @IsString()
  SUPABASE_KEY: string = "";

  @IsOptional()
  @IsString()
  GOOGLE_CREDENTIALS: string = "";
}

export async function validateEnv(config: Record<string, any>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = await validate(validatedConfig);

  if (errors.length > 0) {
    const message = errors
      .map(
        (err) =>
          `${err.property}: ${Object.values(err.constraints || {}).join(", ")}`,
      )
      .join("\n");

    console.error("❌ Variáveis de ambiente inválidas:");
    console.error(message);
    throw new Error(`Validação de environment falhou`);
  }

  console.log("✅ Variáveis de ambiente validadas com sucesso");
  return validatedConfig;
}
