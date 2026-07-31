# Historias de Usuario - Remisoft

Sistema Web Inteligente para Restaurante Familia Remi.

> **Dentro del Documento** Este documento recoge las historias de usuario (HU) del proyecto, agrupadas por requisito funcional (RF) de origen; Roles que se ocupan en estas HUs.

---

### HU-008 Ver estado de pedidos en tiempo real 

| Campo             | Valor                                      |
|-------------------|--------------------------------------------|
| **ID**            | HU-008                                     |
| **Título**        | Ver estado de pedidos en tiempo real       | 
| **Módulo**        | Pedidos en salon                           |
| **Prioridad**     | Alta                                       |
| **Estado**        | NO Implementado                            |
| **RF asociados**  | RF-002                                     |

---

## Historia

**Como** Mesero 
**Necesito** ver el estado de los pedidos de mis mesas en tiempo real
**Con el objetivo de** informar al cliente y coordinar el servicio eficientemente

---

## Criterios de aceptación:
  - **Dado que** El mesero ve: Pendiente, En preparación, Listo, Entregado.
  - **cuando** El estado se actualiza sin necesidad de recargar la página.
  - **entonces** Solo se muestran mesas asignadas al mesero. 
