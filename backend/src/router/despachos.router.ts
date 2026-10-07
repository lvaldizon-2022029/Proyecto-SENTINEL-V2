import { crudRouter } from "./middleware";
export const despachosRouter = crudRouter("/Sentinel/DespachosEmergencia", "despachos", ["STAFF", "ADMIN"]);
export const despachosAliasRouter = crudRouter("/Sentinel/DespachoEmergencias", "despachos", ["STAFF", "ADMIN"]);
export const despachosLegacyRouter = crudRouter("/Sentinel/despachos", "despachos", ["STAFF", "ADMIN"]);
