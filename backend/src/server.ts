import express, { Express } from "express";
import { Server, createServer } from "http";
import { logger } from "./config/logger";
import { validateEnv } from "./config/env.config";
import mongoose from "mongoose";
import { bootstrap } from "./bootstrap";

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

    // Handle database connection errors
    mongoose.connection.on("error", (err) => {
        logger.error(`Database error: ${err.message}`);
        console.log(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`);
    });
};

// Run the server
startServer().catch((error) => {
    logger.error("Failed to start server: ", error);
    process.exit(1);
});
