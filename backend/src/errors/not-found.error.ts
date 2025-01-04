import HttpException from "./http-exception.error";

class NotFoundError extends HttpException {
    constructor(message: string) {
        super(message, 404, null);
    }
}

export default NotFoundError;
