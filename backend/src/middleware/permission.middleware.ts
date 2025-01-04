import { Request, Response, NextFunction } from "express";
import ForbiddenError from "../errors/forbidden.error";

// Check if user has required permissions
const hasRequiredPermissions = (
    userPermissions: Set<string> | undefined,
    requiredPermissions: string[],
    type: "AND" | "OR"
): boolean => {
    if (!userPermissions) return false;

    if (type === "OR") {
        return requiredPermissions.some((permission) =>
            userPermissions.has(permission)
        );
    } else {
        return requiredPermissions.every((permission) =>
            userPermissions.has(permission)
        );
    }
};

export const permissionMiddleware = (
    permissions: string[],
    type: "AND" | "OR" = "AND" // Mặc định là "AND"
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Bypass if user has grantAll permission
            if (req.userData?.grantAll) {
                return next();
            }

            // Validate user permissions
            const hasPermission = hasRequiredPermissions(
                req.userData?.permissions,
                permissions,
                type
            );

            if (!hasPermission) {
                return next(new ForbiddenError("You don't have required permission"));
            }

            next();
        } catch (error) {
            next(error); // Forward any unexpected errors
        }
    };
};