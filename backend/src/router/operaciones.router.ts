import { Router } from "express";
import { store } from "../services/store";
import { authenticate, crudRouter, requireRole } from "./middleware";

export const despachosRouter = crudRouter("/Sentinel/DespachosEmergencia", "despachos", ["STAFF", "ADMIN"]);
export const despachosAliasRouter = crudRouter("/Sentinel/DespachoEmergencias", "despachos", ["STAFF", "ADMIN"]);
export const despachosLegacyRouter = crudRouter("/Sentinel/despachos", "despachos", ["STAFF", "ADMIN"]);
export const especialistasRouter = crudRouter("/Sentinel/Especialistas", "especialistas");
export const estacionesRouter = crudRouter("/Sentinel/Estaciones", "estaciones", ["STAFF", "ADMIN"], ["ADMIN"]);
export const staffRouter = crudRouter("/Sentinel/StaffAutoridad", "staffAutoridad", ["STAFF", "ADMIN"], ["ADMIN"]);
export const agendaRouter = crudRouter("/Sentinel/AgendaCharlas", "agendaCharlas", ["STAFF", "ADMIN"]);
export const vitalDataRouter = crudRouter("/Sentinel/VitalData", "vitalData", ["USER", "ADMIN"]);
export const operationsRouter = Router();
operationsRouter.get("/estaciones/buscar", authenticate, requireRole("STAFF", "ADMIN"), async (req, res) => {
  const name = String(req.query.nombre ?? "").toLowerCase();
  const matches = (await store.collection("estaciones")).filter((item) => String(item.nombreEstaciones ?? item.nombre ?? "").toLowerCase().includes(name));
  return matches.length ? res.json(matches) : res.status(404).json({ error: `No se encontraron estaciones con el nombre: ${name}` });
});
operationsRouter.patch("/estaciones/:id/ubicacion", authenticate, requireRole("ADMIN"), async (req, res) => {
  const item = await store.update("estaciones", Number(req.params.id), { latitud: req.query.lat ?? req.body.lat, longitud: req.query.lng ?? req.body.lng });
  return item ? res.json({ mensaje: "Ubicación de la estación actualizada", datos: item }) : res.status(404).json({ error: "Estación no encontrada" });
});
operationsRouter.get("/estaciones/check", (_req, res) => res.json({ mensaje: "El controlador de Estaciones (SENTINEL-GT) está operando correctamente.", timestamp: new Date().toISOString() }));
operationsRouter.get("/estaciones/tipo/:tipoId", authenticate, requireRole("STAFF", "ADMIN"), async (req, res) => {
  const typeId = Number(req.params.tipoId);
  res.json((await store.collection("estaciones")).filter((item) => Number(item.tipoentidadid ?? item.entidadId) === typeId));
});
operationsRouter.get("/estaciones/contar", authenticate, requireRole("STAFF", "ADMIN"), async (_req, res) => {
  res.json((await store.collection("estaciones")).length);
});
operationsRouter.get("/staff/buscar/cargo", authenticate, requireRole("STAFF", "ADMIN"), async (req, res) => {
  const cargo = String(req.query.cargo ?? "").toLowerCase();
  const matches = (await store.collection("staffAutoridad")).filter((item) => String(item.rangoStaffAutoridad ?? item.rango ?? "").toLowerCase().includes(cargo));
  return matches.length ? res.json(matches) : res.status(404).json({ error: `No se encontró personal con el cargo: ${cargo}` });
});
operationsRouter.get("/staff/check", (_req, res) => res.json({ status: "Operacional", servicio: "Sentinel Authority Staff Service", timestamp: new Date().toISOString() }));
operationsRouter.post("/agenda/:id/confirmar", authenticate, requireRole("STAFF", "ADMIN"), async (req, res) => {
  const item = await store.update("agendaCharlas", Number(req.params.id), { estado: "CONFIRMADA", estadoAgendaCharlas: "CONFIRMADA" });
  return item ? res.json({ mensaje: `Asistencia confirmada para la charla: ${req.params.id}` }) : res.status(400).json({ error: "No se pudo confirmar. Verifique si la charla ya pasó o fue cancelada." });
});
operationsRouter.post("/DespachosEmergencia", authenticate, requireRole("STAFF", "ADMIN"), async (req, res) => {
  const payload = req.body as { idAlerta?: number; idEstacion?: number; unidadId?: string };
  const item = await store.create("despachos", {
    alertaId: payload.idAlerta,
    estacionId: payload.idEstacion,
    unidad: payload.unidadId
  });
  return res.status(201).json({ mensaje: "Unidad despachada correctamente", datos: item });
});
operationsRouter.post("/agenda-charlas/:id/confirmar", authenticate, requireRole("STAFF", "ADMIN"), async (req, res) => {
  const item = await store.update("agendaCharlas", Number(req.params.id), { estado: "CONFIRMADA", estadoAgendaCharlas: "CONFIRMADA" });
  return item ? res.json({ mensaje: `Asistencia confirmada para la charla: ${req.params.id}` }) : res.status(400).json({ error: "No se pudo confirmar. Verifique si la charla ya pasó o fue cancelada." });
});
