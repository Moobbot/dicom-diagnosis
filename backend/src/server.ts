import express, { Express } from "express";
import { Server, createServer } from "http";
import { logger } from "./config/logger";
import { validateEnv } from "./config/env.config";
import mongoose from "mongoose";
import { bootstrap } from "./bootstrap";
import { deleteExpiredFolders } from "./jobs/cronjobs";

let isShuttingDown = false; // Prevent multiple shutdown calls

// Exit handler to gracefully shut down the server
const exitHandler = async (server: Server | null) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    try {
        if (server) {
            await new Promise<void>((resolve) => server.close(() => resolve()));
            logger.info("HTTP server closed");
        }
        await mongoose.connection.close();
        logger.info("Database connection closed");
        process.exit(0);
    } catch (error) {
        logger.error("Error during shutdown: ", error);
        process.exit(1);
    }
};

// Error handler for unexpected exceptions or rejections
const unExpectedErrorHandler = (server: Server) => {
    return (error: Error) => {
        logger.error("Unexpected error: ", error);
        exitHandler(server);
    };
};

const startServer = async () => {
    const app: Express = express();

    try {
        // Initialize app configurations
        await bootstrap(app);

        // Create HTTP server
        const httpServer = createServer(app);
        const port = validateEnv()!.port;

        // Start listening
        const server: Server = httpServer.listen(port, () => {
            logger.info(`Server listening on port ${port}`);
        });

        // Handle process events for graceful shutdown
        process.on("uncaughtException", unExpectedErrorHandler(server));
        process.on("unhandledRejection", unExpectedErrorHandler(server));
        process.on("SIGTERM", () => {
            logger.info("SIGTERM received. Closing server...");
            exitHandler(server);
        });

        // Cải thiện xử lý lỗi database
        mongoose.connection.on("error", (err) => {
            logger.error(`Database error: ${err.message}`);
            console.log(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`);

            // Thử kết nối lại nếu mất kết nối
            if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
                logger.info('Attempting to reconnect to database...');
                mongoose.connect(validateEnv()!.MONGO_DB_URI).catch((reconnectError) => {
                    logger.error('Reconnection failed:', reconnectError);
                });
            }
        });

    } catch (error) {
        if (error instanceof Error && error.message === 'DATABASE_CONNECTION_ERROR') {
            logger.error('Can not start server because of database connection error');
            process.exit(1);
        }
        logger.error("Failed to start server: ", error);
        process.exit(1);
    }

    deleteExpiredFolders.start();
};

// Run the server
startServer().catch((error) => {
    logger.error("Failed to start server: ", error);
    process.exit(1);
});
