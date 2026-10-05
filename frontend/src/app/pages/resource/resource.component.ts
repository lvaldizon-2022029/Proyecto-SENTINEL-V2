import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { ApiService } from "../../core/services/api.service";

interface ResourceConfig {
  title: string;
  path: string;
  fields: string[];
  canCreate?: boolean;
  canDelete?: boolean;
}

@Component({
  standalone: true,
  selector: "app-resource",
  imports: [CommonModule, FormsModule],
  template: `
    <header class="glass-header"><div class="topbar"><div class="brand-row"><div class="module-icon teal">⚙</div><div><div class="module-kicker">SENTINEL • CONFIGURACIÓN</div><div class="module-title">{{ config.title }}</div></div></div><a class="user-status" href="/">Volver al panel</a></div></header>
    <main class="page-shell">
      <section class="clinical-card page-card">
        <div class="page-heading"><div><h1>{{ config.title }}</h1><p>Control de acceso, registros y operaciones del sistema</p></div><button class="btn-primary" type="button" (click)="reset()">+ Nuevo registro</button></div>
        <div class="table-toolbar"><input class="input-clinical" [(ngModel)]="search" (ngModelChange)="filter()" placeholder="Buscar por texto o ID..."><button type="button" class="secondary" (click)="load()">Actualizar</button></div>
        <form (ngSubmit)="save()" class="resource-form">
          <label *ngFor="let field of config.fields">{{ label(field) }}<input [name]="field" [(ngModel)]="form[field]" [placeholder]="field" [type]="field.toLowerCase().includes('fecha') ? 'datetime-local' : field.toLowerCase().includes('id') ? 'number' : 'text'"></label>
          <button type="submit">{{ editingId ? "Actualizar" : "Crear" }}</button>
          <button *ngIf="editingId" type="button" class="secondary" (click)="reset()">Cancelar</button>
        </form>
        <p class="error" *ngIf="error">{{ error }}</p><p class="success" *ngIf="message">{{ message }}</p>
      </section>
      <section class="clinical-card page-card">
        <div class="table-toolbar"><h2>Registros ({{ filteredItems.length }})</h2></div>
        <table class="data-table"><thead><tr><th>ID REF</th><th *ngFor="let field of config.fields">{{ field }}</th><th>Acciones</th></tr></thead>
          <tbody><tr *ngFor="let item of filteredItems"><td>{{ resourceId(item) }}</td><td *ngFor="let field of config.fields">{{ display(item[field]) }}</td>
            <td><button type="button" (click)="edit(item)">Editar</button><button *ngIf="config.canDelete !== false" type="button" class="danger" (click)="remove(resourceId(item))">Eliminar</button></td>
          </tr></tbody>
        </table>
        <p class="muted" *ngIf="!items.length">No hay registros disponibles.</p>
      </section>
    </main>
  `
})
export class ResourceComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  config = this.route.snapshot.data["resource"] as ResourceConfig;
  items: Array<Record<string, any>> = [];
  filteredItems: Array<Record<string, any>> = [];
  form: Record<string, any> = {};
  editingId?: number;
  search = "";
  error = "";
  message = "";

  constructor() { this.reset(); this.load(); }
  load(): void {
    this.api.collection(this.config.path).subscribe({
      next: (value: any) => { this.items = Array.isArray(value) ? value : value.data ?? []; this.filter(); },
      error: (err) => this.error = err.error?.error ?? "No se pudieron cargar los registros."
    });
  }
  resourceId(item: Record<string, any>): number {
    return Number(item["id"] ?? item["idUsers"] ?? item["idAlertas"] ?? item["idEstaciones"] ?? item["idDespachoEmergencias"] ?? item["idAgendaCharlas"] ?? item["idStaffAutoridad"] ?? item["idCatalogoEmergencias"] ?? item["idCatalogoEntidades"] ?? item["userid"] ?? item["idUser"]);
  }
  filter(): void { const needle = this.search.trim().toLowerCase(); this.filteredItems = !needle ? [...this.items] : this.items.filter((item) => JSON.stringify(item).toLowerCase().includes(needle)); }
  label(field: string): string { return field.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase()); }
  display(value: unknown): string { return value === null || value === undefined ? "" : typeof value === "object" ? JSON.stringify(value) : String(value); }
  edit(item: Record<string, any>): void { this.editingId = this.resourceId(item); this.form = { ...item }; window.scrollTo({ top: 0, behavior: "smooth" }); }
  reset(): void { this.editingId = undefined; this.form = {}; }
  save(): void {
    const operation = this.editingId ? this.api.update(this.config.path, this.editingId, this.form) : this.api.create(this.config.path, this.form);
    operation.subscribe({ next: () => { this.message = "Operación completada."; this.error = ""; this.reset(); this.load(); }, error: (err) => this.error = err.error?.error ?? "No se pudo guardar." });
  }
  remove(id: number): void { if (!confirm(`¿Eliminar el registro ${id}?`)) return; this.api.remove(this.config.path, id).subscribe({ next: () => { this.message = "Registro eliminado."; this.load(); }, error: (err) => this.error = err.error?.error ?? "No se pudo eliminar." }); }
}
