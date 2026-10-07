import jwt from "jsonwebtoken";
import { NextFunction, Request, Response, Router } from "express";
import { store } from "../services/store";
import { AuthenticatedRequest, Role } from "../models/types";
import { JWT_CONFIG } from "../config/constants";
import { crudSchemas, alertTriggerSchema, alertDisableSchema, aiQuerySchema, diaryEntrySchema, vitalDataSchema } from "../validation/schemas";
import { validateWith, validateQueryWith, paginationQuerySchema } from "../validation/validate";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) throw new Error("JWT_SECRET no configurado. Defínelo en backend/.env");

export const publicUser = (user: Awaited<ReturnType<typeof store.findUser>>) => {
  if (!user) return user;
  const { contrasenaUsers: _password, ...safeUser } = user;
  return safeUser;
};

export const tokenFor = (user: NonNullable<Awaited<ReturnType<typeof store.findUser>>>) =>
  jwt.sign({ sub: user.idUsers, email: user.emailUsers, role: user.rolUsers }, jwtSecret, { expiresIn: JWT_CONFIG.expiresIn as jwt.SignOptions["expiresIn"] });

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const value = req.header("authorization");
  if (!value?.startsWith("Bearer ")) return res.status(401).json({ error: "No autorizado: Token ausente o inválido" });
  try {
    const payload = jwt.verify(value.slice(7), jwtSecret) as jwt.JwtPayload;
    (req as Request & AuthenticatedRequest).user = {
      idUsers: Number(payload.sub),
      emailUsers: String(payload.email),
      rolUsers: payload.role as Role
    };
    next();
  } catch {
    return res.status(401).json({ error: "No autorizado: Token ausente o inválido" });
  }
};

export const requireRole = (...roles: Role[]) => (req: Request, res: Response, next: NextFunction) => {
  const user = (req as Request & AuthenticatedRequest).user;
  if (!user || !roles.includes(user.rolUsers)) return res.status(403).json({ error: "Prohibido: No tienes permisos suficientes" });
  next();
};

// Validation helpers
export const validateBody = (requiredFields: string[]) => (req: Request, res: Response, next: NextFunction) => {
  const missing = requiredFields.filter((field) => req.body[field] === undefined || req.body[field] === null || req.body[field] === "");
  if (missing.length > 0) {
    return res.status(400).json({ error: `Campos obligatorios faltantes: ${missing.join(", ")}` });
  }
  next();
};

export const validateCrudBody = (collection: string) => {
  const schema = crudSchemas[collection];
  if (!schema) return (_req: Request, _res: Response, next: NextFunction) => next();
  return validateWith(schema);
};

export const validateAlertTrigger = validateWith(alertTriggerSchema);

export const validateAlertDisable = validateWith(alertDisableSchema);

export const validateAiQuery = validateWith(aiQuerySchema);

export const validateDiaryEntry = validateWith(diaryEntrySchema);

export const validateVitalData = validateWith(vitalDataSchema);

export const validatePaginationQuery = validateQueryWith(paginationQuerySchema);

export const crudRouter = (path: string, collection: string, readRoles: Role[] = ["ADMIN"], writeRoles: Role[] = readRoles) => {
  const router = Router();
  router.get("/", authenticate, requireRole(...readRoles), async (req, res) => {
    const page = Math.max(Number(req.query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit ?? 50), 1), 100);
    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined || req.query.search !== undefined;
    const items = await store.collection(collection, String(req.query.search ?? ""), page, limit);
    if (!hasPagination) return res.json(items);
    return res.json({ data: items, page, limit, total: items.length });
  });
  router.get("/:id", authenticate, requireRole(...readRoles), async (req, res, next) => {
    const id = String(req.params.id);
    if (!/^\d+$/.test(id)) return next();
    const item = await store.findById(collection, Number(id));
    return item ? res.json(item) : res.status(404).json({ error: "Recurso no encontrado" });
  });
  router.post("/", authenticate, requireRole(...writeRoles), validateCrudBody(collection), async (req, res) =>
    res.status(201).json({ datos: await store.create(collection, req.body), mensaje: "Recurso creado correctamente" }));
  router.put("/:id", authenticate, requireRole(...writeRoles), validateCrudBody(collection), async (req, res) => {
    const item = await store.update(collection, Number(req.params.id), req.body);
    return item ? res.json({ datos: item, mensaje: "Recurso actualizado correctamente" }) : res.status(404).json({ error: "Recurso no encontrado" });
  });
  router.delete("/:id", authenticate, requireRole(...writeRoles), async (req, res) =>
    await store.delete(collection, Number(req.params.id))
      ? res.json({ mensaje: "Recurso eliminado correctamente" })
      : res.status(404).json({ error: "Recurso no encontrado" }));
  return router;
};
