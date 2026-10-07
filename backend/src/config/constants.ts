export const DEFAULT_ADMIN = {
  nombre: process.env.DEFAULT_ADMIN_NOMBRE ?? "Administrador SENTINEL",
  email: process.env.DEFAULT_ADMIN_EMAIL ?? "admin@sentinel.local",
  password: process.env.DEFAULT_ADMIN_PASSWORD ?? "sentinel",
  rol: (process.env.DEFAULT_ADMIN_ROL as "USER" | "STAFF" | "ADMIN") ?? "ADMIN",
  pin: process.env.DEFAULT_ADMIN_PIN ?? "0000",
} as const;

export const DEFAULT_USER = {
  rol: (process.env.DEFAULT_USER_ROL as "USER" | "STAFF" | "ADMIN") ?? "USER",
  pin: process.env.DEFAULT_USER_PIN ?? "0000",
  password: process.env.DEFAULT_USER_PASSWORD ?? "sentinel",
} as const;

export const ALERT_ESTADOS = {
  PENDIENTE: "PENDIENTE" as const,
  DESPACHADA: "DESPACHADA" as const,
  EN_PROCESO: "EN_PROCESO" as const,
  RESUELTA: "RESUELTA" as const,
  CANCELADA: "CANCELADA" as const,
  default: "PENDIENTE" as const,
} as const;

export const AGENDA_ESTADOS = {
  CONFIRMADA: "CONFIRMADA" as const,
} as const;

export const CATALOGO_PRIORIDADES = {
  ALTA: "ALTA" as const,
  MEDIA: "MEDIA" as const,
  BAJA: "BAJA" as const,
} as const;

export const ROLES = {
  USER: "USER" as const,
  STAFF: "STAFF" as const,
  ADMIN: "ADMIN" as const,
} as const;

export const AI_CONFIG = {
  model: process.env.GROQ_MODEL ?? "qwen/qwen3.8-27b",
  temperature: Number(process.env.AI_TEMPERATURE ?? "0.3"),
  timeoutMs: Number(process.env.AI_TIMEOUT_MS ?? "25000"),
  emergencyNumbers: {
    bomberos: process.env.EMERGENCY_BOMBEROS ?? "123",
    policia: process.env.EMERGENCY_POLICIA ?? "122",
  },
  medicalSystemPrompt: `Eres el nucleo de inteligencia medica de SENTINEL en Guatemala. Responde unicamente sobre primeros auxilios y orientacion medica. En riesgo vital indica llamar al {bomberos} o {policia}. No sustituyas a un medico. Se claro y breve.`,
  wellbeingSystemPrompt: `Eres el modulo de bienestar emocional de SENTINEL en Guatemala. Responde con empatia, apoyo psicologico inicial y tecnicas seguras. En crisis indica contactar servicios de emergencia. No sustituyas terapia profesional.`,
} as const;

export const JWT_CONFIG = {
  expiresIn: process.env.JWT_EXPIRES_IN ?? "8h",
} as const;

export const DB_CONFIG = {
  defaultHost: process.env.DB_HOST ?? "localhost",
  defaultPort: Number(process.env.DB_PORT ?? "3306"),
  defaultDatabase: process.env.DB_NAME ?? "sentinel_db_in5bm",
  defaultUser: process.env.DB_USERNAME ?? "IN5BM",
} as const;