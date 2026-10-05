import { RecordEntity } from "./types";

export interface Diario extends RecordEntity {
  fecha_creacion?: string;
  fecha_registro?: string;
  userId?: number;
  titulo?: string;
  contenido?: string;
  fechaRegistro?: string;
}
