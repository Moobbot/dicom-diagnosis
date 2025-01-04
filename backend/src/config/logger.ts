import winston from "winston";
const { format, createLogger, transports } = winston;
const { printf, combine, timestamp, colorize, uncolorize } = format;

// Get environment
const nodeEnv = process.env.NODE_ENV || "development";

// Define log format
const winstonFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp}: ${level}: ${stack || message}`;
});

// Create logger
export const logger = createLogger({
    level: nodeEnv === "development" ? "debug" : "info",
    format: combine(
        timestamp(), // Add timestamp
        winstonFormat, // Custom log format
        nodeEnv === "development" ? colorize() : uncolorize() // Colorize only in development
    ),
    transports: [
        new transports.Console(), // Always log to console
        ...(nodeEnv === "production"
            ? [
                new transports.File({
                    filename: "logs/error.log",
                    level: "error",
                }),
                new transports.File({
                    filename: "logs/combined.log",
                }),
            ]
            : []),
    ],
});
