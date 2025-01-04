import { connect, set, connection } from "mongoose";
import { validateEnv } from "./env.config";
import { logger } from "./logger";

const MONGO_DB_URI = validateEnv()?.MONGO_DB_URI;

// Connect to MongoDB
export const connectToDB = async () => {
    try {
        // Disable strict query mode to avoid warnings in Mongoose 7+
        set("strictQuery", false);

        // Establish connection
        const db = await connect(MONGO_DB_URI!);
        logger.info(`MongoDB connected to ${db.connection.name}`);

        // Handle Mongoose events
        connection.on("connected", () => {
            logger.info("Mongoose connection is established.");
        });

        connection.on("error", (err) => {
            logger.error("Mongoose connection error:", err);
        });

        connection.on("disconnected", () => {
            logger.warn("Mongoose connection is disconnected.");
        });

        // For a clean shutdown
        process.on("SIGINT", async () => {
            await connection.close();
            logger.info("Mongoose connection closed due to application termination.");
            process.exit(0);
        });

    } catch (error) {
        logger.error("Failed to connect to MongoDB:", error);
        process.exit(1); // Exit the application on critical failure
    }
};