import { Router } from "express";
import { store } from "../services/store";
import { authenticate, requireRole } from "./middleware";

export const dashboardRouter = Router();
dashboardRouter.get("/estadisticas", authenticate, requireRole("USER", "STAFF", "ADMIN"), async (_req, res) => {
  const [alerts, users, dispatches] = await Promise.all([store.collection("alertas"), store.listUsers(), store.collection("despachos")]);
  return res.json({ usuarios: users.length, alertas: alerts.length, alertasPendientes: alerts.filter((item) => item.estadoAlertas === "PENDIENTE").length, despachos: dispatches.length });
});
