import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { finalize, Subscription } from "rxjs";
import { ApiService } from "../../core/services/api.service";
import { AuthService } from "../../core/services/auth.service";
import { PRIORIDADES, ROLES, ALERT_ESTADOS } from "../../core/config/constants";

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
        <div class="page-heading"><div><span class="eyebrow">SENTINEL • {{ sectionLabel() }}</span><h1>{{ config.title }}</h1><p>{{ sectionDescription() }}</p></div>
        <button class="btn-primary" type="button" (click)="reset()" *ngIf="canCreate()" [disabled]="!canCreate()">+ {{ createLabel() }}</button></div>
        <div class="table-toolbar"><input class="input-clinical" [(ngModel)]="search" (ngModelChange)="filter()" [placeholder]="searchPlaceholder()"><button type="button" class="secondary" (click)="load()">Actualizar</button></div>
        <form (ngSubmit)="save()" class="resource-form" *ngIf="canCreate() || editingId">
          <label *ngFor="let field of config.fields">{{ label(field) }}<textarea *ngIf="isLongField(field)" [name]="field" [(ngModel)]="form[field]" [placeholder]="field"></textarea><select *ngIf="field.toLowerCase().includes('prioridad')" [name]="field" [(ngModel)]="form[field]"><option value="">Selecciona prioridad</option><option *ngFor="let p of prioridades" [value]="p.value">{{ p.label }}</option></select><select *ngIf="field.toLowerCase().includes('rol')" [name]="field" [(ngModel)]="form[field]"><option value="">Selecciona rol</option><option *ngFor="let r of roles" [value]="r.value">{{ r.label }}</option></select><select *ngIf="field.toLowerCase().includes('estado') && !field.toLowerCase().includes('alertas')" [name]="field" [(ngModel)]="form[field]"><option value="">Selecciona estado</option><option *ngFor="let e of alertEstados" [value]="e.value">{{ e.label }}</option></select><input *ngIf="!isLongField(field) && !field.toLowerCase().includes('prioridad') && !field.toLowerCase().includes('rol') && !(field.toLowerCase().includes('estado') && !field.toLowerCase().includes('alertas'))" [name]="field" [(ngModel)]="form[field]" [placeholder]="field" [type]="inputType(field)"></label>
          <button type="submit" [disabled]="saving">{{ editingId ? "Actualizar" : "Crear" }}</button>
          <button *ngIf="editingId" type="button" class="secondary" (click)="reset()">Cancelar</button>
        </form>
        <p class="error" *ngIf="error">{{ error }}</p><p class="success" *ngIf="message">{{ message }}</p>
      </section>
      <section class="clinical-card page-card">
        <div class="table-toolbar"><h2>Registros ({{ filteredItems.length }})</h2></div>
        <p class="muted" *ngIf="loading">Cargando registros...</p>
        <table class="data-table" *ngIf="!loading && !error"><thead><tr><th>ID REF</th><th *ngFor="let field of config.fields">{{ field }}</th><th>Acciones</th></tr></thead>
          <tbody><tr *ngFor="let item of filteredItems"><td>{{ resourceId(item) }}</td><td *ngFor="let field of config.fields">{{ display(item[field]) }}</td>
            <td>
              <button type="button" (click)="edit(item)" *ngIf="canEdit()">Editar</button>
              <button type="button" class="secondary" (click)="confirmAgenda(resourceId(item))" *ngIf="config.key === 'agenda' && canEdit()">Confirmar</button>
              <button type="button" class="danger" (click)="remove(resourceId(item))" *ngIf="canDelete()">Eliminar</button>
            </td>
          </tr></tbody>
        </table>
        <p class="muted" *ngIf="!loading && !error && !items.length">No hay registros disponibles.</p>
      </section>
    </main>
  `
})
export class ResourceComponent implements OnDestroy, OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private routeSubscription?: Subscription;
  private dataSubscription?: Subscription;
  @Input() resource?: ResourceConfig;
  config: ResourceConfig = { title: "", path: "", fields: [] };
  private loadedPath = "";
  items: Array<Record<string, any>> = [];
  filteredItems: Array<Record<string, any>> = [];
  form: Record<string, any> = {};
  editingId?: number;
  search = "";
  error = "";
  message = "";
  loading = false;
  saving = false;

  readonly prioridades = PRIORIDADES;
  readonly roles = ROLES;
  readonly alertEstados = ALERT_ESTADOS;

  ngOnInit(): void {
    this.applyResource(this.resource ?? this.route.snapshot.data["resource"] as ResourceConfig | undefined);
    this.routeSubscription = this.route.data.subscribe((data) => {
      this.applyResource(data["resource"] as ResourceConfig | undefined);
    });
  }
  private applyResource(resource: ResourceConfig | undefined): void {
    if (!resource || resource.path === this.loadedPath) return;
    this.loadedPath = resource.path;
    this.config = resource;
    this.search = "";
    this.items = [];
    this.filteredItems = [];
    this.error = "";
    this.message = "";
    this.loading = false;
    this.reset();
    this.load();
  }
  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.dataSubscription?.unsubscribe();
  }

  canRead(): boolean {
    return this.auth.canRead(this.config.path);
  }

  canWrite(): boolean {
    return this.auth.canWrite(this.config.path);
  }

  canCreate(): boolean {
    return this.config.canCreate !== false && this.canWrite();
  }

  canEdit(): boolean {
    return this.canWrite();
  }

  canDelete(): boolean {
    return this.config.canDelete !== false && this.canWrite();
  }

  load(): void {
    if (!this.canRead()) {
      this.error = "No tienes permisos para ver este recurso.";
      this.items = [];
      this.filteredItems = [];
      this.changeDetector.detectChanges();
      return;
    }
    this.dataSubscription?.unsubscribe();
    this.loading = true;
    this.error = "";
    this.dataSubscription = this.api.collection(this.config.path).pipe(
      finalize(() => {
        this.loading = false;
        this.changeDetector.detectChanges();
      })
    ).subscribe({
      next: (value: any) => { this.items = Array.isArray(value) ? value : value.data ?? []; this.filter(); this.changeDetector.detectChanges(); },
      error: (err) => {
        this.items = [];
        this.filteredItems = [];
        if (err.status === 403) {
          this.error = "No tienes permisos para acceder a este recurso.";
        } else if (err.status === 0) {
          this.error = "No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose en http://localhost:8082.";
        } else {
          this.error = err.error?.error ?? "No se pudieron cargar los registros.";
        }
        this.changeDetector.detectChanges();
      }
    });
  }

  resourceId(item: Record<string, any>): number {
    return Number(item["id"] ?? item["idUsers"] ?? item["idAlertas"] ?? item["idEstaciones"] ?? item["idDespachoEmergencias"] ?? item["idAgendaCharlas"] ?? item["idStaffAutoridad"] ?? item["idCatalogoEmergencias"] ?? item["idCatalogoEntidades"] ?? item["userid"] ?? item["idUser"]);
  }

  filter(): void { const needle = this.search.trim().toLowerCase(); this.filteredItems = !needle ? [...this.items] : this.items.filter((item) => JSON.stringify(item).toLowerCase().includes(needle)); }

  label(field: string): string { return field.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase()); }

  confirmAgenda(id: number): void { this.api.confirmAgenda(id).subscribe({ next: () => { this.message = "Asistencia confirmada."; this.load(); }, error: (err) => this.error = err.error?.error ?? "No se pudo confirmar la asistencia." }); }

  sectionLabel(): string { return this.config.key === "alertas" ? "MONITOR" : this.config.key === "agenda" ? "CAPACITACIONES" : this.config.key === "vital-data" ? "FICHA CLÍNICA" : "CONFIGURACIÓN"; }

  sectionDescription(): string { const descriptions: Record<string, string> = { usuarios: "Administra las cuentas, roles y PIN de emergencia.", especialistas: "Certifica y actualiza el cuerpo médico técnico.", despachos: "Asigna unidades y estaciones a incidentes activos.", agenda: "Programa sesiones informativas y confirma asistencia.", emergencias: "Define protocolos y prioridades de respuesta.", entidades: "Mantén el directorio de instituciones aliadas.", estaciones: "Gestiona centros de control, ubicación y contacto.", staff: "Coordina al personal de autoridad por estación.", "vital-data": "Consulta y administra fichas médicas de usuarios." }; return descriptions[this.config.key ?? ""] ?? "Control de acceso, registros y operaciones del sistema"; }

  createLabel(): string { return this.config.key === "agenda" ? "Agendar charla" : this.config.key === "despachos" ? "Nuevo despacho" : "Nuevo registro"; }

  searchPlaceholder(): string { return this.config.key === "estaciones" ? "Buscar estación..." : this.config.key === "agenda" ? "Buscar por fecha o participante..." : "Buscar por texto o ID..."; }

  isLongField(field: string): boolean { return ["biografia", "alergias", "enfermedadesCronicas", "contactoEmergencia", "direccion"].includes(field); }

  inputType(field: string): string { const value = field.toLowerCase(); return value.includes("fecha") ? "datetime-local" : value.includes("latitud") || value.includes("longitud") || value.includes("id") || value.includes("telefono") ? "number" : "text"; }

  display(value: unknown): string { return value === null || value === undefined ? "" : typeof value === "object" ? JSON.stringify(value) : String(value); }

  edit(item: Record<string, any>): void {
    if (!this.canEdit()) return;
    this.editingId = this.resourceId(item);
    this.form = { ...item };
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  reset(): void { this.editingId = undefined; this.form = {}; }

  save(): void {
    if (!this.canWrite()) {
      this.error = "No tienes permisos para realizar esta operación.";
      return;
    }
    this.saving = true;
    this.error = "";
    const operation = this.editingId ? this.api.update(this.config.path, this.editingId, this.form) : this.api.create(this.config.path, this.form);
    operation.subscribe({ next: () => { this.message = "Operación completada."; this.error = ""; this.saving = false; this.reset(); this.load(); }, error: (err) => { this.saving = false; this.error = err.error?.error ?? "No se pudo guardar."; this.changeDetector.detectChanges(); } });
  }

  remove(id: number): void {
    if (!this.canDelete()) {
      this.error = "No tienes permisos para eliminar.";
      return;
    }
    if (!confirm(`¿Eliminar el registro ${id}?`)) return;
    this.api.remove(this.config.path, id).subscribe({ next: () => { this.message = "Registro eliminado."; this.load(); }, error: (err) => this.error = err.error?.error ?? "No se pudo eliminar." });
  }
}
