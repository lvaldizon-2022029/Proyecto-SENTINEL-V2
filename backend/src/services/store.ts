import bcrypt from "bcryptjs";
import { RecordEntity, Role, User } from "../models/types";
import { createMySqlStore, MySqlStore } from "../db/database";

export interface Store {
  readonly persistence: string;
  listUsers(): Promise<User[]>;
  findUser(id: number): Promise<User | undefined>;
  findUserByEmail(email: string): Promise<User | undefined>;
  createUser(input: Partial<User> & { password?: string }): Promise<User>;
  updateUser(id: number, patch: Partial<User> & { password?: string }): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  collection(name: string, query?: string): Promise<RecordEntity[]>;
  create(name: string, input: Record<string, unknown>): Promise<RecordEntity>;
  update(name: string, id: number, input: Record<string, unknown>): Promise<RecordEntity | undefined>;
  delete(name: string, id: number): Promise<boolean>;
}

export class MemoryStore implements Store {
  readonly persistence = "memory";
  private nextId = 1;
  private readonly users: User[] = [];
  private readonly collections = new Map<string, RecordEntity[]>();

  constructor() {
    const password = bcrypt.hashSync("sentinel", 10);
    this.users.push({
      idUsers: this.nextId++, nombreUsers: "Administrador SENTINEL", emailUsers: "admin@sentinel.local",
      contrasenaUsers: password, rolUsers: "ADMIN", pinemergenciaUsers: "0000",
      fechaCreacion: new Date().toISOString(), fotoUrl: null
    });
  }
  async listUsers(): Promise<User[]> { return this.users.map(({ contrasenaUsers: _password, ...user }) => user as User); }
  async findUser(id: number): Promise<User | undefined> { return this.users.find((user) => user.idUsers === id); }
  async findUserByEmail(email: string): Promise<User | undefined> { return this.users.find((user) => user.emailUsers.toLowerCase() === email.toLowerCase()); }
  async createUser(input: Partial<User> & { password?: string }): Promise<User> {
    if (!input.nombreUsers || !input.emailUsers) throw new Error("El nombre y el email son obligatorios");
    if (await this.findUserByEmail(input.emailUsers)) throw new Error("El correo electrónico ya se encuentra registrado en el sistema.");
    const user: User = {
      idUsers: this.nextId++, nombreUsers: input.nombreUsers, emailUsers: input.emailUsers,
      contrasenaUsers: await bcrypt.hash(input.password ?? input.contrasenaUsers ?? "sentinel", 10),
      rolUsers: (input.rolUsers ?? "USER") as Role, pinemergenciaUsers: input.pinemergenciaUsers ?? "0000",
      fechaCreacion: new Date().toISOString(), fotoUrl: input.fotoUrl ?? null
    };
    this.users.push(user); return user;
  }
  async updateUser(id: number, patch: Partial<User> & { password?: string }): Promise<User | undefined> {
    const user = await this.findUser(id); if (!user) return undefined;
    Object.assign(user, { nombreUsers: patch.nombreUsers ?? user.nombreUsers, emailUsers: patch.emailUsers ?? user.emailUsers,
      rolUsers: patch.rolUsers ?? user.rolUsers, pinemergenciaUsers: patch.pinemergenciaUsers ?? user.pinemergenciaUsers,
      fotoUrl: patch.fotoUrl ?? user.fotoUrl });
    if (patch.password || patch.contrasenaUsers) user.contrasenaUsers = await bcrypt.hash(patch.password ?? patch.contrasenaUsers!, 10);
    return user;
  }
  async deleteUser(id: number): Promise<boolean> { const i = this.users.findIndex((user) => user.idUsers === id); if (i < 0) return false; this.users.splice(i, 1); return true; }
  async collection(name: string, query = ""): Promise<RecordEntity[]> {
    const values = this.collections.get(name) ?? [];
    return query ? values.filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase())) : values;
  }
  async create(name: string, input: Record<string, unknown>): Promise<RecordEntity> { const entity = { id: this.nextId++, ...input }; const list = this.collections.get(name) ?? []; list.push(entity); this.collections.set(name, list); return entity; }
  async update(name: string, id: number, input: Record<string, unknown>): Promise<RecordEntity | undefined> { const entity = (await this.collection(name)).find((item) => item.id === id); if (!entity) return undefined; Object.assign(entity, input); return entity; }
  async delete(name: string, id: number): Promise<boolean> { const list = await this.collection(name); const i = list.findIndex((item) => item.id === id); if (i < 0) return false; list.splice(i, 1); return true; }
}

const mysqlStore = createMySqlStore();
export const store: Store = mysqlStore ?? new MemoryStore();
export const databaseStore = mysqlStore as MySqlStore | undefined;
