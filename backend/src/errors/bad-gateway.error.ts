import HttpException from "./http-exception.error";

class BadGatewayError extends HttpException {
    constructor(message: string) {
        super(message, 502, null);
    }
}

export default BadGatewayError;
