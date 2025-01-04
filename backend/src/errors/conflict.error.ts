import HttpException from "./http-exception.error";

class ConflictError extends HttpException {
    constructor(msg: string) {
        super(msg, 409, null);
    }
}

export default ConflictError;
