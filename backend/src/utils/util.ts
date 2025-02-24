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
};

// Generate log filename with current date
export const getFormattedDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}_${month}_${day}`;
};

export const buildSortQuery = (sort?: string[]) => {
    if (sort) {
        const sortOptions: Record<string, 1 | -1> = {};
        sort.forEach((field) => {
            if (field.startsWith("-")) {
                sortOptions[field.substring(1)] = -1; // Giảm dần
            } else {
                sortOptions[field] = 1; // Tăng dần
            }
        });
        return sortOptions;
    }
};

export function buildSearchFilter(
    searchQuery?: string,
    fuzzyFields: string[] = [], // Tìm kiếm gần đúng (sử dụng $regex)
    exactMatchFields: Record<string, any> = {}, // Tìm kiếm chính xác (bằng giá trị)
    dateRange?: { field: string; from?: Date; to?: Date }
): Record<string, any> {
    let filter: Record<string, any> = {};

    // Xử lý tìm kiếm gần đúng với $regex
    if (searchQuery && fuzzyFields.length > 0) {
        filter.$or = fuzzyFields.map((field) => ({
            [field]: { $regex: searchQuery, $options: "i" },
        }));
    }

    // Xử lý tìm kiếm chính xác hoặc tìm kiếm nhiều giá trị ($in)
    Object.entries(exactMatchFields).forEach(([field, value]) => {
        if (Array.isArray(value) && value.length > 0) {
            filter[field] = { $in: value };
        } else if (value !== undefined && value !== null) {
            filter[field] = value;
        }
    });

    // Lọc theo khoảng ngày (từ `from_date` đến `to_date`)
    if (dateRange?.from || dateRange?.to) {
        filter[dateRange.field] = {
            ...(dateRange.from && { $gte: dateRange.from }),
            ...(dateRange.to && { $lte: dateRange.to }),
        };
    }

    return filter;
}
