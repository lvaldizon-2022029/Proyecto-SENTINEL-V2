import { RecordEntity } from "./types";

export interface Estacion extends RecordEntity {
  idEstaciones: number;
  nombreEstaciones?: string;
  tipoentidadid?: number;
  ubicacionlatEstaciones?: number;
  ubicacionlngEstaciones?: number;
  direccionEstaciones?: string;
  telefonoEstaciones?: string;
  nombre?: string;
  entidadId?: number;
  latitud?: number;
  longitud?: number;
  direccion?: string;
  telefono?: string;
  tipoEntidad?: Record<string, unknown>;
}
