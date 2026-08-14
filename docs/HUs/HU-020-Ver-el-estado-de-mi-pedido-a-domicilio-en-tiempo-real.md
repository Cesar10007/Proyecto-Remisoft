# HU-020 Ver el estado de mi pedido a domicilio en tiempo real

| Campo | Valor |
|---|---|
| ID | HU-020 |
| Título | Ver el estado de mi pedido a domicilio en tiempo real |
| Módulo | Gestión de Pedidos a Domicilio |
| Prioridad | Alta |
| Estado | Prototipo visual |
| RF asociados | RF005 |

---

## Historia

**Como** Cliente. **Necesito** ver el estado de mi pedido a domicilio en tiempo real. **Con el objetivo de** para saber cuándo llegará mi pedido sin necesidad de llamar.

## Criterio de aceptación 001
  - **Dado que** El cliente ve los estados: Pendiente, En preparación, En camino, Entregado.
  - **cuando** El estado se actualiza automáticamente.
  - **entonces** Se muestra el tiempo estimado de entrega.
## Criterio de aceptación 002
  - **Dado que** el cliente consulta su pedido.
  - **cuando** lo visualiza.
  - **entonces** ve los estados Pendiente, En preparación, En camino o Entregado.
## Criterio de aceptación 003
  - **Dado que** el estado del pedido cambia.
  - **cuando** ocurre la actualización.
  - **entonces** se refleja automáticamente sin recargar la página.
## Criterio de aceptación 004
  - **Dado que** el cliente consulta su pedido.
  - **cuando** está en curso.
  - **entonces** el sistema muestra el tiempo estimado de entrega.
## Criterio de aceptación 005
  - **Dado que** el pedido llega a estado "Entregado".
  - **cuando** se actualiza.
  - **entonces** el sistema deja de mostrar el tiempo estimado.
