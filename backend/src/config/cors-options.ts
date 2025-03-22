import cors from "cors";

const FE_BASE_URL = process.env.FE_BASE_URL;

// List of allowed origins
const allowedOrigins: string[] = [
    "http://localhost:3000",
    ...(FE_BASE_URL ? [FE_BASE_URL] : []),
];
// console.log("Allowed Frontend URL 2:", allowedOrigins); // Debugging

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
            callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
        }
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    credentials: true, // Allow credentials (e.g., cookies)
    optionsSuccessStatus: 200, // Set success status for OPTIONS preflight
};
