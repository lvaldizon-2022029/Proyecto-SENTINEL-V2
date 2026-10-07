# docs/TEST_PLAN.md — Plan de pruebas SENTINEL V2

## Estrategia

Pirámide mínima: esquemas de validación (unitarias) + API (integración con `supertest` + stores reales) + humo de frontend (rutas y guards). Sin mocks de la lógica bajo prueba; el backend usa `MemoryStore` cuando no hay credenciales MySQL.

## Alcance

| Nivel | Qué cubre | Dónde |
|---|---|---|
| Unitarias | Esquemas Zod: register, login, alertas, diario, vitalData, IA | `backend/src/validation/schemas.test.ts` (7 tests) |
| Integración API | Salud, contrato registro/login, colecciones heredadas, endpoints operativos | `backend/src/server/server.test.ts` (3 tests) |
| Seguridad API | 401 sin JWT, 403 por rol, 400 sin trazas, 404 JSON, cabeceras, 413 | `backend/src/server/security.test.ts` (8 tests) |
| Humo frontend | Rutas login/dashboard protegidas, página 404 dedicada, guards por rol | `frontend/src/app/app.smoke.spec.ts` (3 tests) |

## Comandos

```powershell
cd backend; npm run build; npm test     # 19 tests (tsc + node:test + tsx + supertest)
cd ..\frontend; npm run build; npm test  # 3 tests (ng + vitest)
```

## Criterios de aceptación

- `npm run build` sin errores de TypeScript en ambos paquetes.
- 22/22 tests en verde; ningún error expone `stack` al cliente.
- Flujo manual verificado: registro → login JWT → dashboard con indicadores → disparar/desactivar alerta con PIN.

## Limitaciones

- Sin MySQL local, la integración corre sobre `MemoryStore` (no valida FK/CHECK; ver `Limitaciones` en README).
- Sin pruebas E2E con navegador; las capturas del manual se tomaron con guion Playwright desechable (no versionado).
- Rate-limit de auth (10/15min): no ejecutar suites en paralelo contra el mismo servidor.
