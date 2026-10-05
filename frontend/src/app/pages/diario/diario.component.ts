import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/services/api.service";
import { AuthService } from "../../core/services/auth.service";

interface DiaryEntry { id?: number; titulo?: string; contenido?: string; fecha?: string; }

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="page-shell diary-layout">
      <section class="clinical-card diary-list"><div class="page-heading"><div><span class="eyebrow">SENTINEL • BIENESTAR</span><h1>Diario emocional</h1></div><button class="btn-primary" (click)="newEntry()">+ Nueva entrada</button></div>
        <button *ngFor="let entry of entries" class="diary-select" [class.selected]="selected?.id === entry.id" (click)="select(entry)"><b>{{ entry.titulo || "Sin título" }}</b><small>{{ entry.fecha ? (entry.fecha | date:'short') : "Entrada" }}</small></button>
        <p class="muted" *ngIf="!entries.length">Aún no tienes entradas.</p>
      </section>
      <section class="clinical-card diary-editor"><span class="eyebrow">ESPACIO PRIVADO</span><input class="diary-title" name="title" [(ngModel)]="title" placeholder="Título de la entrada"><textarea name="content" [(ngModel)]="content" maxlength="5000" placeholder="Escribe tus pensamientos..."></textarea><div class="editor-footer"><small>{{ content.length }}/5000 caracteres</small><div><button class="secondary" *ngIf="selected" (click)="remove(selected.id!)">Eliminar</button><button class="btn-primary" (click)="save()">{{ selected ? "Actualizar entrada" : "Guardar entrada" }}</button></div></div><p class="success" *ngIf="message">{{ message }}</p><p class="error" *ngIf="error">{{ error }}</p></section>
    </main>
  `
})
export class DiarioComponent implements OnInit {
  private readonly api = inject(ApiService); private readonly auth = inject(AuthService);
  title = ""; content = ""; message = ""; error = ""; entries: DiaryEntry[] = []; selected?: DiaryEntry;
  ngOnInit(): void { this.load(); }
  load(): void { this.api.diary(this.auth.session()?.idUsers ?? 0).subscribe({ next: (value: any) => this.entries = Array.isArray(value) ? value : [], error: () => this.error = "No se pudo cargar el historial." }); }
  select(entry: DiaryEntry): void { this.selected = entry; this.title = entry.titulo ?? ""; this.content = entry.contenido ?? ""; this.message = ""; }
  newEntry(): void { this.selected = undefined; this.title = ""; this.content = ""; this.message = ""; }
  save(): void {
    const payload = { titulo: this.title.trim(), contenido: this.content.trim(), userId: this.auth.session()?.idUsers };
    if (!payload.titulo || !payload.contenido) { this.error = "Escribe un título y contenido antes de guardar."; return; }
    const request = this.selected?.id ? this.api.updateDiary(this.selected.id, payload) : this.api.saveDiary(payload);
    request.subscribe({ next: () => { this.message = this.selected ? "Entrada actualizada." : "Entrada guardada."; this.error = ""; this.load(); }, error: (error) => this.error = error.error?.error ?? "No se pudo guardar la entrada." });
  }
  remove(id: number): void { if (!confirm("¿Eliminar esta entrada del diario?")) return; this.api.deleteDiary(id).subscribe({ next: () => { this.newEntry(); this.message = "Entrada eliminada."; this.load(); }, error: () => this.error = "No se pudo eliminar la entrada." }); }
}
