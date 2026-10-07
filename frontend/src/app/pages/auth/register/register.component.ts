import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { PASSWORD_REGEX, DEFAULT_PLACEHOLDERS } from "../../../core/config/constants";

const pinsMatch = (group: AbstractControl): ValidationErrors | null => {
  const pin = group.get("pin")?.value;
  const confirmation = group.get("pinConfirmation")?.value;
  return pin && confirmation && pin !== confirmation ? { pinsMismatch: true } : null;
};

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <main class="auth-shell">
      <section class="auth-card" aria-labelledby="register-title">
        <div class="auth-brand">
          <div><div class="brand-icon" aria-hidden="true">✓</div><h1>SENTINEL</h1><span class="brand-kicker">Guatemala Intelligence</span></div>
          <div><div class="security-note">"Registro controlado para usuarios y personal autorizado."</div><p class="brand-kicker">● Plataforma protegida</p></div>
        </div>
        <div class="auth-form-panel">
        <h2 id="register-title">Crear cuenta</h2><p class="auth-subtitle">Registro de acceso al sistema</p>
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="field">
            <label for="register-name">Nombre completo</label>
            <input id="register-name" class="input-clinical" name="name" formControlName="name" required minlength="2" maxlength="100" autocomplete="name" aria-describedby="register-name-error">
            <div class="error" id="register-name-error" *ngIf="control('name').invalid && (control('name').dirty || control('name').touched || submitted)">
              <span *ngIf="control('name').errors?.['required']">El nombre es obligatorio.</span>
              <span *ngIf="control('name').errors?.['minlength']">Nombre obligatorio (2-100 caracteres).</span>
            </div>
          </div>
          <div class="field">
            <label for="register-email">Correo electrónico</label>
            <input id="register-email" class="input-clinical" name="email" type="email" formControlName="email" required placeholder="{{ placeholders.email }}" autocomplete="email" aria-describedby="register-email-error">
            <div class="error" id="register-email-error" *ngIf="control('email').invalid && (control('email').dirty || control('email').touched || submitted)">
              <span *ngIf="control('email').errors?.['required']">El correo electrónico es obligatorio.</span>
              <span *ngIf="control('email').errors?.['email']">Correo electrónico inválido.</span>
            </div>
          </div>
          <div class="field">
            <label for="register-password">Contraseña</label>
            <input id="register-password" class="input-clinical" name="password" [type]="showPassword ? 'text' : 'password'" formControlName="password" required minlength="8" autocomplete="new-password" aria-describedby="register-password-error">
            <button type="button" class="secondary" (click)="showPassword = !showPassword" [attr.aria-label]="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'" aria-controls="register-password">{{ showPassword ? "Ocultar" : "Mostrar" }}</button>
            <div class="error" id="register-password-error" *ngIf="control('password').invalid && (control('password').dirty || control('password').touched || submitted)">{{ passwordErrorMessage() }}</div>
            <div class="password-strength" *ngIf="(form.getRawValue().password?.length ?? 0) > 0" aria-hidden="true"><div class="strength-bar"><div class="strength-fill" [style.width.%]="passwordStrength" [class.weak]="passwordStrength < 33" [class.medium]="passwordStrength >= 33 && passwordStrength < 66" [class.strong]="passwordStrength >= 66"></div></div><small>{{ passwordStrengthLabel }}</small></div>
          </div>
          <div class="field">
            <label for="register-pin">PIN de emergencia</label>
            <input id="register-pin" class="input-clinical" name="pin" [type]="showPin ? 'text' : 'password'" formControlName="pin" minlength="4" maxlength="12" required inputmode="numeric" autocomplete="off" aria-describedby="register-pin-error">
            <button type="button" class="secondary" (click)="showPin = !showPin" [attr.aria-label]="showPin ? 'Ocultar PIN' : 'Mostrar PIN'" aria-controls="register-pin">{{ showPin ? "Ocultar" : "Mostrar" }}</button>
            <div class="error" id="register-pin-error" *ngIf="control('pin').invalid && (control('pin').dirty || control('pin').touched || submitted)">
              <span *ngIf="control('pin').errors?.['required']">El PIN es obligatorio.</span>
              <span *ngIf="control('pin').errors?.['pattern']">PIN obligatorio (4-12 dígitos).</span>
            </div>
          </div>
          <div class="field">
            <label for="register-pin-confirm">Confirmar PIN</label>
            <input id="register-pin-confirm" class="input-clinical" name="pinConfirmation" type="password" formControlName="pinConfirmation" required inputmode="numeric" autocomplete="off" aria-describedby="register-pin-confirm-error">
            <div class="error" id="register-pin-confirm-error" *ngIf="(control('pinConfirmation').invalid && (control('pinConfirmation').dirty || control('pinConfirmation').touched || submitted)) || (form.errors?.['pinsMismatch'] && submitted)">
              <span *ngIf="control('pinConfirmation').errors?.['required']">Confirmar PIN es obligatorio.</span>
              <span *ngIf="form.errors?.['pinsMismatch']">Los PIN no coinciden.</span>
            </div>
          </div>
          <p class="error" *ngIf="error" role="alert">{{ error }}</p>
          <p class="success" *ngIf="success" role="status">{{ success }}</p>
          <button class="btn-primary auth-submit" type="submit" [disabled]="loading">{{ loading ? "Registrando..." : "Registrarme" }}</button>
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
  private readonly fb = inject(FormBuilder);
  readonly form = this.fb.group({
    name: ["", [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ["", [Validators.required, Validators.email, Validators.maxLength(100)]],
    password: ["", [Validators.required, Validators.minLength(8), Validators.maxLength(100), Validators.pattern(PASSWORD_REGEX.pattern)]],
    pin: ["", [Validators.required, Validators.pattern(/^\d{4,12}$/)]],
    pinConfirmation: ["", [Validators.required]],
  }, { validators: pinsMatch });
  showPassword = false;
  showPin = false;
  error = "";
  success = "";
  loading = false;
  submitted = false;
  readonly placeholders = DEFAULT_PLACEHOLDERS;

  control(name: "name" | "email" | "password" | "pin" | "pinConfirmation") {
    return this.form.get(name)!;
  }

  get passwordStrength(): number {
    const password = String(this.form.getRawValue().password ?? "");
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[a-z]/.test(password)) score += 25;
    if (/\d/.test(password)) score += 12.5;
    if (/[@$!%*?&]/.test(password)) score += 12.5;
    return Math.min(score, 100);
  }

  get passwordStrengthLabel(): string {
    if (this.passwordStrength < 33) return "Débil";
    if (this.passwordStrength < 66) return "Media";
    return "Fuerte";
  }

  passwordErrorMessage(): string {
    const errors = this.control("password").errors;
    if (!errors) return "";
    if (errors['required']) return "La contraseña es obligatoria";
    if (errors['minlength']) return "Mínimo 8 caracteres";
    if (errors['pattern']) return "Debe tener mayúscula, minúscula, número y símbolo";
    return "Contraseña inválida";
  }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = this.form.errors?.['pinsMismatch'] ? "Los PIN de emergencia no coinciden." : "Revisa los campos marcados antes de continuar.";
      return;
    }
    this.loading = true;
    this.error = "";
    this.success = "";
    const value = this.form.getRawValue();
    this.auth.register({ nombreUsers: value.name ?? "", emailUsers: value.email ?? "", contrasenaUsers: value.password ?? "", pinemergenciaUsers: value.pin ?? "" }).subscribe({
      next: () => {
        this.loading = false;
        this.success = "Cuenta creada. Redirigiendo...";
        setTimeout(() => this.router.navigateByUrl("/login"), 700);
      },
      error: (err: { error?: { error?: string } }) => { this.loading = false; this.error = err.error?.error ?? "No se pudo crear la cuenta."; }
    });
  }
}
