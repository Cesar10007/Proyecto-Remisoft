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

## Criterios de aceptación:
  - **Dado** El cajero selecciona el método de pago al emitir la factura.
  - **cuando** El sistema registra el método junto a la factura.
  - **entonces** Si es efectivo, calcula el cambio automáticamente.
