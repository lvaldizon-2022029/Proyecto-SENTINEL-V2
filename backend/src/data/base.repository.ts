import { RecordEntity } from "../models/types";
import { store } from "../services/store";

export abstract class BaseRepository<T extends RecordEntity = RecordEntity> {
  constructor(protected readonly collection: string) {}
  findAll(search = "", page?: number, limit?: number): Promise<T[]> { return store.collection(this.collection, search, page, limit) as Promise<T[]>; }
  findById(id: number): Promise<T | undefined> { return store.findById(this.collection, id) as Promise<T | undefined>; }
  create(input: Record<string, unknown>): Promise<T> { return store.create(this.collection, input) as Promise<T>; }
  update(id: number, input: Record<string, unknown>): Promise<T | undefined> { return store.update(this.collection, id, input) as Promise<T | undefined>; }
  delete(id: number): Promise<boolean> { return store.delete(this.collection, id); }
}
