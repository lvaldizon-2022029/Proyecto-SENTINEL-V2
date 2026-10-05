import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { apiConfig } from "../config/api.config";

export interface Session {
  token: string;
  idUsers: number;
  nombreUsers: string;
  emailUsers: string;
  rolUsers: string;
  fotoUrl?: string | null;
}

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
}
