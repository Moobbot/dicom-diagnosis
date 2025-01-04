import {
  object,
  string,
  array,
  date,
  enum as zenum,
  coerce,
  TypeOf,
  union,
  boolean,
} from "zod";

export const CreateUserSchema = object({
  username: string({ required_error: "Name is required" }),
  password: string({ required_error: "Password is required" }).min(
    6,
    "Password must be at least 6 characters"
  ),
  roles: array(string()).min(1, "At least one role is required"),
  detail_user: object({
    user_code: string({ required_error: "User code is required" }),
    name: string({ required_error: "Name is required" }),
    birth_date: coerce.date({ required_error: "Birth date is required" }),
    address: string({ required_error: "Address is required" }),
    gender: zenum(["Male", "Female", "Other"], {
      required_error: "Gender is required",
    }),
  }),
});

export const UpdateUserSchema = object({
  password: string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  roles: array(string()).min(1, "At least one role is required").optional(),
  detail_user: object({
    user_code: string(),
    name: string(),
    birth_date: coerce.date(),
    address: string(),
    gender: zenum(["Male", "Female", "Other"]),
  }).optional(),
});

export const ChangeUserStatusSchema = object({
  status: boolean({ required_error: "Status is required" }),
});

export const ChangeManyUserStatusSchema = object({
  userIds: array(string()).min(1, "At least one user is required"),
  status: boolean({ required_error: "Status is required" }),
});
