import { estacionesRepository } from "../data/EstacionesRepository";
import { ResourceService } from "./resource.service";
export class EstacionesService extends ResourceService { constructor() { super(estacionesRepository); } }
export const estacionesService = new EstacionesService();
