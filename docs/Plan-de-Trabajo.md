# Plan de trabajo — SENTINEL V2

Responsable: Luis Ronaldo Valdizon Contreras (2022029), Grupo #6. El proyecto lo trabajé solo, así que el plan va por fases y no por personas.

## Fases

| Fase | Semanas | Qué se hizo |
|---|---|---|
| 1. Base de datos | 1 | Revisé los exports de MySQL del proyecto original, levanté la base en local y probé que las tablas y llaves estuvieran completas. |
| 2. Backend | 2–3 | Armé la API en Express con TypeScript: login con JWT, roles, los CRUD y el proceso de alertas con PIN. Después agregué Zod porque la validación manual se estaba volviendo un enredo. |
| 3. Frontend | 4–5 | Pasé las vistas a Angular: login, dashboard, el componente genérico de CRUD y las pantallas especiales (alertas, diario, perfil, IA). Al final migré los formularios a reactivos. |
| 4. Calidad y docs | 6 | Pruebas (backend 19, frontend 3), OpenAPI completo, seed de demo, manual con capturas y este archivo. |

## Reparto

Al se run trabajo individual no hubo reparto por integrante. Lo que sí separé fue el orden: primero que la API respondiera con Postman, y hasta después conecté el frontend. Así cuando algo fallaba sabía de qué lado estaba el problema.

## Control

Commits en la rama `dev` del repositorio. La verificación de cada fase fue: `npm run build` + `npm test` en ambos paquetes antes de darla por cerrada.
