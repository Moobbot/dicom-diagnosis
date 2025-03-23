import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
const { format, createLogger, transports } = winston;
const { printf, combine, timestamp, colorize, uncolorize, errors, json } = format;

// Get environment
const nodeEnv = process.env.NODE_ENV || "development";

// Custom format cho console
const consoleFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
    const metaStr = Object.keys(metadata).length ? `\nMetadata: ${JSON.stringify(metadata, null, 2)}` : '';
    return `${timestamp} [${level.toUpperCase()}]: ${stack || message}${metaStr}`;
});

// Custom format cho file
const fileFormat = printf(({ level, message, timestamp, ...metadata }) => {
    return JSON.stringify({
        timestamp,
        level: level.toUpperCase(),
        message,
        ...metadata
    });
});

// Tạo transport cho file logs
const fileTransport = new DailyRotateFile({
    filename: 'logs/%DATE%-error.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error',
});

const combinedFileTransport = new DailyRotateFile({
    filename: 'logs/%DATE%-combined.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
});
const combinedFileExceptions = new DailyRotateFile({
    filename: 'logs/%DATE%-exceptions.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
});

const combinedFileRejections = new DailyRotateFile({
    filename: 'logs/%DATE%-rejections.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
});
// Create logger
export const logger = createLogger({
    level: nodeEnv === "development" ? "debug" : "info",
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        nodeEnv === "development" ? combine(colorize(), consoleFormat) : combine(uncolorize(), fileFormat)
    ),
    transports: [
        // Console transport
        new transports.Console({
            format: combine(
                colorize(),
                consoleFormat
            )
        }),

        // File transports
        ...(nodeEnv === "production" ? [fileTransport, combinedFileTransport] : [])
    ],
    // Xử lý lỗi của logger
    exceptionHandlers: [
        combinedFileExceptions
    ],
    // Xử lý rejection của Promise
    rejectionHandlers: [
        combinedFileRejections
    ],
    // Không dừng process khi có uncaught exception
    exitOnError: false
});

// Thêm các helper methods
export const logError = (message: string, error?: any, metadata?: any) => {
    logger.error({
        message,
        error: error?.message || error,
        stack: error?.stack,
        ...metadata
    });
};

export const logWarning = (message: string, metadata?: any) => {
    logger.warn({
        message,
        ...metadata
    });
};

export const logInfo = (message: string, metadata?: any) => {
    logger.info({
        message,
        ...metadata
    });
};

export const logAccess = (req: any, message: string) => {
    logger.info({
        type: 'ACCESS',
        method: req.method,
        url: req.originalUrl,
        message,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
};
