USE sentinel_db_in5bm;

INSERT IGNORE INTO users (idUsers, nombreUsers, emailUsers, contrasenaUsers, rolUsers, pinemergenciaUsers, fotoUrl) VALUES
(9001, 'Admin Demo', 'admin@sentinel.local', '$2a$10$0y4Q3K2w4cVSYZW7up0rTetCp/N4NsiaecHSGHAD9NeJqUeIH6SXu', 'ADMIN', '0000', NULL),
(9002, 'Staff Demo', 'staff@sentinel.local', '$2a$10$wDFYlX86PRX2ed6YHx.8PuCWeoCUbDLHHyfzj69DpWQId9/EsKqbm', 'STAFF', '1111', NULL),
(9003, 'Ciudadano Demo', 'ciudadano@sentinel.local', '$2a$10$58faNjOdPN.cIdFcdtw2POK4Q2XsZra5SLBCEkROcvJWvgyYd7ms6', 'USER', '1234', NULL);

INSERT IGNORE INTO catalogoemergencias (idCatalogoEmergencias, nombreCatalogoEmergencias, prioridadCatalogoEmergencias) VALUES
(901, 'Incendio', 'ALTA'),
(902, 'Accidente de Tránsito', 'ALTA'),
(903, 'Emergencia Médica', 'ALTA'),
(904, 'Desastre Natural', 'ALTA');

INSERT IGNORE INTO catalogoentidades (idCatalogoEntidades, nombreCatalogoEntidades) VALUES
(901, 'Bomberos'),
(902, 'Policía'),
(903, 'Cruz Roja');

INSERT IGNORE INTO estaciones (idEstaciones, nombreEstaciones, tipoentidadid, ubicacionlatEstaciones, ubicacionlngEstaciones, direccionEstaciones, telefonoEstaciones) VALUES
(901, 'Estación Central Demo', 901, 14.6349, -90.5069, 'Calzada Roosevelt 1-20, Ciudad de Guatemala', '12345678'),
(902, 'Estación Norte Demo', 902, 14.6500, -90.5100, 'Avenida Norte 5-10, Ciudad de Guatemala', '12345679');

INSERT IGNORE INTO especialistas (userid, especialidadEspecialistas, biografiaEspecialistas) VALUES
(9002, 'Primeros auxilios', 'Especialista de demostración para charlas comunitarias.');

INSERT IGNORE INTO staffautoridad (idStaffAutoridad, estacionid, rangoStaffAutoridad, estatusStaffAutoridad, userid) VALUES
(901, 901, 'Capitán', 'ACTIVO', 9002);

INSERT IGNORE INTO uservitaldata (idUser, gruposanguineoUser, alergiasUser, enfermedadescronicasUser, contactoemergenciaUser) VALUES
(9003, 'O+', 'Ninguna conocida', 'Ninguna', 'Familiar demo 5555-0000');
