import {
    FilterQuery,
    UpdateQuery,
    Model,
    PopulateOptions,
    ClientSession,
    QueryOptions,
    Document,
    Types,
} from "mongoose";

export class BaseRepository<T> {
    private readonly model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    // Tìm tất cả tài liệu với tùy chọn phân trang và populate
    findAll(
        filter: FilterQuery<T> = {},
        sort?: Record<string, 1 | -1>,
        page?: number,
        limit?: number
    ) {
        const query = this.model.find(filter);

        // Xử lý sắp xếp
        if (sort) {
            query.sort(sort);
        }

        // Xử lý phân trang
        if (page && limit) {
            const startIndex = (page - 1) * limit;
            query.skip(startIndex).limit(limit);
        }

        query
            .populate({
                path: "created_by",
                select: "id username",
                strictPopulate: false,
            })
            .populate({
                path: "updated_by",
                select: "id username",
                strictPopulate: false,
            });

        return query;
    }

    // Tìm một tài liệu theo ID với tùy chọn populate
    findById(id: string) {
        return this.model.findById(id);
    }

    findByIds(ids: string[]) {
        return this.model.find({ _id: { $in: ids } });
    }

    find(query: FilterQuery<T>, options: QueryOptions = { lean: true }) {
        return this.model.findOne(query, {}, options);
    }

    create(data: Partial<T>) {
        return this.model.create(data);
    }

    createWithTransaction(data: Partial<T>, session: ClientSession) {
        return this.model.create([data], { session });
    }

    createMany(data: Partial<T>[], session?: ClientSession) {
        return this.model.insertMany(data, { session });
    }

    updateById(id: string, update: UpdateQuery<T>, session?: ClientSession) {
        return this.model.findByIdAndUpdate(id, update, {
            new: true,
            session,
        });
    }

    updateByIds(
        ids: string[],
        update: UpdateQuery<T>,
        session?: ClientSession
    ) {
        return this.model.updateMany({ _id: { $in: ids } }, update, {
            session,
        });
    }

    deleteById(id: string, session?: ClientSession) {
        return this.model.deleteOne({ _id: id }, { session });
    }

    count(filter: FilterQuery<T> = {}) {
        return this.model.countDocuments(filter);
    }

    update(filter: FilterQuery<T>, update: UpdateQuery<T>, session?: ClientSession) {
        return this.model.findOneAndUpdate(filter, update, {
            new: true,
            session,
        });
    }
}
