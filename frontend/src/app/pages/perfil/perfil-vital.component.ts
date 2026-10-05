import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/services/api.service";
import { AuthService } from "../../core/services/auth.service";

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="page-shell">
      <section class="clinical-card page-card profile-card">
        <div class="page-heading"><div><span class="eyebrow">SENTINEL • FICHA CLÍNICA</span><h1>Perfil y datos vitales</h1><p>{{ userName || "Cargando perfil..." }}</p></div><div class="profile-avatar">{{ initials }}</div></div>
        <form (ngSubmit)="save()" class="resource-form">
          <label>Grupo sanguíneo<input name="blood" [(ngModel)]="data.grupoSanguineo" required></label>
          <label>Alergias<textarea name="allergies" [(ngModel)]="data.alergias"></textarea></label>
          <label>Enfermedades crónicas<textarea name="conditions" [(ngModel)]="data.enfermedadesCronicas"></textarea></label>
          <label>Contacto de emergencia<input name="contact" [(ngModel)]="data.contactoEmergencia" required></label>
          <label>Teléfono de emergencia<input name="phone" [(ngModel)]="data.telefonoEmergencia"></label>
          <button class="btn-primary" type="submit" [disabled]="loading">{{ loading ? "Guardando..." : "Guardar ficha médica" }}</button>
        </form>
        <p class="success" *ngIf="message">{{ message }}</p><p class="error" *ngIf="error">{{ error }}</p>
      </section>
    </main>
  `
})
export class PerfilVitalComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  data = { grupoSanguineo: "", alergias: "", enfermedadesCronicas: "", contactoEmergencia: "", telefonoEmergencia: "" };
  userName = ""; initials = "U"; message = ""; error = ""; loading = false; recordExists = false;

  ngOnInit(): void {
    const id = this.auth.session()?.idUsers;
    if (!id) return;
    this.api.collection(`/Sentinel/Users/${id}`).subscribe({ next: (user: any) => { this.userName = user.nombreUsers ?? user.nombre ?? this.auth.session()?.emailUsers ?? ""; this.initials = this.userName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(); } });
    this.api.collection(`/Sentinel/VitalData/${id}`).subscribe({ next: (value: any) => { this.recordExists = value?.exists !== false; this.data = { ...this.data, ...value }; }, error: () => this.error = "No se pudieron cargar los datos vitales." });
  }

  save(): void {
    const idUser = this.auth.session()?.idUsers;
    if (!idUser) return;
    this.loading = true; this.message = ""; this.error = "";
    const request = this.recordExists
      ? this.api.update("/Sentinel/VitalData", idUser, { idUser, ...this.data })
      : this.api.create("/Sentinel/VitalData", { idUser, ...this.data });
    request.subscribe({
      next: () => { this.recordExists = true; this.loading = false; this.message = "Perfil y datos vitales sincronizados."; },
      error: (error) => { this.loading = false; this.error = error.error?.error ?? "No se pudo guardar la ficha médica."; }
    });
  }
}
