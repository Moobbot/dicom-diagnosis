import { Express } from "express";
import rootRouter from "./routes/index.route";
import notFoundMiddleware from "./middleware/notFound.middleware";
import errorHandlerMiddleware from "./middleware/error-handler.middleware";
import { configureMiddleware } from "./config/middleware";

export const bootstrapExpress = (app: Express) => {
    // Configure middlewares
    configureMiddleware(app);

    // Setup routes
    app.use("/api/", rootRouter);

    // Not found and error handling
    app.use(notFoundMiddleware);
    app.use(errorHandlerMiddleware);
};
