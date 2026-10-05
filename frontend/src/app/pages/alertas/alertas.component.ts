import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/services/api.service";
import { ResourceComponent } from "../resource/resource.component";

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ResourceComponent],
  template: `<header class="glass-header"><div class="topbar"><div class="brand-row"><div class="module-icon amber">♢</div><div><div class="module-kicker amber-text">SENTINEL • MONITOR</div><div class="module-title">Gestión de Alertas</div></div></div><a class="user-status" href="/">Panel principal</a></div></header><main class="page-shell"><section class="clinical-card page-card"><div class="page-heading"><div><h1>Registro de incidentes</h1><p style="color:#b45309">Monitoreo y respuesta en tiempo real</p></div><button style="background:#fbbf24;color:#0f172a" (click)="trigger()">+ Nueva alerta</button></div><div class="field"><label>Ubicación y tipo de emergencia</label><div class="resource-form"><input type="number" [(ngModel)]="alert.ciudadanoId" placeholder="ID ciudadano"><input type="number" [(ngModel)]="alert.emergenciaId" placeholder="ID emergencia"><input type="number" [(ngModel)]="alert.latitud" placeholder="Latitud"><input type="number" [(ngModel)]="alert.longitud" placeholder="Longitud"></div></div><p class="success" *ngIf="message">{{ message }}</p><p class="error" *ngIf="error">{{ error }}</p></section><app-resource /></main>`,
  selector: "sentinel-alertas"
})
export class AlertasComponent {
  private readonly api = inject(ApiService);
  alert = { ciudadanoId: 1, emergenciaId: 1, latitud: 14.6349, longitud: -90.5069 };
  message = ""; error = "";
  trigger(): void { this.api.triggerAlert(this.alert).subscribe({ next: () => this.message = "Alerta procesada correctamente.", error: (e) => this.error = e.error?.error ?? "No se pudo disparar la alerta." }); }
}
