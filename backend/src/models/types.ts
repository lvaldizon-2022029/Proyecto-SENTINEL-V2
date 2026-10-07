export type Role = "USER" | "STAFF" | "ADMIN";

export interface User {
  idUsers: number;
  nombreUsers: string;
  emailUsers: string;
  contrasenaUsers: string;
  rolUsers: Role;
  pinemergenciaUsers: string;
  fechaCreacion: string;
  fotoUrl: string | null;
  [key: string]: unknown;
}

export type EstadoAlerta = "PENDIENTE" | "DESPACHADA" | "EN_PROCESO" | "RESUELTA" | "CANCELADA";

export interface Alerta {
  id: number;
  idAlertas: number;
  ciudadanoId?: number;
  emergenciaId?: number;
  latitud?: number;
  longitud?: number;
  estado?: EstadoAlerta;
  estadoAlertas?: EstadoAlerta;
  esSilenciosa?: boolean;
  essilenciosaAlertas?: number;
  fecha?: string;
  fechaAlertas?: string;
  ultimaActualizacion?: string;
  usuario?: { idUsers: number; nombreUsers: string; emailUsers: string };
  emergencia?: { idCatalogoEmergencias: number; nombreCatalogoEmergencias: string; prioridadCatalogoEmergencias: string };
  [key: string]: unknown;
}

export interface CatalogoEmergencia {
  id: number;
  idCatalogoEmergencias: number;
  nombre?: string;
  nombreCatalogoEmergencias?: string;
  prioridad?: string;
  prioridadCatalogoEmergencias?: string;
  [key: string]: unknown;
}

export interface CatalogoEntidad {
  id: number;
  idCatalogoEntidades: number;
  nombre?: string;
  nombreCatalogoEntidades?: string;
  [key: string]: unknown;
}

export interface DespachoEmergencia {
  id: number;
  idDespachoEmergencias: number;
  alertaId?: number;
  estacionId?: number;
  unidad?: string;
  unidadidDespachoEmergencias?: string;
  fecha?: string;
  fechahoraDespachoEmergencias?: string;
  alerta?: { idAlertas: number; estadoAlertas?: string };
  estacion?: { idEstaciones: number; nombreEstaciones?: string };
  [key: string]: unknown;
}

export interface Especialista {
  id: number;
  userid?: number;
  especialidad?: string;
  especialidadEspecialistas?: string;
  biografia?: string;
  biografiaEspecialistas?: string;
  user?: { idUsers: number; nombreUsers: string; emailUsers: string };
  [key: string]: unknown;
}

export interface Estacion {
  id: number;
  idEstaciones: number;
  nombre?: string;
  nombreEstaciones?: string;
  entidadId?: number;
  tipoentidadid?: number;
  latitud?: number;
  longitud?: number;
  ubicacionlatEstaciones?: number;
  ubicacionlngEstaciones?: number;
  direccion?: string;
  direccionEstaciones?: string;
  telefono?: string;
  telefonoEstaciones?: string;
  tipoEntidad?: { idCatalogoEntidades: number; nombreCatalogoEntidades?: string };
  [key: string]: unknown;
}

export interface StaffAutoridad {
  id: number;
  idStaffAutoridad: number;
  rango?: string;
  rangoStaffAutoridad?: string;
  estatus?: string;
  estatusStaffAutoridad?: string;
  estacionId?: number;
  userId?: number;
  user?: { idUsers: number; nombreUsers: string };
  estacion?: { idEstaciones: number; nombreEstaciones?: string };
  [key: string]: unknown;
}

export interface AgendaCharla {
  id: number;
  idAgendaCharlas: number;
  ciudadanoId?: number;
  especialistaId?: number;
  fecha?: string;
  fechahoraAgendaCharlas?: string;
  estado?: string;
  estadoAgendaCharlas?: string;
  ciudadano?: { idUsers: number; nombreUsers: string };
  especialista?: { userid: number; especialidadEspecialistas?: string };
  [key: string]: unknown;
}

export interface UserVitalData {
  id: number;
  idUser?: number;
  grupoSanguineo?: string;
  gruposanguineoUser?: string;
  alergias?: string;
  alergiasUser?: string;
  enfermedadesCronicas?: string;
  enfermedadescronicasUser?: string;
  contactoEmergencia?: string;
  contactoemergenciaUser?: string;
  user?: { idUsers: number; nombreUsers: string; emailUsers: string; fotoUrl: string | null };
  [key: string]: unknown;
}

export interface Diario {
  id: number;
  userId?: number;
  titulo?: string;
  contenido?: string;
  fechaRegistro?: string;
  fecha_registro?: string;
  fechaCreacion?: string;
  fecha_creacion?: string;
  [key: string]: unknown;
}

export interface RecordEntity {
  id: number;
  [key: string]: unknown;
}

export interface AuthenticatedRequest {
  user?: Pick<User, "idUsers" | "emailUsers" | "rolUsers">;
}

export interface ApiResponse<T = unknown> {
  datos?: T;
  mensaje?: string;
  error?: string;
  status?: string;
  message?: string;
  idAlerta?: number;
  exists?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}
