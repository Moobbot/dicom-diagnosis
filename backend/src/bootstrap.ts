import { Express } from "express";
import { bootstrapExpress } from "./app";
import { logger } from "./config/logger";
import { validateEnv } from "./config/env.config";
import { connectToDB } from "./config/mongoose";

// Ensure environment variables are validated early
validateEnv();

export const bootstrap = async (app: Express) => {
    try {
        // Connect to the database
        await connectToDB();

        // Initialize Express app
        bootstrapExpress(app);

        // Log the completion of bootstrap
        logger.info("Express app initiated.");
    } catch (error) {
        // Log the error and terminate the application
        logger.error("Error during bootstrap:", error);
        process.exit(1); // Ensure the application does not run in an unstable state
    }
};;
