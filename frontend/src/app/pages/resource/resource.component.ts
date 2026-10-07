import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { finalize, Subscription } from "rxjs";
import { FormBuilder, FormGroup, Validators, AbstractControl } from "@angular/forms";
import { ApiService } from "../../core/services/api.service";
import { AuthService } from "../../core/services/auth.service";
import { PRIORIDADES, ROLES, ALERT_ESTADOS, AGENDA_ESTADOS, BLOOD_GROUPS, CATALOGO_PRIORIDADES } from "../../core/config/constants";

interface ResourceConfig {
  key?: string;
  title: string;
  path: string;
  fields: string[];
  canCreate?: boolean;
  canDelete?: boolean;
}

interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'select' | 'textarea' | 'datetime-local';
  required: boolean;
  validators?: any[];
  options?: { value: string; label: string }[];
  placeholder?: string;
}

@Component({
  standalone: true,
  selector: "app-resource",
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <header class="glass-header"><div class="topbar"><div class="brand-row"><div class="module-icon teal">⚙</div><div><div class="module-kicker">SENTINEL • CONFIGURACIÓN</div><div class="module-title">{{ config.title }}</div></div></div><a class="user-status" href="/">Volver al panel</a></div></header>
    <main class="page-shell">
      <section class="clinical-card page-card">
        <div class="page-heading"><div><span class="eyebrow">SENTINEL • {{ sectionLabel() }}</span><h1>{{ config.title }}</h1><p>{{ sectionDescription() }}</p></div>
        <button class="btn-primary" type="button" (click)="reset()" *ngIf="canCreate()" [disabled]="!canCreate()">+ {{ createLabel() }}</button></div>
        <div class="table-toolbar"><input class="input-clinical" [(ngModel)]="search" (ngModelChange)="filter()" [placeholder]="searchPlaceholder()" aria-label="Buscar registros"><button type="button" class="secondary" (click)="load()">Actualizar</button></div>
        <form [formGroup]="formGroup" (ngSubmit)="save()" class="resource-form" *ngIf="canCreate() || editingId">
          <div *ngFor="let field of fieldConfigs" class="form-field">
            <label [for]="'field-' + field.name">{{ field.label }}<span class="required" *ngIf="field.required">*</span></label>
            <div class="input-wrapper">
              <textarea *ngIf="field.type === 'textarea'" [id]="'field-' + field.name" [formControlName]="field.name" [placeholder]="field.placeholder" rows="3"></textarea>
              <select *ngIf="field.type === 'select'" [id]="'field-' + field.name" [formControlName]="field.name">
                <option value="">Selecciona...</option>
                <option *ngFor="let opt of field.options" [value]="opt.value">{{ opt.label }}</option>
              </select>
              <input *ngIf="field.type !== 'select' && field.type !== 'textarea'" [id]="'field-' + field.name" [formControlName]="field.name" [type]="field.type" [placeholder]="field.placeholder">
            </div>
            <div class="field-errors" *ngIf="fieldControl(field.name).invalid && (fieldControl(field.name).dirty || fieldControl(field.name).touched || formSubmitted)">
              <span *ngIf="fieldControl(field.name).errors?.['required']">{{ field.label }} es obligatorio</span>
              <span *ngIf="fieldControl(field.name).errors?.['email']">Formato de email inválido</span>
              <span *ngIf="fieldControl(field.name).errors?.['minlength']">Mínimo {{ fieldControl(field.name).errors?.['minlength'].requiredLength }} caracteres</span>
              <span *ngIf="fieldControl(field.name).errors?.['maxlength']">Máximo {{ fieldControl(field.name).errors?.['maxlength'].requiredLength }} caracteres</span>
              <span *ngIf="fieldControl(field.name).errors?.['pattern']">Formato inválido</span>
              <span *ngIf="fieldControl(field.name).errors?.['min']">Valor mínimo: {{ fieldControl(field.name).errors?.['min'].min }}</span>
              <span *ngIf="fieldControl(field.name).errors?.['max']">Valor máximo: {{ fieldControl(field.name).errors?.['max'].max }}</span>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary" [disabled]="formGroup.invalid || saving">{{ editingId ? "Actualizar" : "Crear" }}</button>
            <button *ngIf="editingId" type="button" class="secondary" (click)="reset()">Cancelar</button>
          </div>
        </form>
        <p class="error" *ngIf="error">{{ error }}</p>
        <p class="success" *ngIf="message">{{ message }}</p>
      </section>
      <section class="clinical-card page-card">
        <div class="table-toolbar"><h2>Registros ({{ filteredItems.length }})</h2></div>
        <p class="muted" *ngIf="loading">Cargando registros...</p>
        <div class="table-scroll"><table class="data-table" *ngIf="!loading && !error"><thead><tr><th>ID REF</th><th *ngFor="let field of config.fields">{{ label(field) }}</th><th>Acciones</th></tr></thead>
          <tbody><tr *ngFor="let item of filteredItems"><td>{{ resourceId(item) }}</td><td *ngFor="let field of config.fields">{{ display(item[field]) }}</td>
            <td class="actions-cell">
              <button type="button" (click)="edit(item)" *ngIf="canEdit()">Editar</button>
              <button type="button" class="secondary" (click)="confirmAgenda(resourceId(item))" *ngIf="config.key === 'agenda' && canEdit()">Confirmar</button>
              <button type="button" class="danger" (click)="remove(resourceId(item))" *ngIf="canDelete()">Eliminar</button>
            </td>
          </tr>          </tbody>
        </table></div>
        <p class="muted" *ngIf="!loading && !error && !items.length">No hay registros disponibles.</p>
      </section>
    </main>
  `,
  styles: [`
    .page-heading{flex-wrap:wrap}
    .page-heading .btn-primary{white-space:nowrap}
    .table-toolbar{display:flex;align-items:center;gap:12px}
    .table-toolbar .input-clinical{max-width:360px;margin:0}
    .resource-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px;align-items:start;margin:18px 0}
    .form-field { margin-bottom: 0; }
    .form-actions { grid-column: 1 / -1; display: flex; flex-wrap:wrap; gap: 12px; margin-top: 4px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
    .table-scroll{overflow-x:auto;margin:0 -8px;padding:0 8px}
    .data-table{min-width:680px}
    .actions-cell{white-space:nowrap}
    .actions-cell button{margin:2px 6px 2px 0}
    @media(max-width:760px){.resource-form{grid-template-columns:1fr}.page-card{padding:24px 18px}}
    .form-field label { display: block; margin-bottom: 6px; font-weight: 500; font-size: 13px; color: #334155; }
    .required { color: #dc2626; margin-left: 4px; }
    .input-wrapper { position: relative; }
    .input-wrapper input, .input-wrapper select, .input-wrapper textarea {
      width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px;
      font-size: 14px; font-family: inherit; background: #fff; transition: border-color .2s, box-shadow .2s;
    }
    .input-wrapper input:focus, .input-wrapper select:focus, .input-wrapper textarea:focus {
      outline: none; border-color: #0f766e; box-shadow: 0 0 0 3px #0f766e33;
    }
    .input-wrapper input.ng-invalid.ng-touched, .input-wrapper select.ng-invalid.ng-touched, .input-wrapper textarea.ng-invalid.ng-touched {
      border-color: #dc2626;
    }
    .field-errors { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; font-size: 12px; color: #dc2626; }
    .form-actions { display: flex; gap: 12px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
    .btn-primary { padding: 12px 24px; background: #0f766e; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-primary:disabled { background: #94a3b8; cursor: not-allowed; }
    .secondary { padding: 12px 24px; background: #f1f5f9; color: #475569; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .danger { background: #fee2e2; color: #dc2626; }
  `]
})
export class ResourceComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private routeSubscription?: Subscription;
  private dataSubscription?: Subscription;

  @Input() resource?: ResourceConfig;
  config: ResourceConfig = { title: "", path: "", fields: [] };
  private loadedPath = "";
  items: Array<Record<string, any>> = [];
  filteredItems: Array<Record<string, any>> = [];
  formGroup!: FormGroup;
  editingId?: number;
  search = "";
  error = "";
  message = "";
  loading = false;
  saving = false;
  formSubmitted = false;

  fieldConfigs: FieldConfig[] = [];

  readonly prioridades = PRIORIDADES as unknown as { value: string; label: string }[];
  readonly roles = ROLES as unknown as { value: string; label: string }[];
  readonly alertEstados = ALERT_ESTADOS as unknown as { value: string; label: string }[];
  readonly agendaEstados = AGENDA_ESTADOS as unknown as { value: string; label: string }[];
  readonly bloodGroups = BLOOD_GROUPS as unknown as string[];
  readonly catalogoPrioridades = CATALOGO_PRIORIDADES as unknown as { value: string; label: string }[];

  ngOnInit(): void {
    this.applyResource(this.resource ?? this.route.snapshot.data["resource"] as ResourceConfig | undefined);
    this.routeSubscription = this.route.data.subscribe((data) => {
      this.applyResource(data["resource"] as ResourceConfig | undefined);
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.dataSubscription?.unsubscribe();
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
    this.buildForm();
    this.load();
  }

  private buildForm(): void {
    this.fieldConfigs = this.config.fields.map(field => this.getFieldConfig(field));
    for (const field of this.fieldConfigs) {
      if (!field.placeholder) field.placeholder = this.placeholderFor(field.name);
    }
    const controls: Record<string, AbstractControl> = {};
    for (const field of this.fieldConfigs) {
      const validators = field.required ? [Validators.required] : [];
      if (field.type === 'email') validators.push(Validators.email);
      if (field.type === 'number') validators.push(Validators.pattern(/^\d+$/));
      controls[field.name] = this.fb.control('', validators);
    }
    this.formGroup = this.fb.group(controls);
  }

  getFieldConfig(fieldName: string): FieldConfig {
    const lower = fieldName.toLowerCase();

    if (lower.includes('email')) {
      return { name: fieldName, label: this.label(fieldName), type: 'email', required: true, validators: [Validators.email] };
    }
    if ((lower.includes('pin') && !lower.includes('pinemergencia')) || lower.includes('pinemergencia') || lower === 'pin') {
      return { name: fieldName, label: this.label(fieldName), type: 'text', required: true, validators: [Validators.pattern(/^\d{4,12}$/)] };
    }
    if (lower.includes('rol') || lower === 'rolusers') {
      return { name: fieldName, label: this.label(fieldName), type: 'select', required: true, options: this.roles };
    }
    if (lower.includes('prioridad')) {
      return { name: fieldName, label: this.label(fieldName), type: 'select', required: true, options: this.catalogoPrioridades };
    }
    if (lower.includes('estado') && !lower.includes('alertas')) {
      return { name: fieldName, label: this.label(fieldName), type: 'select', required: true, options: this.alertEstados };
    }
    if (lower.includes('estatus')) {
      return { name: fieldName, label: this.label(fieldName), type: 'select', required: true, options: [
        { value: 'ACTIVO', label: 'Activo' },
        { value: 'INACTIVO', label: 'Inactivo' },
        { value: 'LICENCIA', label: 'Licencia' },
        { value: 'SUSPENDIDO', label: 'Suspendido' }
      ]};
    }
    if (lower.includes('gruposanguineo') || lower.includes('grupoSanguineo')) {
      return { name: fieldName, label: this.label(fieldName), type: 'select', required: true, options: this.bloodGroups.map(g => ({ value: g, label: g })) };
    }
    if (lower.includes('fecha')) {
      return { name: fieldName, label: this.label(fieldName), type: 'datetime-local', required: true, validators: [] };
    }
    if (lower.includes('latitud') || lower.includes('lat') || lower.includes('longitud') || lower.includes('lng')) {
      return { name: fieldName, label: this.label(fieldName), type: 'number', required: true, validators: [Validators.pattern(/^-?\d+(\.\d+)?$/)] };
    }
    if (lower.includes('telefono')) {
      return { name: fieldName, label: this.label(fieldName), type: 'text', required: true, validators: [Validators.pattern(/^[\d\-\s\+]+$/)] };
    }
    if ((lower.includes('id') && !lower.includes('iduser') && !lower.includes('ciudadano')) || 
        lower === 'iduser' || lower === 'ciudadanoid' || lower === 'especialistaid' || lower === 'userid') {
      return { name: fieldName, label: this.label(fieldName), type: 'number', required: true, validators: [Validators.pattern(/^\d+$/)] };
    }
    if (lower.includes('biografia') || lower.includes('alergias') || lower.includes('enfermedadescronicas') || lower.includes('contactoemergencia') || lower.includes('direccion')) {
      return { name: fieldName, label: this.label(fieldName), type: 'textarea', required: false, validators: [] };
    }

    return { name: fieldName, label: this.label(fieldName), type: 'text', required: false, validators: [] };
  }

  canRead(): boolean { return this.auth.canRead(this.config.path); }
  canWrite(): boolean { return this.auth.canWrite(this.config.path); }
  canCreate(): boolean { return this.config.canCreate !== false && this.canWrite(); }
  canEdit(): boolean { return this.canWrite(); }
  canDelete(): boolean { return this.config.canDelete !== false && this.canWrite(); }

  fieldControl(name: string): AbstractControl { return this.formGroup.get(name)!; }

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
      next: (value: any) => { 
        this.items = Array.isArray(value) ? value : value.data ?? []; 
        this.filter(); 
        this.changeDetector.detectChanges(); 
      },
      error: (err) => {
        this.items = [];
        this.filteredItems = [];
        if (err.status === 403) this.error = "No tienes permisos para acceder a este recurso.";
        else if (err.status === 0) this.error = "No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose en http://localhost:8082.";
        else this.error = err.error?.error ?? "No se pudieron cargar los registros.";
        this.changeDetector.detectChanges();
      }
    });
  }

  resourceId(item: Record<string, any>): number {
    return Number(item["id"] ?? item["idUsers"] ?? item["idAlertas"] ?? item["idEstaciones"] ?? item["idDespachoEmergencias"] ?? item["idAgendaCharlas"] ?? item["idStaffAutoridad"] ?? item["idCatalogoEmergencias"] ?? item["idCatalogoEntidades"] ?? item["userid"] ?? item["idUser"]);
  }

  filter(): void { 
    const needle = this.search.trim().toLowerCase(); 
    this.filteredItems = !needle ? [...this.items] : this.items.filter((item) => JSON.stringify(item).toLowerCase().includes(needle)); 
  }

  label(field: string): string {
    const labels: Record<string, string> = {
      nombreusers: "Nombre completo",
      emailusers: "Correo electrónico",
      rolusers: "Rol",
      pinemergenciausers: "PIN de emergencia",
      pin: "PIN",
      userid: "ID de usuario",
      iduser: "ID de usuario",
      especialidad: "Especialidad",
      biografia: "Biografía",
      alertaid: "ID de alerta",
      estacionid: "ID de estación",
      unidad: "Unidad",
      ciudadanoid: "ID de ciudadano",
      especialistaid: "ID de especialista",
      fecha: "Fecha y hora",
      estado: "Estado",
      estatus: "Estatus",
      nombre: "Nombre",
      prioridad: "Prioridad",
      entidadid: "Entidad",
      latitud: "Latitud",
      longitud: "Longitud",
      direccion: "Dirección",
      telefono: "Teléfono",
      rango: "Rango",
      gruposanguineo: "Grupo sanguíneo",
      alergias: "Alergias",
      enfermedadescronicas: "Enfermedades crónicas",
      contactoemergencia: "Contacto de emergencia",
    };
    return labels[field.toLowerCase()] ?? field.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase());
  }

  placeholderFor(field: string): string {
    const placeholders: Record<string, string> = {
      nombreusers: "Ej. Ana Pérez",
      nombre: "Ej. Incendio forestal",
      emailusers: "usuario@sentinel.com",
      pinemergenciausers: "4 a 12 dígitos",
      pin: "4 a 12 dígitos",
      userid: "Ej. 3",
      iduser: "Ej. 3",
      especialidad: "Ej. Primeros auxilios",
      biografia: "Experiencia y formación...",
      alertaid: "Ej. 12",
      estacionid: "Ej. 1",
      unidad: "Ej. Unidad-04",
      ciudadanoid: "Ej. 3",
      especialistaid: "Ej. 2",
      entidadid: "ID de la entidad",
      latitud: "Ej. 14.6349",
      longitud: "Ej. -90.5069",
      direccion: "Ej. Calzada Roosevelt 1-20",
      telefono: "Ej. 5555-5555",
      rango: "Ej. Capitán",
      alergias: "Ej. Penicilina",
      enfermedadescronicas: "Ej. Asma",
      contactoemergencia: "Nombre y teléfono",
    };
    return placeholders[field.toLowerCase()] ?? "";
  }

  confirmAgenda(id: number): void { 
    this.api.confirmAgenda(id).subscribe({ 
      next: () => { this.message = "Asistencia confirmada."; this.load(); }, 
      error: (err) => this.error = err.error?.error ?? "No se pudo confirmar la asistencia." 
    }); 
  }

  sectionLabel(): string { 
    return this.config.key === "alertas" ? "MONITOR" : this.config.key === "agenda" ? "CAPACITACIONES" : this.config.key === "vital-data" ? "FICHA CLÍNICA" : "CONFIGURACIÓN"; 
  }

  sectionDescription(): string {
    const descriptions: Record<string, string> = {
      usuarios: "Administra las cuentas, roles y PIN de emergencia.",
      especialistas: "Certifica y actualiza el cuerpo médico técnico.",
      despachos: "Asigna unidades y estaciones a incidentes activos.",
      agenda: "Programa sesiones informativas y confirma asistencia.",
      emergencias: "Define protocolos y prioridades de respuesta.",
      entidades: "Mantén el directorio de instituciones aliadas.",
      estaciones: "Gestiona centros de control, ubicación y contacto.",
      staff: "Coordina al personal de autoridad por estación.",
      "vital-data": "Consulta y administra fichas médicas de usuarios."
    };
    return descriptions[this.config.key ?? ""] ?? "Control de acceso, registros y operaciones del sistema";
  }

  createLabel(): string { return this.config.key === "agenda" ? "Agendar charla" : this.config.key === "despachos" ? "Nuevo despacho" : "Nuevo registro"; }

  searchPlaceholder(): string { return this.config.key === "estaciones" ? "Buscar estación..." : this.config.key === "agenda" ? "Buscar por fecha o participante..." : "Buscar por texto o ID..."; }

  display(value: unknown): string { return value === null || value === undefined ? "" : typeof value === "object" ? JSON.stringify(value) : String(value); }

  edit(item: Record<string, any>): void {
    if (!this.canEdit()) return;
    this.editingId = this.resourceId(item);
    this.formGroup.patchValue(item);
    this.formSubmitted = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  reset(): void { this.editingId = undefined; this.formGroup.reset(); this.formSubmitted = false; }

  save(): void {
    if (!this.canWrite()) { this.error = "No tienes permisos para realizar esta operación."; return; }
    this.formSubmitted = true;
    if (this.formGroup.invalid) { this.formGroup.markAllAsTouched(); return; }
    this.saving = true; this.error = ""; this.message = "";
    const payload = this.formGroup.value;
    const operation = this.editingId ? this.api.update(this.config.path, this.editingId, payload) : this.api.create(this.config.path, payload);
    operation.subscribe({
      next: () => { this.message = "Operación completada."; this.error = ""; this.saving = false; this.reset(); this.load(); },
      error: (err) => { this.saving = false; this.error = err.error?.error ?? "No se pudo guardar."; this.changeDetector.detectChanges(); }
    });
  }

  remove(id: number): void {
    if (!this.canDelete()) { this.error = "No tienes permisos para eliminar."; return; }
    if (!confirm(`¿Eliminar el registro ${id}?`)) return;
    this.api.remove(this.config.path, id).subscribe({ 
      next: () => { this.message = "Registro eliminado."; this.load(); }, 
      error: (err) => this.error = err.error?.error ?? "No se pudo eliminar." 
    });
  }
}