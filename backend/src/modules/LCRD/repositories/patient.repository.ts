import { BaseRepository } from "../../../repositories/base.repository";
import { IPatient } from "../interfaces/patient.interface";
import { PatientModel } from "../models/patient.model";

export class PatientRepository extends BaseRepository<IPatient> {
    constructor() {
        super(PatientModel);
    }
}
