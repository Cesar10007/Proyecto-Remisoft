# HU-029 Ver un reporte de desempeño del personal (pedidos atendidos, tiempos, errores)

| Campo | Valor |
|---|---|
| ID | HU-029 |
| Título | Ver un reporte de desempeño del personal (pedidos atendidos, tiempos, errores) |
| Módulo | Módulo de Reportes y Análisis con IA |
| Prioridad | Media |
| Estado | No iniciado |
| RF asociados | RF007 |

---

## Historia

**Como** Administrador. **Necesito** ver un reporte de desempeño del personal (pedidos atendidos, tiempos, errores). **Con el objetivo de** para evaluar la productividad del equipo y detectar áreas de mejora.

## Criterio de aceptación 001
  - **Dado que** El reporte muestra pedidos atendidos, tiempo promedio y errores por empleado.
  - **cuando** Se puede filtrar por fecha y por empleado.
  - **entonces** Los datos se presentan con gráficos comparativos.
## Criterio de aceptación 002
  - **Dado que** el administrador consulta el reporte.
  - **cuando** se genera.
  - **entonces** muestra pedidos atendidos, tiempo promedio y errores por empleado.
## Criterio de aceptación 003
  - **Dado que** el administrador aplica filtros.
  - **cuando** selecciona fecha o empleado.
  - **entonces** el reporte se ajusta a los criterios seleccionados.
## Criterio de aceptación 004
  - **Dado que** se genera el reporte.
  - **cuando** se visualiza.
  - **entonces** los datos se presentan con gráficos comparativos.
## Criterio de aceptación 005
  - **Dado que** un empleado no tiene actividad en el periodo consultado.
  - **cuando** se genera el reporte.
  - **entonces** aparece con valores en cero, no se omite.
