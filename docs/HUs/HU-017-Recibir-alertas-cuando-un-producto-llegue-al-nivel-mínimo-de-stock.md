# HU-017 Recibir alertas cuando un producto llegue al nivel mínimo de stock

| Campo | Valor |
|---|---|
| ID | HU-017 |
| Título | Recibir alertas cuando un producto llegue al nivel mínimo de stock |
| Módulo | Control de Inventario |
| Prioridad | Media |
| Estado | Prototipo visual |
| RF asociados | RF004 |

---

## Historia

**Como** Administrador. **Necesito** recibir alertas cuando un producto llegue al nivel mínimo de stock. **Con el objetivo de** para reabastecer a tiempo y evitar faltantes durante el servicio.

## Criterio de aceptación 001
  - **Dado que** Se puede configurar un umbral mínimo por producto.
  - **cuando** El sistema envía una alerta visible en el panel cuando se alcanza el umbral.
  - **entonces** La alerta indica el producto y la cantidad disponible.
## Criterio de aceptación 002
  - **Dado que** el administrador configura un umbral mínimo por producto.
  - **cuando** lo guarda.
  - **entonces** el sistema lo aplica para ese producto.
## Criterio de aceptación 003  
  - **Dado que** el stock de un producto llega al umbral mínimo.
  - **cuando** ocurre.
  - **entonces** el sistema envía una alerta visible en el panel.
## Criterio de aceptación 004
  - **Dado que** se genera una alerta.
  - **cuando** se muestra.
  - **entonces** indica el producto y la cantidad disponible.
## Criterio de aceptación 005
  - **Dado que** el stock de un producto vuelve a superar el umbral.
  - **cuando** se actualiza.
  - **entonces** la alerta correspondiente desaparece.
 
  
  
  
  
