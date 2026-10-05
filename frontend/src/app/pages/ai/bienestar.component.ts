import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { ApiService } from "../../core/services/api.service";
import { AuthService } from "../../core/services/auth.service";

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="page-shell wellbeing"><section class="clinical-card page-card"><span class="eyebrow">SENTINEL • ESPACIO SEGURO</span><h1>Bienestar psicológico</h1><p class="lead">Un espacio privado para ordenar lo que sientes y encontrar apoyo inicial.</p><div class="wellbeing-actions"><button (click)="groundingOpen = true">Ejercicio 5-4-3-2-1</button><button (click)="crisisOpen = true">Línea de apoyo</button><button (click)="router.navigateByUrl('/diario')">Abrir diario</button><button (click)="router.navigateByUrl('/respiracion')">Respiración guiada</button></div></section>
      <section class="clinical-card page-card"><h2>Asistente de bienestar</h2><textarea [(ngModel)]="prompt" placeholder="Escribe cómo te sientes..."></textarea><button class="btn-primary" (click)="ask()" [disabled]="loading">{{ loading ? "Analizando..." : "Consultar asistente" }}</button><div class="conversation"><div *ngFor="let message of messages" [class.user-message]="message.user" [class.bot-message]="!message.user">{{ message.text }}</div></div><p class="error" *ngIf="error">{{ error }}</p></section></main>
    <div class="modal-backdrop" *ngIf="groundingOpen"><div class="modal"><h2>Ejercicio 5-4-3-2-1</h2><p>Nombra lentamente 5 cosas que puedas ver, 4 que puedas tocar, 3 que puedas escuchar, 2 que puedas oler y 1 que puedas saborear.</p><button class="btn-primary" (click)="groundingOpen = false">Entendido</button></div></div>
    <div class="modal-backdrop" *ngIf="crisisOpen"><div class="modal"><h2>Apoyo inmediato</h2><p>Si estás en peligro inmediato, contacta a los servicios de emergencia de tu localidad o busca a una persona de confianza. SENTINEL no sustituye atención profesional.</p><button class="btn-primary" (click)="crisisOpen = false">Cerrar</button></div></div>
  `
})
export class BienestarComponent {
  readonly router = inject(Router); private readonly api = inject(ApiService); private readonly auth = inject(AuthService);
  prompt = ""; error = ""; loading = false; groundingOpen = false; crisisOpen = false; messages: { text: string; user: boolean }[] = [];
  ask(): void { const text = this.prompt.trim(); if (!text) return; this.messages.push({ text, user: true }); this.prompt = ""; this.loading = true; this.api.askAi("wellbeing", this.auth.session()?.idUsers ?? 0, text).subscribe({ next: (value) => { this.messages.push({ text: value.respuesta, user: false }); this.loading = false; }, error: (error) => { this.messages.push({ text: error.error?.error ?? "El proveedor de IA no está disponible.", user: false }); this.loading = false; } }); }
}
