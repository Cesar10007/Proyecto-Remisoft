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

## Criterios de aceptación:
  - **Dado que** El panel muestra todos los pedidos activos agrupados por mesa.
  - **cuando** Se indica el tiempo transcurrido desde que se tomó el pedido.
  - **entonces** El administrador puede filtrar por estado.
