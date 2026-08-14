# Historias de Usuario - Remisoft

Sistema Web Inteligente para Restaurante Familia Remi.

> **Dentro del Documento** Este documento recoge las historias de usuario (HU) del proyecto, agrupadas por requisito funcional (RF) de origen; Roles que se ocupan en estas HUs.

---

### HU-008 Ver estado de pedidos en tiempo real 

| Campo             | Valor                                      |
|-------------------|--------------------------------------------|
| **ID**            | HU-008                                     |
| **Título**        | Ver estado de pedidos en tiempo real       | 
| **Módulo**        | Pedidos en salon                           |
| **Prioridad**     | Alta                                       |
| **Estado**        | NO Implementado                            |
| **RF asociados**  | RF-002                                     |

---

## Historia

**Como** Mesero 
**Necesito** ver el estado de los pedidos de mis mesas en tiempo real
**Con el objetivo de** informar al cliente y coordinar el servicio eficientemente

---

## Criterio de aceptación 001
  - **Dado que** El mesero ve: Pendiente, En preparación, Listo, Entregado.
  - **cuando** El estado se actualiza sin necesidad de recargar la página.
  - **entonces** Solo se muestran mesas asignadas al mesero.
## Criterio de aceptación 002
  - **Dado que** el mesero abre el panel de pedidos.
  - **cuando** consulta sus mesas.
  - **entonces** ve los estados Pendiente, En preparación, Listo o Entregado.
## Criterio de aceptación 003
  - **Dado que** el estado de un pedido cambia.
  - **cuando** ocurre la actualización.
  - **entonces** se refleja en pantalla sin necesidad de recargar la página.
## Criterio de aceptación 004
  - **Dado que** un mesero consulta el panel.
  - **cuando** se cargan los pedidos.
  - **entonces** solo se muestran las mesas que tiene asignadas.
## Criterio de aceptación 005
  - **Dado que** no hay pedidos activos en las mesas del mesero.
  - **cuando** consulta el panel.
  - **entonces** el sistema muestra un estado vacío claro.
  
