# Sistema visual — SENTINEL V2

Elegí verde teal porque se asocia con salud y clínicas, y el sistema es de emergencias médicas. El ámbar quedó solo para lo urgente (pánico y alertas) y el rojo para errores. Así con solo ver el color ya se sabe qué tan grave es algo.

## Colores

| Uso | Color | Código |
|---|---|---|
| Botones y acciones principales | Verde teal oscuro | `#0f766e` (hover `#115e59`) |
| Detalles, íconos y fondos suaves | Verde teal claro | `#14b8a7` |
| Emergencias y botón de pánico | Ámbar | `#fbbf24` |
| Errores y peligro | Rojo | `#dc2626` (texto `#b91c1c` sobre `#fef2f2`) |
| Éxito | Verde oscuro | `#047857` |
| Fondo / tarjetas / bordes / texto | Grises | `#f8fafc`, `#ffffff`, `#e2e8f0`, `#0f172a` |

Los textos pequeños usan mínimo `#64748b` sobre blanco para que pasen el contraste 4.5:1. El blanco sobre el teal oscuro también lo pasa, por eso los botones van en ese tono y no en el teal claro.

## Letras

Inter para todo (títulos grandes en mayúsculas, subtítulos pequeños en gris) y JetBrains Mono para números de referencia como los ID.

## Componentes

Tarjetas blancas redondeadas, encabezados con kicker (la etiquetita verde de arriba), tablas con encabezado gris y filas que se iluminan al pasar el mouse, y formularios con el campo en rojo cuando hay error más su mensaje abajo. Los estados siempre llevan texto ("Cargando...", "Sin datos", "Reintentar"), no solo color.

Las variables están en `frontend/src/styles.css` (`:root`) para cambiar todo desde un solo lugar.
