import { Request } from "express";

export const extractTokenFromHeader = (req: Request) => {
    const authHeader =
        req.headers.authorization || (req.headers.Authorization as string);
    if (!authHeader?.startsWith("Bearer ")) {
        return false;
    }
    return authHeader.split(" ")[1];
};

export const extractKeyFromHeader = (req: Request) => {
    return req.headers["api-key"] as string | undefined;
}

// Generate log filename with current date
export const getFormattedDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}_${month}_${day}`;
};