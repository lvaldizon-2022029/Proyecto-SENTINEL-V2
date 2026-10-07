import { BaseRepository } from "./base.repository";
import { UserVitalData } from "../models/UserVitalData";
export class UserVitalDataRepository extends BaseRepository<UserVitalData> { constructor() { super("vitalData"); } }
export const userVitalDataRepository = new UserVitalDataRepository();
