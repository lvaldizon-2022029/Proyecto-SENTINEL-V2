import { Router } from "express";
import { estacionesService } from "../services/estaciones.service";
import { authenticate, crudRouter, requireRole } from "./middleware";
export const estacionesRouter = crudRouter("/Sentinel/Estaciones", "estaciones", ["STAFF", "ADMIN"], ["ADMIN"]);
export const estacionesActionsRouter = Router();
estacionesActionsRouter.get("/buscar", authenticate, requireRole("STAFF", "ADMIN"), async (req, res) => {
  const name = String(req.query.nombre ?? "").toLowerCase();
  const matches = (await estacionesService.list()).filter((item) => String(item.nombreEstaciones ?? item.nombre ?? "").toLowerCase().includes(name));
  return matches.length ? res.json(matches) : res.status(404).json({ error: `No se encontraron estaciones con el nombre: ${name}` });
});
estacionesActionsRouter.patch("/:id/ubicacion", authenticate, requireRole("ADMIN"), async (req, res) => {
  const item = await estacionesService.update(Number(req.params.id), { latitud: req.query.lat ?? req.body.lat, longitud: req.query.lng ?? req.body.lng });
  return item ? res.json({ mensaje: "Ubicación de la estación actualizada", datos: item }) : res.status(404).json({ error: "Estación no encontrada" });
});
estacionesActionsRouter.get("/check", (_req, res) => res.json({ mensaje: "El controlador de Estaciones (SENTINEL-GT) está operando correctamente.", timestamp: new Date().toISOString() }));
