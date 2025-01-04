import { User } from "@prisma/client";
import { IDetailUser } from "../interfaces/user.interface";
    
export interface UserDataType {
    userId: string;
    username?: string;
    detail_user?: IDetailUser;
    grantAll?: boolean;
    permissions?: Set<string>;
}

declare module "express-serve-static-core" {
    export interface Request {
        userData: UserDataType;
        errorMessage?: string;
    }
}
