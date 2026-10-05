import { catalogoEntidadesRepository } from "../data/CatalogoEntidadesRepository";
import { ResourceService } from "./resource.service";
export class CatalogoEntidadesService extends ResourceService { constructor() { super(catalogoEntidadesRepository); } }
export const catalogoEntidadesService = new CatalogoEntidadesService();
