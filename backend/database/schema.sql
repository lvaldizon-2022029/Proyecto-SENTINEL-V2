-- SENTINEL uses the existing compatible schema.
-- Complete SQL exports are kept under backend/database/legacy so this
-- migrated project is self-contained and no longer depends on Java.
CREATE DATABASE IF NOT EXISTS sentinel_db_in5bm
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE sentinel_db_in5bm;

-- The authoritative definitions and seed data are the legacy exports:
-- sentinel_db_in5bm_users.sql
-- sentinel_db_in5bm_alertas.sql
-- sentinel_db_in5bm_catalogoemergencias.sql
-- sentinel_db_in5bm_catalogoentidades.sql
-- sentinel_db_in5bm_despachoemergencias.sql
-- sentinel_db_in5bm_estaciones.sql
-- sentinel_db_in5bm_especialistas.sql
-- sentinel_db_in5bm_staffautoridad.sql
-- sentinel_db_in5bm_agendacharlas.sql
-- sentinel_db_in5bm_uservitaldata.sql
-- sentinel_db_in5bm_sentinel_db_in5bm_diario.sql
