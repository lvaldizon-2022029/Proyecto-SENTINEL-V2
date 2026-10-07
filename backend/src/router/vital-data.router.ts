import { Request, Router } from "express";
import { store } from "../services/store";
import { AuthenticatedRequest } from "../models/types";
import { authenticate, crudRouter, requireRole } from "./middleware";

export const vitalDataRouter = Router();
const toVitalDataResponse = (item: Record<string, unknown>) => ({
  ...item,
  id: Number(item.id ?? item.idUser),
  idUser: Number(item.idUser ?? item.id),
  grupoSanguineo: item.grupoSanguineo ?? item.gruposanguineoUser ?? "",
  alergias: item.alergias ?? item.alergiasUser ?? "",
  enfermedadesCronicas: item.enfermedadesCronicas ?? item.enfermedadescronicasUser ?? "",
  contactoEmergencia: item.contactoEmergencia ?? item.contactoemergenciaUser ?? ""
});

vitalDataRouter.get("/:id", authenticate, requireRole("USER", "ADMIN"), async (req, res, next) => {
  const rawId = String(req.params.id);
  if (!/^\d+$/.test(rawId)) return next();
  const id = Number(rawId);
  const user = (req as Request & AuthenticatedRequest).user;
  if (user?.rolUsers === "USER" && user.idUsers !== id) return res.status(403).json({ error: "No puedes consultar los datos vitales de otro usuario." });
  const item = await store.findById("vitalData", id);
  if (item) return res.json(toVitalDataResponse(item));
  if (!user) return res.status(401).json({ error: "No autorizado" });
  if (user.rolUsers === "USER" && user.idUsers !== id) return res.status(403).json({ error: "No puedes consultar los datos vitales de otro usuario." });
  return res.json({ exists: false, id, idUser: id, grupoSanguineo: "", alergias: "", enfermedadesCronicas: "", contactoEmergencia: "", telefonoEmergencia: "" });
});
vitalDataRouter.use(crudRouter("/Sentinel/VitalData", "vitalData", ["USER", "ADMIN"]));
