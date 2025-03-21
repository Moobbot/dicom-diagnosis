import { FilterQuery, Query, Types } from "mongoose";
import { BaseRepository } from "../../../repositories/base.repository";
import { IPatient } from "../interfaces/patient.interface";
import { PatientModel } from "../models/patient.model";
import { IFolder } from "../interfaces/folder.interface";
import { IPrediction } from "../interfaces/prediction.interface";

export class PatientRepository extends BaseRepository<IPatient> {
    constructor() {
        super(PatientModel);
    }

    findExtendedPatients = (
        filter: FilterQuery<IPatient> = {},
        sort?: Record<string, 1 | -1>,
        page?: number,
        limit?: number
    ) => {
        const query = super.findAll(
            filter,
            { createdAt: -1, ...sort }, // Default sort by createdAt desc
            page,
            limit
        );

        return query.populate<{ folder: IFolder; prediction: IPrediction }>([
            "folder",
            "prediction",
        ]);
    };

    findExtendedPatientById = (id: string) => {
        const query = super.findById(id);

        return query.populate<{
            folder: IFolder & { _id: Types.ObjectId };
            prediction: IPrediction & { _id: Types.ObjectId };
        }>(["folder", "prediction"]);
    };

    findPatientByFolderId = (folderId: string) => {
        return PatientModel.findOne({
            folder: folderId,
        });
    };
}
