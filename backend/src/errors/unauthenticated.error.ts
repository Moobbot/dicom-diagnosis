import HttpException from "./http-exception.error";

class UnauthenticatedError extends HttpException {
    constructor(message: string) {
        super(message, 401, null);
    }
}
export default UnauthenticatedError;
