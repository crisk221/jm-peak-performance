import { z } from "zod";

// Environment variable schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

  // NextAuth Configuration
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NEXTAUTH_SECRET must be at least 32 characters long"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL").optional(),

  // Email Server Configuration
  AUTH_EMAIL_SERVER_HOST: z
    .string()
    .min(1, "AUTH_EMAIL_SERVER_HOST is required"),
  AUTH_EMAIL_SERVER_PORT: z.coerce
    .number()
    .int()
    .min(1)
    .max(65535, "AUTH_EMAIL_SERVER_PORT must be between 1 and 65535"),
  AUTH_EMAIL_SERVER_USER: z
    .string()
    .email("AUTH_EMAIL_SERVER_USER must be a valid email"),
  AUTH_EMAIL_SERVER_PASS: z
    .string()
    .min(1, "AUTH_EMAIL_SERVER_PASS is required"),

  // Environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

// Parse and validate environment variables
function parseEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Environment validation failed:");
    console.error("");

    const missingVars: string[] = [];
    const invalidVars: string[] = [];

    result.error.issues.forEach((issue) => {
      const path = issue.path.join(".");
      const message = issue.message;

      if (issue.code === "invalid_type" && issue.received === "undefined") {
        missingVars.push(`  • ${path}: Missing required environment variable`);
      } else {
        invalidVars.push(`  • ${path}: ${message}`);
      }
    });

    if (missingVars.length > 0) {
      console.error("Missing environment variables:");
      missingVars.forEach((msg) => console.error(msg));
      console.error("");
    }

    if (invalidVars.length > 0) {
      console.error("Invalid environment variables:");
      invalidVars.forEach((msg) => console.error(msg));
      console.error("");
    }

    console.error(
      "Please check your .env file and ensure all required variables are set correctly.",
    );
    console.error("Refer to .env.example for the expected format.");
    console.error("");

    process.exit(1);
  }

  return result.data;
}

// Export validated environment variables
export const env = parseEnv();

// Type for the validated environment
export type Env = typeof env;
