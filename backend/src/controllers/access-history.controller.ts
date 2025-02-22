import { Request, Response } from "express";
import { AccessHistoryService } from "../services/access-history.service";
import { FindQuerySchema } from "../validation/find-query.validation";

export class AccessHistoryController {
    private readonly accessHistoryService: AccessHistoryService;

    constructor() {
        this.accessHistoryService = new AccessHistoryService();
    }

    listAllAccessHistory = async (req: Request, res: Response) => {
        try {
            const validatedQuery = FindQuerySchema.parse(req.query);

            const { total, history } =
                await this.accessHistoryService.listAllAccessHistory(
                    validatedQuery
                );

            const { page, limit } = validatedQuery;

            res.status(200).json({
                page,
                limit,
                total,
                pages: limit ? Math.ceil(total / limit) : undefined,
                data: history,
                success: true,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: (error as Error).message,
            });
        }
    };
}
