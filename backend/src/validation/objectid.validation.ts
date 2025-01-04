import { Types } from "mongoose";
import { object, string, TypeOf, date, boolean, number } from "zod";

export const idSchema = object({
    id: string({ required_error: "ID is required" }).refine(
        (val) => Types.ObjectId.isValid(val),
        { message: "Invalid ID" }
    ),
});
