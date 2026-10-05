import { despachoEmergenciasRepository } from "../data/DespachoEmergenciasRepository";
import { ResourceService } from "./resource.service";
export class DespachoEmergenciasService extends ResourceService { constructor() { super(despachoEmergenciasRepository); } }
export const despachoEmergenciasService = new DespachoEmergenciasService();
