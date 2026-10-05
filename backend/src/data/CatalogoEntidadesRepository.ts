import { BaseRepository } from "./base.repository";
import { CatalogoEntidad } from "../models/CatalogoEntidades";
export class CatalogoEntidadesRepository extends BaseRepository<CatalogoEntidad> { constructor() { super("catalogoEntidades"); } }
export const catalogoEntidadesRepository = new CatalogoEntidadesRepository();
