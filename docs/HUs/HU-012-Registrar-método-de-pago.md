# Historias de Usuario - Remisoft

Sistema Web Inteligente para Restaurante Familia Remi.

> **Dentro del Documento** Este documento recoge las historias de usuario (HU) del proyecto, agrupadas por requisito funcional (RF) de origen; Roles que se ocupan en estas HUs.

---

## HU-012 Registrar método de pago

| Campo             | Valor                           |
|-------------------|---------------------------------|
| **ID**            | HU-011                          |
| **Título**        | Registrar método de pago        | 
| **Módulo**        | Facturación                     |
| **Prioridad**     | Alta                            |
| **Estado**        | No Implementada                 |
| **RF asociados**  | RF-003                          |

---

##Historia

**Como** Cajero
**Necesito** registrar el método de pago (efectivo, tarjeta, transferencia) en la factura
**Con el objetivo de** llevar trazabilidad de los ingresos según su forma de pago

---

## Criterio de aceptación 001
  - **Dado** El cajero selecciona el método de pago al emitir la factura.
  - **cuando** El sistema registra el método junto a la factura.
  - **entonces** Si es efectivo, calcula el cambio automáticamente.
## Criterio de aceptación 002
  - **Dado que** el cajero emite una factura.
  - **cuando** selecciona el método de pago (efectivo, tarjeta o transferencia).
  - **entonces** el sistema lo registra junto a la factura.
## Criterio de aceptación 003
  - **Dado que** el método de pago es efectivo.
  - **cuando** se ingresa el monto recibido.
  - **entonces** el sistema calcula el cambio automáticamente.
## Criterio de aceptación 004
  - **Dado que** se selecciona tarjeta o transferencia.
  - **cuando** se confirma el pago.
  - **entonces** el sistema no solicita cálculo de cambio.
## Criterio de aceptación 005
  - **Dado que** no se selecciona ningún método de pago.
  - **cuando** se intenta cerrar la factura.
  - **entonces** el sistema no permite continuar.
