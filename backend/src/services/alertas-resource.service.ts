import { alertasRepository } from "../data/AlertasRepository";
import { ResourceService } from "./resource.service";
export class AlertasResourceService extends ResourceService { constructor() { super(alertasRepository); } }
export const alertasResourceService = new AlertasResourceService();
