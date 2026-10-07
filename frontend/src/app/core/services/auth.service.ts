import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { apiConfig } from "../config/api.config";

export type Role = "USER" | "STAFF" | "ADMIN";

export interface Session {
  token: string;
  idUsers: number;
  nombreUsers: string;
  emailUsers: string;
  rolUsers: Role;
  fotoUrl?: string | null;
}

const ROUTE_ROLES: Record<string, { read: Role[]; write: Role[] }> = {
  "/Sentinel/Alertas": { read: ["USER", "STAFF", "ADMIN"], write: ["STAFF", "ADMIN"] },
  "/Sentinel/Users": { read: ["ADMIN"], write: ["ADMIN"] },
  "/Sentinel/Especialistas": { read: ["ADMIN"], write: ["ADMIN"] },
  "/Sentinel/DespachosEmergencia": { read: ["STAFF", "ADMIN"], write: ["STAFF", "ADMIN"] },
  "/Sentinel/DespachoEmergencias": { read: ["STAFF", "ADMIN"], write: ["STAFF", "ADMIN"] },
  "/Sentinel/despachos": { read: ["STAFF", "ADMIN"], write: ["STAFF", "ADMIN"] },
  "/Sentinel/AgendaCharlas": { read: ["STAFF", "ADMIN"], write: ["STAFF", "ADMIN"] },
  "/Sentinel/agenda-charlas": { read: ["STAFF", "ADMIN"], write: ["STAFF", "ADMIN"] },
  "/Sentinel/CatalogoEmergencias": { read: ["USER", "STAFF", "ADMIN"], write: ["ADMIN"] },
  "/Sentinel/catalogo-emergencias": { read: ["USER", "STAFF", "ADMIN"], write: ["ADMIN"] },
  "/Sentinel/CatalogoEntidades": { read: ["ADMIN"], write: ["ADMIN"] },
  "/Sentinel/catalogo-entidades": { read: ["ADMIN"], write: ["ADMIN"] },
  "/Sentinel/Estaciones": { read: ["STAFF", "ADMIN"], write: ["ADMIN"] },
  "/Sentinel/estaciones": { read: ["STAFF", "ADMIN"], write: ["ADMIN"] },
  "/Sentinel/StaffAutoridad": { read: ["STAFF", "ADMIN"], write: ["ADMIN"] },
  "/Sentinel/staff-autoridad": { read: ["STAFF", "ADMIN"], write: ["ADMIN"] },
  "/Sentinel/VitalData": { read: ["USER", "ADMIN"], write: ["USER", "ADMIN"] },
};

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly api = apiConfig.baseUrl;
  readonly session = signal<Session | null>(this.readSession());

  constructor(private readonly http: HttpClient) {}

  login(emailUsers: string, contrasenaUsers: string): Observable<Session> {
    return this.http.post<Session>(`${this.api}/Sentinel/Auth/login`, { emailUsers, contrasenaUsers })
      .pipe(tap((session) => {
        localStorage.setItem("sentinel-session", JSON.stringify(session));
        this.session.set(session);
      }));
  }

  register(data: { nombreUsers: string; emailUsers: string; contrasenaUsers: string; pinemergenciaUsers?: string }): Observable<unknown> {
    return this.http.post(`${this.api}/Sentinel/Auth/register`, data);
  }

  logout(): void {
    localStorage.removeItem("sentinel-session");
    this.session.set(null);
  }

  private readSession(): Session | null {
    const value = localStorage.getItem("sentinel-session");
    return value ? JSON.parse(value) as Session : null;
  }

  hasRole(roles: Role[]): boolean {
    const s = this.session();
    return s ? roles.includes(s.rolUsers) : false;
  }

  isAdmin(): boolean {
    return this.hasRole(["ADMIN"]);
  }

  isStaff(): boolean {
    return this.hasRole(["STAFF", "ADMIN"]);
  }

  canRead(path: string): boolean {
    const s = this.session();
    if (!s) return false;
    const config = ROUTE_ROLES[path];
    return config ? config.read.includes(s.rolUsers) : false;
  }

  canWrite(path: string): boolean {
    const s = this.session();
    if (!s) return false;
    const config = ROUTE_ROLES[path];
    return config ? config.write.includes(s.rolUsers) : false;
  }

  getRequiredRoles(path: string): { read: Role[]; write: Role[] } | null {
    return ROUTE_ROLES[path] ?? null;
  }
}
