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

## Criterios de aceptación:
  - **Dado que** La factura incluye: detalle de productos, precio unitario, IVA, descuentos y total.
  - **cuando** Se genera en formato digital (PDF) y puede imprimirse.
  - **entonces** La factura queda registrada en el historial de ventas.
