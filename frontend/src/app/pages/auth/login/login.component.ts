import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <main class="auth-shell">
      <section class="auth-card" aria-labelledby="login-title">
        <div class="auth-brand">
          <div><div class="brand-icon" aria-hidden="true">✓</div><h1>SENTINEL</h1><span class="brand-kicker">Guatemala Intelligence</span></div>
          <div><div class="security-note">"Acceso restringido para personal autorizado del Grupo #6 y usuarios registrados."</div><p class="brand-kicker">● Encriptación AES-256 activa</p></div>
        </div>
        <div class="auth-form-panel">
        <h2 id="login-title">Iniciar sesión</h2>
        <p class="auth-subtitle">Portal de gestión de datos vitales</p>
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="field">
            <label for="login-email">Correo electrónico</label>
            <input id="login-email" class="input-clinical" name="email" type="email" formControlName="email" required placeholder="ejemplo@sentinel.com" autocomplete="email" aria-describedby="login-email-error">
            <div class="error" id="login-email-error" *ngIf="control('email').invalid && (control('email').dirty || control('email').touched || submitted)">
              <span *ngIf="control('email').errors?.['required']">El correo electrónico es obligatorio.</span>
              <span *ngIf="control('email').errors?.['email']">Formato de correo electrónico inválido.</span>
            </div>
          </div>
          <div class="field">
            <label for="login-password">Contraseña</label>
            <input id="login-password" class="input-clinical" name="password" [type]="showPassword ? 'text' : 'password'" formControlName="password" required placeholder="••••••••" autocomplete="current-password" aria-describedby="login-password-error">
            <button type="button" class="secondary" (click)="showPassword = !showPassword" [attr.aria-label]="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'" aria-controls="login-password">{{ showPassword ? "Ocultar" : "Mostrar" }}</button>
            <div class="error" id="login-password-error" *ngIf="control('password').invalid && (control('password').dirty || control('password').touched || submitted)">
              <span *ngIf="control('password').errors?.['required']">La contraseña es obligatoria.</span>
              <span *ngIf="control('password').errors?.['minlength']">Mínimo 6 caracteres.</span>
            </div>
          </div>
          <p class="error" *ngIf="error" role="alert">{{ error }}</p>
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
  private readonly fb = inject(FormBuilder);
  readonly form = this.fb.group({
    email: ["", [Validators.required, Validators.email, Validators.maxLength(100)]],
    password: ["", [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
  });
  error = "";
  loading = false;
  showPassword = false;
  submitted = false;

  control(name: "email" | "password") {
    return this.form.get(name)!;
  }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = "Revisa los campos marcados antes de continuar.";
      return;
    }
    this.loading = true;
    this.error = "";
    const { email, password } = this.form.getRawValue();
    this.auth.login(email ?? "", password ?? "").subscribe({
      next: () => this.router.navigateByUrl("/"),
      error: (error: { error?: { error?: string } }) => {
        this.error = error.error?.error ?? "No se pudo iniciar sesión.";
        this.loading = false;
      }
    });
  }
}
