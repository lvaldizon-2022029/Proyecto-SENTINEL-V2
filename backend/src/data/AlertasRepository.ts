import { BaseRepository } from "./base.repository";
import { Alerta } from "../models/Alertas";
export class AlertasRepository extends BaseRepository<Alerta> { constructor() { super("alertas"); } }
export const alertasRepository = new AlertasRepository();
