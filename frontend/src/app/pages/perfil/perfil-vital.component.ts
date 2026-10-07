import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, OnInit, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { ApiService, UserVitalData } from "../../core/services/api.service";
import { AuthService } from "../../core/services/auth.service";
import { BLOOD_GROUPS } from "../../core/config/constants";

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <header class="profile-header">
      <div class="profile-header-inner">
        <a routerLink="/" class="profile-brand" aria-label="Volver al panel principal"><span aria-hidden="true">✚</span><div><small>SENTINEL • USUARIO</small><b>Perfil vital</b></div></a>
        <div class="profile-header-user"><div><b>{{ userName | uppercase }}</b><small><i aria-hidden="true"></i> Sesión protegida</small></div><button class="secondary" (click)="logout()">Cerrar sesión</button></div>
      </div>
    </header>

    <main class="vital-shell" aria-labelledby="vital-title">
      <div class="vital-title"><div><span class="vital-kicker">FICHA DE IDENTIFICACIÓN Y EMERGENCIA</span><h1 id="vital-title">Mi perfil vital</h1><p>Información médica disponible para ayudarte cuando más la necesitas.</p></div><button class="back-button" routerLink="/">← Panel principal</button></div>
      <div class="vital-grid">
        <aside class="identity-card" aria-label="Identificación del usuario">
          <div class="photo-wrap"><img [src]="avatarUrl" [alt]="'Fotografía de ' + (userName || 'usuario SENTINEL')"><label class="photo-button" for="vital-photo" title="Cambiar fotografía" aria-label="Cambiar fotografía">✎<input id="vital-photo" type="file" accept="image/*" (change)="selectPhoto($event)"></label></div>
          <h2>{{ userName || "Usuario SENTINEL" }}</h2><p>{{ email }}</p><span class="role-badge">{{ role }}</span>
          <div class="identity-line"><span>IDENTIFICADOR</span><b>#{{ userId }}</b></div>
          <div class="identity-line"><span>ESTADO DE CUENTA</span><b class="online">● ACTIVA</b></div>
          <div class="privacy-note"><b>🔒 Información protegida</b><small>Estos datos solo se utilizan para facilitar la atención en una emergencia.</small></div>
        </aside>

        <section class="medical-card" aria-label="Datos vitales">
          <div class="medical-heading"><div><span class="vital-kicker">REGISTRO MÉDICO</span><h2>Datos vitales</h2></div><span class="sync-badge" [class.synced]="recordExists" role="status">● {{ recordExists ? "SINCRONIZADO" : "PENDIENTE DE REGISTRO" }}</span></div>
          <form [formGroup]="form" (ngSubmit)="save()" novalidate>
            <div class="form-section"><h3 id="blood-group-label">Información sanguínea</h3><div class="blood-grid" role="group" aria-labelledby="blood-group-label"><button type="button" *ngFor="let group of bloodGroups" [class.selected]="form.getRawValue().grupoSanguineo === group" (click)="pickBloodGroup(group)" [attr.aria-pressed]="form.getRawValue().grupoSanguineo === group" [attr.aria-label]="'Grupo sanguíneo ' + group">{{ group }}</button></div></div>
            <div class="form-section"><h3>Antecedentes médicos</h3><div class="form-grid">
              <div><label for="vital-allergies">Alergias conocidas</label><textarea id="vital-allergies" name="allergies" formControlName="alergias" placeholder="Escribe alergias a medicamentos, alimentos u otros..." maxlength="500"></textarea></div>
              <div><label for="vital-conditions">Enfermedades crónicas</label><textarea id="vital-conditions" name="conditions" formControlName="enfermedadesCronicas" placeholder="Indica enfermedades o condiciones relevantes..." maxlength="500"></textarea></div>
            </div></div>
            <div class="form-section"><h3><label for="vital-contact">Contacto de emergencia</label></h3><input id="vital-contact" name="contact" formControlName="contactoEmergencia" placeholder="Ejemplo: María López - 5555-5555" required aria-describedby="vital-contact-error">
            <div class="error" id="vital-contact-error" *ngIf="control('contactoEmergencia').invalid && (control('contactoEmergencia').dirty || control('contactoEmergencia').touched || submitted)">
              <span *ngIf="control('contactoEmergencia').errors?.['required']">El contacto de emergencia es obligatorio.</span>
              <span *ngIf="control('contactoEmergencia').errors?.['minlength']">Mínimo 5 caracteres.</span>
            </div></div>
            <div class="form-footer"><small>Última actualización: {{ updatedAt ? (updatedAt | date:'medium') : "Aún no guardado" }}</small><button class="save-button" type="submit" [disabled]="loading">{{ loading ? "Guardando..." : "Guardar cambios" }}</button></div>
          </form>
          <p class="success" *ngIf="message" role="status">{{ message }}</p><p class="error" *ngIf="error" role="alert">{{ error }}</p>
        </section>
      </div>
    </main>
  `,
  styles: [`
    :host{display:block;min-height:100vh;background:#f8fafc;color:#0f172a;font-family:Inter,system-ui,sans-serif}.profile-header{position:sticky;top:0;z-index:10;background:#ffffffe8;backdrop-filter:blur(12px);border-bottom:1px solid #d1fae5;padding:16px 28px}.profile-header-inner{max-width:1200px;margin:auto;display:flex;justify-content:space-between;align-items:center}.profile-brand{display:flex;align-items:center;gap:12px;text-decoration:none;color:#0f172a}.profile-brand>span{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:#0f766e;color:#fff;font-size:24px;box-shadow:0 8px 18px #0f766e40}.profile-brand small,.vital-kicker{display:block;color:#047857;font-size:9px;font-weight:900;letter-spacing:.2em;text-transform:uppercase}.profile-brand b{display:block;text-transform:uppercase;font-size:14px;margin-top:3px}.profile-header-user{display:flex;align-items:center;gap:18px;text-align:right}.profile-header-user>b,.profile-header-user small{display:block}.profile-header-user b{font-size:11px}.profile-header-user small{font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;margin-top:4px}.profile-header-user i{color:#22c55e;font-style:normal}.secondary,.back-button{border:0;border-radius:10px;background:#f1f5f9;color:#475569;padding:10px 14px;font-weight:800;cursor:pointer}.vital-shell{max-width:1200px;margin:38px auto;padding:0 24px 60px}.vital-title{display:flex;justify-content:space-between;align-items:end;margin-bottom:25px}.vital-title h1{margin:7px 0 5px;font-size:32px;letter-spacing:-.06em;text-transform:uppercase}.vital-title p{margin:0;color:#64748b;font-size:13px}.back-button{color:#047857;background:#ecfdf5}@media(max-width:760px){.vital-grid{grid-template-columns:1fr}.vital-title{flex-direction:column;align-items:start;gap:12px}.form-grid{grid-template-columns:1fr}.blood-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.medical-card{padding:24px 20px}.form-footer{flex-direction:column;align-items:stretch;text-align:center}}
    .vital-title{align-items:flex-end}
    .identity-card,.medical-card{background:#fff;border:1px solid #e2e8f0;border-radius:25px;box-shadow:0 12px 28px #0f172a08}
    .identity-card{padding:28px;text-align:center}
    .photo-wrap{position:relative;width:116px;height:116px;margin:0 auto 16px}
    .photo-wrap img{width:116px;height:116px;border-radius:50%;object-fit:cover;box-shadow:0 0 0 4px #e5faf5}
    .photo-button{position:absolute;right:0;bottom:0;display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:#0f766e;color:#fff;font-size:15px;cursor:pointer}
    .photo-button input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
    .identity-card h2{margin:0;font-size:18px}
    .identity-card>p{margin:4px 0 10px;color:#64748b;font-size:12px;word-break:break-all}
    .role-badge{display:inline-block;padding:5px 12px;border-radius:999px;background:#d1fae5;color:#047857;font-size:10px;font-weight:900;letter-spacing:.1em}
    .identity-line{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:14px;padding-top:14px;border-top:1px solid #f1f5f9;font-size:11px}
    .identity-line span{color:#64748b;font-weight:800;letter-spacing:.08em}
    .online{color:#047857}
    .privacy-note{margin-top:18px;padding:14px;border-radius:14px;background:#f8fafc;font-size:12px;text-align:left}
    .privacy-note b{display:block;margin-bottom:4px}
    .privacy-note small{color:#64748b}
    .medical-card{padding:32px}
    .medical-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:20px}
    .medical-heading h2{margin:4px 0 0;font-size:22px}
    .sync-badge{font-size:10px;font-weight:900;letter-spacing:.1em;color:#b45309;background:#fffbeb;border:1px solid #fde68a;padding:6px 12px;border-radius:999px;white-space:nowrap}
    .sync-badge.synced{color:#047857;background:#ecfdf5;border-color:#a7f3d0}
    .form-section{margin-bottom:24px}
    .form-section h3{margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#334155}
    .blood-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
    .blood-grid button{padding:12px 0;border:1px solid #e2e8f0;border-radius:12px;background:#fff;font-weight:800;color:#475569;cursor:pointer}
    .blood-grid button.selected{background:#0f766e;border-color:#0f766e;color:#fff}
    .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .form-section label{display:block;font-size:12px;font-weight:700;color:#334155}
    .form-section textarea,.form-section input{width:100%;margin-top:6px;padding:12px;border:1px solid #d1d5db;border-radius:10px;font-size:14px;font-family:inherit;background:#fff}
    .form-footer{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:8px}
    .form-footer small{color:#64748b;font-size:11px}
    .save-button{padding:12px 24px;border:0;border-radius:10px;background:#0f766e;color:#fff;font-weight:800;cursor:pointer}
    .save-button:disabled{background:#94a3b8;cursor:not-allowed}
  `]
})
export class PerfilVitalComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly fb = inject(FormBuilder);
  readonly bloodGroups = BLOOD_GROUPS;
  readonly form = this.fb.group({
    grupoSanguineo: ["", [Validators.required]],
    alergias: ["", [Validators.maxLength(500)]],
    enfermedadesCronicas: ["", [Validators.maxLength(500)]],
    contactoEmergencia: ["", [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
  });
  userName = ""; email = ""; role = "USER"; userId = 0; initials = "U"; avatarUrl = ""; updatedAt = ""; message = ""; error = ""; loading = false; recordExists = false; submitted = false;

  control(name: "grupoSanguineo" | "alergias" | "enfermedadesCronicas" | "contactoEmergencia") {
    return this.form.get(name)!;
  }

  pickBloodGroup(group: string): void {
    this.form.patchValue({ grupoSanguineo: group });
    this.form.get("grupoSanguineo")?.markAsTouched();
  }

  ngOnInit(): void {
    const session = this.auth.session(); if (!session) { void this.router.navigateByUrl("/login"); return; }
    this.userId = session.idUsers; this.email = session.emailUsers; this.role = session.rolUsers;
    this.api.getUser(this.userId).subscribe({ next: (user: any) => { this.userName = user.nombreUsers ?? user.nombre ?? this.email; this.avatarUrl = user.fotoUrl || this.fallbackAvatar(this.userName); this.initials = this.userName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(); this.changeDetector.detectChanges(); } });
    this.api.getVitalData(this.userId).subscribe({ next: (value: any) => { this.recordExists = value?.exists !== false; this.updatedAt = value?.ultimaActualizacion ?? value?.fechaActualizacion ?? ""; this.form.patchValue({ grupoSanguineo: value?.grupoSanguineo ?? "", alergias: value?.alergias ?? "", enfermedadesCronicas: value?.enfermedadesCronicas ?? "", contactoEmergencia: value?.contactoEmergencia ?? "" }); this.changeDetector.detectChanges(); }, error: () => { this.error = "No se pudieron cargar los datos vitales."; this.changeDetector.detectChanges(); } });
  }
  fallbackAvatar(name: string): string { return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00C9A7&color=fff&bold=true`; }
  selectPhoto(event: Event): void { const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { this.avatarUrl = String(reader.result); this.api.updateUser(this.userId, { fotoUrl: this.avatarUrl }).subscribe({ error: () => this.error = "La fotografía se mostró localmente, pero no pudo guardarse." }); }; reader.readAsDataURL(file); }
  save(): void {
    this.submitted = true;
    if (this.form.invalid) { this.form.markAllAsTouched(); this.error = "Revisa los campos marcados antes de guardar."; return; }
    this.loading = true; this.message = ""; this.error = "";
    const value = this.form.getRawValue();
    const payload = { grupoSanguineo: value.grupoSanguineo ?? "", alergias: value.alergias ?? "", enfermedadesCronicas: value.enfermedadesCronicas ?? "", contactoEmergencia: value.contactoEmergencia ?? "", idUser: this.userId };
    const request = this.recordExists ? this.api.updateVitalData(this.userId, payload) : this.api.createVitalData(payload);
    request.subscribe({ next: () => { this.recordExists = true; this.updatedAt = new Date().toISOString(); this.loading = false; this.message = "Información vital actualizada correctamente."; this.changeDetector.detectChanges(); }, error: (error) => { this.loading = false; this.error = error.error?.error ?? "No se pudo guardar la información vital."; this.changeDetector.detectChanges(); } });
  }
  logout(): void { this.auth.logout(); void this.router.navigateByUrl("/login"); }
}
