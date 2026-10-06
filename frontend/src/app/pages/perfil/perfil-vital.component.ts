import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { ApiService } from "../../core/services/api.service";
import { AuthService } from "../../core/services/auth.service";

interface VitalForm {
  grupoSanguineo: string;
  alergias: string;
  enfermedadesCronicas: string;
  contactoEmergencia: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <header class="profile-header">
      <div class="profile-header-inner">
        <a routerLink="/" class="profile-brand"><span>✚</span><div><small>SENTINEL • USUARIO</small><b>Perfil vital</b></div></a>
        <div class="profile-header-user"><div><b>{{ userName | uppercase }}</b><small><i></i> Sesión protegida</small></div><button class="secondary" (click)="logout()">Cerrar sesión</button></div>
      </div>
    </header>

    <main class="vital-shell">
      <div class="vital-title"><div><span class="vital-kicker">FICHA DE IDENTIFICACIÓN Y EMERGENCIA</span><h1>Mi perfil vital</h1><p>Información médica disponible para ayudarte cuando más la necesitas.</p></div><button class="back-button" routerLink="/">← Panel principal</button></div>
      <div class="vital-grid">
        <aside class="identity-card">
          <div class="photo-wrap"><img [src]="avatarUrl" [alt]="userName"><label class="photo-button" title="Cambiar fotografía">✎<input type="file" accept="image/*" (change)="selectPhoto($event)"></label></div>
          <h2>{{ userName || "Usuario SENTINEL" }}</h2><p>{{ email }}</p><span class="role-badge">{{ role }}</span>
          <div class="identity-line"><span>IDENTIFICADOR</span><b>#{{ userId }}</b></div>
          <div class="identity-line"><span>ESTADO DE CUENTA</span><b class="online">● ACTIVA</b></div>
          <div class="privacy-note"><b>🔒 Información protegida</b><small>Estos datos solo se utilizan para facilitar la atención en una emergencia.</small></div>
        </aside>

        <section class="medical-card">
          <div class="medical-heading"><div><span class="vital-kicker">REGISTRO MÉDICO</span><h2>Datos vitales</h2></div><span class="sync-badge" [class.synced]="recordExists">● {{ recordExists ? "SINCRONIZADO" : "PENDIENTE DE REGISTRO" }}</span></div>
          <form (ngSubmit)="save()">
            <div class="form-section"><h3>Información sanguínea</h3><div class="blood-grid"><button type="button" *ngFor="let group of bloodGroups" [class.selected]="data.grupoSanguineo === group" (click)="data.grupoSanguineo = group">{{ group }}</button></div></div>
            <div class="form-section"><h3>Antecedentes médicos</h3><div class="form-grid"><label>Alergias conocidas<textarea name="allergies" [(ngModel)]="data.alergias" placeholder="Escribe alergias a medicamentos, alimentos u otros..."></textarea></label><label>Enfermedades crónicas<textarea name="conditions" [(ngModel)]="data.enfermedadesCronicas" placeholder="Indica enfermedades o condiciones relevantes..."></textarea></label></div></div>
            <div class="form-section"><h3>Contacto de emergencia</h3><label>Persona y teléfono de contacto<input name="contact" [(ngModel)]="data.contactoEmergencia" placeholder="Ejemplo: María López - 5555-5555"></label></div>
            <div class="form-footer"><small>Última actualización: {{ updatedAt ? (updatedAt | date:'medium') : "Aún no guardado" }}</small><button class="save-button" type="submit" [disabled]="loading">{{ loading ? "Guardando..." : "Guardar cambios" }}</button></div>
          </form>
          <p class="success" *ngIf="message">{{ message }}</p><p class="error" *ngIf="error">{{ error }}</p>
        </section>
      </div>
    </main>
  `,
  styles: [`
    :host{display:block;min-height:100vh;background:#f8fafc;color:#0f172a;font-family:Inter,system-ui,sans-serif}.profile-header{position:sticky;top:0;z-index:10;background:#ffffffe8;backdrop-filter:blur(12px);border-bottom:1px solid #d1fae5;padding:16px 28px}.profile-header-inner{max-width:1200px;margin:auto;display:flex;justify-content:space-between;align-items:center}.profile-brand{display:flex;align-items:center;gap:12px;text-decoration:none;color:#0f172a}.profile-brand>span{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:#00c9a7;color:#fff;font-size:24px;box-shadow:0 8px 18px #a7f3d0}.profile-brand small,.vital-kicker{display:block;color:#059669;font-size:9px;font-weight:900;letter-spacing:.2em;text-transform:uppercase}.profile-brand b{display:block;text-transform:uppercase;font-size:14px;margin-top:3px}.profile-header-user{display:flex;align-items:center;gap:18px;text-align:right}.profile-header-user>b,.profile-header-user small{display:block}.profile-header-user b{font-size:11px}.profile-header-user small{font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;margin-top:4px}.profile-header-user i{color:#22c55e;font-style:normal}.secondary,.back-button{border:0;border-radius:10px;background:#f1f5f9;color:#475569;padding:10px 14px;font-weight:800;cursor:pointer}.vital-shell{max-width:1200px;margin:38px auto;padding:0 24px 60px}.vital-title{display:flex;justify-content:space-between;align-items:end;margin-bottom:25px}.vital-title h1{margin:7px 0 5px;font-size:32px;letter-spacing:-.06em;text-transform:uppercase}.vital-title p{margin:0;color:#64748b;font-size:13px}.back-button{color:#047857;background:#ecfdf5}.vital-grid{display:grid;grid-template-columns:290px minmax(0,1fr);gap:24px}.identity-card,.medical-card{background:#fff;border:1px solid #e2e8f0;border-radius:25px;box-shadow:0 12px 28px #0f172a08}.identity-card{padding:28px;text-align:center}.photo-wrap{position:relative;width:116px;height:116px;margin:0 auto 18px}.photo-wrap img{width:100%;height:100%;object-fit:cover;border-radius:34px;border:5px solid #fff;box-shadow:0 0 0 3px #d1fae5,0 10px 25px #0f172a1a}.photo-button{position:absolute;right:-4px;bottom:-4px;width:31px;height:31px;display:grid;place-items:center;background:#00c9a7;color:#fff;border:3px solid #fff;border-radius:50%;cursor:pointer}.photo-button input{display:none}.identity-card h2{margin:0;font-size:18px;text-transform:uppercase;letter-spacing:-.03em}.identity-card>p{margin:5px 0 12px;color:#94a3b8;font-size:11px}.role-badge{display:inline-block;padding:5px 10px;border-radius:999px;background:#ecfdf5;color:#059669;font-size:9px;font-weight:900;text-transform:uppercase}.identity-line{display:flex;justify-content:space-between;border-top:1px solid #f1f5f9;padding:15px 0 0;margin-top:15px;text-align:left}.identity-line span{font-size:9px;color:#94a3b8;font-weight:900;letter-spacing:.08em}.identity-line b{font-size:10px}.online{color:#16a34a}.privacy-note{margin-top:26px;padding:14px;text-align:left;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px}.privacy-note b,.privacy-note small{display:block}.privacy-note b{font-size:10px;color:#047857}.privacy-note small{margin-top:5px;color:#64748b;font-size:10px;line-height:1.45}.medical-card{padding:30px}.medical-heading{display:flex;justify-content:space-between;align-items:start;border-bottom:1px solid #f1f5f9;padding-bottom:20px;margin-bottom:6px}.medical-heading h2{margin:7px 0 0;font-size:24px;text-transform:uppercase;letter-spacing:-.04em}.sync-badge{padding:7px 10px;border-radius:8px;background:#fff7ed;color:#b45309;font-size:9px;font-weight:900;letter-spacing:.08em}.sync-badge.synced{background:#ecfdf5;color:#059669}.form-section{padding:21px 0;border-bottom:1px solid #f1f5f9}.form-section h3{margin:0 0 14px;color:#334155;font-size:11px;text-transform:uppercase;letter-spacing:.16em}.blood-grid{display:flex;gap:9px;flex-wrap:wrap}.blood-grid button{width:58px;height:42px;border:1px solid #cbd5e1;border-radius:10px;background:#fff;color:#64748b;font-weight:900;cursor:pointer}.blood-grid button:hover,.blood-grid button.selected{border-color:#00c9a7;background:#ecfdf5;color:#047857;box-shadow:0 0 0 3px #d1fae5}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.medical-card label{display:grid;gap:7px;color:#64748b;font-size:10px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}.medical-card input,.medical-card textarea{width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:11px;padding:12px 14px;resize:vertical;background:#fcfdfe;outline:none}.medical-card textarea{min-height:100px}.medical-card input:focus,.medical-card textarea:focus{border-color:#00c9a7;box-shadow:0 0 0 4px #d1fae5}.form-footer{display:flex;justify-content:space-between;align-items:center;padding-top:22px}.form-footer small{color:#94a3b8;font-size:10px}.save-button{border:0;border-radius:11px;padding:13px 22px;background:#00a98f;color:#fff;font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}.save-button:disabled{opacity:.6}@media(max-width:780px){.profile-header-user>div{display:none}.vital-title,.form-footer{align-items:start;flex-direction:column;gap:15px}.vital-grid{grid-template-columns:1fr}.form-grid{grid-template-columns:1fr}}
  `]
})
export class PerfilVitalComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);
  readonly bloodGroups = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
  data: VitalForm = { grupoSanguineo: "", alergias: "", enfermedadesCronicas: "", contactoEmergencia: "" };
  userName = ""; email = ""; role = "USER"; userId = 0; initials = "U"; avatarUrl = ""; updatedAt = ""; message = ""; error = ""; loading = false; recordExists = false;

  ngOnInit(): void {
    const session = this.auth.session(); if (!session) { void this.router.navigateByUrl("/login"); return; }
    this.userId = session.idUsers; this.email = session.emailUsers; this.role = session.rolUsers;
    this.api.collection(`/Sentinel/Users/${this.userId}`).subscribe({ next: (user: any) => { this.userName = user.nombreUsers ?? user.nombre ?? this.email; this.avatarUrl = user.fotoUrl || this.fallbackAvatar(this.userName); this.initials = this.userName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(); this.changeDetector.detectChanges(); } });
    this.api.collection(`/Sentinel/VitalData/${this.userId}`).subscribe({ next: (value: any) => { this.recordExists = value?.exists !== false; this.updatedAt = value?.ultimaActualizacion ?? value?.fechaActualizacion ?? ""; this.data = { ...this.data, ...value }; this.changeDetector.detectChanges(); }, error: () => { this.error = "No se pudieron cargar los datos vitales."; this.changeDetector.detectChanges(); } });
  }
  fallbackAvatar(name: string): string { return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00C9A7&color=fff&bold=true`; }
  selectPhoto(event: Event): void { const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { this.avatarUrl = String(reader.result); this.api.update("/Sentinel/Users", this.userId, { fotoUrl: this.avatarUrl }).subscribe({ error: () => this.error = "La fotografía se mostró localmente, pero no pudo guardarse." }); }; reader.readAsDataURL(file); }
  save(): void {
    this.loading = true; this.message = ""; this.error = "";
    const request = this.recordExists ? this.api.update("/Sentinel/VitalData", this.userId, { idUser: this.userId, ...this.data }) : this.api.create("/Sentinel/VitalData", { idUser: this.userId, ...this.data });
    request.subscribe({ next: () => { this.recordExists = true; this.updatedAt = new Date().toISOString(); this.loading = false; this.message = "Información vital actualizada correctamente."; this.changeDetector.detectChanges(); }, error: (error) => { this.loading = false; this.error = error.error?.error ?? "No se pudo guardar la información vital."; this.changeDetector.detectChanges(); } });
  }
  logout(): void { this.auth.logout(); void this.router.navigateByUrl("/login"); }
}
