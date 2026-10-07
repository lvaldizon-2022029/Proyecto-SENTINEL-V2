import { z } from "zod";

const trimmedString = (min = 1, max = 5000) =>
  z.string().trim().min(min).max(max);

export const roleSchema = z.enum(["USER", "STAFF", "ADMIN"]);

export const registerSchema = z.object({
  nombreUsers: z.preprocess(
    (v) => (typeof v === "string" ? v : String(v ?? "")),
    trimmedString(2, 100)
  ),
  emailUsers: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toLowerCase() : String(v ?? "").trim().toLowerCase()),
    z.string().email("emailUsers tiene formato inválido").max(100)
  ),
  contrasenaUsers: z.preprocess(
    (v) => (typeof v === "string" ? v : String(v ?? "")),
    z.string().min(6, "contrasenaUsers debe tener al menos 6 caracteres").max(100)
  ),
  rolUsers: roleSchema.optional().default("USER"),
  pinemergenciaUsers: z
    .string()
    .trim()
    .regex(/^\d{4,12}$/, "pinemergenciaUsers debe tener 4-12 dígitos")
    .optional()
    .default("0000"),
});

export const loginSchema = z.object({
  emailUsers: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toLowerCase() : ""),
    z.string().min(1, "emailUsers es obligatorio").email("emailUsers tiene formato inválido").max(100)
  ),
  contrasenaUsers: z.preprocess(
    (v) => (typeof v === "string" ? v : ""),
    z.string().min(1, "contrasenaUsers es obligatoria").max(100)
  ),
});

export const alertTriggerSchema = z.object({
  emergenciaId: z.coerce.number().int().positive("emergenciaId debe ser un entero positivo"),
  latitud: z.coerce.number().min(-90, "Latitud fuera de rango").max(90, "Latitud fuera de rango"),
  longitud: z.coerce.number().min(-180, "Longitud fuera de rango").max(180, "Longitud fuera de rango"),
  ciudadanoId: z.coerce.number().int().positive("ciudadanoId debe ser un entero positivo"),
  esSilenciosa: z.union([z.boolean(), z.literal(0), z.literal(1)]).optional().default(0),
});

export const alertDisableSchema = z.object({
  idAlerta: z.coerce.number().int().positive("idAlerta debe ser un entero positivo"),
  pin: z.preprocess(
    (v) => (typeof v === "number" ? String(v) : typeof v === "string" ? v.trim() : v),
    z.string().min(1, "pin es obligatorio").max(12)
  ),
});

export const aiQuerySchema = z.object({
  userId: z.coerce.number().int().positive("userId debe ser un entero positivo"),
  prompt: trimmedString(1, 4000),
});

export const diaryEntrySchema = z.object({
  titulo: trimmedString(1, 200),
  contenido: trimmedString(1, 5000),
  userId: z.coerce.number().int().positive("userId debe ser un entero positivo"),
});

export const vitalDataSchema = z.object({
  idUser: z.coerce.number().int().positive("idUser debe ser un entero positivo"),
  grupoSanguineo: z.enum(["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]).optional(),
  alergias: z.string().trim().max(500).optional().default(""),
  enfermedadesCronicas: z.string().trim().max(500).optional().default(""),
  contactoEmergencia: z.string().trim().min(5).max(100).optional(),
});

export const catalogoEmergenciaSchema = z.object({
  nombre: trimmedString(2, 100),
  prioridad: z.enum(["BAJA", "MEDIA", "ALTA"]),
});

export const catalogoEntidadSchema = z.object({
  nombre: trimmedString(2, 100),
});

export const estacionSchema = z.object({
  nombre: trimmedString(2, 100),
  entidadId: z.coerce.number().int().positive(),
  latitud: z.coerce.number().min(-90).max(90),
  longitud: z.coerce.number().min(-180).max(180),
  direccion: trimmedString(5, 200),
  telefono: z.string().trim().min(7).max(20).regex(/^[\d\-\s+]+$/, "telefono tiene formato inválido"),
});

export const despachoSchema = z.object({
  alertaId: z.coerce.number().int().positive(),
  estacionId: z.coerce.number().int().positive(),
  unidad: trimmedString(1, 50),
});

export const especialistaSchema = z.object({
  userid: z.coerce.number().int().positive(),
  especialidad: trimmedString(2, 100),
  biografia: z.string().trim().max(2000).default(""),
});

export const staffAutoridadSchema = z.object({
  estacionId: z.coerce.number().int().positive(),
  rango: trimmedString(2, 50),
  estatus: z.enum(["ACTIVO", "INACTIVO", "LICENCIA", "SUSPENDIDO"]),
  userId: z.coerce.number().int().positive(),
});

export const agendaCharlaSchema = z.object({
  ciudadanoId: z.coerce.number().int().positive(),
  especialistaId: z.coerce.number().int().positive(),
  fecha: z.string().datetime({ offset: true, message: "fecha debe ser ISO 8601" }),
  estado: z.enum(["PENDIENTE", "CONFIRMADA", "CANCELADA"]),
});

export const usuarioSchema = z.object({
  nombreUsers: trimmedString(2, 100),
  emailUsers: z.string().trim().toLowerCase().email().max(100),
  rolUsers: roleSchema,
  pinemergenciaUsers: z.string().trim().regex(/^\d{4,12}$/),
});

export const crudSchemas: Record<string, z.ZodTypeAny> = {
  usuarios: usuarioSchema,
  catalogoEmergencias: catalogoEmergenciaSchema,
  catalogoEntidades: catalogoEntidadSchema,
  estaciones: estacionSchema,
  despachos: despachoSchema,
  especialistas: especialistaSchema,
  staffAutoridad: staffAutoridadSchema,
  agendaCharlas: agendaCharlaSchema,
  vitalData: vitalDataSchema,
  diario: diaryEntrySchema,
};
