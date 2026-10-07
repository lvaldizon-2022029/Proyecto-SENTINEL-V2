# Proyecto SENTINEL V2

Plataforma full-stack para coordinar alertas comunitarias, respuesta ante emergencias y bienestar (médico y emocional). Migrada del proyecto Spring original a Node.js + Angular, conservando la base de datos heredada.

## Tecnologías

| Capa | Stack |
|---|---|
| Backend | Node.js 20+, Express 5, TypeScript, `mysql2` (sin ORM), Zod, JWT, bcryptjs, helmet, CORS, express-rate-limit |
| Frontend | Angular 22 standalone, RxJS, Leaflet (mapa de alertas), Vitest |
| Base de datos | MySQL 8 (`sentinel_db_in5bm`, 11 tablas heredadas) |
| IA externa | Groq (`qwen3`, solo endpoints `/Sentinel/AI/*`) |
| Docs API | OpenAPI 3.0 (`backend/openapi.yaml`) |

Documentación: [Análisis y alcance](docs/Analisis-y-Alcance.md) · [Arquitectura del sistema](docs/Arquitectura-del-Sistema.md) · [Diccionario de datos](docs/Diccionario-de-Datos.md) · [Guía de la API](docs/Guia-de-la-API.md) · [Plan de pruebas](docs/Plan-de-Pruebas.md) · [Instrucciones de agente](AGENTS.md).

## Requisitos

- Node.js 20+ y npm.
- MySQL accesible en `localhost:3306` (opcional para desarrollo: sin credenciales el backend usa memoria).
- Puertos libres `8082` (API) y `4200` (app).

## Instalación

```powershell
cd backend; npm install
Copy-Item .env.example .env
cd ..\frontend; npm install
```

Edita `backend/.env` (no se versiona). Variables:

| Variable | Obligatoria | Descripción |
|---|---|---|
| `PORT` | No (8082) | Puerto de la API |
| `JWT_SECRET` | **Sí** | Secreto de firma JWT; sin esto el servidor no arranca |
| `JWT_EXPIRES_IN` | No (8h) | Duración del token |
| `FRONTEND_ORIGIN` | No | Orígenes CORS extra (localhost siempre permitido) |
| `MYSQL_URL` / `DB_PASSWORD` | Una de las dos para MySQL | Conexión (`DB_HOST/DB_PORT/DB_NAME/DB_USERNAME` completan) |
| `GROQ_API_KEY` | Solo para IA | Clave de Groq; sin ella `/Sentinel/AI/*` responde 502 controlado |
| `DEFAULT_ADMIN_*` | No | Admin inicial si `users` está vacía (solo local) |

## Migraciones y seed

La base es heredada, no se migra con ORM:

- DDL y datos originales: `backend/database/legacy/` (12 exports, incluye rutinas).
- `backend/database/schema.sql` referencia qué export cargar primero.
- Seed de demostración: `backend/database/seed.sql` — solo `INSERT IGNORE` (admin/staff/ciudadano demo, catálogos, estaciones, especialista). Aplicar con:
  ```powershell
  mysql -u IN5BM -p sentinel_db_in5bm < backend\database\seed.sql
  ```
- Al arrancar con MySQL vacío, el backend crea además el admin de `.env`. Si MySQL está configurado pero inalcanzable, el servidor termina con error (no cae a memoria).

## Ejecución

```powershell
cd backend; npm run dev      # API en http://localhost:8082 (salud: GET /health)
cd frontend; npm start        # App en http://localhost:4200
```

Verificación: `npm run build` + `npm test` en cada paquete (backend 19 tests, frontend 3). Producción backend: `npm run build; npm start`.

## Despliegue

1. MySQL 8 con `sentinel_db_in5bm` provisionada desde `database/legacy/` + `seed.sql`.
2. `backend/.env` con `JWT_SECRET` largo, credenciales MySQL y `GROQ_API_KEY` si se usa IA.
3. Backend: `npm ci; npm run build; npm start` (requiere `JWT_SECRET`; exponer solo el puerto 8082 tras el proxy).
4. Frontend: `ng build` y servir `dist/`; apunta a la API por `environment.prod.ts` (`apiUrl`).
5. Nunca versionar `.env` ni exponer `DB_PASSWORD` / `GROQ_API_KEY` en el frontend.

## Credenciales de demostración

Solo para entornos locales/demos (definidas en `backend/database/seed.sql`):

| Rol | Email | Contraseña | PIN |
|---|---|---|---|
| ADMIN | `admin@sentinel.local` | `Sentinel123` | `0000` |
| STAFF | `staff@sentinel.local` | `Staff123` | `1111` |
| USER | `ciudadano@sentinel.local` | `Ciudadano123` | `1234` |

Las credenciales administrativas reales viven **únicamente** en el `backend/.env` local (`DEFAULT_ADMIN_*`) y nunca se publican ni se versionan.

## Decisiones técnicas

- **Sin ORM**: SQL parametrizado con `mysql2` + capa `toLegacy/fromLegacy`, porque las 11 tablas heredadas tienen nombres en español y la API expone alias en inglés.
- **Persistencia dual**: `MemoryStore` permite desarrollar y testear sin MySQL; en producción con credenciales siempre exige la base real.
- **Validación Zod en el borde** (`validation/`): sanitiza (trim) y responde 400 `{ error }`; el frontend valida de nuevo con formularios reactivos.
- **Un CRUD genérico** en backend (`crudRouter`) y otro en frontend (`resource.component.ts`) para las 9 entidades tabulares; alertas, diario, perfil, IA y respiración tienen componentes propios por su flujo especial.
- **Alertas sin borrado en UI**: su ciclo es disparar → despachar → desactivar con PIN, no editar/eliminar.
- **Identidad médica**: primario teal `#0f766e`, ámbar solo emergencias; textos pequeños ≥ `#64748b` (contraste ≥ 4.5:1).

## Limitaciones conocidas

- Los CHECK heredados son más amplios que la validación API: agenda en DB acepta `PROGRAMADA/REALIZADA` (la API solo `PENDIENTE/CONFIRMADA/CANCELADA`), staff en DB acepta `VACACIONES` (la API `LICENCIA/SUSPENDIDO`) y emergencias en DB acepta `CRITICA` (la API no). Enviar esos valores falla a nivel de base.
- `MemoryStore` no persiste entre reinicios y no replica FK ni CHECK de MySQL.
- La IA requiere `GROQ_API_KEY` y tiene rate-limit 5/min; auth 10/15min (los tests evitan ráfagas).
- El frontend apunta a `http://localhost:8082` fijo en `environment*.ts`; para otro host hay que editarlo y reconstruir.
- `backend/database/legacy/sentinel_db_in5bm_routines.sql` no lo usa la API.
