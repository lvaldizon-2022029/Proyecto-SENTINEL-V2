import { agendaCharlasRepository } from "../data/AgendaCharlasRepository";
import { ResourceService } from "./resource.service";
export class AgendaCharlasService extends ResourceService { constructor() { super(agendaCharlasRepository); } }
export const agendaCharlasService = new AgendaCharlasService();
