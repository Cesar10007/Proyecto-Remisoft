# HU-027 Ver un reporte diario de ventas con productos más vendidos e ingresos totales

| Campo | Valor |
|---|---|
| ID | HU-027 |
| Título | Ver un reporte diario de ventas con productos más vendidos e ingresos totales |
| Módulo | Módulo de Reportes y Análisis con IA |
| Prioridad | Alta |
| Estado | No iniciado |
| RF asociados | RF007 |

---

## Historia

**Como** Administrador. **Necesito** ver un reporte diario de ventas con productos más vendidos e ingresos totales. **Con el objetivo de** para tomar decisiones operativas con base en datos reales del negocio.

## Criterio de aceptación 001
  - **Dado que** El reporte muestra: total de ventas, número de pedidos, productos top 5.
  - **cuando** Se puede filtrar por día, semana o mes.
  - **entonces** Se puede exportar en formato común.
## Criterio de aceptación 002
  - **Dado que** el administrador consulta el reporte.
  - **cuando** se genera.
  - **entonces** muestra total de ventas, número de pedidos y el top 5 de productos.
## Criterio de aceptación 003
  - **Dado que** el administrador aplica un filtro de periodo.
  - **cuando** selecciona día, semana o mes.
  - **entonces** el reporte se recalcula según el rango elegido.
## Criterio de aceptación 004
  - **Dado que** el administrador solicita exportar el reporte.
  - **cuando** confirma.
  - **entonces** el sistema lo genera en un formato común (PDF o Excel).
## Criterio de aceptación 005
  - **Dado que** no hay ventas en el periodo consultado.
  - **cuando** se genera el reporte.
  - **entonces** el sistema indica que no hay datos disponibles.
