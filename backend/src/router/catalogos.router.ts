import { Router } from "express";
import { store } from "../services/store";
import { authenticate, crudRouter, requireRole } from "./middleware";

export const catalogoEmergenciasRouter = crudRouter("/Sentinel/CatalogoEmergencias", "catalogoEmergencias", ["USER", "STAFF", "ADMIN"], ["ADMIN"]);
export const catalogoEntidadesRouter = crudRouter("/Sentinel/CatalogoEntidades", "catalogoEntidades");
export const catalogoActionsRouter = Router();
catalogoActionsRouter.get("/entidades/buscarNombre", authenticate, requireRole("ADMIN"), async (req, res) => {
  const name = String(req.query.nombre ?? "");
  const entity = (await store.collection("catalogoEntidades")).find((item) => String(item.nombreCatalogoEntidades ?? item.nombre ?? "").toLowerCase() === name.toLowerCase());
  return entity ? res.json(entity) : res.status(404).json({ error: `No se encontró la entidad con el nombre: ${name}` });
});
catalogoActionsRouter.get("/emergencias/prioridad/:prioridad", authenticate, requireRole("STAFF", "ADMIN"), async (req, res) => {
  const priority = String(req.params.prioridad).toLowerCase();
  const matches = (await store.collection("catalogoEmergencias")).filter((item) => String(item.prioridadCatalogoEmergencias ?? item.prioridad ?? "").toLowerCase() === priority);
  return matches.length ? res.json(matches) : res.status(404).json({ error: `No se encontraron emergencias con prioridad: ${req.params.prioridad}` });
});
catalogoActionsRouter.get("/emergencias/total", authenticate, requireRole("STAFF", "ADMIN"), async (_req, res) =>
  res.json({ totalCategorias: (await store.collection("catalogoEmergencias")).length }));
