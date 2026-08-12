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

## Criterio de aceptación 001
  - **Dado que** El administrador puede filtrar por rango de fechas, mesero, mesa o estado.
  - **cuando** Se puede exportar el historial.
  - **entonces** Cada factura muestra su estado: pagada, anulada.
## Criterio de aceptación 002
  - **Dado que** el administrador accede al historial.
  - **cuando** aplica filtros por fecha, mesero, mesa o estado.
  - **entonces** el sistema muestra solo las facturas que coinciden.
## Criterio de aceptación 003
  - **Dado que** el administrador consulta el historial.
  - **cuando** solicita exportarlo.
  - **entonces** el sistema genera el archivo con los registros filtrados.
## Criterio de aceptación 004
  - **Dado que** una factura está en el historial.
  - **cuando** se visualiza.
  - **entonces** muestra su estado (pagada o anulada).
## Criterio de aceptación 005
  - **Dado que** no existen facturas para los filtros aplicados.
  - **cuando** se consulta.
  - **entonces** el sistema indica que no hay resultados.
  
