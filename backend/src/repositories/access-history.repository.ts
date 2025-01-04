import { IAccessHistory } from "../interfaces/access-history.interface";
import { AccessHistoryModel } from "../models/access-history.model";
import { BaseRepository } from "./base.repository";

export class AccessHistoryRepository extends BaseRepository<IAccessHistory> {
    constructor() {
        super(AccessHistoryModel);
    }
}
