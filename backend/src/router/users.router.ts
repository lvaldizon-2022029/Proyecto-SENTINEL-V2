import { Router } from "express";
import { usersService } from "../services/users.service";
import { authenticate, requireRole } from "./middleware";

export const usersRouter = Router();
usersRouter.get("/", authenticate, requireRole("ADMIN"), async (_req, res) => res.json(await usersService.list()));
usersRouter.get("/get", authenticate, requireRole("ADMIN"), async (_req, res) => res.json(await usersService.list()));
usersRouter.get("/getid/:id", authenticate, requireRole("USER", "STAFF", "ADMIN"), async (req, res) => {
  const user = await usersService.find(Number(req.params.id));
  return user ? res.json(user) : res.status(404).json({ error: `Usuario no encontrado con id: ${req.params.id}` });
});
usersRouter.get("/:id", authenticate, requireRole("USER", "STAFF", "ADMIN"), async (req, res) => {
  const user = await usersService.find(Number(req.params.id));
  return user ? res.json(user) : res.status(404).json({ error: "Usuario no encontrado." });
});
usersRouter.post("/", authenticate, requireRole("ADMIN"), async (req, res) =>
  res.status(201).json({ datos: await usersService.create(req.body), mensaje: "Usuario creado con éxito" }));
usersRouter.put("/:id", authenticate, requireRole("USER", "STAFF", "ADMIN"), async (req, res) => {
  const user = await usersService.update(Number(req.params.id), req.body);
  return user ? res.json({ datos: user, mensaje: "Usuario actualizado con éxito" }) : res.status(404).json({ error: "Usuario no encontrado." });
});
usersRouter.delete("/:id", authenticate, requireRole("ADMIN"), async (req, res) =>
  await usersService.delete(Number(req.params.id))
    ? res.json({ mensaje: "Usuario eliminado correctamente", idEliminado: req.params.id })
    : res.status(404).json({ error: "No se puede eliminar: ID no existe" }));

usersRouter.put("/put/:id", authenticate, requireRole("USER", "STAFF", "ADMIN"), async (req, res) => {
  const user = await usersService.update(Number(req.params.id), req.body);
  return user ? res.json(user) : res.status(404).json({ error: `No se puede actualizar: ID ${req.params.id} no existe` });
});
usersRouter.delete("/delete/:id", authenticate, requireRole("ADMIN"), async (req, res) => {
  const deleted = await usersService.delete(Number(req.params.id));
  return deleted ? res.status(204).send() : res.status(404).json({ error: `No se puede eliminar: ID ${req.params.id} no existe` });
});
