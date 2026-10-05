import { RecordEntity } from "./types";

export interface Especialista extends RecordEntity {
  userid?: number;
  especialidad?: string;
  biografia?: string;
}
