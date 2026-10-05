import { RecordEntity } from "./types";

export interface DespachoEmergencia extends RecordEntity {
  idDespachoEmergencias: number;
  unidadidDespachoEmergencias?: string;
  fechahoraDespachoEmergencias?: string;
  alertaId?: number;
  estacionId?: number;
  unidad?: string;
  alerta?: Record<string, unknown>;
  estacion?: Record<string, unknown>;
}
