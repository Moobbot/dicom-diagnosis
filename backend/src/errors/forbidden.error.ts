import HttpException from "./http-exception.error";

class ForbiddenError extends HttpException {
    constructor(message: string) {
        super(message, 403, null);
    }
}

export default ForbiddenError;
