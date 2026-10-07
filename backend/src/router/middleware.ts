import jwt from "jsonwebtoken";
import { NextFunction, Request, Response, Router } from "express";
import { store } from "../services/store";
import { AuthenticatedRequest, Role } from "../models/types";
import { JWT_CONFIG, ALERT_ESTADOS } from "../config/constants";

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

export const validateAlertTrigger = (req: Request, res: Response, next: NextFunction) => {
  const { emergenciaId, latitud, longitud, ciudadanoId } = req.body;
  if (emergenciaId === undefined || latitud === undefined || longitud === undefined || ciudadanoId === undefined) {
    return res.status(400).json({ error: "Campos obligatorios: emergenciaId, latitud, longitud, ciudadanoId" });
  }
  if (typeof latitud !== "number" || typeof longitud !== "number") {
    return res.status(400).json({ error: "Latitud y longitud deben ser números" });
  }
  if (latitud < -90 || latitud > 90 || longitud < -180 || longitud > 180) {
    return res.status(400).json({ error: "Coordenadas fuera de rango válido" });
  }
  next();
};

export const validateAlertDisable = (req: Request, res: Response, next: NextFunction) => {
  const { idAlerta, pin } = req.body;
  if (idAlerta === undefined || pin === undefined) {
    return res.status(400).json({ error: "Campos obligatorios: idAlerta, pin" });
  }
  next();
};

export const validateAiQuery = (req: Request, res: Response, next: NextFunction) => {
  const { userId, prompt } = req.body;
  if (!userId || !prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "Campos obligatorios: userId (number), prompt (string no vacío)" });
  }
  next();
};

export const validateDiaryEntry = (req: Request, res: Response, next: NextFunction) => {
  const { titulo, contenido, userId } = req.body;
  if (!titulo || !contenido || !userId) {
    return res.status(400).json({ error: "Campos obligatorios: titulo, contenido, userId" });
  }
  if (typeof titulo !== "string" || typeof contenido !== "string") {
    return res.status(400).json({ error: "Título y contenido deben ser strings" });
  }
  if (titulo.length > 200) return res.status(400).json({ error: "Título máximo 200 caracteres" });
  if (contenido.length > 5000) return res.status(400).json({ error: "Contenido máximo 5000 caracteres" });
  next();
};

export const validateVitalData = (req: Request, res: Response, next: NextFunction) => {
  const { idUser, grupoSanguineo, alergias, enfermedadesCronicas, contactoEmergencia } = req.body;
  if (!idUser) return res.status(400).json({ error: "idUser obligatorio" });
  next();
};

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
  router.post("/", authenticate, requireRole(...writeRoles), async (req, res) =>
    res.status(201).json({ datos: await store.create(collection, req.body), mensaje: "Recurso creado correctamente" }));
  router.put("/:id", authenticate, requireRole(...writeRoles), async (req, res) => {
    const item = await store.update(collection, Number(req.params.id), req.body);
    return item ? res.json({ datos: item, mensaje: "Recurso actualizado correctamente" }) : res.status(404).json({ error: "Recurso no encontrado" });
  });
  router.delete("/:id", authenticate, requireRole(...writeRoles), async (req, res) =>
    await store.delete(collection, Number(req.params.id))
      ? res.json({ mensaje: "Recurso eliminado correctamente" })
      : res.status(404).json({ error: "Recurso no encontrado" }));
  return router;
};
