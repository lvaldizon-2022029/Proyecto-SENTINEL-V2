import { Router } from "express";
import { usuariosService } from "../services/usuarios.service";
import { authenticate, requireRole } from "./middleware";

export const usersRouter = Router();
usersRouter.get("/", authenticate, requireRole("ADMIN"), async (_req, res) => res.json(await usuariosService.listar()));
usersRouter.get("/get", authenticate, requireRole("ADMIN"), async (_req, res) => res.json(await usuariosService.listar()));
usersRouter.get("/getid/:id", authenticate, requireRole("USER", "STAFF", "ADMIN"), async (req, res) => {
  const user = await usuariosService.buscarPorId(Number(req.params.id));
  return user ? res.json(user) : res.status(404).json({ error: `Usuario no encontrado con id: ${req.params.id}` });
});
usersRouter.get("/:id", authenticate, requireRole("USER", "STAFF", "ADMIN"), async (req, res) => {
  const user = await usuariosService.buscarPorId(Number(req.params.id));
  return user ? res.json(user) : res.status(404).json({ error: "Usuario no encontrado." });
});
usersRouter.post("/", authenticate, requireRole("ADMIN"), async (req, res) =>
  res.status(201).json({ datos: await usuariosService.crear(req.body), mensaje: "Usuario creado con éxito" }));
usersRouter.put("/:id", authenticate, requireRole("USER", "STAFF", "ADMIN"), async (req, res) => {
  try {
    const user = await usuariosService.actualizar(Number(req.params.id), req.body);
    return user ? res.json({ datos: user, mensaje: "Usuario actualizado con éxito" }) : res.status(404).json({ error: "Usuario no encontrado." });
  } catch (error) {
    console.error("No se pudo actualizar el usuario:", error);
    return res.status(400).json({ error: "No se pudo actualizar el usuario. Verifica los datos enviados." });
  }
});
usersRouter.delete("/:id", authenticate, requireRole("ADMIN"), async (req, res) =>
  await usuariosService.eliminar(Number(req.params.id))
    ? res.json({ mensaje: "Usuario eliminado correctamente", idEliminado: req.params.id })
    : res.status(404).json({ error: "No se puede eliminar: ID no existe" }));

usersRouter.put("/put/:id", authenticate, requireRole("USER", "STAFF", "ADMIN"), async (req, res) => {
  try {
    const user = await usuariosService.actualizar(Number(req.params.id), req.body);
    return user ? res.json(user) : res.status(404).json({ error: `No se puede actualizar: ID ${req.params.id} no existe` });
  } catch (error) {
    console.error("No se pudo actualizar el usuario:", error);
    return res.status(400).json({ error: "No se pudo actualizar el usuario. Verifica los datos enviados." });
  }
});
usersRouter.delete("/delete/:id", authenticate, requireRole("ADMIN"), async (req, res) => {
  const deleted = await usuariosService.eliminar(Number(req.params.id));
  return deleted ? res.status(204).send() : res.status(404).json({ error: `No se puede eliminar: ID ${req.params.id} no existe` });
});
