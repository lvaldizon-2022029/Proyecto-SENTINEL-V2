# docs/ENDPOINTS.md — API SENTINEL

Base: `http://localhost:8082`. Contrato formal: `backend/openapi.yaml` (OpenAPI 3.0). Auth JWT `Bearer`; roles `USER, STAFF, ADMIN` verificados en servidor. Errores siempre `{ error: string }`. Listados con `?search=&page=&limit=` (máx. 100). Alias de mayúsculas duplicados (`/Auth` y `/auth`); aquí se muestra la forma canónica.

## Salud y Auth (rate-limit 10/15min en Auth)

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/health` | público | Estado, persistencia (`mysql`/`memory`) y DB |
| POST | `/Sentinel/Auth/register` | público | Registro → 201 `{ mensaje, datos }` |
| POST | `/Sentinel/Auth/login` | público | Login → 200 `{ token, ...usuario }`, 401 si falla |

## Usuarios y Dashboard

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/Sentinel/Users`, `/get`, `/getid/:id`, `/:id` | ADMIN / propio | Listar y obtener |
| POST | `/Sentinel/Users` | ADMIN | Crear → 201 |
| PUT | `/Sentinel/Users/:id`, `/put/:id` | ADMIN / propio | Actualizar |
| DELETE | `/Sentinel/Users/:id`, `/delete/:id` | ADMIN | Eliminar (204 en alias legacy) |
| GET | `/Sentinel/Dashboard/estadisticas` | USER+ | `{ usuarios, alertas, alertasPendientes, despachos }` |

## Alertas (lectura USER+, escritura STAFF+)

| Método | Ruta | Descripción |
|---|---|---|
| GET / POST | `/Sentinel/Alertas`, `/Sentinel/Alertas/:id` | CRUD (PUT/DELETE incluidos) |
| POST | `/Sentinel/Alertas/disparar` | `{ emergenciaId, latitud, longitud, ciudadanoId, esSilenciosa? }` → 201 |
| POST | `/Sentinel/Alertas/desactivar` | `{ idAlerta, pin }` → 200/401 PIN /404 |

## Catálogos

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET / POST / PUT / DELETE | `/Sentinel/CatalogoEmergencias[/:id]` | lectura USER+, escritura ADMIN | Tipos y prioridades |
| GET / POST / PUT / DELETE | `/Sentinel/CatalogoEntidades[/:id]` | ADMIN | Instituciones |
| GET | `/Sentinel/entidades/buscarNombre?nombre=` | ADMIN | Búsqueda exacta → 404 si no existe |
| GET | `/Sentinel/emergencias/prioridad/:prioridad` | STAFF+ | Filtro por prioridad |
| GET | `/Sentinel/emergencias/total` | STAFF+ | `{ totalCategorias }` |

## Operación (STAFF+; escritura estaciones/staff solo ADMIN)

| Método | Ruta | Descripción |
|---|---|---|
| CRUD | `/Sentinel/DespachosEmergencia[/:id]`, alias `/DespachoEmergencias`, `/despachos` | Despachos de unidades |
| POST | `/Sentinel/DespachosEmergencia` | `{ idAlerta, idEstacion, unidadId }` → 201 |
| CRUD | `/Sentinel/Especialistas[/:id]` | Especialistas (ADMIN) |
| CRUD | `/Sentinel/Estaciones[/:id]` | Estaciones |
| GET | `/Sentinel/estaciones/buscar?nombre=` | Búsqueda parcial |
| PATCH | `/Sentinel/estaciones/:id/ubicacion` | `{ latitud, longitud }` (ADMIN) |
| GET | `/Sentinel/estaciones/check`, `/tipo/:tipoId`, `/contar` | Diagnóstico, filtro y conteo |
| CRUD | `/Sentinel/StaffAutoridad[/:id]` | Personal |
| GET | `/Sentinel/staff/buscar/cargo?cargo=`, `/staff/check` | Búsqueda y diagnóstico |
| CRUD | `/Sentinel/AgendaCharlas[/:id]` | Charlas |
| POST | `/Sentinel/AgendaCharlas/:id/confirmar` | Confirmar asistencia |

## Datos vitales, Diario e IA

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/Sentinel/VitalData/:id` | USER (propio) / ADMIN | Ficha; `{ exists:false }` si no hay |
| CRUD | `/Sentinel/VitalData[/:id]` | USER / ADMIN | Crear, actualizar, eliminar |
| POST | `/Sentinel/Diario/guardar` | USER+ | `{ titulo, contenido, userId }` |
| GET | `/Sentinel/Diario/historial/:userId`, `/Diario/:userId` | USER+ | Historial |
| PUT / DELETE | `/Sentinel/Diario/actualizar/:id`, `/eliminar/:id` | USER+ | Editar / borrar |
| POST | `/Sentinel/AI/consultar`, `/bienestar` | USER+ (rate 5/min) | `{ userId, prompt }` → `{ respuesta }`; 502 sin Groq |
