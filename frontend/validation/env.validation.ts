import { z } from "zod";

// Schema for environment variables
export const EnvSchema = z.object({
    NEXT_PUBLIC_API_BASE_URL: z
        .string({ required_error: "NEXT_PUBLIC_API_BASE_URL is required" })
        .url("NEXT_PUBLIC_API_BASE_URL must be a valid URL"),

    NEXT_PUBLIC_LOGIN_PAGE: z.string({
        required_error: "NEXT_PUBLIC_LOGIN_PAGE is required",
    }),

    PORT: z
        .string({ required_error: "PORT is required" })
        .regex(/^\d+$/, "PORT must be a valid number"),

    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    NEXT_PUBLIC_DEBUG: z
        .string({ required_error: "NEXT_PUBLIC_DEBUG is required" })
        .transform((value) => value === "true"), // Convert to boolean
});

// Infer TypeScript type for validated environment variables
export type EnvConfig = z.infer<typeof EnvSchema>;