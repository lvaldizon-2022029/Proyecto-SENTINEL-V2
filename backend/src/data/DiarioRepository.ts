import { BaseRepository } from "./base.repository";
import { Diario } from "../models/Diario";
export class DiarioRepository extends BaseRepository<Diario> { constructor() { super("diario"); } }
export const diarioRepository = new DiarioRepository();
