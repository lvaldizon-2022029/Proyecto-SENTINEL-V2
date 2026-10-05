import { Request, Router } from "express";
import { store } from "../services/store";
import { AuthenticatedRequest } from "../models/types";
import { authenticate, crudRouter, requireRole } from "./middleware";

export const vitalDataRouter = Router();
vitalDataRouter.get("/:id", authenticate, requireRole("USER", "ADMIN"), async (req, res, next) => {
  const rawId = String(req.params.id);
  if (!/^\d+$/.test(rawId)) return next();
  const id = Number(rawId);
  const item = (await store.collection("vitalData")).find((entry) => entry.id === id || entry.idUser === id);
  if (item) return res.json(item);
  const user = (req as Request & AuthenticatedRequest).user;
  if (!user) return res.status(401).json({ error: "No autorizado" });
  if (user.rolUsers === "USER" && user.idUsers !== id) return res.status(403).json({ error: "No puedes consultar los datos vitales de otro usuario." });
  return res.json({ exists: false, id, idUser: id, grupoSanguineo: "", alergias: "", enfermedadesCronicas: "", contactoEmergencia: "", telefonoEmergencia: "" });
});
vitalDataRouter.use(crudRouter("/Sentinel/VitalData", "vitalData", ["USER", "ADMIN"]));
export const vitalDataLegacyRouter = Router();
vitalDataLegacyRouter.get("/get", authenticate, requireRole("USER", "ADMIN"), async (_req, res) => res.json(await store.collection("vitalData")));
vitalDataLegacyRouter.get("/getid/:id", authenticate, requireRole("USER", "ADMIN"), async (req, res) => {
  const item = (await store.collection("vitalData")).find((entry) => entry.id === Number(req.params.id));
  return item ? res.json(item) : res.status(404).json({ error: "Datos vitales no encontrados" });
});
vitalDataLegacyRouter.post("/", authenticate, requireRole("USER", "ADMIN"), async (req, res) =>
  res.status(201).json(await store.create("vitalData", req.body)));
vitalDataLegacyRouter.put("/put/:id", authenticate, requireRole("USER", "ADMIN"), async (req, res) => {
  const item = await store.update("vitalData", Number(req.params.id), req.body);
  return item ? res.json(item) : res.status(404).json({ error: "Datos vitales no encontrados" });
});
vitalDataLegacyRouter.delete("/delete/:id", authenticate, requireRole("USER", "ADMIN"), async (req, res) =>
  await store.delete("vitalData", Number(req.params.id)) ? res.status(204).send() : res.status(404).json({ error: "Datos vitales no encontrados" }));
