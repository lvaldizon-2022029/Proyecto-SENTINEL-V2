# Proyecto SENTINEL

Aplicación full stack para coordinar alertas comunitarias, respuesta ante emergencias y bienestar, migrada a Node.js con TypeScript y Angular.

## Estructura

- `backend/`: API Express modular, JWT, roles, conexión `mysql2` a la base original y OpenAPI.
  - `src/data/`: referencias de datos/configuración de provisión.
    - Repositories por módulo: `UsuariosRepository`, `AlertasRepository`, `CatalogoEmergenciasRepository`, `CatalogoEntidadesRepository`, `DespachoEmergenciasRepository`, `EspecialistasRepository`, `EstacionesRepository`, `StaffAutoridadRepository`, `AgendaCharlasRepository`, `UserVitalDataRepository` y `DiarioRepository`.
  - `src/db/`: adaptador MySQL.
  - `src/models/`: tipos y modelos compartidos.
    - Modelos por dominio: `Usuarios`, `Alertas`, `CatalogoEmergencias`, `CatalogoEntidades`, `DespachoEmergencias`, `Especialistas`, `Estaciones`, `StaffAutoridad`, `AgendaCharlas`, `UserVitalData` y `Diario`.
  - `src/router/`: punto de composición de rutas.
    - `auth.router.ts`, `users.router.ts`, `alertas.router.ts`, `catalogos.router.ts`, `operaciones.router.ts`, `diario.router.ts`, `ai.router.ts` y `dashboard.router.ts` equivalen a los controladores originales.
  - `src/server/`: aplicación HTTP y pruebas de integración.
  - `src/services/`: persistencia y lógica de servicios.
    - Services por módulo, separados de los routers: autenticación, usuarios, alertas, catálogos, despachos, especialistas, estaciones, staff, agenda, datos vitales, diario e IA.
  - `src/utils/`: utilidades reservadas para validaciones y seguridad.
  - `src/index.ts`: entrada del servidor.
- `frontend/`: Angular standalone con routing, guard, interceptor, formularios y dashboard.
  - `src/app/core/`: configuración, guards, interceptors y servicios compartidos.
  - `src/app/pages/`: pantallas por funcionalidad, incluyendo `pages/auth`.
  - `src/app/layout/`: reservado para componentes visuales compartidos.
- `backend/database/legacy/`: exportaciones SQL compatibles para provisionar la base heredada sin depender de Java.

## Conexión a la base original

El backend usa exactamente la conexión que tenía Spring:

```text
Host: localhost
Puerto: 3306
Base: sentinel_db_in5bm
Usuario: IN5BM
```

La contraseña no se conserva en el repositorio. Configure el valor localmente en `MYSQL_URL` o `DB_PASSWORD`. El backend consulta las tablas originales: `users`, `alertas`, `catalogoemergencias`, `catalogoentidades`, `despachoemergencias`, `estaciones`, `especialistas`, `staffautoridad`, `agendacharlas`, `uservitaldata` y `sentinel_db_in5bm_diario`.

Las definiciones y datos compatibles están en `backend/database/legacy`. `backend/database/schema.sql` y `backend/database/seed.sql` documentan la provision de la base sin crear tablas paralelas.

## Requisitos

- Node.js 20 o superior y npm.
- MySQL accesible en `localhost:3306`.

## Ejecutar el backend

> Importante: abre exactamente la copia aislada `C:\Users\LuisRo\copilot-worktrees\Proyecto-SENTINEL\lvaldizon-2022029-supreme-chainsaw`. El archivo que debes crear es `backend\.env` dentro de esa carpeta; editar `C:\Users\LuisRo\Proyecto-SENTINEL` no cambia esta copia.

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Edite `.env` con la conexión original:

```env
PORT=8082
JWT_SECRET=use-a-long-random-secret
FRONTEND_ORIGIN=http://localhost:4200
MYSQL_URL=mysql://IN5BM:CONTRASEÑA_REAL@localhost:3306/sentinel_db_in5bm?charset=utf8mb4
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sentinel_db_in5bm
DB_USERNAME=IN5BM
DB_PASSWORD=
GROQ_API_KEY=
```

Use `npm run dev`; para validar `npm test` y `npm run build`; producción usa `npm start`. Si no se establece ninguna credencial MySQL, el backend usa `MemoryStore` únicamente para pruebas locales aisladas. Si se configura MySQL pero la conexión falla, el servidor termina con un error explícito: no cambia silenciosamente a memoria ni oculta la falta de datos reales.

## Ejecutar el frontend

```powershell
cd frontend
npm install
npm start
```

Angular queda disponible en `http://localhost:4200` y consume la URL definida en `frontend/src/environments/environment.ts`.

## API y funcionalidades

- Registro e inicio de sesión con bcrypt y JWT.
- Roles `USER`, `STAFF` y `ADMIN`, validados en el servidor.
- CRUD compatible con las entidades heredadas.
- Alertas, despachos, datos vitales, agenda y diario.
- Búsqueda y paginación con `search`, `page` y `limit`.
- `GET /Sentinel/Dashboard/estadisticas` para indicadores reales.
- OpenAPI en `backend/openapi.yaml`.
- Salud: `GET /health`.

Las respuestas de IA conservan `/Sentinel/AI`, pero requieren `GROQ_API_KEY`. No se guardan secretos en el repositorio.

## Validación

El backend compila y tiene pruebas automatizadas de salud, registro, login y endpoints operativos heredados. El frontend compila con `ng build`.

La integración local se verificó levantando ambos procesos: `http://localhost:4200` respondió con la aplicación Angular, el registro e inicio de sesión devolvieron un JWT desde `http://localhost:8082`, y el dashboard consultó estadísticas protegidas usando ese token. Sin `DB_PASSWORD` o `MYSQL_URL`, esta validación usa `MemoryStore`; la conexión MySQL real requiere una contraseña disponible en el entorno local.

### Auditoría de funcionalidades

El backend Node conserva las funcionalidades de API del proyecto original: autenticación, usuarios, alertas, desactivación por PIN, IA médica/bienestar mediante Groq cuando se configura la clave, diario, datos vitales, catálogos, estaciones, especialistas, personal de autoridad, despachos y agenda con confirmación. También conserva rutas auxiliares como búsquedas, totales, checks y el alias `/Sentinel/despachos` usado por una plantilla antigua.

Las 18 vistas originales tienen equivalentes Angular: login, registro, dashboard, alertas, usuarios, especialistas, despachos, agenda, catálogos, estaciones, staff, datos/perfil vital, diario, bienestar y respiración. Los módulos CRUD usan un componente reutilizable conectado a los endpoints Node; los flujos especiales de alertas, diario, IA, perfil vital y respiración tienen componentes propios.

Rutas de compatibilidad de interfaz: `/login`, `/register`, `/dashboard`, `/alertas`, `/usuarios` (`/admin-users`), `/especialistas` (`/admin-especialistas`), `/despachos` (`/admin-despacho-emergencias`), `/agenda`, `/catalogo-emergencias`, `/catalogo-entidades`, `/estaciones`, `/staff`, `/vital-data`, `/perfil-vital`, `/diario`, `/bienestar` y `/respiracion`.
