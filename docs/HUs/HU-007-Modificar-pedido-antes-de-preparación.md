# Historias de Usuario - Remisoft

Sistema Web Inteligente para Restaurante Familia Remi.

> **Dentro del Documento** Este documento recoge las historias de usuario (HU) del proyecto, agrupadas por requisito funcional (RF) de origen; Roles que se ocupan en estas HUs.

---

### HU-007 Modificar pedido antes de preparación

| Campo             | Valor                                      |
|-------------------|--------------------------------------------|
| **ID**            | HU-007                                     |
| **Título**        | Modificar pedido antes de preparación      | 
| **Módulo**        | Pedidos en salon                           |
| **Prioridad**     | Alta                                       |
| **Estado**        | Implementado                               |
| **RF asociados**  | RF-002                                     |

---

## Historia

**Como** Mesero
**Necesito** modificar un pedido antes de que sea preparado
**Con el objetivo de** Corregir errores del cliente sin cancelar el pedido completo

---

## Criterio de aceptación 001
  - **Dado que** El mesero puede agregar o quitar productos mientras el estado sea "pendiente".
  - **cuando** La cocina recibe la actualización en tiempo real.
  - **entonces** El sistema registra el cambio con fecha y hora.
## Criterio de aceptación 002
  - **Dado que** un pedido está en estado "pendiente".
  - **cuando** el mesero agrega o quita productos.
  - **entonces** el sistema permite la modificación.
## Criterio de aceptación 003
  - **Dado que** un pedido ya pasó a estado "en preparación".
  - **cuando** el mesero intenta modificarlo.
  - **entonces** el sistema bloquea el cambio.
## Criterio de aceptación 004
  - **Dado que** se modifica un pedido.
  - **cuando** se guarda el cambio.
  - **entonces** cocina recibe la actualización en tiempo real.
## Criterio de aceptación 005
  - **Dado que** un pedido es modificado.
  - **cuando** se registra el cambio.
  - **entonces** el sistema guarda fecha, hora y usuario que lo hizo.
