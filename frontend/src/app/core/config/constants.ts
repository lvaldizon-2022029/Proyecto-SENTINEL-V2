export const CATALOGO_PRIORIDADES = [
  { value: "BAJA", label: "Baja" },
  { value: "MEDIA", label: "Media" },
  { value: "ALTA", label: "Alta" },
] as const;

export const PRIORIDADES = [
  { value: "BAJA", label: "Baja" },
  { value: "MEDIA", label: "Media" },
  { value: "ALTA", label: "Alta" },
] as const;

export const ROLES = [
  { value: "USER", label: "Usuario" },
  { value: "STAFF", label: "Personal" },
  { value: "ADMIN", label: "Administrador" },
] as const;

export const ALERT_ESTADOS = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "ACTIVA", label: "Activa" },
  { value: "CONFIRMADA", label: "Confirmada" },
  { value: "COMPLETADA", label: "Completada" },
  { value: "CANCELADA", label: "Cancelada" },
  { value: "DESPACHADA", label: "Despachada" },
  { value: "EN_PROCESO", label: "En Proceso" },
  { value: "RESUELTA", label: "Resuelta" },
] as const;

export const AGENDA_ESTADOS = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "CONFIRMADA", label: "Confirmada" },
  { value: "CANCELADA", label: "Cancelada" },
] as const;

export const BLOOD_GROUPS = [
  "O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"
] as const;

export const DEFAULT_PLACEHOLDERS = {
  email: "ejemplo@sentinel.com",
  password: "••••••••",
} as const;

export const MODULES_CONFIG = [
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
  { role: "STAFF", kicker: "Capacitaciones", title: "Agendar<br>Charlas", subtitle: "SESIONES INFORMATIVAS", icon: "📅", route: "/agenda", theme: "slate" },
] as const;

export const AI_SUGGESTIONS = {
  wellbeing: [
    "Estoy ansioso/a",
    "Necesito hablar",
    "No puedo dormir",
    "Me siento abrumado/a",
    "Tengo miedo",
    "Me siento solo/a"
  ] as const,
  medical: [
    "¿Qué hago ante una quemadura?",
    "Primeros auxilios por corte",
    "Síntomas de deshidratación",
    "Cómo hacer RCP",
    "Manejo de fractura",
    "Picadura de insecto"
  ] as const,
} as const;

export const BREATHING_PHASES = [
  { name: "Inhala", duration: 4 },
  { name: "Mantén", duration: 4 },
  { name: "Exhala", duration: 6 },
] as const;

export const PANIC_CATEGORY_NAME = "PÁNICO";

export const MAP_DEFAULTS = {
  lat: 14.6349,
  lng: -90.5069,
  zoom: 16,
};

export const LEAFLET_ICONS = {
  iconUrl: "/assets/leaflet/marker-icon.png",
  iconRetinaUrl: "/assets/leaflet/marker-icon-2x.png",
  shadowUrl: "/assets/leaflet/marker-shadow.png",
} as const;

export const PASSWORD_REGEX = {
  minLength: 8,
  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  message: "Mín. 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 símbolo"
} as const;