# Historias de Usuario - Remisoft

Sistema Web Inteligente para Restaurante Familia Remi.

> **Dentro del Documento** Este documento recoge las historias de usuario (HU) del proyecto, agrupadas por requisito funcional (RF) de origen; Roles que se ocupan en estas HUs.

---

### HU-010 Listado de pedidos activos

| Campo             | Valor                           |
|-------------------|---------------------------------|
| **ID**            | HU-010                          |
| **Título**        | Listado de pedidos activos      | 
| **Módulo**        | Pedidos en salon                |
| **Prioridad**     | Media                           |
| **Estado**        | Implementada                    |
| **RF asociados**  | RF-002                          |

---

## Historia

**Como** Administrador. 
**Necesito** ver un listado de todos los pedidos en el salón.
**Con el objetivo de** supervisar la operación en tiempo real y detectar demoras.

---

## Criterio de aceptación 001
  - **Dado que** El panel muestra todos los pedidos activos agrupados por mesa.
  - **cuando** Se indica el tiempo transcurrido desde que se tomó el pedido.
  - **entonces** El administrador puede filtrar por estado.
## Criterio de aceptación 002
  - **Dado que** el administrador abre el panel.
  - **cuando** consulta los pedidos.
  - **entonces** ve todos los pedidos activos agrupados por mesa.
## Criterio de aceptación 003
  - **Dado que** un pedido está en curso.
  - **cuando** se muestra en el listado.
  - **entonces** se indica el tiempo transcurrido desde que se tomó.
## Criterio de aceptación 004
  - **Dado que** el administrador aplica un filtro.
  - **cuando** selecciona un estado.
  - **entonces** el listado muestra solo los pedidos que coinciden.
## Criterio de aceptación 005
  - **Dado que** no hay pedidos activos.
  - **cuando** se consulta el listado.
  - **entonces** el sistema informa que no hay pedidos en curso.

