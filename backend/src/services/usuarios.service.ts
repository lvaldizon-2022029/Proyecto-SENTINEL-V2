import { usuariosRepository } from "../data/UsuariosRepository";
import { publicUser } from "../router/middleware";

export class UsuariosService {
  async listar() { return (await usuariosRepository.findAll()).map(publicUser); }
  async buscarPorId(id: number) { return publicUser(await usuariosRepository.findById(id)); }
  async buscarPorEmail(email: string) { return usuariosRepository.findByEmail(email); }
  async crear(input: Record<string, unknown>) { return publicUser(await usuariosRepository.create(input)); }
  async actualizar(id: number, input: Record<string, unknown>) { return publicUser(await usuariosRepository.update(id, input)); }
  eliminar(id: number) { return usuariosRepository.delete(id); }
}
export const usuariosService = new UsuariosService();
