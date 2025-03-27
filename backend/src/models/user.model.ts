import { Schema, model } from "mongoose";
import { IDetailUser, IUser } from "../interfaces/user.interface";
import { Gender } from "../enums/gender.enum";

const detailSchema = new Schema<IDetailUser>(
    {
        user_code: { type: String, required: [true, "User code is required"] },
        name: { type: String, required: [true, "Name is required"] },
        avatar: { type: String },
        dob: { type: Date },
        address: { type: String },
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
        created_by: { type: Schema.Types.ObjectId, ref: "User" },
        updated_by: { type: Schema.Types.ObjectId, ref: "User" },
        status: { type: Boolean, default: true },
        refresh_token: { type: String, default: null, select: false },
        detail_user: { type: detailSchema, required: true },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

export const UserModel = model<IUser>("User", userSchema);
