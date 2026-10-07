import "dotenv/config";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { aiRouter } from "../router/ai.router";
import { alertasRouter, alertActionsRouter } from "../router/alertas.router";
import { authRouter } from "../router/auth.router";
import { catalogoActionsRouter, catalogoEmergenciasRouter, catalogoEntidadesRouter } from "../router/catalogos.router";
import { dashboardRouter } from "../router/dashboard.router";
import { diarioRouter } from "../router/diario.router";
import { agendaRouter, agendaActionsRouter, despachosRouter, estacionesRouter, especialistasRouter, operationsRouter, staffRouter } from "../router/operaciones.router";
import { usersRouter } from "../router/users.router";
import { vitalDataRouter } from "../router/vital-data.router";
import { store } from "../services/store";
import { authenticate, requireRole } from "../router/middleware";
import { AuthenticatedRequest } from "../models/types";

const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: "Demasiadas solicitudes, intente más tarde" },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Demasiados intentos de autenticación, intente en 15 minutos" },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Límite de consultas a IA alcanzado, intente en 1 minuto" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);
const configuredOrigins = (process.env.FRONTEND_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const isAllowedOrigin = (origin: string): boolean => {
  if (configuredOrigins.includes(origin)) return true;
  try {
    const url = new URL(origin);
    return (url.hostname === "localhost" || url.hostname === "127.0.0.1")
      && (url.protocol === "http:" || url.protocol === "https:");
  } catch {
    return false;
  }
};
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Origen no permitido por CORS"));
  }
}));
app.use(express.json({ limit: "1mb" }));
app.use((req: Request, res: Response, next: NextFunction) => {
  const started = Date.now();
  res.on("finish", () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - started}ms`);
  });
  next();
});
app.get("/health", async (_req, res) => {
  let dbStatus = "unknown";
  try {
    if (store.persistence === "mysql") {
      await store.collection("users", "", 1, 1);
      dbStatus = "connected";
    } else {
      dbStatus = "memory";
    }
  } catch {
    dbStatus = "error";
  }
  res.json({ status: "ok", service: "sentinel-backend", persistence: store.persistence, database: dbStatus });
});
app.use("/Sentinel/Auth", authLimiter, authRouter);
app.use("/Sentinel/auth", authLimiter, authRouter);
app.use("/Sentinel/Users", usersRouter);
app.use("/Sentinel/Dashboard", dashboardRouter);
app.use("/Sentinel/Alertas", alertActionsRouter);
app.use("/Sentinel/Alertas", alertasRouter);
app.use("/Sentinel/alertas", alertActionsRouter);
app.use("/Sentinel/alertas", alertasRouter);
app.use("/Sentinel/CatalogoEmergencias", catalogoEmergenciasRouter);
app.use("/Sentinel/CatalogoEntidades", catalogoEntidadesRouter);
app.use("/Sentinel/catalogo-emergencias", catalogoEmergenciasRouter);
app.use("/Sentinel/catalogo-entidades", catalogoEntidadesRouter);
app.use("/Sentinel", catalogoActionsRouter);
app.use("/Sentinel/DespachosEmergencia", despachosRouter);
app.use("/Sentinel/DespachoEmergencias", despachosRouter);
app.use("/Sentinel/despachos", despachosRouter);
app.use("/Sentinel/Especialistas", especialistasRouter);
app.use("/Sentinel/especialistas", especialistasRouter);
app.use("/Sentinel/Estaciones", estacionesRouter);
app.use("/Sentinel/estaciones", estacionesRouter);
app.use("/Sentinel/StaffAutoridad", staffRouter);
app.use("/Sentinel/staff-autoridad", staffRouter);
app.use("/Sentinel/AgendaCharlas", agendaRouter);
app.use("/Sentinel/AgendaCharlas", agendaActionsRouter);
app.use("/Sentinel/agenda-charlas", agendaRouter);
app.use("/Sentinel/agenda-charlas", agendaActionsRouter);
app.use("/Sentinel/VitalData", vitalDataRouter);
app.use("/Sentinel", operationsRouter);
app.use("/Sentinel/Diario", diarioRouter);
app.use("/Sentinel/AI", aiLimiter, aiRouter);
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Recurso no encontrado" });
});
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof SyntaxError) {
    return res.status(400).json({ error: "Cuerpo JSON inválido" });
  }
  if (error instanceof Error && (error as NodeJS.ErrnoException & { type?: string }).type === "entity.too.large") {
    return res.status(413).json({ error: "Cuerpo demasiado grande" });
  }
  if (error instanceof Error && error.message === "Origen no permitido por CORS") {
    return res.status(403).json({ error: "Origen no permitido por CORS" });
  }
  console.error(error);
  res.status(500).json({ error: "Error interno del servidor" });
});
export { app };
