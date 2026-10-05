import { staffAutoridadRepository } from "../data/StaffAutoridadRepository";
import { ResourceService } from "./resource.service";
export class StaffAutoridadService extends ResourceService { constructor() { super(staffAutoridadRepository); } }
export const staffAutoridadService = new StaffAutoridadService();
