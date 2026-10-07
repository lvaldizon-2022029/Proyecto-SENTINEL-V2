import "dotenv/config";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
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
app.get("/health", (_req, res) => res.json({ status: "ok", service: "sentinel-backend", persistence: store.persistence }));
app.use("/Sentinel/Auth", authRouter);
app.use("/Sentinel/auth", authRouter);
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
app.use("/Sentinel/AI", aiRouter);
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({ error: "Error interno del servidor" });
});
export { app };
