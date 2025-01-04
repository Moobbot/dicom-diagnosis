import { existsSync, mkdirSync } from "fs";
import morgan from "morgan";
import path from "path";
import { createStream } from "rotating-file-stream";
import { validateEnv } from "./env.config";
import { Request } from "express";
import { getFormattedDate } from "../utils/util"

const nodeEnv = validateEnv()?.env || "development";

// Determine log format based on environment
const getIPFormat = () => (nodeEnv === "production" ? ":remote-addr - " : "");

// Ensure the logs directory exists
const logsDir = process.env.LOG_DIR || path.join(__dirname, "..", "logs");
if (!existsSync(logsDir)) {
    mkdirSync(logsDir);
}

// Log rotation stream (rotate logs daily)
const accessLogStream = createStream(`${getFormattedDate()}_access.log`, {
    interval: "1d", // Rotate logs daily
    path: logsDir,
});

// Token tùy chỉnh để ghi lỗi
morgan.token("error", (req: Request) => {
    return req.errorMessage || "-"; // `req.errorMessage` sẽ được thêm trong middleware lỗi
});

// Unified log format
const logFormat = `${getIPFormat()} :method :url :status :response-time ms - :res[content-length] :user-agent :error`;

// Unified handler (log both success and error with a single format)
const unifiedHandler = morgan(logFormat, {
    stream: accessLogStream,
});

// Console logging for development
if (nodeEnv === "development") {
    console.log("Development environment: Logging requests to console.");
    morgan(logFormat, { skip: () => false }); // Log tất cả request ra console
}
export { unifiedHandler as logger };
