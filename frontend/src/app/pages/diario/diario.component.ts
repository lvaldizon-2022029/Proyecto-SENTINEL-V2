import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, OnInit, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ApiService, DiarioEntry } from "../../core/services/api.service";
import { AuthService } from "../../core/services/auth.service";

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="page-shell diary-layout" aria-labelledby="diary-title">
      <section class="clinical-card diary-list" aria-label="Historial de entradas"><div class="page-heading"><div><span class="eyebrow">SENTINEL • BIENESTAR</span><h1 id="diary-title">Diario emocional</h1></div><button class="btn-primary" (click)="newEntry()">+ Nueva entrada</button></div>
        <button *ngFor="let entry of entries" class="diary-select" [class.selected]="selected?.id === entry.id" (click)="select(entry)" [attr.aria-label]="'Abrir entrada ' + (entry.titulo || 'sin título')"><b>{{ entry.titulo || "Sin título" }}</b><small>{{ entry.fechaRegistro ? (entry.fechaRegistro | date:'short') : "Entrada" }}</small></button>
        <p class="muted" *ngIf="!entries.length">Aún no tienes entradas.</p>
      </section>
      <section class="clinical-card diary-editor" aria-label="Editor de entrada"><span class="eyebrow">ESPACIO PRIVADO</span>
        <form [formGroup]="form" (ngSubmit)="save()" novalidate>
          <label class="sr-only" for="diary-entry-title">Título de la entrada</label>
          <input id="diary-entry-title" class="diary-title" name="title" formControlName="title" placeholder="Título de la entrada" required maxlength="200" aria-describedby="diary-title-error diary-counter">
          <div class="error" id="diary-title-error" *ngIf="control('title').invalid && (control('title').dirty || control('title').touched || submitted)">
            <span *ngIf="control('title').errors?.['required']">El título es obligatorio.</span>
            <span *ngIf="control('title').errors?.['maxlength']">El título no puede exceder 200 caracteres.</span>
          </div>
          <label class="sr-only" for="diary-entry-content">Contenido de la entrada</label>
          <textarea id="diary-entry-content" name="content" formControlName="content" maxlength="5000" placeholder="Escribe tus pensamientos..." required aria-describedby="diary-content-error diary-counter"></textarea>
          <div class="error" id="diary-content-error" *ngIf="control('content').invalid && (control('content').dirty || control('content').touched || submitted)">
            <span *ngIf="control('content').errors?.['required']">El contenido es obligatorio.</span>
            <span *ngIf="control('content').errors?.['maxlength']">El contenido no puede exceder 5000 caracteres.</span>
          </div>
          <div class="editor-footer"><small id="diary-counter">{{ (form.getRawValue().content?.length ?? 0) }}/5000 caracteres</small>
            <div>
              <button type="button" class="secondary" *ngIf="selected" (click)="remove(selected.id!)">Eliminar</button>
              <button type="submit" class="btn-primary" [disabled]="saving">{{ selected ? "Actualizar entrada" : "Guardar entrada" }}</button>
            </div>
          </div>
        </form>
        <p class="success" *ngIf="message" role="status">{{ message }}</p>
        <p class="error" *ngIf="error" role="alert">{{ error }}</p>
      </section>
    </main>
  `,
  styles: [`
    :host{display:block;min-height:100vh;background:#fbfaf7;font-family:Inter,system-ui,sans-serif;color:#334155}.diary-layout{max-width:1120px;grid-template-columns:300px minmax(0,1fr);align-items:start}.diary-list,.diary-editor{min-height:560px}.diary-list{padding:25px;background:#fffdf9;border-color:#f1e5d4}.diary-list .page-heading{display:block;margin-bottom:24px}.diary-list h1{font-size:23px}.diary-select{display:block;width:100%;margin:8px 0;padding:14px;text-align:left;border:1px solid #f1e5d4;border-radius:13px;background:#fff;color:#475569;cursor:pointer}.diary-select:hover,.diary-select.selected{border-color:#e9b86b;background:#fff7ed;box-shadow:0 3px 10px #e9b86b22}.diary-select b,.diary-select small{display:block}.diary-select b{font-size:12px}.diary-select small{margin-top:5px;color:#64748b;font-size:10px}.diary-editor{padding:34px;background:#fff;border-color:#f1e5d4}.diary-title{margin:22px 0 15px;border:0!important;border-bottom:1px solid #f1e5d4!important;border-radius:0!important;padding:13px 0!important;background:transparent!important;font-size:22px!important;font-weight:800}.diary-editor textarea{min-height:350px;border-color:#f1e5d4;background:#fffdf9;line-height:1.8;resize:vertical}.editor-footer{display:flex;justify-content:space-between;align-items:center;margin-top:18px}.editor-footer small{color:#64748b;font-size:10px}.editor-footer div{display:flex;gap:9px}.error{color:#dc2626;font-size:12px;margin-top:4px}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media(max-width:760px){.diary-layout{grid-template-columns:1fr}.diary-list,.diary-editor{min-height:auto}.diary-list{order:2}.diary-editor{order:1}}
  `]
})
export class DiarioComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly fb = inject(FormBuilder);
  readonly form = this.fb.group({
    title: ["", [Validators.required, Validators.maxLength(200)]],
    content: ["", [Validators.required, Validators.maxLength(5000)]],
  });
  message = ""; error = ""; entries: DiarioEntry[] = []; selected?: DiarioEntry; saving = false; submitted = false;

  ngOnInit(): void { this.load(); }

  control(name: "title" | "content") {
    return this.form.get(name)!;
  }

  load(): void {
    this.api.diary(this.auth.session()?.idUsers ?? 0).subscribe({
      next: (value: any) => { this.entries = Array.isArray(value) ? value : []; this.changeDetector.detectChanges(); },
      error: () => { this.error = "No se pudo cargar el historial."; this.changeDetector.detectChanges(); }
    });
  }

  select(entry: DiarioEntry): void {
    this.selected = entry;
    this.form.setValue({ title: entry.titulo ?? "", content: entry.contenido ?? "" });
    this.message = ""; this.error = ""; this.submitted = false;
  }

  newEntry(): void {
    this.selected = undefined;
    this.form.reset({ title: "", content: "" });
    this.message = ""; this.error = ""; this.submitted = false;
  }

  save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = "Escribe un título y contenido antes de guardar.";
      return;
    }
    const value = this.form.getRawValue();
    const payload = { titulo: (value.title ?? "").trim(), contenido: (value.content ?? "").trim(), userId: this.auth.session()?.idUsers };
    if (!payload.titulo || !payload.contenido) { this.error = "Escribe un título y contenido antes de guardar."; return; }
    this.saving = true; this.error = "";
    const request = this.selected?.id ? this.api.updateDiary(this.selected.id, payload) : this.api.saveDiary(payload);
    request.subscribe({ next: () => { this.message = this.selected ? "Entrada actualizada." : "Entrada guardada."; this.error = ""; this.saving = false; this.load(); }, error: (error) => { this.saving = false; this.error = error.error?.error ?? "No se pudo guardar la entrada."; this.changeDetector.detectChanges(); } });
  }

  remove(id: number): void {
    if (!confirm("¿Eliminar esta entrada del diario?")) return;
    this.api.deleteDiary(id).subscribe({ next: () => { this.newEntry(); this.message = "Entrada eliminada."; this.load(); }, error: () => this.error = "No se pudo eliminar la entrada." });
  }
}
