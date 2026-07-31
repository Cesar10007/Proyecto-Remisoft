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

## Criterios de aceptación:
- **Dado que** Al confirmar un pedido, los ingredientes del plato se descuentan según receta.
- **cuando** El movimiento queda registrado con fecha y pedido asociado.
- **entonces** Si el stock es insuficiente, el sistema alerta antes de confirmar.
