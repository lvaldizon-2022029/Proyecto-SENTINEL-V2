import { RecordEntity } from "./types";

export interface AgendaCharla extends RecordEntity {
  idAgendaCharlas: number;
  ciudadanoId?: number;
  especialistaId?: number;
  fechahoraAgendaCharlas?: string;
  fecha?: string;
  estadoAgendaCharlas?: string;
  estado?: string;
  ciudadano?: Record<string, unknown>;
  especialista?: Record<string, unknown>;
}
