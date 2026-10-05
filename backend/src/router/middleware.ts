import jwt from "jsonwebtoken";
import { NextFunction, Request, Response, Router } from "express";
import { store } from "../services/store";
import { AuthenticatedRequest, Role } from "../models/types";

const jwtSecret = process.env.JWT_SECRET ?? "development-only-secret";

export const publicUser = (user: Awaited<ReturnType<typeof store.findUser>>) => {
  if (!user) return user;
  const { contrasenaUsers: _password, ...safeUser } = user;
  return safeUser;
};

export const tokenFor = (user: NonNullable<Awaited<ReturnType<typeof store.findUser>>>) =>
  jwt.sign({ sub: user.idUsers, email: user.emailUsers, role: user.rolUsers }, jwtSecret, { expiresIn: "8h" });

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

export const crudRouter = (path: string, collection: string, readRoles: Role[] = ["ADMIN"], writeRoles: Role[] = readRoles) => {
  const router = Router();
  router.get("/", authenticate, requireRole(...readRoles), async (req, res) => {
    const page = Math.max(Number(req.query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit ?? 50), 1), 100);
    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined || req.query.search !== undefined;
    const items = await store.collection(collection, String(req.query.search ?? ""));
    if (!hasPagination) return res.json(items);
    return res.json({ data: items.slice((page - 1) * limit, page * limit), page, limit, total: items.length });
  });
  router.get("/:id", authenticate, requireRole(...readRoles), async (req, res, next) => {
    const id = String(req.params.id);
    if (!/^\d+$/.test(id)) return next();
    const item = (await store.collection(collection)).find((entry) => entry.id === Number(id));
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
