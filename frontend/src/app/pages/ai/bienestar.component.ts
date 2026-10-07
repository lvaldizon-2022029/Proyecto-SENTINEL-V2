import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { ApiService } from "../../core/services/api.service";
import { AuthService } from "../../core/services/auth.service";
import { AI_SUGGESTIONS } from "../../core/config/constants";

interface ChatMessage { text: string; user: boolean; time: string; }

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <header class="wellness-header">
      <div class="wellness-header-inner">
        <a routerLink="/" class="wellness-brand"><span>♡</span><div><small>SENTINEL • ESPACIO SEGURO</small><b>Bienestar psicológico</b></div></a>
        <div class="wellness-user"><div><b>{{ userName | uppercase }}</b><small><i></i> Sesión protegida</small></div><button (click)="logout()">Cerrar sesión</button></div>
      </div>
    </header>

    <main class="wellness-shell">
      <section class="wellness-hero">
        <div><span>UN MOMENTO PARA TI</span><h1>Tu bienestar también importa.</h1><p>Encuentra herramientas para regular tus emociones, escribir lo que sientes y pedir apoyo cuando lo necesites.</p></div>
        <div class="hero-symbol">♡</div>
      </section>

      <section class="quick-grid">
        <button class="quick-card mint" (click)="groundingOpen = true"><span>◌</span><div><b>Vuelve al presente</b><small>Ejercicio de conexión 5-4-3-2-1</small></div><strong>→</strong></button>
        <button class="quick-card lavender" routerLink="/respiracion"><span>◉</span><div><b>Respira con calma</b><small>Ejercicio guiado de respiración</small></div><strong>→</strong></button>
        <button class="quick-card peach" routerLink="/diario"><span>✎</span><div><b>Escribe cómo te sientes</b><small>Tu diario emocional privado</small></div><strong>→</strong></button>
        <button class="quick-card rose" (click)="crisisOpen = true"><span>☎</span><div><b>Necesito ayuda</b><small>Información de apoyo inmediato</small></div><strong>→</strong></button>
      </section>

      <section class="wellness-content">
        <div class="support-column">
          <article class="quote-card"><span>“</span><p>No tienes que resolverlo todo hoy. Un paso pequeño también es avanzar.</p><small>— SENTINEL</small></article>
          <article class="resource-card"><div class="resource-icon">✦</div><div><b>Cuida tu ritmo</b><p>Descansa, hidrátate y permite que tus emociones existan sin juzgarte.</p></div></article>
          <article class="resource-card"><div class="resource-icon">☀</div><div><b>Recursos de calma</b><p>Prueba una herramienta breve y vuelve a ella cada vez que la necesites.</p></div></article>
        </div>

        <section class="assistant-card">
          <div class="assistant-heading"><div class="assistant-avatar">✦</div><div><span>ASISTENTE DE APOYO</span><h2>Habla con Sentinel</h2><small>Orientación inicial, no reemplaza ayuda profesional.</small></div><i>●</i></div>
          <div class="chat-history" #chatHistory>
            <div *ngFor="let message of messages" class="chat-line" [class.from-user]="message.user"><div class="chat-bubble">{{ message.text }}</div><small>{{ message.time }}</small></div>
            <div *ngIf="loading" class="typing"><i></i><i></i><i></i> Sentinel está pensando...</div>
          </div>
          <div class="suggestions"><button *ngFor="let suggestion of suggestions" (click)="useSuggestion(suggestion)">{{ suggestion }}</button></div>
          <form #aiForm="ngForm" (ngSubmit)="ask()">
            <textarea name="prompt" [(ngModel)]="prompt" (keydown.enter)="onEnter($event)" placeholder="Cuéntame cómo te sientes..." rows="2" required #promptInput="ngModel"></textarea>
            <button type="submit" [disabled]="aiForm.invalid || loading">➤</button>
          </form>
          <small class="chat-disclaimer">Si estás en peligro inmediato, llama a los servicios de emergencia de tu localidad.</small>
          <p class="error" *ngIf="error">{{ error }}</p>
        </section>
      </section>
    </main>

    <div class="modal-backdrop" *ngIf="groundingOpen"><section class="wellness-modal grounding-modal"><button class="close" (click)="groundingOpen = false">×</button><div class="modal-symbol">◌</div><span class="modal-kicker">TÉCNICA DE ANCLAJE</span><h2>5-4-3-2-1</h2><p>Observa tu entorno y nombra lentamente:</p><ol><li><b>5</b> cosas que puedas ver</li><li><b>4</b> cosas que puedas tocar</li><li><b>3</b> sonidos que puedas escuchar</li><li><b>2</b> aromas que puedas reconocer</li><li><b>1</b> sabor que puedas identificar</li></ol><button class="modal-action" (click)="groundingOpen = false">Comenzar ejercicio</button></section></div>
    <div class="modal-backdrop" *ngIf="crisisOpen"><section class="wellness-modal crisis-modal"><button class="close" (click)="crisisOpen = false">×</button><div class="modal-symbol">♡</div><span class="modal-kicker">APOYO INMEDIATO</span><h2>No estás solo/a</h2><p>Si existe un riesgo inmediato, busca a una persona de confianza y contacta los servicios de emergencia de tu localidad.</p><div class="crisis-box"><b>También puedes:</b><span>Acudir al centro de salud más cercano.</span><span>Hablar con un familiar, amigo o profesional.</span><span>Usar el botón de pánico de SENTINEL si necesitas auxilio.</span></div><button class="modal-action" (click)="crisisOpen = false">Entendido</button></section></div>
  `,
  styles: [`
    :host{display:block;min-height:100vh;background:#f8fafc;color:#243047;font-family:Inter,system-ui,sans-serif}
    .wellness-header{position:sticky;top:0;z-index:10;background:#ffffffe8;backdrop-filter:blur(12px);border-bottom:1px solid #d7f5eb;padding:15px 28px}
    .wellness-header-inner{max-width:1180px;margin:auto;display:flex;justify-content:space-between;align-items:center}
    .wellness-brand{display:flex;align-items:center;gap:12px;color:#243047;text-decoration:none}
    .wellness-brand>span{display:grid;place-items:center;width:43px;height:43px;border-radius:14px;background:#23c7a4;color:#fff;font-size:27px;box-shadow:0 8px 18px #b9eee2}
    .wellness-brand small,.assistant-heading span,.modal-kicker{display:block;color:#047857;font-size:9px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}
    .wellness-brand b{display:block;margin-top:3px;font-size:14px;text-transform:uppercase}
    .wellness-user{text-align:right;display:flex;align-items:center;gap:18px}
    .wellness-user b,.wellness-user small{display:block}
    .wellness-user b{font-size:11px}
    .wellness-user small{margin-top:4px;color:#64748b;font-size:9px;text-transform:uppercase}
    .wellness-user i{color:#22c55e;font-style:normal}
    .wellness-user button{border:0;background:#f1f5f9;color:#64748b;border-radius:10px;padding:10px 13px;font-size:10px;font-weight:900;text-transform:uppercase}
    .wellness-shell{max-width:1180px;margin:34px auto;padding:0 24px 60px}
    .wellness-hero{position:relative;overflow:hidden;min-height:190px;padding:35px 42px;border-radius:30px;background:linear-gradient(115deg,#115e59,#0f766e);color:#fff;box-shadow:0 18px 35px #0f766e40}
    .wellness-hero>div:first-child{max-width:620px}
    .wellness-hero span{font-size:10px;font-weight:900;letter-spacing:.2em}
    .wellness-hero h1{margin:12px 0 8px;font-size:34px;letter-spacing:-.06em}
    .wellness-hero p{margin:0;color:#d8fff5;font-size:14px;line-height:1.6}
    .hero-symbol{position:absolute;right:8%;bottom:-34px;font-size:190px;line-height:1;color:#ffffff1f;transform:rotate(-14deg)}
    .quick-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:24px}
    .quick-card{display:flex;align-items:center;gap:16px;padding:20px;border-radius:20px;background:#fff;border:1px solid #e2e8f0;cursor:pointer;transition:transform .2s,box-shadow .2s}
    .quick-card:hover{transform:translateY(-4px);box-shadow:0 12px 24px #0000001a}
    .quick-card.mint{border-left:4px solid #14b8a6}
    .quick-card.lavender{border-left:4px solid #a855f7}
    .quick-card.peach{border-left:4px solid #f97316}
    .quick-card.rose{border-left:4px solid #f43f5e}
    .quick-card span{font-size:28px}
    .quick-card div{flex:1}
    .quick-card b{display:block;font-size:14px;color:#0f172a;margin-bottom:4px}
    .quick-card small{color:#64748b;font-size:12px}
    .quick-card strong{color:#047857;font-size:18px}
    .wellness-content{display:grid;grid-template-columns:1fr 420px;gap:32px;margin-top:32px}
    .support-column{display:flex;flex-direction:column;gap:20px}
    .quote-card{padding:24px;background:#f0fdfa;border:1px solid #99f6e4;border-radius:16px;position:relative}
    .quote-card span{position:absolute;top:8px;left:16px;font-size:28px;color:#14b8a6;line-height:1}
    .quote-card p{margin:0 0 12px;padding-left:40px;font-size:15px;color:#0f172a;line-height:1.6}
    .quote-card small{display:block;padding-left:40px;color:#047857;font-size:12px;font-style:italic}
    .resource-card{display:flex;gap:16px;padding:20px;background:#fff;border:1px solid #e2e8f0;border-radius:16px}
    .resource-card .resource-icon{font-size:24px}
    .resource-card b{display:block;font-size:14px;color:#0f172a;margin-bottom:4px}
    .resource-card p{margin:0;color:#64748b;font-size:13px;line-height:1.5}
    .assistant-card{background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:24px}
    .assistant-heading{display:flex;align-items:center;gap:16px;margin-bottom:20px}
    .assistant-avatar{font-size:28px}
    .assistant-heading span{display:block;color:#047857;font-size:9px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}
    .assistant-heading h2{margin:0;font-size:18px;color:#0f172a}
    .assistant-heading small{display:block;margin-top:4px;color:#64748b;font-size:12px}
    .assistant-heading i{color:#22c55e;font-size:10px}
    .chat-history{height:320px;overflow-y:auto;padding:16px;background:#f8fafc;border-radius:12px;margin-bottom:16px;display:flex;flex-direction:column;gap:12px}
    .chat-line{display:flex;flex-direction:column;max-width:85%}
    .chat-line.from-user{align-self:flex-end}
    .chat-bubble{padding:12px 16px;border-radius:18px;font-size:14px;line-height:1.5}
    .chat-line.from-user .chat-bubble{background:#0f766e;color:#fff;border-bottom-right-radius:4px}
    .chat-line:not(.from-user) .chat-bubble{background:#fff;border:1px solid #e2e8f0;color:#0f172a;border-bottom-left-radius:4px}
    .chat-line small{font-size:10px;color:#64748b;margin-top:4px;text-align:right}
    .chat-line.from-user small{text-align:left}
    .typing{display:flex;gap:4px;padding:8px 12px;color:#64748b;font-size:12px}
    .typing i{width:6px;height:6px;background:#047857;border-radius:50%;animation:bounce 1.4s infinite ease-in-out}
    .typing i:nth-child(2){animation-delay:.2s}
    .typing i:nth-child(3){animation-delay:.4s}
    @keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
    .suggestions{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
    .suggestions button{padding:8px 16px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:999px;font-size:12px;color:#334155;cursor:pointer;transition:all .2s}
    .suggestions button:hover{background:#0f766e;color:#fff;border-color:#0f766e}
    .chat-form{display:flex;gap:12px}
    .chat-form textarea{flex:1;padding:12px 16px;border:1px solid #e2e8f0;border-radius:12px;font-family:inherit;font-size:14px;resize:none;min-height:56px;max-height:120px}
    .chat-form textarea:focus{outline:none;border-color:#047857;box-shadow:0 0 0 3px #14b8a633}
    .chat-form button{padding:0 24px;background:#0f766e;color:#fff;border:none;border-radius:12px;font-weight:700;cursor:pointer;transition:background .2s}
    .chat-form button:disabled{background:#94a3b8;cursor:not-allowed}
    .chat-disclaimer{display:block;text-align:center;margin-top:12px;font-size:11px;color:#64748b}
    .error{color:#dc2626;font-size:12px;margin-top:8px}
    .modal-backdrop{position:fixed;inset:0;background:#00000080;display:flex;align-items:center;justify-content:center;z-index:50;padding:24px}
    .wellness-modal{background:#fff;border-radius:24px;padding:32px;max-width:420px;width:100%;box-shadow:0 24px 48px #00000020;position:relative}
    .wellness-modal .close{position:absolute;top:16px;right:16px;width:32px;height:32px;border:none;background:#f1f5f9;border-radius:50%;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center}
    .modal-symbol{font-size:40px;text-align:center;margin-bottom:8px}
    .modal-kicker{display:block;color:#047857;font-size:9px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;text-align:center;margin-bottom:8px}
    .wellness-modal h2{margin:0 0 12px;font-size:22px;text-align:center;color:#0f172a}
    .wellness-modal p{margin:0 0 20px;color:#64748b;text-align:center;line-height:1.6}
    .wellness-modal ol{padding-left:20px;margin:0 0 20px;color:#334155;line-height:2}
    .wellness-modal li{margin-bottom:8px}
    .wellness-modal li b{color:#047857}
    .crisis-box{background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin:16px 0}
    .crisis-box b{display:block;margin-bottom:8px;color:#991b1b}
    .crisis-box span{display:block;margin-bottom:4px;color:#7f1d1d;font-size:13px}
    .modal-action{width:100%;padding:14px;background:#0f766e;color:#fff;border:none;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer;transition:background .2s}
    .modal-action:hover{background:#0f766e}
  `]
})
export class BienestarComponent {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);
  userName = this.auth.session()?.nombreUsers || this.auth.session()?.emailUsers || "USUARIO";
  prompt = ""; error = ""; loading = false; groundingOpen = false; crisisOpen = false;
  readonly suggestions = AI_SUGGESTIONS.wellbeing;
  messages: ChatMessage[] = [{ text: "Hola. Estoy aquí para escucharte. Puedes contarme cómo te sientes, sin juicios.", user: false, time: this.now() }];

  useSuggestion(value: string): void { this.prompt = value; }
  onEnter(event: Event): void { const keyboardEvent = event as KeyboardEvent; if (!keyboardEvent.shiftKey) { event.preventDefault(); this.ask(); } }
  ask(): void {
    const text = this.prompt.trim(); if (!text || this.loading) return;
    this.messages.push({ text, user: true, time: this.now() }); this.prompt = ""; this.error = ""; this.loading = true;
    this.api.askAi("wellbeing", this.auth.session()?.idUsers ?? 0, text).subscribe({
      next: (value) => { this.messages.push({ text: value.respuesta, user: false, time: this.now() }); this.loading = false; this.changeDetector.detectChanges(); },
      error: (error) => { this.messages.push({ text: error.error?.error ?? "El proveedor de IA no está disponible.", user: false, time: this.now() }); this.loading = false; this.changeDetector.detectChanges(); }
    });
  }
  now(): string { return new Date().toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" }); }
logout(): void { this.auth.logout(); void this.router.navigateByUrl("/login"); }
}
