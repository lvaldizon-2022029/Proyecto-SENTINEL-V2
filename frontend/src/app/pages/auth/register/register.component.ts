import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { PASSWORD_REGEX, DEFAULT_PLACEHOLDERS } from "../../../core/config/constants";

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
        <form #registerForm="ngForm" (ngSubmit)="submit()">
          <div class="field"><label>Nombre completo</label><input class="input-clinical" name="name" [(ngModel)]="name" required minlength="2" maxlength="100" #nameInput="ngModel"><div class="error" *ngIf="nameInput.invalid && (nameInput.dirty || nameInput.touched)">Nombre obligatorio (2-100 caracteres)</div></div>
          <div class="field"><label>Correo electrónico</label><input class="input-clinical" name="email" type="email" [(ngModel)]="email" required placeholder="{{ placeholders.email }}" #emailInput="ngModel"><div class="error" *ngIf="emailInput.invalid && (emailInput.dirty || emailInput.touched)">Correo electrónico inválido</div></div>
          <div class="field"><label>Contraseña</label><input class="input-clinical" name="password" [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" required minlength="8" pattern="{{ passwordPattern }}" #passwordInput="ngModel"><button type="button" class="secondary" (click)="showPassword = !showPassword">{{ showPassword ? "Ocultar" : "Mostrar" }}</button><div class="error" *ngIf="passwordInput.invalid && (passwordInput.dirty || passwordInput.touched)">{{ passwordErrorMessage(passwordInput) }}</div><div class="password-strength" *ngIf="password.length > 0"><div class="strength-bar"><div class="strength-fill" [style.width.%]="passwordStrength" [class.weak]="passwordStrength < 33" [class.medium]="passwordStrength >= 33 && passwordStrength < 66" [class.strong]="passwordStrength >= 66"></div></div><small>{{ passwordStrengthLabel }}</small></div></div>
          <div class="field"><label>PIN de emergencia</label><input class="input-clinical" name="pin" [type]="showPin ? 'text' : 'password'" [(ngModel)]="pin" minlength="4" maxlength="12" required #pinInput="ngModel"><button type="button" class="secondary" (click)="showPin = !showPin">{{ showPin ? "Ocultar" : "Mostrar" }}</button><div class="error" *ngIf="pinInput.invalid && (pinInput.dirty || pinInput.touched)">PIN obligatorio (4-12 dígitos)</div></div>
          <div class="field"><label>Confirmar PIN</label><input class="input-clinical" name="pinConfirmation" type="password" [(ngModel)]="pinConfirmation" required #pinConfirmInput="ngModel"><div class="error" *ngIf="pinConfirmInput.invalid && (pinConfirmInput.dirty || pinConfirmInput.touched)">Confirmar PIN es obligatorio</div><div class="error" *ngIf="pin !== pinConfirmation && pinConfirmation.length > 0">Los PIN no coinciden</div></div>
          <p class="error" *ngIf="error">{{ error }}</p>
          <p class="success" *ngIf="success">{{ success }}</p>
          <button class="btn-primary auth-submit" type="submit" [disabled]="registerForm.invalid || loading">{{ loading ? "Registrando..." : "Registrarme" }}</button>
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
  loading = false;
  readonly placeholders = DEFAULT_PLACEHOLDERS;
  readonly passwordPattern = PASSWORD_REGEX.pattern;

  get passwordStrength(): number {
    let score = 0;
    if (this.password.length >= 8) score += 25;
    if (/[A-Z]/.test(this.password)) score += 25;
    if (/[a-z]/.test(this.password)) score += 25;
    if (/\d/.test(this.password)) score += 12.5;
    if (/[@$!%*?&]/.test(this.password)) score += 12.5;
    return Math.min(score, 100);
  }

  get passwordStrengthLabel(): string {
    if (this.passwordStrength < 33) return "Débil";
    if (this.passwordStrength < 66) return "Media";
    return "Fuerte";
  }

  passwordErrorMessage(input: { errors: { [key: string]: any } | null }): string {
    if (!input.errors) return "";
    if (input.errors['required']) return "La contraseña es obligatoria";
    if (input.errors['minlength']) return "Mínimo 8 caracteres";
    if (input.errors['pattern']) return "Debe tener mayúscula, minúscula, número y símbolo";
    return "Contraseña inválida";
  }

  submit(): void {
    if (this.pin !== this.pinConfirmation) { this.error = "Los PIN de emergencia no coinciden."; return; }
    this.loading = true;
    this.error = "";
    this.success = "";
    this.auth.register({ nombreUsers: this.name, emailUsers: this.email, contrasenaUsers: this.password, pinemergenciaUsers: this.pin }).subscribe({
      next: () => {
        this.loading = false;
        this.success = "Cuenta creada. Redirigiendo...";
        setTimeout(() => this.router.navigateByUrl("/login"), 700);
      },
      error: (err: { error?: { error?: string } }) => { this.loading = false; this.error = err.error?.error ?? "No se pudo crear la cuenta."; }
    });
  }
}
