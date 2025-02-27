import { z } from "zod";

export const FindQuerySchema = z.object({
    page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : undefined))
        .refine((val) => val === undefined || val > 0, {
            message: "Page must be greater than 0",
        }),
    limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : undefined))
        .refine((val) => val === undefined || val > 0, {
            message: "Limit must be greater than 0",
        }),
    sort: z
        .string()
        .optional()
        .transform((val) =>
            val ? val.split(",").map((item) => item.trim()) : undefined
        ),
    search: z.string().optional(),
});
