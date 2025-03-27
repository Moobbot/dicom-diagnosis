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
        // Phân loại và xử lý lỗi cụ thể
        if (error instanceof Error) {
            if (error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT')) {
                logger.error("Can't connect to the database:", error);
                throw new Error('DATABASE_CONNECTION_ERROR');
            }
        }
        // Log the error and terminate the application
        logger.error("Error during bootstrap:", error);
        throw error; // Chuyển lỗi lên để server.ts xử lý
    }
};
