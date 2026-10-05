import { especialistasRepository } from "../data/EspecialistasRepository";
import { ResourceService } from "./resource.service";
export class EspecialistasService extends ResourceService { constructor() { super(especialistasRepository); } }
export const especialistasService = new EspecialistasService();
