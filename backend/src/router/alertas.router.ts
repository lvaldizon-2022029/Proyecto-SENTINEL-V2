import { Router } from "express";
import { Request } from "express";
import { alertasService } from "../services/alertas.service";
import { AuthenticatedRequest } from "../models/types";
import { authenticate, crudRouter, requireRole, validateAlertTrigger, validateAlertDisable } from "./middleware";

export const alertasRouter = crudRouter("/Sentinel/Alertas", "alertas", ["USER", "STAFF", "ADMIN"], ["STAFF", "ADMIN"]);
export const alertActionsRouter = Router();
alertActionsRouter.post("/disparar", authenticate, requireRole("USER", "STAFF", "ADMIN"), validateAlertTrigger, async (req, res) => {
  const body = { ...req.body, emergenciaId: req.body.emergenciaId ?? 1, esSilenciosa: req.body.esSilenciosa ?? 0 };
  return res.status(201).json(await alertasService.trigger(body));
});
alertActionsRouter.post("/desactivar", authenticate, requireRole("USER", "STAFF", "ADMIN"), validateAlertDisable, async (req, res) => {
  const user = (req as Request & AuthenticatedRequest).user;
  const result = await alertasService.disable(Number(req.body.idAlerta), req.body.pin, user);
  return res.status(result.status).json(result.body);
});
