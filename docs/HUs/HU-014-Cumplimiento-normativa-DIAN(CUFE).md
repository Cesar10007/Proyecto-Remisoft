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

## Criterios de aceptacion:
  - **Dado que** Cada factura generada incluye el CUFE según resolución 000042 de 2020.
  - **cuando** La factura se almacena en formato XML.
  - **entonces** Los valores se muestran en COP con el formato correcto.
