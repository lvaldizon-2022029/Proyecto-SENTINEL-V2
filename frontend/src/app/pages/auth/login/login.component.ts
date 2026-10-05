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
          <div><div class="security-note">"Acceso restringido para personal autorizado del Grupo #6 y usuarios registrados."</div><p class="brand-kicker">● Encriptación AES-256 activa</p></div>
        </div>
        <div class="auth-form-panel">
        <h2>Iniciar sesión</h2>
        <p class="auth-subtitle">Portal de gestión de datos vitales</p>
        <form (ngSubmit)="submit()">
          <div class="field"><label>Correo electrónico</label><input class="input-clinical" name="email" type="email" [(ngModel)]="email" required placeholder="ejemplo@sentinel.com"></div>
          <div class="field"><label>Contraseña</label><input class="input-clinical" name="password" [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" required placeholder="••••••••"><button type="button" class="secondary" (click)="showPassword = !showPassword">{{ showPassword ? "Ocultar" : "Mostrar" }}</button></div>
          <p class="error" *ngIf="error">{{ error }}</p>
          <button class="btn-primary auth-submit" [disabled]="loading" type="submit">{{ loading ? "Verificando..." : "Ingresar al sistema →" }}</button>
        </form>
        <div class="auth-footer">¿Nuevo en el sistema? <a routerLink="/register">Crear cuenta</a></div>
        </div>
      </section>
    </main>
  `
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  email = "admin@sentinel.local";
  password = "sentinel";
  error = "";
  loading = false;
  showPassword = false;

  submit(): void {
    this.loading = true;
    this.error = "";
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigateByUrl("/"),
      error: (error: { error?: { error?: string } }) => {
        this.error = error.error?.error ?? "No se pudo iniciar sesión.";
        this.loading = false;
      }
    });
  }
}
