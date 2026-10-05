import { Router } from "express";
import { agendaCharlasService } from "../services/agenda-charlas.service";
import { authenticate, crudRouter, requireRole } from "./middleware";
export const agendaRouter = crudRouter("/Sentinel/AgendaCharlas", "agendaCharlas", ["STAFF", "ADMIN"]);
export const agendaActionsRouter = Router();
agendaActionsRouter.post("/:id/confirmar", authenticate, requireRole("STAFF", "ADMIN"), async (req, res) => {
  const item = await agendaCharlasService.update(Number(req.params.id), { estado: "CONFIRMADA", estadoAgendaCharlas: "CONFIRMADA" });
  return item ? res.json({ mensaje: `Asistencia confirmada para la charla: ${req.params.id}` }) : res.status(400).json({ error: "No se pudo confirmar. Verifique si la charla ya pasó o fue cancelada." });
});
