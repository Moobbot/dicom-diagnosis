import dotenv from "dotenv";
import { ZodError } from "zod";
import { EnvConfig, EnvSchema } from "../validation/env.validation";

dotenv.config({ path: ".env" });

export const validateEnv = () => {
    try {
        // Parse and validate environment variables
        const envVars: EnvConfig = EnvSchema.parse(process.env);

        // Return validated configuration
        return {
            port: +envVars.PORT,
            env: envVars.NODE_ENV,
            MONGO_DB_URI: envVars.MONGO_DB_URI,
            jwtconfig: {
                accessSecret: envVars.JWT,
                accessExpiration: envVars.JWT_EXPIRATION,
                refreshAccessSecret: envVars.JWT_REFRESH,
                refreshAccessExpiration: envVars.JWT_REFRESH_EXPIRATION,
            },
            //   smtp: {
            //     host: envVars.SMTP_HOST,
            //     port: envVars.SMTP_PORT,
            //     service: envVars.SMTP_SERVICE,
            //     mail: envVars.SMTP_MAIL,
            //     password: envVars.SMTP_PASSWORD,
            //   },
        };
    } catch (error) {
        if (error instanceof ZodError) {
            // Log validation errors and exit
            console.error("Validation failed:", error.errors);
        } else {
            console.error("Error parsing environment variables:", error);
        }

        // Exit the application immediately on invalid configuration
        process.exit(1);
    }
};
