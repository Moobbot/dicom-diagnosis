import { Schema, model } from "mongoose";
import { IDetailUser, IUser } from "../interfaces/user.interface";
import { Gender } from "../enums/gender.enum";

const detailSchema = new Schema<IDetailUser>(
    {
        user_code: { type: String, required: [true, "User code is required"] },
        name: { type: String, required: [true, "Name is required"] },
        avatar: { type: String, default: null },
        birth_date: { type: Date, required: [true, "Birth date is required"] },
        address: { type: String, required: [true, "Address is required"] },
        gender: {
            type: Number,
            enum: Object.values(Gender),
            required: [true, "Gender is required"],
        },
    },
    { _id: false }
);

const userSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            select: false,
        },
        roles: [{ type: Schema.Types.ObjectId, ref: "Role" }],
        createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
        updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
        status: { type: Boolean, default: true },
        refreshToken: { type: String, default: null, select: false },
        detail_user: { type: detailSchema, required: true },
    },
    { timestamps: true }
);

export const UserModel = model<IUser>("User", userSchema);