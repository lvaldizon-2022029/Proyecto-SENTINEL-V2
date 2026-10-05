import { catalogoEmergenciasRepository } from "../data/CatalogoEmergenciasRepository";
import { ResourceService } from "./resource.service";
export class CatalogoEmergenciasService extends ResourceService { constructor() { super(catalogoEmergenciasRepository); } }
export const catalogoEmergenciasService = new CatalogoEmergenciasService();
