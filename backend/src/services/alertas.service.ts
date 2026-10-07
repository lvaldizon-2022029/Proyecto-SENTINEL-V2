import { AuthenticatedRequest } from "../models/types";
import { alertasRepository } from "../data/AlertasRepository";
import { usuariosRepository } from "../data/UsuariosRepository";
import { ALERT_ESTADOS } from "../config/constants";

export class AlertasService {
  listar() { return alertasRepository.findAll(); }
  buscarPorId(id: number) { return alertasRepository.findById(id); }
  crear(input: Record<string, unknown>) { return alertasRepository.create(input); }
  actualizar(id: number, input: Record<string, unknown>) { return alertasRepository.update(id, input); }
  eliminar(id: number) { return alertasRepository.delete(id); }
  async trigger(input: Record<string, unknown>) {
    const alert = await alertasRepository.create({ ...input, estadoAlertas: ALERT_ESTADOS.default, fechaAlertas: new Date().toISOString() });
    return { status: "success", message: "Alerta de emergencia procesada correctamente", idAlerta: alert.id, datos: alert };
  }

  async disable(id: number, pin: unknown, requestUser: AuthenticatedRequest["user"]) {
    const alert = await alertasRepository.findById(id);
    const owner = requestUser && await usuariosRepository.findById(requestUser.idUsers);
    if (!alert) return { status: 404, body: { error: "Alerta no encontrada" } };
    if (pin !== owner?.pinemergenciaUsers) return { status: 401, body: { error: "El PIN de emergencia es incorrecto." } };
    await alertasRepository.update(id, { estadoAlertas: ALERT_ESTADOS.CANCELADA });
    return { status: 200, body: { status: "success", message: "Alerta desactivada correctamente. Todo bajo control." } };
  }
}

export const alertasService = new AlertasService();
