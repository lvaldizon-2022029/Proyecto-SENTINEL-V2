import { RecordEntity } from "./types";

export type EstadoAlerta = "PENDIENTE" | "DESPACHADA" | "EN_PROCESO" | "RESUELTA" | "CANCELADA";

export interface Alerta extends RecordEntity {
  idAlertas: number;
  ciudadanoId?: number;
  emergenciaId?: number;
  ubicacionlatAlertas?: number;
  ubicacionlngAlertas?: number;
  latitud?: number;
  longitud?: number;
  estadoAlertas?: EstadoAlerta;
  essilenciosaAlertas?: number;
  esSilenciosa?: boolean | number;
  fechaAlertas?: string;
  ultimaActualizacion?: string;
  usuario?: Record<string, unknown>;
  emergencia?: Record<string, unknown>;
}
