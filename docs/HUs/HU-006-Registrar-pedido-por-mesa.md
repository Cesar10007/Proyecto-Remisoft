# Historias de Usuario - Remisoft

Sistema Web Inteligente para Restaurante Familia Remi.

> **Dentro del Documento** Este documento recoge las historias de usuario (HU) del proyecto, agrupadas por requisito funcional (RF) de origen; Roles que se ocupan en estas HUs.

---

### HU-006 Registrar pedido por mesa

| Campo             | Valor                           |
|-------------------|---------------------------------|
| **ID**            | HU-006                          |
| **Título**        | Registrar pedido por mesa       | 
| **Módulo**        | Pedidos en salon                |
| **Prioridad**     | Alta                            |
| **Estado**        | No Implementada                 |
| **RF asociados**  | RF-002                          |

---

## Historia

**Como** Mesero
**Necesito** Registrar un pedido asignándolo a una mesa especifica
**Con el objetivo de** que la cocina reciba la orden correctamente y sin errores

---

## Criterio de aceptación 001
  - **Dado que** El mesero selecciona la mesa y agrega productos al pedido.
  - **cuando** El pedido se envía automáticamente a cocina.
  - **entonces** La mesa queda marcada como ocupada.
## Criterio de aceptación 002
  - **Dado que** el mesero selecciona una mesa disponible.
  - **cuando** agrega productos al pedido.
  - **entonces** el sistema arma el pedido asociado a esa mesa.
## Criterio de aceptación 003
  - **Dado que** el pedido se confirma.
  - **cuando** se envía.
  - **entonces** llega automáticamente a la vista de cocina.
## Criterio de aceptación 004
  - **Dado que** un pedido fue registrado.
  - **cuando** se guarda.
  - **entonces** la mesa correspondiente queda marcada como ocupada.
## Criterio de aceptación 005
  - **Dado que** se intenta registrar un pedido sin productos.
  - **cuando** se envía el formulario.
  - **entonces** el sistema lo rechaza indicando que debe tener al menos un product.
