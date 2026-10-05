import { Router } from "express";
import { staffAutoridadService } from "../services/staff-autoridad.service";
import { authenticate, crudRouter, requireRole } from "./middleware";
export const staffRouter = crudRouter("/Sentinel/StaffAutoridad", "staffAutoridad", ["STAFF", "ADMIN"], ["ADMIN"]);
export const staffActionsRouter = Router();
staffActionsRouter.get("/buscar/cargo", authenticate, requireRole("STAFF", "ADMIN"), async (req, res) => {
  const cargo = String(req.query.cargo ?? "").toLowerCase();
  const matches = (await staffAutoridadService.list()).filter((item) => String(item.rangoStaffAutoridad ?? item.rango ?? "").toLowerCase().includes(cargo));
  return matches.length ? res.json(matches) : res.status(404).json({ error: `No se encontró personal con el cargo: ${cargo}` });
});
staffActionsRouter.get("/check", (_req, res) => res.json({ status: "Operacional", servicio: "Sentinel Authority Staff Service", timestamp: new Date().toISOString() }));
