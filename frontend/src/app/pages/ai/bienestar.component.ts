import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { ApiService } from "../../core/services/api.service";
import { AuthService } from "../../core/services/auth.service";

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
          <form class="chat-form" (ngSubmit)="ask()"><textarea name="prompt" [(ngModel)]="prompt" (keydown.enter)="onEnter($event)" placeholder="Cuéntame cómo te sientes..." rows="2"></textarea><button type="submit" [disabled]="loading || !prompt.trim()">➤</button></form>
          <small class="chat-disclaimer">Si estás en peligro inmediato, llama a los servicios de emergencia de tu localidad.</small>
          <p class="error" *ngIf="error">{{ error }}</p>
        </section>
      </section>
    </main>

    <div class="modal-backdrop" *ngIf="groundingOpen"><section class="wellness-modal grounding-modal"><button class="close" (click)="groundingOpen = false">×</button><div class="modal-symbol">◌</div><span class="modal-kicker">TÉCNICA DE ANCLAJE</span><h2>5-4-3-2-1</h2><p>Observa tu entorno y nombra lentamente:</p><ol><li><b>5</b> cosas que puedas ver</li><li><b>4</b> cosas que puedas tocar</li><li><b>3</b> sonidos que puedas escuchar</li><li><b>2</b> aromas que puedas reconocer</li><li><b>1</b> sabor que puedas identificar</li></ol><button class="modal-action" (click)="groundingOpen = false">Comenzar ejercicio</button></section></div>
    <div class="modal-backdrop" *ngIf="crisisOpen"><section class="wellness-modal crisis-modal"><button class="close" (click)="crisisOpen = false">×</button><div class="modal-symbol">♡</div><span class="modal-kicker">APOYO INMEDIATO</span><h2>No estás solo/a</h2><p>Si existe un riesgo inmediato, busca a una persona de confianza y contacta los servicios de emergencia de tu localidad.</p><div class="crisis-box"><b>También puedes:</b><span>Acudir al centro de salud más cercano.</span><span>Hablar con un familiar, amigo o profesional.</span><span>Usar el botón de pánico de SENTINEL si necesitas auxilio.</span></div><button class="modal-action" (click)="crisisOpen = false">Entendido</button></section></div>
  `,
  styles: [`
    :host{display:block;min-height:100vh;background:#f8fafc;color:#243047;font-family:Inter,system-ui,sans-serif}.wellness-header{position:sticky;top:0;z-index:10;background:#ffffffe8;backdrop-filter:blur(12px);border-bottom:1px solid #d7f5eb;padding:15px 28px}.wellness-header-inner{max-width:1180px;margin:auto;display:flex;justify-content:space-between;align-items:center}.wellness-brand{display:flex;align-items:center;gap:12px;color:#243047;text-decoration:none}.wellness-brand>span{display:grid;place-items:center;width:43px;height:43px;border-radius:14px;background:#23c7a4;color:#fff;font-size:27px;box-shadow:0 8px 18px #b9eee2}.wellness-brand small,.assistant-heading span,.modal-kicker{display:block;color:#0c9d80;font-size:9px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}.wellness-brand b{display:block;margin-top:3px;font-size:14px;text-transform:uppercase}.wellness-user{text-align:right;display:flex;align-items:center;gap:18px}.wellness-user b,.wellness-user small{display:block}.wellness-user b{font-size:11px}.wellness-user small{margin-top:4px;color:#94a3b8;font-size:9px;text-transform:uppercase}.wellness-user i{color:#22c55e;font-style:normal}.wellness-user button{border:0;background:#f1f5f9;color:#64748b;border-radius:10px;padding:10px 13px;font-size:10px;font-weight:900;text-transform:uppercase}.wellness-shell{max-width:1180px;margin:34px auto;padding:0 24px 60px}.wellness-hero{position:relative;overflow:hidden;min-height:190px;padding:35px 42px;border-radius:30px;background:linear-gradient(115deg,#0f766e,#00c9a7);color:#fff;box-shadow:0 18px 35px #00c9a72e}.wellness-hero>div:first-child{max-width:620px}.wellness-hero span{font-size:10px;font-weight:900;letter-spacing:.2em}.wellness-hero h1{margin:12px 0 8px;font-size:34px;letter-spacing:-.06em}.wellness-hero p{margin:0;color:#d8fff5;font-size:14px;line-height:1.6}.hero-symbol{position:absolute;right:8%;bottom:-34px;font-size:190px;line-height:1;color:#ffffff1f;transform:rotate(-14deg)}.quick-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:22px 0}.quick-card{position:relative;display:flex;align-items:center;gap:12px;text-align:left;border:1px solid #e2e8f0;border-radius:18px;padding:18px 15px;background:#fff;cursor:pointer;transition:.2s}.quick-card:hover{transform:translateY(-3px);box-shadow:0 12px 25px #0f172a12}.quick-card>span{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;font-size:22px}.quick-card div{flex:1}.quick-card b,.quick-card small{display:block}.quick-card b{font-size:12px}.quick-card small{margin-top:4px;color:#64748b;font-size:10px;line-height:1.3}.quick-card>strong{color:#64748b;font-size:18px}.mint{background:#ecfdf7}.mint>span{background:#c9f5e7;color:#079779}.lavender{background:#f5f3ff}.lavender>span{background:#e5defe;color:#7864d7}.peach{background:#fff7ed}.peach>span{background:#ffebc8;color:#df8b24}.rose{background:#fff1f2}.rose>span{background:#ffe0e5;color:#df6274}.wellness-content{display:grid;grid-template-columns:290px minmax(0,1fr);gap:22px;align-items:start}.support-column{display:grid;gap:15px}.quote-card,.resource-card,.assistant-card{background:#fff;border:1px solid #e2e8f0;border-radius:24px;box-shadow:0 10px 25px #0f172a08}.quote-card{padding:24px;background:#effcf7;border-color:#ccefe3}.quote-card>span{color:#21ba99;font-size:48px;font-family:Georgia;line-height:.4}.quote-card p{margin:15px 0 14px;color:#285e53;font-size:14px;line-height:1.55;font-style:italic}.quote-card small{color:#0c9d80;font-size:9px;font-weight:900;letter-spacing:.15em}.resource-card{display:flex;gap:12px;padding:18px}.resource-icon{display:grid;place-items:center;flex:none;width:36px;height:36px;border-radius:11px;background:#f0fdf4;color:#10a37f;font-size:20px}.resource-card b{font-size:12px}.resource-card p{margin:5px 0 0;color:#64748b;font-size:11px;line-height:1.45}.assistant-card{min-height:540px;overflow:hidden}.assistant-heading{display:flex;align-items:center;gap:12px;padding:22px 24px;border-bottom:1px solid #f1f5f9;background:#fbfffd}.assistant-avatar{display:grid;place-items:center;width:45px;height:45px;border-radius:15px;background:#d8f8ed;color:#0c9d80;font-size:24px}.assistant-heading h2{margin:4px 0;font-size:19px;text-transform:uppercase;letter-spacing:-.04em}.assistant-heading small{display:block;color:#94a3b8;font-size:10px}.assistant-heading>i{margin-left:auto;color:#22c55e;font-style:normal;font-size:16px}.chat-history{height:295px;overflow-y:auto;padding:22px 24px;background:#f8fbfa}.chat-line{display:flex;flex-direction:column;align-items:flex-start;gap:4px;margin-bottom:14px}.chat-line.from-user{align-items:flex-end}.chat-bubble{max-width:78%;padding:12px 15px;border-radius:17px;border-top-left-radius:4px;background:#fff;border:1px solid #d9eee7;color:#475569;font-size:12px;line-height:1.5;white-space:pre-wrap}.from-user .chat-bubble{border:0;border-top-left-radius:17px;border-top-right-radius:4px;background:#10aa8b;color:#fff}.chat-line small{color:#a0aec0;font-size:9px}.typing{color:#0c9d80;font-size:10px;font-weight:700}.typing i{display:inline-block;width:5px;height:5px;margin-right:3px;border-radius:50%;background:#10aa8b}.suggestions{display:flex;gap:7px;flex-wrap:wrap;padding:14px 24px 0}.suggestions button{border:1px solid #c8eee2;border-radius:999px;padding:7px 10px;background:#f0fdf9;color:#0c9d80;font-size:10px;font-weight:800;cursor:pointer}.chat-form{display:flex;gap:9px;padding:14px 24px 8px}.chat-form textarea{flex:1;resize:none;border:1px solid #cbd5e1;border-radius:13px;padding:11px 13px;outline:none;font-size:12px}.chat-form textarea:focus{border-color:#10b98e;box-shadow:0 0 0 3px #d8f8ed}.chat-form button{width:43px;border:0;border-radius:13px;background:#10aa8b;color:#fff;font-size:20px;cursor:pointer}.chat-form button:disabled{opacity:.45}.chat-disclaimer{display:block;padding:0 24px 15px;color:#94a3b8;font-size:9px;text-align:center}.error{margin:0 24px 15px;padding:9px;border-radius:8px;background:#fff1f2;color:#be123c;font-size:11px}.modal-backdrop{position:fixed;inset:0;z-index:30;display:grid;place-items:center;padding:20px;background:#0f172a99;backdrop-filter:blur(5px)}.wellness-modal{position:relative;width:min(460px,100%);padding:32px;border-radius:27px;background:#fff;box-shadow:0 25px 50px #0f172a38}.close{position:absolute;right:18px;top:12px;border:0;background:none;color:#94a3b8;font-size:25px;cursor:pointer}.modal-symbol{display:grid;place-items:center;width:50px;height:50px;margin-bottom:15px;border-radius:16px;background:#d8f8ed;color:#0c9d80;font-size:26px}.wellness-modal h2{margin:7px 0 10px;font-size:27px;text-transform:uppercase;letter-spacing:-.05em}.wellness-modal>p{color:#64748b;font-size:13px;line-height:1.55}.grounding-modal ol{display:grid;gap:9px;padding:0;list-style:none}.grounding-modal li{padding:10px 12px;border-radius:10px;background:#f0fdf9;color:#475569;font-size:12px}.grounding-modal li b{display:inline-grid;place-items:center;width:22px;height:22px;margin-right:7px;border-radius:50%;background:#10aa8b;color:#fff}.crisis-box{display:grid;gap:9px;margin:18px 0;padding:15px;border-radius:13px;background:#fff7ed;color:#7c2d12;font-size:11px}.crisis-box b{font-size:12px}.modal-action{width:100%;border:0;border-radius:11px;padding:13px;background:#10aa8b;color:#fff;font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}@media(max-width:900px){.quick-grid{grid-template-columns:repeat(2,1fr)}.wellness-content{grid-template-columns:1fr}.support-column{grid-template-columns:repeat(3,1fr)}.quote-card{grid-column:1/-1}}@media(max-width:600px){.wellness-header-user>div{display:none}.wellness-shell{padding:0 14px 40px}.wellness-hero{padding:28px 24px}.wellness-hero h1{font-size:27px}.quick-grid,.support-column{grid-template-columns:1fr}.assistant-card{border-radius:18px}.chat-history{height:280px}}
  `]
})
export class BienestarComponent {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);
  userName = this.auth.session()?.nombreUsers || this.auth.session()?.emailUsers || "USUARIO";
  prompt = ""; error = ""; loading = false; groundingOpen = false; crisisOpen = false;
  suggestions = ["Estoy ansioso/a", "Necesito hablar", "No puedo dormir"];
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
