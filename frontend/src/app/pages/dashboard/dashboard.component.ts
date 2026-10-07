import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import * as L from "leaflet";
import { Subscription, interval } from "rxjs";
import { ApiService, Emergency } from "../../core/services/api.service";
import { AuthService } from "../../core/services/auth.service";

interface AlertItem {
  idAlertas?: number;
  id?: number;
  estadoAlertas?: string;
  estado?: string;
  fechaAlertas?: string;
  fecha?: string;
  ciudadanoId?: number;
  usuario?: { idUsers?: number; id?: number };
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="dashboard-header">
      <div class="header-inner">
        <div class="brand">
          <div class="brand-icon">⚠</div>
          <div><small>SENTINEL • ALERTA</small><strong>Panel de Emergencias</strong></div>
        </div>
        <div class="header-actions">
          <div class="clock"><b>{{ clock() }}</b><span>{{ today() }}</span></div>
          <div class="account">
            <b>{{ displayName | uppercase }}</b>
            <span><i></i><button (click)="logout()">Cerrar sesión</button></span>
          </div>
          <button class="avatar" (click)="go('/perfil-vital')" [style.background-image]="avatarUrl ? 'url(' + avatarUrl + ')' : ''"></button>
        </div>
      </div>
    </header>

    <main class="dashboard-layout">
      <section class="main-column">
        <div class="panic-card">
          <button class="panic-button" (click)="sendSilentAlert()"><span>⚠️</span><b>PÁNICO</b></button>
          <div><h1>¿Cuál es tu emergencia?</h1><p>Tu auxilio en lo cotidiano. Activa el botón de pánico o usa la IA médica para asesoría inmediata.</p>
            <div class="badges"><span class="danger">Alerta silenciosa activa</span><span class="success">GPS Tracking ON</span></div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-heading"><h2>Catálogo operativo</h2><input [(ngModel)]="search" (ngModelChange)="filterCatalog()" placeholder="Buscar tipo de incidente..."></div>
          <div class="table-wrap"><table><thead><tr><th>ID</th><th>Categoría del incidente</th><th>Prioridad</th><th></th></tr></thead>
            <tbody><tr *ngFor="let emergency of filteredCatalog"><td>#{{ emergency.idCatalogoEmergencias || "N/A" }}</td><td>{{ emergency.nombreCatalogoEmergencias || "Sin nombre" | uppercase }}</td>
              <td><span class="priority" [class.high]="emergency.prioridadCatalogoEmergencias === 'ALTA'">{{ emergency.prioridadCatalogoEmergencias || "N/A" }}</span></td>
              <td class="right"><button class="dispatch" (click)="openAlert(emergency.idCatalogoEmergencias)">DISPARAR</button></td></tr>
              <tr *ngIf="!filteredCatalog.length"><td colspan="4" class="empty">No hay emergencias disponibles</td></tr>
            </tbody></table></div>
        </div>

        <div class="panel alerts-panel"><div class="panel-heading"><h2>Monitoreo de alertas activas</h2></div>
          <div *ngIf="!userAlerts.length" class="empty">No tienes alertas activas.</div>
          <article *ngFor="let alert of userAlerts" class="alert-row" [class.closed]="alertStatus(alert) !== 'PENDIENTE' && alertStatus(alert) !== 'ACTIVA'">
            <div><small>Alerta #{{ alert.idAlertas || alert.id }}</small><b>{{ alertDate(alert) }}</b></div>
            <div class="alert-actions"><span [class.active]="alertStatus(alert) === 'ACTIVA'">{{ alertStatus(alert) }}</span>
              <button *ngIf="isEditable(alert)" (click)="selectAlert(alert.idAlertas || alert.id!)">{{ selectedAlertId === (alert.idAlertas || alert.id) ? "✕ CANCELAR" : "DESACTIVAR" }}</button></div>
            <div *ngIf="selectedAlertId === (alert.idAlertas || alert.id)" class="pin-box"><input [id]="'pin-' + (alert.idAlertas || alert.id)" type="password" [(ngModel)]="pin" placeholder="PIN"><button (click)="disableAlert(alert.idAlertas || alert.id!)">OK</button></div>
          </article>
        </div>
        <div *ngIf="status" class="status" [class.error]="statusError">{{ status }}</div>
      </section>

      <aside class="side-column">
        <div class="side-brand"><b>SENTINEL</b><span>GUATEMALA V1.0 • GRUPO #6</span></div>
        <button class="module dark" (click)="chatOpen = true"><em>Soporte virtual</em><b>IA SENTINEL</b><span>CONSULTA MÉDICA <strong>›</strong></span><i>🤖</i></button>
        <button *ngFor="let module of visibleModules" class="module" [class]="module.theme" (click)="go(module.route)">
          <em>{{ module.kicker }}</em><b [innerHTML]="module.title"></b><span>{{ module.subtitle }} <strong>›</strong></span><i>{{ module.icon }}</i>
        </button>
      </aside>
    </main>

    <div *ngIf="chatOpen" class="chat">
      <div class="chat-head"><b>● Sentinel AI Core</b><button (click)="chatOpen = false">×</button></div>
      <div class="chat-messages"><div class="bot-message">Unidad de IA SENTINEL lista. ¿Necesitas asesoría en primeros auxilios?</div>
        <div *ngFor="let message of messages" [class.user-message]="message.user" [class.bot-message]="!message.user">{{ message.text }}</div>
      </div>
      <form (ngSubmit)="askAi()"><input name="prompt" [(ngModel)]="prompt" placeholder="Pregunta sobre síntomas o auxilio..."><button>➤</button></form>
    </div>

    <div *ngIf="modalOpen" class="modal-backdrop"><div class="modal">
      <div class="modal-title"><h2>Confirmar geolocalización</h2><button (click)="closeModal()">×</button></div>
      <div id="dashboard-map"></div>
      <div class="coordinates"><label>Latitud detectada<input [value]="latitude | number:'1.6-6'" readonly></label><label>Longitud detectada<input [value]="longitude | number:'1.6-6'" readonly></label></div>
      <p class="map-help">Puedes arrastrar el marcador verde en el mapa para ajustar la precisión exacta de la alerta.</p>
      <div class="modal-actions"><button (click)="closeModal()">Cancelar</button><button class="confirm" (click)="confirmAlert()">Confirmar envío</button></div>
    </div></div>
  `,
  styles: [`
    :host{display:block;min-height:100vh;background:#f8fafc;color:#0f172a;font-family:Inter,system-ui,sans-serif}.dashboard-header{position:sticky;top:0;z-index:20;background:#ffffffd9;backdrop-filter:blur(12px);border-bottom:1px solid #dff5ef;padding:16px 24px}.header-inner{max-width:1240px;margin:auto;display:flex;justify-content:space-between;align-items:center}.brand,.header-actions,.account span,.badges,.modal-actions,.coordinates{display:flex;align-items:center}.brand{gap:14px}.brand-icon{background:#00c9a7;color:#fff;border-radius:12px;padding:10px 14px;font-size:23px;box-shadow:0 8px 20px #b8eee4}.brand small,.panel-heading h2,.module em{display:block;font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}.brand small{color:#00a98f}.brand strong{display:block;font-size:14px;text-transform:uppercase}.header-actions{gap:22px}.clock{border-right:1px solid #e2e8f0;padding-right:22px;text-align:right;color:#94a3b8}.clock b,.clock span{display:block}.clock b{font-size:14px;letter-spacing:.12em}.clock span{font-size:9px;text-transform:uppercase;letter-spacing:.16em}.account{text-align:right}.account>b{display:block;font-size:11px}.account span{justify-content:flex-end;gap:5px;font-size:10px}.account i{width:6px;height:6px;border-radius:50%;background:#22c55e}.account button,.module,.avatar,button{cursor:pointer}.account button{border:0;background:none;color:#dc2626;font-size:10px;font-weight:800;text-transform:uppercase}.avatar{width:44px;height:44px;border:2px solid #fff;border-radius:16px;background-size:cover;background-position:center;box-shadow:0 0 0 3px #e5faf5}.dashboard-layout{max-width:1240px;margin:32px auto;padding:0 24px 48px;display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:32px}.main-column,.side-column{display:flex;flex-direction:column;gap:20px}.panic-card,.panel,.side-brand{background:#fff;border-radius:24px;border:1px solid #e2e8f0;box-shadow:0 5px 18px #0f172a08}.panic-card{border-color:#fee2e2;padding:30px;display:flex;gap:32px;align-items:center}.panic-button{width:170px;height:170px;flex:none;border-radius:50%;border:9px solid #fef2f2;background:#dc2626;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;box-shadow:0 18px 32px #fecaca;font-size:13px}.panic-button span{font-size:44px}.panic-button:hover{background:#b91c1c;transform:scale(.98)}h1{font-size:25px;text-transform:uppercase;margin:0 0 8px}.panic-card p{color:#64748b;font-size:13px;font-style:italic}.badges{gap:10px;flex-wrap:wrap}.badges span,.priority{padding:6px 10px;border-radius:999px;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.danger{background:#fef2f2;color:#dc2626}.success{background:#ecfdf5;color:#00a98f}.panel{overflow:hidden}.panel-heading{padding:20px 24px;background:#f8fafc;border-bottom:1px solid #f1f5f9;display:flex;justify-content:space-between;align-items:center}.panel-heading h2{color:#94a3b8;margin:0}.panel-heading input{border:1px solid #e2e8f0;border-radius:12px;padding:10px 14px;width:260px;font-size:11px;font-weight:700;text-transform:uppercase;outline:none}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:15px 24px;border-bottom:1px solid #f1f5f9;font-size:12px}th{color:#94a3b8;font-size:10px;text-transform:uppercase;letter-spacing:.12em}td{font-weight:700}.right{text-align:right}.priority{background:#d1fae5;color:#059669;border-radius:4px}.priority.high{background:#fee2e2;color:#dc2626}.dispatch{background:#00c9a7;border:0;color:#fff;border-radius:10px;padding:9px 13px;font-size:10px;font-weight:900}.dispatch:hover{background:#0f172a}.empty{text-align:center;color:#94a3b8;font-style:italic;padding:32px}.alert-row{display:grid;grid-template-columns:1fr auto;gap:12px;margin:14px 20px;padding:16px;border:1px solid #f1f5f9;border-radius:16px}.alert-row small,.alert-row b{display:block}.alert-row small{color:#94a3b8;font-size:10px;text-transform:uppercase}.alert-row b{font-size:12px;margin-top:5px}.alert-actions{text-align:right}.alert-actions span{background:#d1fae5;color:#059669;padding:5px 8px;border-radius:5px;font-size:9px;font-weight:900}.alert-actions span.active{background:#fee2e2;color:#dc2626}.alert-actions button{display:block;margin-top:10px;border:0;background:none;color:#64748b;font-size:9px;font-weight:900}.pin-box{grid-column:1/-1;display:flex;gap:8px;background:#f8fafc;padding:8px;border-radius:10px}.pin-box input{flex:1;border:1px solid #e2e8f0;border-radius:8px;padding:8px}.pin-box button{background:#0f172a;color:#fff;border:0;border-radius:8px;padding:0 15px;font-weight:900}.status{padding:14px;border:2px solid #a7f3d0;background:#ecfdf5;color:#059669;border-radius:14px;text-align:center;font-size:11px;font-weight:900;text-transform:uppercase}.status.error{border-color:#fecaca;background:#fef2f2;color:#dc2626}.side-brand{text-align:center;padding:22px}.side-brand b{display:block;font-size:22px}.side-brand span{font-size:10px;color:#94a3b8;font-weight:800;letter-spacing:.08em}.module{position:relative;text-align:left;border:1px solid #e2e8f0;border-radius:24px;padding:20px;height:128px;overflow:hidden;background:#fff;display:flex;flex-direction:column;justify-content:space-between;transition:.2s}.module:hover{transform:scale(1.02);box-shadow:0 10px 25px #0f172a14}.module em{font-style:normal;color:#64748b}.module>b{font-size:16px;line-height:1.05;text-transform:uppercase;z-index:1}.module>span{font-size:10px;color:#64748b;font-weight:800;border-top:1px solid #e2e8f0;padding-top:8px;z-index:1}.module>span strong{float:right;font-size:20px}.module i{position:absolute;right:12px;bottom:-18px;font-style:normal;font-size:70px;opacity:.12}.module.dark{background:#0f172a;color:#fff;border:0}.module.dark em{color:#34d399}.module.dark>span{color:#94a3b8;border-color:#ffffff1a}.module.teal{background:linear-gradient(135deg,#00c9a7,#047857);color:#fff;border-color:#34d399}.module.blue{background:#eff6ff}.module.red{background:#fff1f2}.module.slate{background:#f8fafc}.module.indigo{background:#eef2ff}.module.orange{background:#fff7ed}.module.amber{background:#fffbeb}.chat{position:fixed;right:24px;bottom:24px;z-index:30;width:380px;height:500px;background:#fff;border:1px solid #e2e8f0;border-radius:24px;box-shadow:0 20px 45px #0f172a33;display:flex;flex-direction:column;overflow:hidden}.chat-head{background:#0f172a;color:#fff;padding:16px;display:flex;justify-content:space-between;text-transform:uppercase;font-size:10px;letter-spacing:.1em}.chat-head button,.modal-title button{background:none;border:0;color:#94a3b8;font-size:24px}.chat-messages{flex:1;padding:16px;overflow:auto;background:#f8fafc;display:flex;flex-direction:column;gap:12px}.bot-message,.user-message{max-width:85%;padding:12px;border-radius:15px;font-size:12px}.bot-message{background:#fff;border:1px solid #d1fae5}.user-message{background:#059669;color:#fff;align-self:flex-end}.chat form{display:flex;gap:8px;padding:14px;border-top:1px solid #f1f5f9}.chat input{flex:1;border:1px solid #e2e8f0;border-radius:10px;padding:10px}.chat form button{background:#10b981;color:#fff;border:0;border-radius:10px;padding:0 14px}.modal-backdrop{position:fixed;inset:0;background:#0f172a99;backdrop-filter:blur(5px);display:grid;place-items:center;padding:20px;z-index:40}.modal{background:#fff;border-radius:28px;width:min(520px,100%);padding:26px}.modal-title{display:flex;justify-content:space-between;align-items:center}.modal-title h2{font-size:18px;text-transform:uppercase}.modal-title button{color:#64748b}.coordinates{gap:12px}.coordinates label{flex:1;color:#94a3b8;font-size:10px;font-weight:900;text-transform:uppercase}.coordinates input{display:block;width:100%;box-sizing:border-box;margin-top:5px;padding:10px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc}.map-help{background:#ecfdf5;color:#047857;padding:12px;border-radius:10px;font-size:11px;text-align:center}.modal-actions{gap:10px}.modal-actions button{flex:1;border:0;border-radius:10px;padding:12px;text-transform:uppercase;font-weight:900}.modal-actions .confirm{background:#10b981;color:#fff}#dashboard-map{height:260px;margin:12px 0;border-radius:18px;overflow:hidden}@media(max-width:850px){.dashboard-layout{grid-template-columns:1fr}.side-column{display:grid;grid-template-columns:repeat(2,1fr)}.side-brand{grid-column:1/-1}.header-actions .clock{display:none}}@media(max-width:560px){.panic-card{flex-direction:column;text-align:center}.side-column{display:flex}.header-inner{gap:8px}.brand strong{font-size:11px}.account{display:none}.chat{left:12px;right:12px;width:auto}}
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly subscriptions = new Subscription();
  readonly clock = signal("00:00:00"); readonly today = signal("");
  displayName = "USUARIO"; avatarUrl = "";
  catalog: Emergency[] = []; filteredCatalog: Emergency[] = []; userAlerts: AlertItem[] = [];
  search = ""; status = ""; statusError = false; modalOpen = false; chatOpen = false;
  latitude = 14.6349; longitude = -90.5069; pendingEmergencyId?: number; pendingSilent = false;
  selectedAlertId: number | null = null; pin = ""; prompt = ""; messages: { text: string; user: boolean }[] = [];
  private map?: L.Map; private marker?: L.Marker;

  readonly modules = [
    { role: "USER", kicker: "Espacio seguro", title: "Bienestar<br>Psicológico", subtitle: "SALUD MENTAL Y APOYO EMOCIONAL", icon: "💚", route: "/bienestar", theme: "teal" },
    { role: "ADMIN", kicker: "Ficha clínica", title: "Acceso<br>Médico", subtitle: "DATOS VITALES", icon: "🏥", route: "/vital-data", theme: "red" },
    { role: "ADMIN", kicker: "Seguridad", title: "Gestión de<br>Accesos", subtitle: "GESTIÓN USUARIOS", icon: "⚙️", route: "/admin-users", theme: "teal" },
    { role: "ADMIN", kicker: "Directorio", title: "Catálogo de<br>Entidades", subtitle: "CATÁLOGO ENTIDADES", icon: "📘", route: "/catalogo-entidades", theme: "blue" },
    { role: "STAFF", kicker: "Seguridad", title: "Catálogo de<br>Emergencias", subtitle: "PROTOCOLOS DE RESPUESTA", icon: "🚨", route: "/catalogo-emergencias", theme: "red" },
    { role: "STAFF", kicker: "Logística", title: "Gestión de<br>Despachos", subtitle: "CONTROL OPERATIVO", icon: "📡", route: "/despachos", theme: "slate" },
    { role: "STAFF", kicker: "Personal", title: "Staff de<br>Autoridad", subtitle: "EQUIPO DE COORDINACIÓN", icon: "👤", route: "/staff", theme: "indigo" },
    { role: "ADMIN", kicker: "Especialidades", title: "Cuerpo Médico<br>Técnico", subtitle: "ESPECIALISTAS", icon: "🩺", route: "/admin-especialistas", theme: "indigo" },
    { role: "ADMIN", kicker: "Infraestructura", title: "Estaciones de<br>Control", subtitle: "CENTROS DE OPERACIONES", icon: "🏢", route: "/estaciones", theme: "orange" },
    { role: "STAFF", kicker: "Incidentes", title: "Gestión de<br>Alertas", subtitle: "MONITOREO EN TIEMPO REAL", icon: "⚠️", route: "/alertas", theme: "amber" },
    { role: "STAFF", kicker: "Capacitaciones", title: "Agendar<br>Charlas", subtitle: "SESIONES INFORMATIVAS", icon: "📅", route: "/agenda", theme: "slate" }
  ];

  get visibleModules() { const role = this.auth.session()?.rolUsers ?? "USER"; return this.modules.filter((module) => module.role === "USER" || module.role === role || (role === "ADMIN" && module.role === "STAFF")); }

  ngOnInit(): void {
    const session = this.auth.session();
    if (!session) { void this.router.navigateByUrl("/login"); return; }
    this.displayName = session.nombreUsers || session.emailUsers;
    this.avatarUrl = session.fotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(this.displayName)}&background=00C9A7&color=fff&bold=true`;
    this.updateClock(); this.subscriptions.add(interval(1000).subscribe(() => this.updateClock()));
    this.loadCatalog(); this.loadAlerts(); this.subscriptions.add(interval(5000).subscribe(() => this.loadAlerts()));
  }
  ngOnDestroy(): void { this.subscriptions.unsubscribe(); this.map?.remove(); }
  updateClock(): void { const now = new Date(); this.clock.set(now.toLocaleTimeString("es-GT", { hour12: false })); this.today.set(now.toLocaleDateString("es-GT", { weekday: "short", year: "numeric", month: "short", day: "numeric" }).toUpperCase()); }
  loadCatalog(): void { this.api.collection<Emergency[]>("/Sentinel/CatalogoEmergencias").subscribe({ next: (value) => { this.catalog = Array.isArray(value) ? value : []; this.filteredCatalog = [...this.catalog]; this.changeDetector.detectChanges(); }, error: () => { this.showStatus("Error al cargar catálogo", true); this.changeDetector.detectChanges(); } }); }
  filterCatalog(): void { const value = this.search.toLowerCase(); this.filteredCatalog = this.catalog.filter((item) => String(item.nombreCatalogoEmergencias ?? "").toLowerCase().includes(value)); }
  loadAlerts(): void { this.api.getAlerts().subscribe({ next: (value) => { const items = Array.isArray(value) ? value : value.data; const userId = this.auth.session()?.idUsers; this.userAlerts = (items as AlertItem[]).filter((item) => Number(item.ciudadanoId ?? item.usuario?.idUsers ?? item.usuario?.id) === userId); this.changeDetector.detectChanges(); }, error: () => { this.userAlerts = []; this.changeDetector.detectChanges(); } }); }
  openAlert(id?: number, silent = false): void { if (!id) return; if (this.userAlerts.some((item) => this.isEditable(item))) { this.showStatus("Existe una alerta activa en resolución", true); return; } this.pendingEmergencyId = id; this.pendingSilent = silent; this.modalOpen = true; this.getLocation(); }
  sendSilentAlert(): void { const panic = this.catalog.find((item) => String(item.nombreCatalogoEmergencias ?? "").toUpperCase().includes("PÁNICO")); if (!panic?.idCatalogoEmergencias) { this.showStatus("No se encontró la categoría PÁNICO", true); return; } this.openAlert(panic.idCatalogoEmergencias, true); }
  getLocation(): void { if (!navigator.geolocation) { this.initMap(); return; } navigator.geolocation.getCurrentPosition((position) => { this.latitude = position.coords.latitude; this.longitude = position.coords.longitude; this.initMap(); this.showStatus("GPS integrado"); }, () => this.initMap()); }
  initMap(): void { setTimeout(() => { if (!this.map) { L.Icon.Default.mergeOptions({ iconUrl: "/assets/leaflet/marker-icon.png", iconRetinaUrl: "/assets/leaflet/marker-icon-2x.png", shadowUrl: "/assets/leaflet/marker-shadow.png" }); this.map = L.map("dashboard-map").setView([this.latitude, this.longitude], 16); L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(this.map); this.marker = L.marker([this.latitude, this.longitude], { draggable: true }).addTo(this.map); this.marker.on("dragend", () => this.readMarker()); this.map.on("click", (event) => { this.marker?.setLatLng(event.latlng); this.readMarker(); }); } else { this.map.setView([this.latitude, this.longitude], 16); this.marker?.setLatLng([this.latitude, this.longitude]); } this.map.invalidateSize(); }, 0); }
  readMarker(): void { const position = this.marker?.getLatLng(); if (position) { this.latitude = position.lat; this.longitude = position.lng; } }
  closeModal(): void { this.modalOpen = false; }
  confirmAlert(): void { if (!this.pendingEmergencyId) return; this.api.triggerAlert({ latitud: this.latitude, longitud: this.longitude, esSilenciosa: this.pendingSilent, ciudadanoId: this.auth.session()?.idUsers, emergenciaId: this.pendingEmergencyId, infoExtra: "DISPOSITIVO WEB - SENTINEL DASHBOARD GPS" }).subscribe({ next: () => { this.closeModal(); this.showStatus(this.pendingSilent ? "Pánico silencioso enviado" : "Alerta registrada"); this.loadAlerts(); }, error: () => this.showStatus("Error en servidor", true) }); }
  selectAlert(id: number): void { this.selectedAlertId = this.selectedAlertId === id ? null : id; this.pin = ""; }
  disableAlert(id: number): void { if (!this.pin.trim()) return; this.api.disableAlert(id, this.pin.trim()).subscribe({ next: () => { this.selectedAlertId = null; this.pin = ""; this.showStatus("Canal normalizado"); this.loadAlerts(); }, error: () => { this.pin = ""; this.showStatus("PIN incorrecto", true); } }); }
  isEditable(alert: AlertItem): boolean { return ["PENDIENTE", "ACTIVA"].includes(this.alertStatus(alert)); }
  alertStatus(alert: AlertItem): string { return String(alert.estadoAlertas ?? alert.estado ?? "PENDIENTE").toUpperCase(); }
  alertDate(alert: AlertItem): string { const date = alert.fechaAlertas ?? alert.fecha; return date ? new Date(date).toLocaleTimeString() : "---"; }
  askAi(): void { const text = this.prompt.trim(); if (!text) return; this.messages.push({ text, user: true }); this.prompt = ""; this.messages.push({ text: "Analizando protocolo médico...", user: false }); this.api.askAi("medical", this.auth.session()?.idUsers ?? 0, text).subscribe({ next: (answer) => this.messages[this.messages.length - 1].text = answer.respuesta, error: () => this.messages[this.messages.length - 1].text = "⚠️ El proveedor de IA no está disponible." }); }
  showStatus(message: string, error = false): void { this.status = message; this.statusError = error; setTimeout(() => this.status = "", 4000); }
  go(route: string): void { void this.router.navigateByUrl(route); }
  logout(): void { this.auth.logout(); void this.router.navigateByUrl("/login"); }
}
