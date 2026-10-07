import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/services/api.service";
import { AuthService } from "../../core/services/auth.service";

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `<header class="glass-header"><div class="topbar"><div class="brand-row"><div class="module-icon amber">♢</div><div><div class="module-kicker amber-text">SENTINEL • MONITOR</div><div class="module-title">Gestión de Alertas</div></div></div><a class="user-status" href="/">Panel principal</a></div></header><main class="page-shell"><section class="clinical-card page-card"><div class="page-heading"><div><h1>Registro de incidentes</h1><p style="color:#b45309">Monitoreo y respuesta en tiempo real</p></div></div><form (ngSubmit)="trigger()" class="alert-form"><div class="field"><label>Tipo de emergencia *</label><input type="number" [(ngModel)]="alert.emergenciaId" name="emergenciaId" placeholder="ID emergencia" required min="1"></div><div class="field"><label>Latitud *</label><input type="number" [(ngModel)]="alert.latitud" name="latitud" placeholder="Latitud" required step="any" min="-90" max="90"></div><div class="field"><label>Longitud *</label><input type="number" [(ngModel)]="alert.longitud" name="longitud" placeholder="Longitud" required step="any" min="-180" max="180"></div><div class="field checkbox-field"><label><input type="checkbox" [(ngModel)]="alert.esSilenciosa" name="esSilenciosa"> Alerta silenciosa (pánico)</label></div><button type="submit" class="btn-primary" [disabled]="loading || !isFormValid()">{{ loading ? "Enviando..." : "+ Disparar alerta" }}</button></form><p class="success" *ngIf="message">{{ message }}</p><p class="error" *ngIf="error">{{ error }}</p></section><section class="clinical-card page-card"><div class="page-heading"><h2>Mis alertas recientes</h2></div><div *ngIf="userAlerts.length === 0" class="empty">No tienes alertas registradas.</div><div *ngFor="let alert of userAlerts" class="alert-item"><div><strong>Alerta #{{ alert.idAlertas || alert.id }}</strong> <span class="badge" [class.active]="alert.estadoAlertas === 'PENDIENTE' || alert.estadoAlertas === 'ACTIVA'">{{ alert.estadoAlertas || 'PENDIENTE' }}</span></div><small>Emergencia: {{ alert.emergenciaId }} | {{ alert.fechaAlertas | date:'short' }}</small></div></section></main>`,
  selector: "sentinel-alertas",
  styles: [`
    .alert-form { display: grid; gap: 12px; margin-top: 16px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label { font-weight: 600; font-size: 13px; }
    .field input[type="number"] { padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; }
    .field input[type="number"]:invalid { border-color: #ef4444; }
    .checkbox-field { flex-direction: row; align-items: center; gap: 8px; }
    .checkbox-field label { font-weight: 500; cursor: pointer; }
    .btn-primary { padding: 12px 24px; background: #fbbf24; color: #0f172a; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .success { color: #16a34a; margin-top: 12px; font-weight: 500; }
    .error { color: #dc2626; margin-top: 12px; font-weight: 500; }
    .alert-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; margin-top: 8px; background: #fff; }
    .badge { padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #fef3c7; color: #92400e; }
    .badge.active { background: #dcfce7; color: #166534; }
    .empty { color: #9ca3af; text-align: center; padding: 24px; }
  `]
})
export class AlertasComponent {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  alert = { emergenciaId: null as number | null, latitud: null as number | null, longitud: null as number | null, esSilenciosa: false };
  message = ""; error = ""; loading = false;
  userAlerts: any[] = [];

  ngOnInit(): void {
    this.loadUserAlerts();
  }

  isFormValid(): boolean {
    return this.alert.emergenciaId !== null && this.alert.latitud !== null && this.alert.longitud !== null;
  }

  trigger(): void {
    if (!this.isFormValid()) { this.error = "Completa todos los campos obligatorios."; return; }
    const session = this.auth.session();
    if (!session) { this.error = "Sesión no válida."; return; }
    this.loading = true; this.error = ""; this.message = "";
    const payload = { ...this.alert, ciudadanoId: session.idUsers, infoExtra: "SENTINEL ALERTAS MODULE", esSilenciosa: this.alert.esSilenciosa ? 1 : 0 };
    this.api.triggerAlert(payload).subscribe({
      next: () => { this.message = "Alerta procesada correctamente."; this.loading = false; this.resetForm(); this.loadUserAlerts(); this.changeDetector.detectChanges(); },
      error: (e) => { this.error = e.error?.error ?? "No se pudo disparar la alerta."; this.loading = false; this.changeDetector.detectChanges(); }
    });
  }

  resetForm(): void {
    this.alert = { emergenciaId: null, latitud: null, longitud: null, esSilenciosa: false };
  }

  loadUserAlerts(): void {
    this.api.getAlerts().subscribe({
      next: (value) => { const items = Array.isArray(value) ? value : value.data; const userId = this.auth.session()?.idUsers; this.userAlerts = (items as any[]).filter((item) => Number(item.ciudadanoId ?? item.usuario?.idUsers ?? item.usuario?.id) === userId); this.changeDetector.detectChanges(); },
      error: () => { this.userAlerts = []; this.changeDetector.detectChanges(); }
    });
  }
}
