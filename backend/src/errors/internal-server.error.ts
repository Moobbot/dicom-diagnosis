import HttpException from "./http-exception.error";

class InternalServerError extends HttpException {
    constructor(message: string) {
        super(message, 500, null);
    }
}

export default InternalServerError;
