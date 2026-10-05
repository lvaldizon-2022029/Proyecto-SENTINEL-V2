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
}

export interface RecordEntity {
  id: number;
  [key: string]: unknown;
}

export interface AuthenticatedRequest {
  user?: Pick<User, "idUsers" | "emailUsers" | "rolUsers">;
}
