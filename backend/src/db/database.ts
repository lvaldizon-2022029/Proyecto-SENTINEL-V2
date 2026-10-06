import mysql, { Pool } from "mysql2/promise";
import bcrypt from "bcryptjs";
import { RecordEntity, Role, User } from "../models/types";

type DbValue = string | number | boolean | Date | null;

const rowToUser = (row: Record<string, unknown>): User => ({
  idUsers: Number(row.idUsers),
  nombreUsers: String(row.nombreUsers),
  emailUsers: String(row.emailUsers),
  contrasenaUsers: String(row.contrasenaUsers),
  rolUsers: String(row.rolUsers) as Role,
  pinemergenciaUsers: String(row.pinemergenciaUsers ?? "0000"),
  fechaCreacion: row.fechaCreacion ? new Date(row.fechaCreacion as string | Date).toISOString() : new Date().toISOString(),
  fotoUrl: row.fotoUrl ? String(row.fotoUrl) : null
});

export class MySqlStore {
  readonly persistence = "mysql";
  constructor(private readonly pool: Pool) {}
  close(): Promise<void> { return this.pool.end(); }

  async initialize(): Promise<void> {
    await this.pool.execute("ALTER TABLE users MODIFY COLUMN fotoUrl MEDIUMTEXT NULL");
    const [rows] = await this.pool.query("SELECT idUsers FROM users LIMIT 1");
    if ((rows as unknown[]).length === 0) {
      await this.createUser({
        nombreUsers: "Administrador SENTINEL",
        emailUsers: "admin@sentinel.local",
        password: "sentinel",
        rolUsers: "ADMIN",
        pinemergenciaUsers: "0000"
      });
    }
  }

  async listUsers(): Promise<User[]> {
    const [rows] = await this.pool.query("SELECT * FROM users ORDER BY idUsers");
    return (rows as Record<string, unknown>[]).map(rowToUser);
  }
  async findUser(id: number): Promise<User | undefined> {
    const [rows] = await this.pool.query("SELECT * FROM users WHERE idUsers = ?", [id]);
    const row = (rows as Record<string, unknown>[])[0];
    return row ? rowToUser(row) : undefined;
  }
  async findUserByEmail(email: string): Promise<User | undefined> {
    const [rows] = await this.pool.query("SELECT * FROM users WHERE LOWER(emailUsers) = LOWER(?)", [email]);
    const row = (rows as Record<string, unknown>[])[0];
    return row ? rowToUser(row) : undefined;
  }
  async createUser(input: Partial<User> & { password?: string }): Promise<User> {
    if (!input.nombreUsers || !input.emailUsers) throw new Error("El nombre y el email son obligatorios");
    if (await this.findUserByEmail(input.emailUsers)) throw new Error("El correo electrónico ya se encuentra registrado en el sistema.");
    const hash = await bcrypt.hash(input.password ?? input.contrasenaUsers ?? "sentinel", 10);
    const [result] = await this.pool.execute(
      "INSERT INTO users (nombreUsers,emailUsers,contrasenaUsers,rolUsers,pinemergenciaUsers,fotoUrl) VALUES (?,?,?,?,?,?)",
      [input.nombreUsers, input.emailUsers, hash, input.rolUsers ?? "USER", input.pinemergenciaUsers ?? "0000", input.fotoUrl ?? null]
    );
    return (await this.findUser(Number((result as { insertId: number }).insertId)))!;
  }
  async updateUser(id: number, patch: Partial<User> & { password?: string }): Promise<User | undefined> {
    const current = await this.findUser(id);
    if (!current) return undefined;
    const password = patch.password || patch.contrasenaUsers
      ? await bcrypt.hash(patch.password ?? patch.contrasenaUsers!, 10)
      : current.contrasenaUsers;
    await this.pool.execute(
      "UPDATE users SET nombreUsers=?,emailUsers=?,contrasenaUsers=?,rolUsers=?,pinemergenciaUsers=?,fotoUrl=? WHERE idUsers=?",
      [patch.nombreUsers ?? current.nombreUsers, patch.emailUsers ?? current.emailUsers, password,
        patch.rolUsers ?? current.rolUsers, patch.pinemergenciaUsers ?? current.pinemergenciaUsers,
        patch.fotoUrl ?? current.fotoUrl, id]
    );
    return this.findUser(id);
  }
  async deleteUser(id: number): Promise<boolean> {
    const [result] = await this.pool.execute("DELETE FROM users WHERE idUsers = ?", [id]);
    return Number((result as { affectedRows: number }).affectedRows) > 0;
  }

  private table(name: string): { table: string; id: string; columns: string[] } {
    const tables: Record<string, { table: string; id: string; columns: string[] }> = {
      alertas: { table: "alertas", id: "idAlertas", columns: ["ciudadanoid", "emergenciaid", "ubicacionlatAlertas", "ubicacionlngAlertas", "estadoAlertas", "essilenciosaAlertas", "fechaAlertas", "ultimaActualizacion"] },
      catalogoEmergencias: { table: "catalogoemergencias", id: "idCatalogoEmergencias", columns: ["nombreCatalogoEmergencias", "prioridadCatalogoEmergencias"] },
      catalogoEntidades: { table: "catalogoentidades", id: "idCatalogoEntidades", columns: ["nombreCatalogoEntidades"] },
      despachos: { table: "despachoemergencias", id: "idDespachoEmergencias", columns: ["alertaid", "estacionid", "unidadidDespachoEmergencias", "fechahoraDespachoEmergencias"] },
      especialistas: { table: "especialistas", id: "userid", columns: ["userid", "especialidadEspecialistas", "biografiaEspecialistas"] },
      estaciones: { table: "estaciones", id: "idEstaciones", columns: ["nombreEstaciones", "tipoentidadid", "ubicacionlatEstaciones", "ubicacionlngEstaciones", "direccionEstaciones", "telefonoEstaciones"] },
      staffAutoridad: { table: "staffautoridad", id: "idStaffAutoridad", columns: ["estacionid", "rangoStaffAutoridad", "estatusStaffAutoridad", "userid"] },
      agendaCharlas: { table: "agendacharlas", id: "idAgendaCharlas", columns: ["ciudadanoid", "especialistaid", "fechahoraAgendaCharlas", "estadoAgendaCharlas"] },
      vitalData: { table: "uservitaldata", id: "idUser", columns: ["idUser", "gruposanguineoUser", "alergiasUser", "enfermedadescronicasUser", "contactoemergenciaUser"] },
      diario: { table: "sentinel_db_in5bm_diario", id: "id", columns: ["fecha_registro", "contenido", "titulo", "user_id", "fecha_creacion"] }
    };
    const definition = tables[name];
    if (!definition) throw new Error(`Colección no soportada: ${name}`);
    return definition;
  }

  private toLegacy(name: string, input: Record<string, unknown>): Record<string, unknown> {
    const aliases: Record<string, Record<string, string>> = {
      alertas: { idUser: "ciudadanoid", ciudadanoId: "ciudadanoid", emergenciaId: "emergenciaid", latitud: "ubicacionlatAlertas", longitud: "ubicacionlngAlertas", esSilenciosa: "essilenciosaAlertas" },
      catalogoEmergencias: { nombre: "nombreCatalogoEmergencias", prioridad: "prioridadCatalogoEmergencias" },
      catalogoEntidades: { nombre: "nombreCatalogoEntidades" },
      despachos: { idAlerta: "alertaid", alertaId: "alertaid", idEstacion: "estacionid", estacionId: "estacionid", unidadId: "unidadidDespachoEmergencias", unidad: "unidadidDespachoEmergencias" },
      especialistas: { especialidad: "especialidadEspecialistas", biografia: "biografiaEspecialistas" },
      estaciones: { nombre: "nombreEstaciones", entidadId: "tipoentidadid", latitud: "ubicacionlatEstaciones", longitud: "ubicacionlngEstaciones", direccion: "direccionEstaciones", telefono: "telefonoEstaciones" },
      staffAutoridad: { estacionId: "estacionid", rango: "rangoStaffAutoridad", estatus: "estatusStaffAutoridad", userId: "userid" },
      agendaCharlas: { ciudadanoId: "ciudadanoid", especialistaId: "especialistaid", fecha: "fechahoraAgendaCharlas", estado: "estadoAgendaCharlas" },
      vitalData: { idUser: "idUser", grupoSanguineo: "gruposanguineoUser", alergias: "alergiasUser", enfermedadesCronicas: "enfermedadescronicasUser", contactoEmergencia: "contactoemergenciaUser" },
      diario: { userId: "user_id", usuarioId: "user_id", fechaRegistro: "fecha_registro", fechaCreacion: "fecha_creacion" }
    };
    const mapped = { ...input };
    const nested = input as { usuario?: { idUsers?: number }; user?: { idUsers?: number }; emergencia?: { idCatalogoEmergencias?: number }; alerta?: { idAlertas?: number }; estacion?: { idEstaciones?: number }; ciudadano?: { idUsers?: number }; especialista?: { userid?: number } };
    if (name === "alertas") {
      if (nested.usuario?.idUsers !== undefined) mapped.ciudadanoid = nested.usuario.idUsers;
      if (nested.emergencia?.idCatalogoEmergencias !== undefined) mapped.emergenciaid = nested.emergencia.idCatalogoEmergencias;
    }
    if (name === "despachos") {
      if (nested.alerta?.idAlertas !== undefined) mapped.alertaid = nested.alerta.idAlertas;
      if (nested.estacion?.idEstaciones !== undefined) mapped.estacionid = nested.estacion.idEstaciones;
    }
    if (name === "agendaCharlas") {
      if (nested.ciudadano?.idUsers !== undefined) mapped.ciudadanoid = nested.ciudadano.idUsers;
      if (nested.especialista?.userid !== undefined) mapped.especialistaid = nested.especialista.userid;
    }
    if (name === "especialistas" && nested.user?.idUsers !== undefined) mapped.userid = nested.user.idUsers;
    if (name === "staffAutoridad") {
      if (nested.estacion?.idEstaciones !== undefined) mapped.estacionid = nested.estacion.idEstaciones;
      if (nested.user?.idUsers !== undefined) mapped.userid = nested.user.idUsers;
    }
    for (const [source, target] of Object.entries(aliases[name] ?? {})) {
      if (source in input && !(target in mapped)) mapped[target] = input[source];
      delete mapped[source];
    }
    return mapped;
  }

  private fromLegacy(name: string, row: Record<string, unknown>): RecordEntity {
    const definition = this.table(name);
    const aliases: Record<string, Record<string, string>> = {
      alertas: { ciudadanoid: "ciudadanoId", emergenciaid: "emergenciaId", ubicacionlatAlertas: "latitud", ubicacionlngAlertas: "longitud", essilenciosaAlertas: "esSilenciosa" },
      catalogoEmergencias: { nombreCatalogoEmergencias: "nombre", prioridadCatalogoEmergencias: "prioridad" },
      catalogoEntidades: { nombreCatalogoEntidades: "nombre" },
      despachos: { alertaid: "alertaId", estacionid: "estacionId", unidadidDespachoEmergencias: "unidad", fechahoraDespachoEmergencias: "fecha" },
      especialistas: { especialidadEspecialistas: "especialidad", biografiaEspecialistas: "biografia" },
      estaciones: { nombreEstaciones: "nombre", tipoentidadid: "entidadId", ubicacionlatEstaciones: "latitud", ubicacionlngEstaciones: "longitud", direccionEstaciones: "direccion", telefonoEstaciones: "telefono" },
      staffAutoridad: { estacionid: "estacionId", rangoStaffAutoridad: "rango", estatusStaffAutoridad: "estatus", userid: "userId" },
      agendaCharlas: { ciudadanoid: "ciudadanoId", especialistaid: "especialistaId", fechahoraAgendaCharlas: "fecha", estadoAgendaCharlas: "estado" },
      vitalData: { gruposanguineoUser: "grupoSanguineo", alergiasUser: "alergias", enfermedadescronicasUser: "enfermedadesCronicas", contactoemergenciaUser: "contactoEmergencia" },
      diario: { user_id: "userId", fecha_registro: "fechaRegistro", fecha_creacion: "fechaCreacion", contenido: "contenido", titulo: "titulo" }
    };
    const mapped: RecordEntity = { id: Number(row[definition.id]), ...row };
    for (const [source, target] of Object.entries(aliases[name] ?? {})) {
      if (source in row) mapped[target] = row[source];
    }
    if (name === "alertas") {
      if (row.rel_usuario_id) mapped.usuario = { idUsers: Number(row.rel_usuario_id), nombreUsers: row.rel_usuario_nombre, emailUsers: row.rel_usuario_email };
      if (row.rel_emergencia_id) mapped.emergencia = { idCatalogoEmergencias: Number(row.rel_emergencia_id), nombreCatalogoEmergencias: row.rel_emergencia_nombre, prioridadCatalogoEmergencias: row.rel_emergencia_prioridad };
    }
    if (name === "despachos") {
      if (row.rel_alerta_id) mapped.alerta = { idAlertas: Number(row.rel_alerta_id), estadoAlertas: row.rel_alerta_estado };
      if (row.rel_estacion_id) mapped.estacion = { idEstaciones: Number(row.rel_estacion_id), nombreEstaciones: row.rel_estacion_nombre };
    }
    if (name === "agendaCharlas") {
      if (row.rel_ciudadano_id) mapped.ciudadano = { idUsers: Number(row.rel_ciudadano_id), nombreUsers: row.rel_ciudadano_nombre };
      if (row.rel_especialista_id) mapped.especialista = { userid: Number(row.rel_especialista_id), especialidadEspecialistas: row.rel_especialista_especialidad };
    }
    if (name === "especialistas" && row.rel_user_id) {
      mapped.user = { idUsers: Number(row.rel_user_id), nombreUsers: row.rel_user_nombre, emailUsers: row.rel_user_email };
    }
    if (name === "estaciones" && row.rel_entidad_id) {
      mapped.tipoEntidad = { idCatalogoEntidades: Number(row.rel_entidad_id), nombreCatalogoEntidades: row.rel_entidad_nombre };
    }
    if (name === "staffAutoridad") {
      if (row.rel_estacion_id) mapped.estacion = { idEstaciones: Number(row.rel_estacion_id), nombreEstaciones: row.rel_estacion_nombre };
      if (row.rel_user_id) mapped.user = { idUsers: Number(row.rel_user_id), nombreUsers: row.rel_user_nombre };
    }
    if (name === "vitalData" && row.rel_user_id) {
      mapped.user = { idUsers: Number(row.rel_user_id), nombreUsers: row.rel_user_nombre, emailUsers: row.rel_user_email, fotoUrl: row.rel_user_foto };
    }
    return mapped;
  }

  async collection(name: string, query = ""): Promise<RecordEntity[]> {
    const definition = this.table(name);
    const joins: Record<string, string> = {
      alertas: " LEFT JOIN users u ON u.idUsers = t.ciudadanoid LEFT JOIN catalogoemergencias ce ON ce.idCatalogoEmergencias = t.emergenciaid ",
      despachos: " LEFT JOIN alertas al ON al.idAlertas = t.alertaid LEFT JOIN estaciones es ON es.idEstaciones = t.estacionid ",
      agendaCharlas: " LEFT JOIN users cu ON cu.idUsers = t.ciudadanoid LEFT JOIN especialistas sp ON sp.userid = t.especialistaid ",
      especialistas: " LEFT JOIN users eu ON eu.idUsers = t.userid ",
      estaciones: " LEFT JOIN catalogoentidades en ON en.idCatalogoEntidades = t.tipoentidadid ",
      staffAutoridad: " LEFT JOIN estaciones se ON se.idEstaciones = t.estacionid LEFT JOIN users su ON su.idUsers = t.userid ",
      vitalData: " LEFT JOIN users vu ON vu.idUsers = t.idUser "
    };
    const relationColumns: Record<string, string> = {
      alertas: ", u.idUsers rel_usuario_id, u.nombreUsers rel_usuario_nombre, u.emailUsers rel_usuario_email, ce.idCatalogoEmergencias rel_emergencia_id, ce.nombreCatalogoEmergencias rel_emergencia_nombre, ce.prioridadCatalogoEmergencias rel_emergencia_prioridad",
      despachos: ", al.idAlertas rel_alerta_id, al.estadoAlertas rel_alerta_estado, es.idEstaciones rel_estacion_id, es.nombreEstaciones rel_estacion_nombre",
      agendaCharlas: ", cu.idUsers rel_ciudadano_id, cu.nombreUsers rel_ciudadano_nombre, sp.userid rel_especialista_id, sp.especialidadEspecialistas rel_especialista_especialidad",
      especialistas: ", eu.idUsers rel_user_id, eu.nombreUsers rel_user_nombre, eu.emailUsers rel_user_email",
      estaciones: ", en.idCatalogoEntidades rel_entidad_id, en.nombreCatalogoEntidades rel_entidad_nombre",
      staffAutoridad: ", se.idEstaciones rel_estacion_id, se.nombreEstaciones rel_estacion_nombre, su.idUsers rel_user_id, su.nombreUsers rel_user_nombre",
      vitalData: ", vu.idUsers rel_user_id, vu.nombreUsers rel_user_nombre, vu.emailUsers rel_user_email, vu.fotoUrl rel_user_foto"
    };
    const search = query ? ` WHERE CONCAT_WS(' ', ${definition.columns.map((column) => `t.\`${column}\``).join(", ")}) LIKE ?` : "";
    const [rows] = await this.pool.query(`SELECT t.*${relationColumns[name] ?? ""} FROM \`${definition.table}\` t${joins[name] ?? ""}${search} ORDER BY t.\`${definition.id}\` DESC`, query ? [`%${query}%`] : []);
    return (rows as Record<string, unknown>[]).map((row) => this.fromLegacy(name, row));
  }
  async create(name: string, input: Record<string, unknown>): Promise<RecordEntity> {
    const definition = this.table(name);
    const mapped = this.toLegacy(name, input);
    if (name === "especialistas" || name === "vitalData") {
      const primary = mapped[definition.id] ?? mapped.userid ?? mapped.idUser;
      if (primary === undefined) throw new Error(`El identificador ${definition.id} es obligatorio`);
      mapped[definition.id] = primary;
    }
    const columns = definition.columns.filter((column) => column in mapped);
    const values = columns.map((column) => mapped[column] as DbValue);
    const [result] = await this.pool.execute(
      `INSERT INTO \`${definition.table}\` (${columns.map((column) => `\`${column}\``).join(",")}) VALUES (${columns.map(() => "?").join(",")})`,
      values
    );
    const id = name === "especialistas" || name === "vitalData" ? Number(mapped[definition.id]) : Number((result as { insertId: number }).insertId);
    const rows = await this.collection(name);
    return rows.find((row) => row.id === id) ?? { id, ...input };
  }
  async update(name: string, id: number, input: Record<string, unknown>): Promise<RecordEntity | undefined> {
    const definition = this.table(name);
    const mapped = this.toLegacy(name, input);
    const columns = definition.columns.filter((column) => column in mapped);
    if (columns.length === 0) return (await this.collection(name)).find((entry) => entry.id === id);
    const [result] = await this.pool.execute(
      `UPDATE \`${definition.table}\` SET ${columns.map((column) => `\`${column}\`=?`).join(",")} WHERE \`${definition.id}\`=?`,
      [...columns.map((column) => mapped[column] as DbValue), id]
    );
    if (Number((result as { affectedRows: number }).affectedRows) === 0) return undefined;
    return (await this.collection(name)).find((entry) => entry.id === id);
  }
  async delete(name: string, id: number): Promise<boolean> {
    const definition = this.table(name);
    const [result] = await this.pool.execute(`DELETE FROM \`${definition.table}\` WHERE \`${definition.id}\`=?`, [id]);
    return Number((result as { affectedRows: number }).affectedRows) > 0;
  }
}

export const createMySqlStore = (): MySqlStore | undefined => {
  const configuredUrl = process.env.MYSQL_URL?.trim();
  const url = configuredUrl
    ?.replace(/^jdbc:/i, "")
    .replace(/([?&])(useSSL|serverTimezone|allowPublicKeyRetrieval)=[^&]*/gi, "$1")
    .replace(/[?&]$/, "")
    .replace(/\?&/, "?");
  if (url && (url.includes("******") || url.includes("CONTRASEÑA_REAL"))) {
    throw new Error("MYSQL_URL contiene un valor de ejemplo. Reemplázalo por la URL real o deja MYSQL_URL vacío y configura DB_PASSWORD.");
  }
  const urlHasCredentials = Boolean(url && /\/\/[^/@]+:[^/@]*@/.test(url));
  const pool = url && urlHasCredentials
    ? mysql.createPool(url)
    : process.env.DB_PASSWORD?.trim()
      ? mysql.createPool({
          host: process.env.DB_HOST ?? "localhost",
          port: Number(process.env.DB_PORT ?? 3306),
          database: process.env.DB_NAME ?? "sentinel_db_in5bm",
          user: process.env.DB_USERNAME ?? "IN5BM",
          password: process.env.DB_PASSWORD,
          waitForConnections: true,
          connectionLimit: 10
        })
      : undefined;
  return pool ? new MySqlStore(pool) : undefined;
};
