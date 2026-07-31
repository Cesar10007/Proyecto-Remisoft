# Historias de Usuario - Remisoft

Sistema Web Inteligente para Restaurante Familia Remi.

> **Dentro del Documento** Este documento recoge las historias de usuario (HU) del proyecto, agrupadas por requisito funcional (RF) de origen; Roles que se ocupan en estas HUs.

---

## HU-013 Historial de facturas con filtros

| Campo             | Valor                              |
|-------------------|------------------------------------|
| **ID**            | HU-013                             |
| **Título**        | Historial de facturas con filtros  | 
| **Módulo**        | Facturación                        |
| **Prioridad**     | Alta                               |
| **Estado**        | No Implementada                    |
| **RF asociados**  | RF-003                             |

---

## Historia

**Como** Administrador
**Necesito** consultar el historial de facturas emitidas con filtros de fecha y monto
**Con el objetivo de** hacer seguimiento contable y auditorías internas

---

## Criterios de aceptación:
  - **Dado que** El administrador puede filtrar por rango de fechas, mesero, mesa o estado.
  - **cuando** Se puede exportar el historial.
  - **entonces** Cada factura muestra su estado: pagada, anulada.
