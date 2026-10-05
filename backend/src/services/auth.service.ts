import bcrypt from "bcryptjs";
import { store } from "./store";
import { publicUser, tokenFor } from "../router/middleware";

export class AuthService {
  async register(input: Record<string, unknown>) {
    const normalized: Record<string, unknown> = {
      ...input,
      nombreUsers: String(input.nombreUsers ?? input.nombre ?? ""),
      emailUsers: String(input.emailUsers ?? input.email ?? ""),
      rolUsers: String(input.rolUsers ?? "USER"),
      pinemergenciaUsers: String(input.pinemergenciaUsers ?? "0000")
    };
    const user = await store.createUser({
      ...normalized,
      password: typeof (normalized.contrasenaUsers ?? normalized.password) === "string"
        ? (normalized.contrasenaUsers ?? normalized.password) as string
        : undefined
    });
    return { mensaje: "Usuario registrado correctamente", datos: publicUser(user) };
  }

  async login(email: unknown, password: unknown) {
    const user = typeof email === "string" ? await store.findUserByEmail(email) : undefined;
    if (!user || typeof password !== "string" || !(await bcrypt.compare(password, user.contrasenaUsers))) {
      return undefined;
    }
    return { token: tokenFor(user), ...publicUser(user) };
  }
}

export const authService = new AuthService();
