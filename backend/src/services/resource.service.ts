import { BaseRepository } from "../data/base.repository";
import { RecordEntity } from "../models/types";

export class ResourceService<T extends RecordEntity = RecordEntity> {
  constructor(protected readonly repository: BaseRepository<T>) {}
  list(search = "") { return this.repository.findAll(search); }
  find(id: number) { return this.repository.findById(id); }
  create(input: Record<string, unknown>) { return this.repository.create(input); }
  update(id: number, input: Record<string, unknown>) { return this.repository.update(id, input); }
  delete(id: number) { return this.repository.delete(id); }
}
