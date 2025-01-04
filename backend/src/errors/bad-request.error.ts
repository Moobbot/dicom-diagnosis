import HttpException from "./http-exception.error";

class BadRequestError extends HttpException {
    constructor(message: string) {
        super(message, 400, null);
    }
}

export default BadRequestError;
