import { RecordEntity } from "./types";

export interface CatalogoEntidad extends RecordEntity {
  idCatalogoEntidades: number;
  nombreCatalogoEntidades?: string;
  nombre?: string;
}
