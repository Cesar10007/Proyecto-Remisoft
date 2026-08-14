# Historias de Usuario - Remisoft

Sistema Web Inteligente para Restaurante Familia Remi.

> **Dentro del Documento** Este documento recoge las historias de usuario (HU) del proyecto, agrupadas por requisito funcional (RF) de origen; Roles que se ocupan en estas HUs.

---

## HU-011 Generar factura automáticamente

| Campo             | Valor                           |
|-------------------|---------------------------------|
| **ID**            | HU-011                          |
| **Título**        | Generar factura automáticamente | 
| **Módulo**        | Facturación                     |
| **Prioridad**     | Alta                            |
| **Estado**        | No Implementada                 |
| **RF asociados**  | RF-003                          |

---


## Historia 

**Como** Cajero
**Necesito** que el sistema genere la factura automáticamente al cerrar un pedido
**Con el objetivo de** evitar errores manuales y agilizar el proceso de cobro

---

## Criterio de aceptación 001
  - **Dado que** La factura incluye: detalle de productos, precio unitario, IVA, descuentos y total.
  - **cuando** Se genera en formato digital (PDF) y puede imprimirse.
  - **entonces** La factura queda registrada en el historial de ventas.
## Criterio de aceptación 002
  - **Dado que** se cierra un pedido.
  - **cuando** el sistema genera la factura.
  - **entonces** incluye detalle de productos, precio unitario, IVA, descuentos y total.
## Criterio de aceptación 003
  - **Dado que** una factura fue generada.
  - **cuando** el cajero la solicita.
  - **entonces** el sistema la entrega en formato PDF y permite imprimirla.
## Criterio de aceptación 004
  - **Dado que** una factura fue emitida.
  - **cuando** se guarda.
  - **entonces** queda registrada en el historial de ventas.
## Criterio de aceptación 005
  - **Dado que** ocurre un error al generar la factura.
  - **cuando** el sistema lo detecta.
  - **entonces** notifica al cajero y no cierra el pedido.

