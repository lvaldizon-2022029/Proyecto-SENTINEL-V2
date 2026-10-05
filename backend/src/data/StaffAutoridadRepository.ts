import { BaseRepository } from "./base.repository";
import { StaffAutoridad } from "../models/StaffAutoridad";
export class StaffAutoridadRepository extends BaseRepository<StaffAutoridad> { constructor() { super("staffAutoridad"); } }
export const staffAutoridadRepository = new StaffAutoridadRepository();
