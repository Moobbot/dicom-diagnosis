import cors from "cors";

// List of allowed origins
const allowedOrigins: string[] = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
];

// Check if origin is allowed
const isOriginAllowed = (origin: string | undefined): boolean => {
    // If no origin (e.g., non-browser requests) or origin is in the list, allow
    return !origin || allowedOrigins.includes(origin);
};

// CORS options
export const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    credentials: true, // Allow credentials (e.g., cookies)
    optionsSuccessStatus: 200, // Set success status for OPTIONS preflight
};
