# AGENTS.md — Proyecto SENTINEL V2

Full-stack: `backend/` (Express + TypeScript, `mysql2`, sin ORM) y `frontend/` (Angular 22 standalone). Puertos: API `8082`, app `4200`.

## Backend (`backend/`)

- Comandos (desde `backend/`): `npm run dev` (tsx), `npm run build` (tsc), `npm start` (node dist), `npm test` → `node --import tsx --test src/server/server.test.ts src/server/security.test.ts src/validation/schemas.test.ts`.
- `JWT_SECRET` es obligatorio al importar: `src/router/middleware.ts` lanza si falta. Los tests necesitan `backend/.env` presente (existe local, no se versiona; partir de `.env.example`).
- Persistencia dual: sin credenciales MySQL usa `MemoryStore` (solo pruebas locales); con MySQL configurado pero inalcanzable el servidor **termina con error**, no cae a memoria. Tablas heredadas en español (`users`, `alertas`, `catalogoemergencias`, …) mapeadas en `src/db/database.ts` (`table()` / `toLegacy()` / `fromLegacy()`).
- Validación con Zod: esquemas en `src/validation/schemas.ts`, middleware `validateWith` en `src/validation/validate.ts`. Respuestas de error siempre `{ error: string }`, sin trazas; el handler central está al final de `src/server/server.ts` (400 JSON inválido, 413 cuerpo >1mb, 403 CORS, 404 JSON, 500 genérico).
- Rate limits: global 200/15min, auth 10/15min, IA 5/min. No bombardear `/Sentinel/Auth/*` en tests o dan 429.
- Rutas con alias de mayúsculas (`/Sentinel/Auth` y `/Sentinel/auth`, etc.) — mantener ambos al agregar endpoints. Spec completa en `backend/openapi.yaml`; actualizarla al agregar rutas.
- Contraseñas con `bcryptjs` (cost 10). Seed no destructivo (`INSERT IGNORE`) en `backend/database/seed.sql`; DDL heredado en `backend/database/legacy/`.
- Shell Windows PowerShell 5.1: encadenar con `cmd1; if ($?) { cmd2 }` (no `&&`). No hay Python disponible.

## Frontend (`frontend/`)

- Comandos (desde `frontend/`): `npm start` (ng serve), `npm run build`, `npm test` → `ng test sentinel-frontend --watch=false` (vitest, `src/app/app.smoke.spec.ts`).
- Todo HTTP pasa por `ApiService` / `AuthService` (`src/app/core/services/`); no usar `HttpClient` en páginas. Roles en guards (`authGuard`, `adminGuard`, `staffGuard`) + `ROUTE_ROLES` en `auth.service.ts`.
- Los 9 CRUD comparten `pages/resource/resource.component.ts` (reactivo): etiquetas legibles y placeholders viven en `label()` / `placeholderFor()` — agregar ahí cualquier campo nuevo, nunca mostrar la clave técnica. `**` va a `NotFoundComponent`, no redirect.
- Identidad médica: primario teal `#0f766e` (hover `#115e59`), acento ámbar solo emergencias, rojo error. Texto pequeño ≥ `#64748b` sobre blanco y texto sobre teal solo en `#047857` o más oscuro (contraste ≥ 4.5:1). Variables en `src/styles.css` `:root`.
- `src/environments/environment*.ts` solo contienen `apiUrl` (`http://localhost:8082`); no poner secretos.
