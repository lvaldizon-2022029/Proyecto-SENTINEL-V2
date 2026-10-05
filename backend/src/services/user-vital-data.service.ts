import { userVitalDataRepository } from "../data/UserVitalDataRepository";
import { ResourceService } from "./resource.service";
export class UserVitalDataService extends ResourceService { constructor() { super(userVitalDataRepository); } }
export const userVitalDataService = new UserVitalDataService();
