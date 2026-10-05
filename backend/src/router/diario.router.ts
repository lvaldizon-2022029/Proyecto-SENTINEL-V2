import { Router } from "express";
import { diarioService } from "../services/diario.service";
import { authenticate } from "./middleware";

export const diarioRouter = Router();
diarioRouter.post("/guardar", authenticate, async (req, res) => res.json({ mensaje: "Pensamientos liberados correctamente", id: (await diarioService.save(req.body)).id }));
diarioRouter.get("/historial/:userId", authenticate, async (req, res) => res.json(await diarioService.history(String(req.params.userId))));
diarioRouter.get("/:userId", authenticate, async (req, res) => res.json(await diarioService.history(String(req.params.userId))));
diarioRouter.put("/actualizar/:id", authenticate, async (req, res) => {
  const entry = await diarioService.update(Number(req.params.id), req.body);
  return entry ? res.json({ mensaje: "Entrada del diario actualizada correctamente" }) : res.status(404).json({ error: "Entrada no encontrada" });
});
diarioRouter.delete("/eliminar/:id", authenticate, async (req, res) =>
  await diarioService.remove(Number(req.params.id)) ? res.json({ mensaje: "Entrada del diario eliminada correctamente" }) : res.status(404).json({ error: "Entrada no encontrada" }));
