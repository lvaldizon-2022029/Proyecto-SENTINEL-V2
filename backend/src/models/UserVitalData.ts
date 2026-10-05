import { RecordEntity } from "./types";

export interface UserVitalData extends RecordEntity {
  idUser?: number;
  gruposanguineoUser?: string;
  alergiasUser?: string;
  enfermedadescronicasUser?: string;
  contactoemergenciaUser?: string;
  grupoSanguineo?: string;
  alergias?: string;
  enfermedadesCronicas?: string;
  contactoEmergencia?: string;
  user?: Record<string, unknown>;
}
