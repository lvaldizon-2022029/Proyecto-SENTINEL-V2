import { CommonModule } from "@angular/common";
import { Component, OnDestroy } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="breathing-page">
      <a routerLink="/bienestar" class="back-link">← Volver a bienestar</a>
      <section class="breathing-card">
        <span class="breathing-kicker">SENTINEL • CALMA</span><h1>Respiración consciente</h1><p class="intro">Sigue el círculo y permite que tu respiración encuentre un ritmo tranquilo.</p>
        <div class="instruction-row"><span>4 s</span><b>Inhala</b><span>4 s</span><b>Mantén</b><span>6 s</span><b>Exhala</b></div>
        <div class="breath-stage" [class.active]="running" [class.inhale]="phase === 'Inhala'" [class.hold]="phase === 'Mantén'" [class.exhale]="phase === 'Exhala'"><div class="breath-orbit"></div><div class="breath-core"><small>{{ running ? phase : "Cuando estés listo" }}</small><strong>{{ running ? seconds : "♡" }}</strong><span>{{ running ? "segundos" : "Respira" }}</span></div></div>
        <div class="breath-status" *ngIf="running">Ciclo {{ cycle }} · Sigue el ritmo sin forzar.</div>
        <div class="breathing-controls"><button class="start" *ngIf="!running" (click)="start()">Comenzar ejercicio</button><button class="stop" *ngIf="running" (click)="stop()">Detener ejercicio</button></div>
        <p class="note">Puedes detener el ejercicio en cualquier momento. Busca una postura cómoda y relaja los hombros.</p>
      </section>
    </main>
  `,
  styles: [`
    :host{display:block;min-height:100vh;background:linear-gradient(145deg,#effcf8,#f8fafc 55%,#f4f0ff);font-family:Inter,system-ui,sans-serif;color:#243047}.breathing-page{max-width:760px;margin:auto;padding:30px 20px 60px}.back-link{color:#0c9d80;font-size:11px;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:.1em}.breathing-card{margin-top:22px;padding:38px 48px;text-align:center;border:1px solid #d8eee7;border-radius:32px;background:#ffffffe8;box-shadow:0 22px 45px #0f172a0d}.breathing-kicker{color:#0c9d80;font-size:10px;font-weight:900;letter-spacing:.2em}.breathing-card h1{margin:10px 0 6px;font-size:32px;letter-spacing:-.06em;text-transform:uppercase}.intro{margin:0 auto;color:#64748b;font-size:13px;line-height:1.6;max-width:450px}.instruction-row{display:flex;justify-content:center;gap:12px;margin:27px auto 10px;align-items:center;color:#94a3b8;font-size:10px}.instruction-row b{color:#0c9d80;text-transform:uppercase;font-size:10px}.breath-stage{position:relative;display:grid;place-items:center;width:280px;height:280px;margin:20px auto}.breath-orbit{position:absolute;inset:8px;border:1px dashed #9be6d3;border-radius:50%}.breath-stage:before,.breath-stage:after{content:"";position:absolute;border-radius:50%;background:#d9f8ed}.breath-stage:before{inset:33px;opacity:.65}.breath-stage:after{inset:62px;opacity:.7}.breath-core{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;width:145px;height:145px;border-radius:50%;background:linear-gradient(145deg,#12b995,#0c9d80);color:#fff;box-shadow:0 14px 30px #0c9d8045}.breath-core small,.breath-core span{font-size:10px;text-transform:uppercase;letter-spacing:.1em}.breath-core strong{margin:4px 0;font-size:43px;line-height:1}.breath-stage.active .breath-core{animation:breathPulse 14s ease-in-out infinite}.breath-stage.inhale .breath-core{animation-duration:4s;transform:scale(1.12)}.breath-stage.hold .breath-core{transform:scale(1.12)}.breath-stage.exhale .breath-core{animation-duration:6s;transform:scale(.88)}@keyframes breathPulse{0%,100%{transform:scale(.88)}28%{transform:scale(1.12)}57%{transform:scale(1.12)}100%{transform:scale(.88)}}.breath-status{color:#0c9d80;font-size:11px;font-weight:800}.breathing-controls{margin-top:22px}.start,.stop{border:0;border-radius:12px;padding:14px 24px;color:#fff;font-size:10px;font-weight:900;letter-spacing:.15em;text-transform:uppercase;cursor:pointer}.start{background:#0caa8c}.stop{background:#64748b}.note{margin:25px auto 0;color:#94a3b8;font-size:10px;line-height:1.5;max-width:430px}@media(max-width:560px){.breathing-card{padding:30px 20px}.breathing-card h1{font-size:25px}.instruction-row{gap:6px}.breath-stage{width:240px;height:240px}}
  `]
})
export class RespiracionComponent implements OnDestroy {
  running = false; phase = "Listo"; seconds = 0; cycle = 1; private timer?: ReturnType<typeof setInterval>; private phaseIndex = 0;
  private readonly phases = [{ name: "Inhala", duration: 4 }, { name: "Mantén", duration: 4 }, { name: "Exhala", duration: 6 }];
  start(): void { this.stop(); this.running = true; this.cycle = 1; this.phaseIndex = 0; this.seconds = this.phases[0].duration; this.phase = this.phases[0].name; this.timer = setInterval(() => this.tick(), 1000); }
  tick(): void { if (--this.seconds > 0) return; this.phaseIndex = (this.phaseIndex + 1) % this.phases.length; if (this.phaseIndex === 0) this.cycle++; const next = this.phases[this.phaseIndex]; this.phase = next.name; this.seconds = next.duration; }
  stop(): void { if (this.timer) clearInterval(this.timer); this.timer = undefined; this.running = false; this.phase = "Listo"; this.seconds = 0; }
  ngOnDestroy(): void { this.stop(); }
}
