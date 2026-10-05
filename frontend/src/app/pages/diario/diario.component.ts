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
  `,
  styles: [`
    :host{display:block;min-height:100vh;background:#fbfaf7;font-family:Inter,system-ui,sans-serif;color:#334155}.diary-layout{max-width:1120px;grid-template-columns:300px minmax(0,1fr);align-items:start}.diary-list,.diary-editor{min-height:560px}.diary-list{padding:25px;background:#fffdf9;border-color:#f1e5d4}.diary-list .page-heading{display:block;margin-bottom:24px}.diary-list h1{font-size:23px}.diary-select{display:block;width:100%;margin:8px 0;padding:14px;text-align:left;border:1px solid #f1e5d4;border-radius:13px;background:#fff;color:#475569;cursor:pointer}.diary-select:hover,.diary-select.selected{border-color:#e9b86b;background:#fff7ed;box-shadow:0 3px 10px #e9b86b22}.diary-select b,.diary-select small{display:block}.diary-select b{font-size:12px}.diary-select small{margin-top:5px;color:#94a3b8;font-size:10px}.diary-editor{padding:34px;background:#fff;border-color:#f1e5d4}.diary-title{margin:22px 0 15px;border:0!important;border-bottom:1px solid #f1e5d4!important;border-radius:0!important;padding:13px 0!important;background:transparent!important;font-size:22px!important;font-weight:800}.diary-editor textarea{min-height:350px;border-color:#f1e5d4;background:#fffdf9;line-height:1.8;resize:vertical}.editor-footer{display:flex;justify-content:space-between;align-items:center;margin-top:18px}.editor-footer small{color:#94a3b8;font-size:10px}.editor-footer div{display:flex;gap:9px}@media(max-width:760px){.diary-layout{grid-template-columns:1fr}.diary-list,.diary-editor{min-height:auto}.diary-list{order:2}.diary-editor{order:1}}
  `]
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
