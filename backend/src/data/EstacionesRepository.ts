import { BaseRepository } from "./base.repository";
import { Estacion } from "../models/Estaciones";
export class EstacionesRepository extends BaseRepository<Estacion> { constructor() { super("estaciones"); } }
export const estacionesRepository = new EstacionesRepository();
