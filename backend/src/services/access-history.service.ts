import { IAccessHistory } from "../interfaces/access-history.interface";
import { AccessHistoryRepository } from "../repositories/access-history.repository";

export class AccessHistoryService {
    private readonly accessHistoryRepository: AccessHistoryRepository;

    constructor() {
        this.accessHistoryRepository = new AccessHistoryRepository();
    }

    // Tạo mới một lịch sử truy cập
    async createAccessHistory(accessData: Partial<IAccessHistory>) {
        try {
            const createdHistory = await this.accessHistoryRepository.create(accessData);
            return {
                success: true,
                data: createdHistory,
            };
        } catch (error) {
            throw new Error(`Failed to create access history: ${(error as Error).message}`);
        }
    }

    // Liệt kê tất cả lịch sử truy cập với phân trang và bộ lọc
    async listAllAccessHistory(
        page: number,
        limit: number,
        filter: Partial<IAccessHistory> = {}
    ) {
        try {
            const total = await this.accessHistoryRepository.count(filter);

            const history = await this.accessHistoryRepository.findAll(
                filter,
                page,
                limit
            );
            const result = {
                total,
                history,
            };
            return result;
        } catch (error) {
            throw new Error(`Failed to fetch access history: ${(error as Error).message}`);
        }
    }
}
