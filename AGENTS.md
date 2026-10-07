# Proyecto SENTINEL - Agent Instructions

## Project Structure
- **Monorepo** with `backend/` (Node.js/TypeScript + Express) and `frontend/` (Angular 22 standalone)
- Backend uses `mysql2` to connect to legacy MySQL DB (`sentinel_db_in5bm`, user `IN5BM`, port 3306)
- No DB password in repo — must set `MYSQL_URL` or `DB_PASSWORD` in `backend/.env`

## Key Commands

### Backend
```bash
cd backend
npm install
cp .env.example .env   # edit with real DB credentials
npm run dev            # dev server with tsx (hot reload)
npm run build          # tsc -> dist/
npm start              # production (node dist/index.js)
npm test               # node --import tsx --test src/server/server.test.ts
```

### Frontend
```bash
cd frontend
npm install
npm start              # ng serve on :4200
npm run build          # ng build (output: dist/sentinel-frontend)
npm test               # ng test --watch=false (vitest + jsdom)
```

## Environment Variables (backend/.env)
| Var | Required | Notes |
|-----|----------|-------|
| `PORT` | No | Default 8082 |
| `JWT_SECRET` | Yes | Long random string |
| `FRONTEND_ORIGIN` | Yes | Default `http://localhost:4200` |
| `MYSQL_URL` | Yes* | Full connection string (preferred) |
| `DB_HOST/PORT/NAME/USERNAME/PASSWORD` | Yes* | Alternative to MYSQL_URL |
| `GROQ_API_KEY` | No | For AI endpoints (`/Sentinel/AI/*`) |

*At least one DB config method required. Without DB creds, backend falls back to `MemoryStore` (tests only). With creds but failed connection, server exits with error.

## Architecture Notes
- **Backend entry**: `backend/src/index.ts` → composes routers from `backend/src/router/`
- **Routers** = controllers: `auth`, `users`, `alertas`, `catalogos`, `operaciones`, `diario`, `ai`, `dashboard`, `staff`, `especialistas`, `estaciones`, `agenda`, `vital-data`
- **Services** = persistence/logic in `backend/src/services/` (separate from routers)
- **Repositories** in `backend/src/data/` per module
- **Models** in `backend/src/models/` (shared types)
- **Frontend**: Angular standalone components, routing in `app.routes.ts`, API base URL in `environment.ts`

## Testing
- Backend: Native Node test runner (`node --test`) with `tsx` + `supertest`
- Frontend: Vitest + jsdom via Angular builder (`ng test --watch=false`)
- Run single test: `node --import tsx --test src/server/server.test.ts --test-name-pattern="health"`

## OpenAPI
- Spec at `backend/openapi.yaml`
- Health endpoint: `GET /health`

## Common Gotchas
1. **DB connection**: Must have MySQL running locally on 3306 with `sentinel_db_in5bm` and user `IN5BM`
2. **Port conflicts**: Backend default 8082, frontend 4200
3. **CORS**: `FRONTEND_ORIGIN` must match frontend URL exactly
4. **JWT_SECRET**: Must be set; otherwise auth fails
5. **No .env in repo**: Copy `.env.example` → `.env` locally
6. **TypeScript**: Backend uses `NodeNext` modules; frontend uses bundler resolution