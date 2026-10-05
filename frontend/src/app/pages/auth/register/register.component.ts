import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="auth-shell">
      <section class="auth-card">
        <div class="auth-brand">
          <div><div class="brand-icon">✓</div><h1>SENTINEL</h1><span class="brand-kicker">Guatemala Intelligence</span></div>
          <div><div class="security-note">"Registro controlado para usuarios y personal autorizado."</div><p class="brand-kicker">● Plataforma protegida</p></div>
        </div>
        <div class="auth-form-panel">
        <h2>Crear cuenta</h2><p class="auth-subtitle">Registro de acceso al sistema</p>
        <form (ngSubmit)="submit()">
          <div class="field"><label>Nombre completo</label><input class="input-clinical" name="name" [(ngModel)]="name" required></div>
          <div class="field"><label>Correo electrónico</label><input class="input-clinical" name="email" type="email" [(ngModel)]="email" required></div>
          <div class="field"><label>Contraseña</label><input class="input-clinical" name="password" [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" required><button type="button" class="secondary" (click)="showPassword = !showPassword">{{ showPassword ? "Ocultar" : "Mostrar" }}</button></div>
          <div class="field"><label>PIN de emergencia</label><input class="input-clinical" name="pin" [type]="showPin ? 'text' : 'password'" [(ngModel)]="pin" minlength="4" maxlength="12" required></div>
          <div class="field"><label>Confirmar PIN</label><input class="input-clinical" name="pinConfirmation" type="password" [(ngModel)]="pinConfirmation" required></div>
          <p class="error" *ngIf="error">{{ error }}</p>
          <p class="success" *ngIf="success">{{ success }}</p>
          <button class="btn-primary auth-submit" type="submit">Registrarme</button>
        </form>
        <div class="auth-footer"><a routerLink="/login">Volver al acceso</a></div>
        </div>
      </section>
    </main>
  `
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  name = "";
  email = "";
  password = "";
  pin = "";
  pinConfirmation = "";
  showPassword = false;
  showPin = false;
  error = "";
  success = "";

  submit(): void {
    if (this.pin !== this.pinConfirmation) { this.error = "Los PIN de emergencia no coinciden."; return; }
    this.auth.register({ nombreUsers: this.name, emailUsers: this.email, contrasenaUsers: this.password, pinemergenciaUsers: this.pin }).subscribe({
      next: () => {
        this.success = "Cuenta creada. Redirigiendo...";
        setTimeout(() => this.router.navigateByUrl("/login"), 700);
      },
      error: (error: { error?: { error?: string } }) => this.error = error.error?.error ?? "No se pudo crear la cuenta."
    });
  }
}
