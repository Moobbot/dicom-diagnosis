import {
    FilterQuery,
    UpdateQuery,
    Model,
    PopulateOptions,
} from "mongoose";

export class BaseRepository<T> {
    private readonly model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    // Tìm tất cả tài liệu với tùy chọn phân trang và populate
    async findAll(
        filter: FilterQuery<T> = {},
        page?: number,
        limit?: number,
        populateOptions?: PopulateOptions | PopulateOptions[]
    ) {
        try {
            const query = this.model.find(filter);

            // Thêm populate nếu có
            if (populateOptions) {
                query.populate(populateOptions);
            }
            //  else {
            //     query
            //         .populate({ path: "createdBy", select: "id username" })
            //         .populate({ path: "updatedBy", select: "id username" });
            // }

            // Xử lý phân trang
            if (page && limit) {
                const startIndex = (page - 1) * limit;
                query.skip(startIndex).limit(limit);
            }

            return await query.exec();
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error fetching data: ${error.message}`);
            } else {
                throw new Error("An unknown error occurred");
            }
        }
    }

    // Tìm một tài liệu theo ID với tùy chọn populate
    async findById(id: string, populateOptions?: PopulateOptions | PopulateOptions[]) {
        try {
            const query = this.model.findById(id);
            if (populateOptions) {
                query.populate(populateOptions);
            }
            return query.exec();
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error fetching document by ID: ${error.message}`);
            } else {
                throw new Error("An unknown error occurred");
            }
        }
    }

    async findByIds(ids: string[]) {
        try {
            const query = this.model.find({ _id: { $in: ids } });
            return query.exec();
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error fetching document by ID: ${error.message}`);
            } else {
                throw new Error("An unknown error occurred");
            }
        }
    }
    async create(data: Partial<T>) {
        try {
            return this.model.create(data);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error creating document: ${error.message}`);
            } else {
                throw new Error("An unknown error occurred");
            }
        }
    }
    async createMany(data: Partial<T>[]) {
        try {
            return this.model.insertMany(data);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error creating document: ${error.message}`);
            } else {
                throw new Error("An unknown error occurred");
            }
        }
    }

    async updateById(id: string, update: UpdateQuery<T>) {
        try {
            return this.model.findByIdAndUpdate(id, update, {
                new: true,
            }).exec();
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error updating document by ID: ${error.message}`);
            } else {
                throw new Error("An unknown error occurred");
            }
        }
    }
    updateByIds(ids: string[], update: UpdateQuery<T>) {
        try {
            return this.model.updateMany({ _id: { $in: ids } }, update).exec();
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error updating document by ID: ${error.message}`);
            } else {
                throw new Error("An unknown error occurred");
            }
        }
    }

    async deleteById(id: string) {
        try {
            return this.model.deleteOne({ _id: id }).exec();
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error deleting document by ID: ${error.message}`);
            } else {
                throw new Error("An unknown error occurred");
            }
        }
    }

    async count(filter: FilterQuery<T> = {}) {
        try {
            return this.model.countDocuments(filter);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error counting documents: ${error.message}`);
            } else {
                throw new Error("An unknown error occurred");
            }
        }
    }
}
