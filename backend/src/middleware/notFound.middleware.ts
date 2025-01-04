import { NextFunction, Request, Response } from "express";
import NotFoundError from "../errors/not-found.error";

const notFoundMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    //   res.status(404);
    const error = new NotFoundError(`🔍 - Not Found - ${req.originalUrl}`);
    next(error);
};

export default notFoundMiddleware;
