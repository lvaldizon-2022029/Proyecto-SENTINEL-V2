import { Router } from "express";
import { authService } from "../services/auth.service";

export const authRouter = Router();
authRouter.post("/register", async (req, res) => {
  try {
    return res.status(201).json(await authService.register(req.body));
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "No se pudo completar el registro" });
  }
});
authRouter.post("/login", async (req, res) => {
  const result = await authService.login(req.body.emailUsers ?? req.body.email, req.body.contrasenaUsers ?? req.body.password);
  if (!result) {
    return res.status(401).json({ error: "El correo o la contraseña son incorrectos." });
  }
  return res.json(result);
});
