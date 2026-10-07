import { BaseRepository } from "./base.repository";
import { AgendaCharla } from "../models/AgendaCharlas";
export class AgendaCharlasRepository extends BaseRepository<AgendaCharla> { constructor() { super("agendaCharlas"); } }
export const agendaCharlasRepository = new AgendaCharlasRepository();
