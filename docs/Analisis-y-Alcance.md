# docs/ANALYSIS.md — Análisis de la problemática y alcance (SENTINEL V2)

## 1. Problema mundial sustentado y delimitado

La respuesta tardía ante emergencias cotidianas (accidentes, incendios, violencia, crisis médicas) aumenta la mortalidad y las secuelas evitables: cada minuto sin atención reduce la probabilidad de supervivencia en paros cardíacos (~7–10 % por minuto, AHA) y agrava traumas y hemorragias. En Guatemala se suman desastres naturales recurrentes (sismos, erupciones, inundaciones), violencia que exige alertas silenciosas y un acceso limitado a apoyo psicológico.

**Delimitación (Grupo #6, Fundación Kinal):** no se construye un 911 ni se sustituye atención médica profesional; se construye una plataforma comunitaria que (a) acorta el tiempo entre el incidente y el aviso con botón de pánico geolocalizado, (b) coordina la respuesta (despacho por estaciones), (c) guarda la información médica crítica del ciudadano y (d) ofrece bienestar emocional básico con IA supervisada.

## 2. Usuarios y necesidades

| Usuario | Necesidad principal | Necesidades secundarias |
|---|---|---|
| Ciudadano (USER) | Pedir ayuda rápido, incluso en silencio | Ver el estado de su alerta; guardar datos médicos; apoyo emocional; diario privado |
| Personal de respuesta (STAFF) | Ver alertas activas y despachar unidades | Gestionar estaciones, charlas y catálogos operativos |
| Especialista (STAFF) | Impartir charlas de prevención | Consultar agenda y asistentes |
| Administrador (ADMIN) | Gobernar usuarios, roles y catálogos | Auditar personal, estaciones y entidades |

## 3. Objetivos y alcance viable

**Objetivo general:** reducir el tiempo de aviso y coordinación ante emergencias comunitarias mediante una app web con pánico geolocalizado, despacho, ficha vital y apoyo de IA.

**Objetivos específicos:** (1) alerta con GPS en < 1 min; (2) desactivación solo con PIN del dueño; (3) despacho trazable por estación/unidad; (4) ficha vital disponible para quien atiende; (5) IA médica y de bienestar con límites de uso; (6) roles y permisos verificados en servidor.

**Alcance incluido:** auth JWT + roles, 11 entidades con CRUD, ciclo de alerta, despachos, agenda con confirmación, diario, datos vitales, dashboard con indicadores, IA Groq. **Fuera de alcance:** app móvil nativa, llamadas/SMS automáticos, integración con el 911 real, diagnóstico médico.

## 4. Requisitos e historias de usuario

**Funcionales:** RF1 registro/login; RF2 roles USER/STAFF/ADMIN; RF3 disparar alerta con GPS; RF4 alerta silenciosa; RF5 desactivar con PIN; RF6 CRUD de las 11 entidades; RF7 despachar unidades; RF8 confirmar charlas; RF9 ficha vital; RF10 diario privado; RF11 consultas IA; RF12 dashboard con datos reales; RF13 búsqueda y paginación.

**No funcionales:** RNF1 contraseñas con hash; RNF2 errores sin trazas; RNF3 rate-limit en auth e IA; RNF4 contraste ≥ 4.5:1; RNF5 responsive móvil/escritorio; RNF6 secretos fuera del repositorio.

**Historias (todas implementadas y probadas):**

1. Como ciudadana quiero disparar una alerta con mi ubicación para recibir ayuda pronto. (RF3; `POST /Sentinel/Alertas/disparar`)
2. Como mujer en riesgo quiero un botón de pánico silencioso para no alertar a mi agresor. (RF4; `esSilenciosa=1`)
3. Como ciudadano quiero desactivar mi alerta con mi PIN para evitar falsas alarmas. (RF5; `/desactivar`)
4. Como staff quiero ver alertas pendientes y despachar la estación más cercana. (RF7; despachos)
5. Como staff quiero confirmar asistencia a charlas preventivas. (RF8; `/confirmar`)
6. Como ciudadana quiero que mi grupo sanguíneo y alergias estén disponibles en una emergencia. (RF9; perfil vital)
7. Como ciudadano quiero un diario privado para mi salud emocional. (RF10; diario)
8. Como ciudadana quiero orientación inmediata de primeros auxilios por IA. (RF11; `/AI/consultar`)
9. Como admin quiero gestionar usuarios y roles sin ver contraseñas. (RF2/RF6; hash + `publicUser`)
10. Como admin quiero indicadores reales de operación. (RF12; `/Dashboard/estadisticas`)
