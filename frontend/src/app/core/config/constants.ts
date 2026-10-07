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