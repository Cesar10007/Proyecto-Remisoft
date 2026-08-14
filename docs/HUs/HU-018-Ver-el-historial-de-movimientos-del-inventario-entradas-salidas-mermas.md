# HU-018 Ver el historial de movimientos del inventario (entradas, salidas, mermas)

| Campo | Valor |
|---|---|
| ID | HU-018 |
| Título | Ver el historial de movimientos del inventario (entradas, salidas, mermas) |
| Módulo | Control de Inventario |
| Prioridad | Media |
| Estado | Prototipo visual |
| RF asociados | RF004 |

---

## Historia

**Como** Administrador. **Necesito** ver el historial de movimientos del inventario (entradas, salidas, mermas). **Con el objetivo de** para auditar el consumo de insumos y detectar pérdidas o inconsistencias.

## Criterio de aceptación 001
  - **Dado que** El historial muestra: tipo de movimiento, producto, cantidad, fecha y usuario.
  - **cuando** Se puede filtrar por producto, tipo de movimiento y rango de fechas.
  - **entonces** Se puede exportar el reporte.
## Criterio de aceptación 002
  - **Dado que** el administrador consulta el historial.
  - **cuando** se carga.
  - **entonces** muestra tipo de movimiento, producto, cantidad, fecha y usuario.
## Criterio de aceptación 003
  - **Dado que** el administrador aplica filtros.
  - **cuando** selecciona producto, tipo de movimiento o rango de fechas.
  - **entonces** el sistema muestra solo los movimientos que coinciden.
## Criterio de aceptación 004
  - **Dado que** el administrador solicita exportar el historial.
  - **cuando** confirma la acción.
  - **entonces** el sistema genera el reporte descargable.
## Criterio de aceptación 005
  - **Dado que** no hay movimientos para los filtros aplicados.
  - **cuando** se consulta.
  - **entonces** el sistema indica que no hay resultados.
