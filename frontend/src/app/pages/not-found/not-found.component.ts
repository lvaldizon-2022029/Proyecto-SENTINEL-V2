import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="not-found" aria-labelledby="not-found-title">
      <div class="not-found-card">
        <div class="brand-icon" aria-hidden="true">⚠</div>
        <span class="eyebrow">SENTINEL • ERROR 404</span>
        <h1 id="not-found-title">Página no encontrada</h1>
        <p>La ruta solicitada no existe o fue movida. Verifica la dirección o vuelve al panel principal.</p>
        <div class="not-found-actions">
          <a class="btn-primary" routerLink="/">Volver al panel</a>
          <a class="secondary" routerLink="/login">Ir al acceso</a>
        </div>
      </div>
    </main>
  `,
  styles: [`
    :host{display:block;min-height:100vh;background:#f8fafc;color:#0f172a;font-family:Inter,system-ui,sans-serif}
    .not-found{display:grid;place-items:center;min-height:100vh;padding:24px}
    .not-found-card{max-width:460px;text-align:center;background:#fff;border:1px solid #e2e8f0;border-radius:24px;padding:48px 40px;box-shadow:0 12px 28px #0f172a08}
    .brand-icon{display:inline-grid;place-items:center;width:56px;height:56px;border-radius:16px;background:#0f766e;color:#fff;font-size:28px;margin-bottom:16px}
    .eyebrow{display:block;font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:#00a98f}
    h1{font-size:26px;margin:8px 0}
    p{color:#64748b;font-size:14px;line-height:1.6}
    .not-found-actions{display:flex;gap:12px;justify-content:center;margin-top:24px}
    .btn-primary{padding:12px 24px;background:#0f766e;color:#fff;border-radius:8px;font-weight:700;text-decoration:none}
    .secondary{padding:12px 24px;background:#f1f5f9;color:#475569;border-radius:8px;font-weight:700;text-decoration:none}
    @media(max-width:760px){.not-found-card{padding:32px 24px}.not-found-actions{flex-direction:column}}
  `]
})
export class NotFoundComponent {}
