import { Router } from "express";
import { authService } from "../services/auth.service";
import { validateWith } from "../validation/validate";
import { loginSchema, registerSchema } from "../validation/schemas";

export const authRouter = Router();

const normalizeRegister = (body: Record<string, unknown>) => ({
  nombreUsers: body.nombreUsers ?? body.nombre ?? "",
  emailUsers: body.emailUsers ?? body.email ?? "",
  contrasenaUsers: body.contrasenaUsers ?? body.password ?? "",
  rolUsers: body.rolUsers ?? "USER",
  pinemergenciaUsers: body.pinemergenciaUsers ?? "0000",
});

const normalizeLogin = (body: Record<string, unknown>) => ({
  emailUsers: body.emailUsers ?? body.email ?? "",
  contrasenaUsers: body.contrasenaUsers ?? body.password ?? "",
});

authRouter.post("/register", (req, res, next) => {
  req.body = normalizeRegister(req.body ?? {});
  next();
}, validateWith(registerSchema), async (req, res) => {
  try {
    return res.status(201).json(await authService.register(req.body));
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "No se pudo completar el registro" });
  }
});

authRouter.post("/login", (req, res, next) => {
  req.body = normalizeLogin(req.body ?? {});
  next();
}, validateWith(loginSchema), async (req, res) => {
  const result = await authService.login(req.body.emailUsers, req.body.contrasenaUsers);
  if (!result) {
    return res.status(401).json({ error: "El correo o la contraseña son incorrectos." });
  }
  return res.json(result);
});
