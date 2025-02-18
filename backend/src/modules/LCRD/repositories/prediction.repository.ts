import { BaseRepository } from "../../../repositories/base.repository";
import { IPrediction } from "../interfaces/prediction.interface";
import { PredictionModel } from "../models/prediction.model";

export class PredictionRepository extends BaseRepository<IPrediction> {
    constructor() {
        super(PredictionModel);
    }

    getPredictionBySessionId = (session_id: string) => {
        return PredictionModel.findOne({ session_id });
    };
}
