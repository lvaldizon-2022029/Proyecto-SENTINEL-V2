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

@Injectable({ providedIn: "root" })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = apiConfig.baseUrl;

  getAlerts(page = 1, limit = 20, search = ""): Observable<Paginated<unknown>> {
    const params = new HttpParams({ fromObject: { page, limit, search } });
    return this.http.get<Paginated<unknown>>(`${this.baseUrl}/Sentinel/Alertas`, { params });
  }

  getDashboardStats(): Observable<{ usuarios: number; alertas: number; alertasPendientes: number; despachos: number }> {
    return this.http.get<{ usuarios: number; alertas: number; alertasPendientes: number; despachos: number }>(
      `${this.baseUrl}/Sentinel/Dashboard/estadisticas`
    );
  }

  collection(path: string, params?: Record<string, string | number>): Observable<unknown> {
    return this.http.get<unknown>(`${this.baseUrl}${path}`, { params: params as Record<string, string> });
  }

  create(path: string, payload: Record<string, unknown>): Observable<unknown> {
    return this.http.post<unknown>(`${this.baseUrl}${path}`, payload);
  }

  update(path: string, id: number, payload: Record<string, unknown>): Observable<unknown> {
    return this.http.put<unknown>(`${this.baseUrl}${path}/${id}`, payload);
  }

  remove(path: string, id: number): Observable<unknown> {
    return this.http.delete<unknown>(`${this.baseUrl}${path}/${id}`);
  }

  triggerAlert(payload: Record<string, unknown>): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/Sentinel/Alertas/disparar`, payload);
  }

  disableAlert(idAlerta: number, pin: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/Sentinel/Alertas/desactivar`, { idAlerta, pin });
  }

  askAi(mode: "medical" | "wellbeing", userId: number, prompt: string): Observable<{ respuesta: string }> {
    return this.http.post<{ respuesta: string }>(`${this.baseUrl}/Sentinel/AI/${mode === "medical" ? "consultar" : "bienestar"}`, { userId, prompt });
  }

  diary(userId: number): Observable<unknown> {
    return this.http.get(`${this.baseUrl}/Sentinel/Diario/historial/${userId}`);
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
}
