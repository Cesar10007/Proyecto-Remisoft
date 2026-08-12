# HU-030 Que el sistema identifique los horarios de mayor demanda y zonas de domicilio más frecuentes

| Campo | Valor |
|---|---|
| ID | HU-030 |
| Título | Que el sistema identifique los horarios de mayor demanda y zonas de domicilio más frecuentes |
| Módulo | Módulo de Reportes y Análisis con IA |
| Prioridad | Media |
| Estado | No iniciado |
| RF asociados | RF007 |

---

## Historia

**Como** Administrador. **Necesito** que el sistema identifique los horarios de mayor demanda y zonas de domicilio más frecuentes. **Con el objetivo de** para planificar mejor el personal y los recursos de entrega.

## Criterio de aceptación 001
  - **Dado que** La IA analiza los pedidos e identifica franjas horarias pico.
  - **cuando** Muestra un mapa de calor o gráfico de zonas con más domicilios.
  - **entonces** El análisis se actualiza con cada nueva semana de datos.
## Criterio de aceptación 002
  - **Dado que** existen pedidos registrados.
  - **cuando** la IA los analiza.
  - **entonces** identifica las franjas horarias de mayor demanda.
## Criterio de aceptación 003
  - **Dado que** se procesa el análisis.
  - **cuando** se genera el resultado.
  - **entonces** se muestra un mapa de calor o gráfico de zonas con más domicilios.
## Criterio de aceptación 004
  - **Dado que** se agregan nuevos datos.
  - **cuando** transcurre una semana.
  - **entonces** el análisis se actualiza automáticamente.
## Criterio de aceptación 005
  - **Dado que** no hay suficientes datos históricos.
  - **cuando** se solicita el análisis.
  - **entonces** el sistema informa que aún no puede generar resultados confiables.
