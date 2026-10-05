import { Routes } from "@angular/router";
import { LoginComponent } from "./pages/auth/login/login.component";
import { RegisterComponent } from "./pages/auth/register/register.component";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { authGuard } from "./core/guards/auth.guard";
import { ResourceComponent } from "./pages/resource/resource.component";
import { AlertasComponent } from "./pages/alertas/alertas.component";
import { BienestarComponent } from "./pages/ai/bienestar.component";
import { RespiracionComponent } from "./pages/ai/respiracion.component";
import { DiarioComponent } from "./pages/diario/diario.component";
import { PerfilVitalComponent } from "./pages/perfil/perfil-vital.component";

export const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "", component: DashboardComponent, canActivate: [authGuard] },
  { path: "dashboard", component: DashboardComponent, canActivate: [authGuard] },
  { path: "alertas", component: AlertasComponent, canActivate: [authGuard], data: { resource: { key: "alertas", title: "Gestión de alertas", path: "/Sentinel/Alertas", fields: ["ciudadanoId", "emergenciaId", "latitud", "longitud", "estadoAlertas"] } } },
  { path: "usuarios", component: ResourceComponent, canActivate: [authGuard], data: { resource: { key: "usuarios", title: "Usuarios del sistema", path: "/Sentinel/Users", fields: ["nombreUsers", "emailUsers", "rolUsers", "pinemergenciaUsers"] } } },
  { path: "admin-users", component: ResourceComponent, canActivate: [authGuard], data: { resource: { key: "usuarios", title: "Usuarios del sistema", path: "/Sentinel/Users", fields: ["nombreUsers", "emailUsers", "rolUsers", "pinemergenciaUsers"] } } },
  { path: "especialistas", component: ResourceComponent, canActivate: [authGuard], data: { resource: { key: "especialistas", title: "Especialistas certificados", path: "/Sentinel/Especialistas", fields: ["userid", "especialidad", "biografia"] } } },
  { path: "admin-especialistas", component: ResourceComponent, canActivate: [authGuard], data: { resource: { key: "especialistas", title: "Especialistas certificados", path: "/Sentinel/Especialistas", fields: ["userid", "especialidad", "biografia"] } } },
  { path: "despachos", component: ResourceComponent, canActivate: [authGuard], data: { resource: { key: "despachos", title: "Despachos de emergencia", path: "/Sentinel/DespachosEmergencia", fields: ["alertaId", "estacionId", "unidad"] } } },
  { path: "admin-despacho-emergencias", component: ResourceComponent, canActivate: [authGuard], data: { resource: { key: "despachos", title: "Despachos de emergencia", path: "/Sentinel/despachos", fields: ["alertaId", "estacionId", "unidad"] } } },
  { path: "agenda", component: ResourceComponent, canActivate: [authGuard], data: { resource: { key: "agenda", title: "Agenda de charlas", path: "/Sentinel/AgendaCharlas", fields: ["ciudadanoId", "especialistaId", "fecha", "estado"] } } },
  { path: "catalogo-emergencias", component: ResourceComponent, canActivate: [authGuard], data: { resource: { key: "emergencias", title: "Catálogo de emergencias", path: "/Sentinel/CatalogoEmergencias", fields: ["nombre", "prioridad"] } } },
  { path: "catalogo-entidades", component: ResourceComponent, canActivate: [authGuard], data: { resource: { key: "entidades", title: "Catálogo de entidades", path: "/Sentinel/CatalogoEntidades", fields: ["nombre"] } } },
  { path: "estaciones", component: ResourceComponent, canActivate: [authGuard], data: { resource: { key: "estaciones", title: "Centros de mando", path: "/Sentinel/Estaciones", fields: ["nombre", "entidadId", "latitud", "longitud", "direccion", "telefono"] } } },
  { path: "staff", component: ResourceComponent, canActivate: [authGuard], data: { resource: { key: "staff", title: "Personal de autoridad", path: "/Sentinel/StaffAutoridad", fields: ["estacionId", "rango", "estatus", "userId"] } } },
  { path: "vital-data", component: ResourceComponent, canActivate: [authGuard], data: { resource: { key: "vital-data", title: "Datos vitales", path: "/Sentinel/VitalData", fields: ["idUser", "grupoSanguineo", "alergias", "enfermedadesCronicas", "contactoEmergencia"] } } },
  { path: "perfil-vital", component: PerfilVitalComponent, canActivate: [authGuard] },
  { path: "diario", component: DiarioComponent, canActivate: [authGuard] },
  { path: "bienestar", component: BienestarComponent, canActivate: [authGuard] },
  { path: "respiracion", component: RespiracionComponent, canActivate: [authGuard] },
  { path: "**", redirectTo: "" }
];
