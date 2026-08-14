# Historias de Usuario - Remisoft

Sistema Web Inteligente para Restaurante Familia Remi.

> **Dentro del Documento** Este documento recoge las historias de usuario (HU) del proyecto, agrupadas por requisito funcional (RF) de origen; Roles que se ocupan en estas HUs.

---

### HU-009 Cerrar cuenta y generar factura

| Campo             | Valor                           |
|-------------------|---------------------------------|
| **ID**            | HU-009                          |
| **Título**        | Cerrar cuenta y generar factura | 
| **Módulo**        | Pedidos en salon                |
| **Prioridad**     | Alta                            |
| **Estado**        | No Implementada                 |
| **RF asociados**  | RF-002                          |

--- 

## Historia

**Como** Cajero/Administrador
**Necesito** cerrar una cuenta de mesa y generar la factura correspondiente
**Con el objetivo de** cobrar al cliente de forma rápida y precisa al finalizar el servicio

---

## Criterio de aceptación 001
  - **Dado que** Al cerrar la cuenta se genera la factura automáticamente.
  - **cuando** La factura incluye productos, precios, subtotal, IVA y total.
  - **entonces** La mesa queda libre en el sistema.
## Criterio de aceptación 002
  - **Dado que** el cajero cierra la cuenta de una mesa.
  - **cuando** confirma la acción.
  - **entonces** el sistema genera la factura automaticamente.
## Criterio de aceptación 003
  - **Dado que** se genera una factura.
  - **cuando** se visualiza.
  - **entonces** incluye productos, precios, subtotal, IVA y total.
## Criterio de aceptación 004
  - **Dado que** una cuenta fue cerrada y facturada.
  - **cuando** se completa el proceso.
  - **entonces** la mesa queda liberada en el sistema.
## Criterio de aceptación 005
  - **Dado que** se intenta cerrar una cuenta sin productos consumidos.
  - **cuando** se envía la solicitud.
  - **entonces** el sistema la rechaza.
