# Historias de Usuario - Remisoft

Sistema Web Inteligente para Restaurante Familia Remi.

> **Dentro del Documento** Este documento recoge las historias de usuario (HU) del proyecto, agrupadas por requisito funcional (RF) de origen; Roles que se ocupan en estas HUs.

---

## HU-015 Descuento automático de inventario

| Campo             | Valor                              |
|-------------------|------------------------------------|
| **ID**            | HU-015                             |
| **Título**        | Descuento automático de inventario | 
| **Módulo**        | Inventario                         |
| **Prioridad**     | Media                              |
| **Estado**        | No Implementada                    |
| **RF asociados**  | RF-004                             |

---

## Historia

**Como** Administrador
**Necesito** que el inventario se descuente automáticamente al registrar una venta
**Con el objetivo de** mantener existencias actualizadas sin procesos manuales

---

## Criterio de aceptación 001
  - **Dado que** Al confirmar un pedido, los ingredientes del plato se descuentan según receta.
  - **cuando** El movimiento queda registrado con fecha y pedido asociado.
  - **entonces** Si el stock es insuficiente, el sistema alerta antes de confirmar.
## Criterio de aceptación 002
  - **Dado que** se confirma un pedido.
  - **cuando** se procesa.
  - **entonces** los ingredientes del plato se descuentan del inventario según la receta.
## Criterio de aceptación 003
  - **Dado que** se realiza un descuento de inventario.
  - **cuando** se ejecuta.
  - **entonces** el movimiento queda registrado con fecha y pedido asociado.
## Criterio de aceptación 004
  - **Dado que** el stock de un ingrediente es insuficiente.
  - **cuando** se intenta confirmar el pedido,
  - **entonces** el sistema alerta antes de procesarlo.
## Criterio de aceptación 005
  - **Dado que** se cancela un pedido ya confirmado.
  - **cuando** se revierte.
  - **entonces** el inventario descontado se restaura correctamente.
