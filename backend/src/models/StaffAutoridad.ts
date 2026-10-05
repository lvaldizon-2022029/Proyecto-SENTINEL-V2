import { RecordEntity } from "./types";

export interface StaffAutoridad extends RecordEntity {
  idStaffAutoridad: number;
  rangoStaffAutoridad?: string;
  estatusStaffAutoridad?: string;
  estacionId?: number;
  rango?: string;
  estatus?: string;
  userId?: number;
  estacion?: Record<string, unknown>;
  user?: Record<string, unknown>;
}
