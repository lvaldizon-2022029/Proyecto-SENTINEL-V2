import { BaseRepository } from "./base.repository";
import { DespachoEmergencia } from "../models/DespachoEmergencias";
export class DespachoEmergenciasRepository extends BaseRepository<DespachoEmergencia> { constructor() { super("despachos"); } }
export const despachoEmergenciasRepository = new DespachoEmergenciasRepository();
