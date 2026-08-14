# Historias de Usuario - Remisoft

Sistema Web Inteligente para Restaurante Familia Remi.

> **Dentro del Documento** Este documento recoge las historias de usuario (HU) del proyecto, agrupadas por requisito funcional (RF) de origen; Roles que se ocupan en estas HUs.

---

### HU-014 Cumplimiento normativa DIAN(CUFE)

| Campo             | Valor                             |
|-------------------|-----------------------------------|
| **ID**            | HU-014                            |
| **Título**        | Cumplimiento normativa DIAN(CUFE) | 
| **Módulo**        | Facturación                       |
| **Prioridad**     | Alta                              |
| **Estado**        | Implementada                      |
| **RF asociados**  | RF-003                            |

---

## Historia

**Como** Administrador
**Necesito** que las facturas cumplan la normativa DIAN con CUFE
**Con el objetivo de** garantizar el cumplimiento legal de facturación electrónica en Colombia

---

## Criterio de aceptacion 001
  - **Dado que** Cada factura generada incluye el CUFE según resolución 000042 de 2020.
  - **cuando** La factura se almacena en formato XML.
  - **entonces** Los valores se muestran en COP con el formato correcto.
## Criterio de aceptacion 002
  - **Dado que** se genera una factura.
  - **cuando** se emite.
  - **entonces** incluye el CUFE conforme a la resolución 000042 de 2020.
## Criterio de aceptacion 003
  - **Dado que** una factura fue generada.
  - **cuando** se almacena.
  - **entonces** se guarda en formato XML válido según la norma DIAN.
## Criterio de aceptacion 004
  - **Dado que** se muestra una factura.
  - **cuando** se visualizan los valores.
  - **entonces** aparecen en pesos colombianos (COP) con el formato correcto.
## Criterio de aceptacion 005
  - **Dado que** falla la generación del CUFE.
  - **cuando** el sistema lo detecta.
  - **entonces** impide emitir la factura hasta corregir el error.

