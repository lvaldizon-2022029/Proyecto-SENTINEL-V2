import { RecordEntity } from "./types";

export interface CatalogoEmergencia extends RecordEntity {
  idCatalogoEmergencias: number;
  nombreCatalogoEmergencias?: string;
  prioridadCatalogoEmergencias?: string;
  nombre?: string;
  prioridad?: string;
}
