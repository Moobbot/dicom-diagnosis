import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import ExpressMongoSanitize from "express-mongo-sanitize";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { corsOptions } from "./cors-options";
import { logger } from "./morgan";

export const configureMiddleware = (app: express.Express) => {
    // Logging - Log requests
    app.use(logger);

    // Security middlewares
    app.use(ExpressMongoSanitize());
    // Bỏ đã sử dụng successHandler và errorHandler - chỉ sử dụng khi ở môi trường develop
    app.use(morgan("dev"));
    app.use(helmet());
    //Tính năng đã được tích hợp sẵn.
    // app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
    // Tính năng đã được tích hợp sẵn trong helmet từ version 4
    // app.use(helmet.xssFilter());
    app.use(helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'trusted-cdn.com'"],
            objectSrc: ["'none'"],
        },
    }));

    // CORS
    app.use(cors(corsOptions));

    // Parsing and cookies middlewares
    app.use(express.json({ limit: "10mb" }));
    app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
    app.use(cookieParser());
};
