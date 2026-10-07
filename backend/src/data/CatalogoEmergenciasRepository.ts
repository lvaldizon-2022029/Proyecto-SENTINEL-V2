import { BaseRepository } from "./base.repository";
import { CatalogoEmergencia } from "../models/CatalogoEmergencias";
export class CatalogoEmergenciasRepository extends BaseRepository<CatalogoEmergencia> { constructor() { super("catalogoEmergencias"); } }
export const catalogoEmergenciasRepository = new CatalogoEmergenciasRepository();
