import { usuariosService } from "./usuarios.service";

export class UsersService {
  list() { return usuariosService.listar(); }
  find(id: number) { return usuariosService.buscarPorId(id); }
  create(input: Record<string, unknown>) { return usuariosService.crear(input); }
  update(id: number, input: Record<string, unknown>) { return usuariosService.actualizar(id, input); }
  delete(id: number) { return usuariosService.eliminar(id); }
}

export const usersService = new UsersService();
