import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { ApiService } from "../../core/services/api.service";

interface ResourceConfig {
  key?: string;
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
        <div class="page-heading"><div><span class="eyebrow">SENTINEL • {{ sectionLabel() }}</span><h1>{{ config.title }}</h1><p>{{ sectionDescription() }}</p></div><button class="btn-primary" type="button" (click)="reset()">+ {{ createLabel() }}</button></div>
        <div class="table-toolbar"><input class="input-clinical" [(ngModel)]="search" (ngModelChange)="filter()" [placeholder]="searchPlaceholder()"><button type="button" class="secondary" (click)="load()">Actualizar</button></div>
        <form (ngSubmit)="save()" class="resource-form">
          <label *ngFor="let field of config.fields">{{ label(field) }}<textarea *ngIf="isLongField(field)" [name]="field" [(ngModel)]="form[field]" [placeholder]="field"></textarea><select *ngIf="field.toLowerCase().includes('prioridad')" [name]="field" [(ngModel)]="form[field]"><option value="">Selecciona prioridad</option><option>BAJA</option><option>MEDIA</option><option>ALTA</option></select><select *ngIf="field.toLowerCase().includes('rol')" [name]="field" [(ngModel)]="form[field]"><option value="">Selecciona rol</option><option>USER</option><option>STAFF</option><option>ADMIN</option></select><select *ngIf="field.toLowerCase().includes('estado') && !field.toLowerCase().includes('alertas')" [name]="field" [(ngModel)]="form[field]"><option value="">Selecciona estado</option><option>PENDIENTE</option><option>ACTIVA</option><option>CONFIRMADA</option><option>COMPLETADA</option><option>CANCELADA</option></select><input *ngIf="!isLongField(field) && !field.toLowerCase().includes('prioridad') && !field.toLowerCase().includes('rol') && !(field.toLowerCase().includes('estado') && !field.toLowerCase().includes('alertas'))" [name]="field" [(ngModel)]="form[field]" [placeholder]="field" [type]="inputType(field)"></label>
          <button type="submit">{{ editingId ? "Actualizar" : "Crear" }}</button>
          <button *ngIf="editingId" type="button" class="secondary" (click)="reset()">Cancelar</button>
        </form>
        <p class="error" *ngIf="error">{{ error }}</p><p class="success" *ngIf="message">{{ message }}</p>
      </section>
      <section class="clinical-card page-card">
        <div class="table-toolbar"><h2>Registros ({{ filteredItems.length }})</h2></div>
        <table class="data-table"><thead><tr><th>ID REF</th><th *ngFor="let field of config.fields">{{ field }}</th><th>Acciones</th></tr></thead>
          <tbody><tr *ngFor="let item of filteredItems"><td>{{ resourceId(item) }}</td><td *ngFor="let field of config.fields">{{ display(item[field]) }}</td>
            <td><button type="button" (click)="edit(item)">Editar</button><button *ngIf="config.key === 'agenda'" type="button" class="secondary" (click)="confirmAgenda(resourceId(item))">Confirmar</button><button *ngIf="config.canDelete !== false" type="button" class="danger" (click)="remove(resourceId(item))">Eliminar</button></td>
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
  confirmAgenda(id: number): void { this.api.create(`/Sentinel/AgendaCharlas/${id}/confirmar`, {}).subscribe({ next: () => { this.message = "Asistencia confirmada."; this.load(); }, error: (err) => this.error = err.error?.error ?? "No se pudo confirmar la asistencia." }); }
  sectionLabel(): string { return this.config.key === "alertas" ? "MONITOR" : this.config.key === "agenda" ? "CAPACITACIONES" : this.config.key === "vital-data" ? "FICHA CLÍNICA" : "CONFIGURACIÓN"; }
  sectionDescription(): string { const descriptions: Record<string, string> = { usuarios: "Administra las cuentas, roles y PIN de emergencia.", especialistas: "Certifica y actualiza el cuerpo médico técnico.", despachos: "Asigna unidades y estaciones a incidentes activos.", agenda: "Programa sesiones informativas y confirma asistencia.", emergencias: "Define protocolos y prioridades de respuesta.", entidades: "Mantén el directorio de instituciones aliadas.", estaciones: "Gestiona centros de control, ubicación y contacto.", staff: "Coordina al personal de autoridad por estación.", "vital-data": "Consulta y administra fichas médicas de usuarios." }; return descriptions[this.config.key ?? ""] ?? "Control de acceso, registros y operaciones del sistema"; }
  createLabel(): string { return this.config.key === "agenda" ? "Agendar charla" : this.config.key === "despachos" ? "Nuevo despacho" : "Nuevo registro"; }
  searchPlaceholder(): string { return this.config.key === "estaciones" ? "Buscar estación..." : this.config.key === "agenda" ? "Buscar por fecha o participante..." : "Buscar por texto o ID..."; }
  isLongField(field: string): boolean { return ["biografia", "alergias", "enfermedadesCronicas", "contactoEmergencia", "direccion"].includes(field); }
  inputType(field: string): string { const value = field.toLowerCase(); return value.includes("fecha") ? "datetime-local" : value.includes("latitud") || value.includes("longitud") || value.includes("id") || value.includes("telefono") ? "number" : "text"; }
  display(value: unknown): string { return value === null || value === undefined ? "" : typeof value === "object" ? JSON.stringify(value) : String(value); }
  edit(item: Record<string, any>): void { this.editingId = this.resourceId(item); this.form = { ...item }; window.scrollTo({ top: 0, behavior: "smooth" }); }
  reset(): void { this.editingId = undefined; this.form = {}; }
  save(): void {
    const operation = this.editingId ? this.api.update(this.config.path, this.editingId, this.form) : this.api.create(this.config.path, this.form);
    operation.subscribe({ next: () => { this.message = "Operación completada."; this.error = ""; this.reset(); this.load(); }, error: (err) => this.error = err.error?.error ?? "No se pudo guardar." });
  }
  remove(id: number): void { if (!confirm(`¿Eliminar el registro ${id}?`)) return; this.api.remove(this.config.path, id).subscribe({ next: () => { this.message = "Registro eliminado."; this.load(); }, error: (err) => this.error = err.error?.error ?? "No se pudo eliminar." }); }
}
