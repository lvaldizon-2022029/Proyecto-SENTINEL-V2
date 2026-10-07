import { store } from "../services/store";
import { User } from "../models/types";

export class UsuariosRepository {
  findAll(): Promise<User[]> { return store.listUsers(); }
  findById(id: number): Promise<User | undefined> { return store.findUser(id); }
  findByEmail(email: string): Promise<User | undefined> { return store.findUserByEmail(email); }
  create(input: Partial<User> & { password?: string }): Promise<User> { return store.createUser(input); }
  update(id: number, input: Partial<User> & { password?: string }): Promise<User | undefined> { return store.updateUser(id, input); }
  delete(id: number): Promise<boolean> { return store.deleteUser(id); }
}
export const usuariosRepository = new UsuariosRepository();
