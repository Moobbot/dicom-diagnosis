import dotenv from "dotenv";
import { ZodError } from "zod";
import { EnvConfig, EnvSchema } from "../validation/env.validation";

// Load environment variables
dotenv.config({ path: ".env" }); // Xác nhận rằng file .env đã được đặt đúng

export const validateEnv = () => {
    try {
        // Parse and validate environment variables
        const envVars: EnvConfig = EnvSchema.parse(process.env);
        // console.log("✅ Environment variables loaded and validated:", envVars);


        return {
            port: +envVars.PORT || 3000,
            env: envVars.NODE_ENV || "development",
            debug: envVars.NEXT_PUBLIC_DEBUG,
            apiBaseUrl: envVars.NEXT_PUBLIC_API_BASE_URL,
            loginPage: envVars.NEXT_PUBLIC_LOGIN_PAGE,
        };
    } catch (error) {
        if (error instanceof ZodError) {
            console.error("❌ Validation failed. Missing or invalid environment variables:");
            error.errors.forEach((err) => {
                console.error(`- ${err.path.join(".")}: ${err.message}`);
            });
        } else {
            console.error("❌ Unexpected error parsing environment variables:", error);
        }

        throw new Error("Environment validation failed. Check the console for details.");
    }
};

export const env = validateEnv();
