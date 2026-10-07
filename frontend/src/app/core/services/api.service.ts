import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { apiConfig } from "../config/api.config";

export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

export interface Emergency {
  idCatalogoEmergencias?: number;
  nombreCatalogoEmergencias?: string;
  prioridadCatalogoEmergencias?: string;
}

export interface Alert {
  id: number;
  ciudadanoId: number;
  emergenciaId: number;
  latitud: number;
  longitud: number;
  estado: string;
  esSilenciosa: boolean;
  fecha: string;
  ultimaActualizacion: string;
  usuario?: { idUsers: number; nombreUsers: string; emailUsers: string };
  emergencia?: { idCatalogoEmergencias: number; nombreCatalogoEmergencias: string; prioridadCatalogoEmergencias: string };
}

export interface DashboardStats {
  usuarios: number;
  alertas: number;
  alertasPendientes: number;
  despachos: number;
}

export interface UserVitalData {
  id: number;
  idUser: number;
  grupoSanguineo: string;
  alergias: string;
  enfermedadesCronicas: string;
  contactoEmergencia: string;
}

export interface UserProfile {
  idUsers: number;
  nombreUsers: string;
  emailUsers: string;
  rolUsers: string;
  fotoUrl?: string | null;
}

export interface DiarioEntry {
  id: number;
  userId: number;
  titulo: string;
  contenido: string;
  fechaRegistro: string;
  fechaCreacion: string;
}

export interface AiResponse {
  respuesta: string;
}

@Injectable({ providedIn: "root" })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = apiConfig.baseUrl;

  getAlerts(page = 1, limit = 20, search = ""): Observable<Paginated<Alert>> {
    const params = new HttpParams({ fromObject: { page, limit, search } });
    return this.http.get<Paginated<Alert>>(`${this.baseUrl}/Sentinel/Alertas`, { params });
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(
      `${this.baseUrl}/Sentinel/Dashboard/estadisticas`
    );
  }

  collection<T>(path: string, params?: Record<string, string | number>): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`, { params: params as Record<string, string> });
  }

  create<T>(path: string, payload: Record<string, unknown>): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, payload);
  }

  update<T>(path: string, id: number, payload: Record<string, unknown>): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}/${id}`, payload);
  }

  remove(path: string, id: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}${path}/${id}`);
  }

  triggerAlert(payload: Record<string, unknown>): Observable<{ status: string; message: string; idAlerta: number; datos: Alert }> {
    return this.http.post<{ status: string; message: string; idAlerta: number; datos: Alert }>(`${this.baseUrl}/Sentinel/Alertas/disparar`, payload);
  }

  disableAlert(idAlerta: number, pin: string): Observable<{ status: string; message: string }> {
    return this.http.post<{ status: string; message: string }>(`${this.baseUrl}/Sentinel/Alertas/desactivar`, { idAlerta, pin });
  }

  askAi(mode: "medical" | "wellbeing", userId: number, prompt: string): Observable<AiResponse> {
    return this.http.post<AiResponse>(`${this.baseUrl}/Sentinel/AI/${mode === "medical" ? "consultar" : "bienestar"}`, { userId, prompt });
  }

  diary(userId: number): Observable<DiarioEntry[]> {
    return this.http.get<DiarioEntry[]>(`${this.baseUrl}/Sentinel/Diario/historial/${userId}`);
  }

  saveDiary(payload: Record<string, unknown>): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/Sentinel/Diario/guardar`, payload);
  }

  updateDiary(id: number, payload: Record<string, unknown>): Observable<unknown> {
    return this.http.put(`${this.baseUrl}/Sentinel/Diario/actualizar/${id}`, payload);
  }

  deleteDiary(id: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/Sentinel/Diario/eliminar/${id}`);
  }

  getUser(id: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/Sentinel/Users/${id}`);
  }

  updateUser(id: number, payload: Record<string, unknown>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.baseUrl}/Sentinel/Users/${id}`, payload);
  }

  getVitalData(id: number): Observable<UserVitalData & { exists?: boolean; ultimaActualizacion?: string; fechaActualizacion?: string }> {
    return this.http.get<UserVitalData & { exists?: boolean; ultimaActualizacion?: string; fechaActualizacion?: string }>(`${this.baseUrl}/Sentinel/VitalData/${id}`);
  }

  createVitalData(payload: Record<string, unknown>): Observable<UserVitalData> {
    return this.http.post<UserVitalData>(`${this.baseUrl}/Sentinel/VitalData`, payload);
  }

  updateVitalData(id: number, payload: Record<string, unknown>): Observable<UserVitalData> {
    return this.http.put<UserVitalData>(`${this.baseUrl}/Sentinel/VitalData/${id}`, payload);
  }

  confirmAgenda(id: number): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/Sentinel/AgendaCharlas/${id}/confirmar`, {});
  }
}
