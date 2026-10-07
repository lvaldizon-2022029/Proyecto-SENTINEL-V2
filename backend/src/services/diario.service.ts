import { diarioRepository } from "../data/DiarioRepository";

export class DiarioService {
  listar() { return diarioRepository.findAll(); }
  buscarPorUsuario(userId: number) { return this.history(String(userId)); }
  save(input: Record<string, unknown>) { return diarioRepository.create(input); }
  async history(userId: string) { return (await diarioRepository.findAll()).filter((entry) => String(entry.userId ?? entry.usuarioId) === userId); }
  update(id: number, input: Record<string, unknown>) { return diarioRepository.update(id, input); }
  remove(id: number) { return diarioRepository.delete(id); }
  guardarEntrada(input: Record<string, unknown>) { return this.save(input); }
  obtenerHistorialPorUsuario(userId: number) { return this.buscarPorUsuario(userId); }
  actualizarEntrada(id: number, input: Record<string, unknown>) { return this.update(id, input); }
  eliminarEntrada(id: number) { return this.remove(id); }
}

export const diarioService = new DiarioService();
