import { BaseRepository } from "./base.repository";
import { Especialista } from "../models/Especialistas";
export class EspecialistasRepository extends BaseRepository<Especialista> { constructor() { super("especialistas"); } }
export const especialistasRepository = new EspecialistasRepository();
