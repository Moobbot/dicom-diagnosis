import express, { Express } from "express";
import rootRouter from "./routes/index.route";
import notFoundMiddleware from "./middleware/notFound.middleware";
import errorHandlerMiddleware from "./middleware/error-handler.middleware";
import { configureMiddleware } from "./config/middleware";
import path from "path";

export const bootstrapExpress = (app: Express) => {
    // Configure middlewares
    configureMiddleware(app);

    // Static files
    app.use("/results", express.static(path.join(__dirname, "/modules/LCRD/tmp/results")));

    // Setup routes
    app.use("/api/", rootRouter);

    // Not found and error handling
    app.use(notFoundMiddleware);
    app.use(errorHandlerMiddleware);
};
