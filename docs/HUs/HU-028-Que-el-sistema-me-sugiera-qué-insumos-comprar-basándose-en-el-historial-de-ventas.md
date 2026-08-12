# HU-028 Que el sistema me sugiera qué insumos comprar basándose en el historial de ventas

| Campo | Valor |
|---|---|
| ID | HU-028 |
| Título | Que el sistema me sugiera qué insumos comprar basándose en el historial de ventas |
| Módulo | Módulo de Reportes y Análisis con IA |
| Prioridad | Alta |
| Estado | No iniciado |
| RF asociados | RF007 |

---

## Historia

**Como** Administrador. **Necesito** que el sistema me sugiera qué insumos comprar basándose en el historial de ventas. **Con el objetivo de** para optimizar las compras y evitar tanto faltantes como exceso de stock.

## Criterio de aceptación 001
  - **Dado que** La IA analiza el historial y genera sugerencias de compra por producto.
  - **cuando** Las sugerencias consideran tendencias y festividades locales (Día de la Madre, Halloween, etc.).
  - **entonces** El administrador puede aceptar o ignorar la sugerencia.
## Criterio de aceptación 002
  - **Dado que** existe historial de ventas.
  - **cuando** la IA lo analiza.
  - **entonces** genera sugerencias de compra por producto.
## Criterio de aceptación 003
  - **Dado que** se generan sugerencias.
  - **cuando** se calculan.
  - **entonces** consideran tendencias y festividades locales (Día de la Madre, Halloween, etc.).
## Criterio de aceptación 004
  - **Dado que** el administrador revisa una sugerencia.
  - **cuando** decide sobre ella.
  - **entonces** puede aceptarla o ignorarla.
## Criterio de aceptación 005
  - **Dado que** no hay suficiente historial de ventas.
  - **cuando** se solicita una sugerencia.
  - **entonces** el sistema informa que no hay datos suficientes para generarla.
