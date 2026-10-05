import { CommonModule } from "@angular/common";
import { Component, OnDestroy } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `<main class="page-shell"><section class="clinical-card page-card breathing"><span class="eyebrow">SENTINEL • CALMA</span><h1>Respiración guiada</h1><p>Inhala durante 4 segundos, mantén 4 y exhala durante 6.</p><div class="breathing-circle" [class.running]="running"><b>{{ phase }}</b><strong>{{ seconds }}</strong></div><div class="breathing-controls"><button class="btn-primary" *ngIf="!running" (click)="start()">Comenzar ejercicio</button><button class="secondary" *ngIf="running" (click)="stop()">Detener</button><a routerLink="/bienestar">Volver a bienestar</a></div></section></main>`
})
export class RespiracionComponent implements OnDestroy {
  running = false; phase = "Listo"; seconds = 0; private timer?: ReturnType<typeof setInterval>; private phaseIndex = 0;
  private readonly phases = [{ name: "Inhala", duration: 4 }, { name: "Mantén", duration: 4 }, { name: "Exhala", duration: 6 }];
  start(): void { this.stop(); this.running = true; this.phaseIndex = 0; this.seconds = this.phases[0].duration; this.phase = this.phases[0].name; this.timer = setInterval(() => this.tick(), 1000); }
  tick(): void { if (--this.seconds > 0) return; this.phaseIndex = (this.phaseIndex + 1) % this.phases.length; const next = this.phases[this.phaseIndex]; this.phase = next.name; this.seconds = next.duration; }
  stop(): void { if (this.timer) clearInterval(this.timer); this.timer = undefined; this.running = false; this.phase = "Listo"; this.seconds = 0; }
  ngOnDestroy(): void { this.stop(); }
}
