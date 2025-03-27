import { z } from "zod";

import { IAccessHistory } from "../interfaces/access-history.interface";

import { AccessHistoryRepository } from "../repositories/access-history.repository";

import { buildSearchFilter, buildSortQuery } from "../utils/util";

import { FindQuerySchema } from "../validation/find-query.validation";

export class AccessHistoryService {
    private readonly accessHistoryRepository: AccessHistoryRepository;

    constructor() {
        this.accessHistoryRepository = new AccessHistoryRepository();
    }

    // Tạo mới một lịch sử truy cập
    async createAccessHistory(accessData: Partial<IAccessHistory>) {
        const createdHistory = await this.accessHistoryRepository.create(
            accessData
        );
        return {
            success: true,
            data: createdHistory,
        };
    }

    // Liệt kê tất cả lịch sử truy cập với phân trang và bộ lọc
    async listAllAccessHistory(query: z.infer<typeof FindQuerySchema>) {
        const { search, sort, page, limit } = query;
        const filter = buildSearchFilter(
            search,
        );

        const sortOptions = buildSortQuery(sort);

        const total = await this.accessHistoryRepository.count(filter);

        const history = await this.accessHistoryRepository.findAll(
            filter,
            sortOptions,
            page,
            limit
        );
        return { total, history };
    }
}
