# Historias de Usuario - Remisoft

Sistema Web Inteligente para Restaurante Familia Remi.

> **Dentro del Documento** Este documento recoge las historias de usuario (HU) del proyecto, agrupadas por requisito funcional (RF) de origen; Roles que se ocupan en estas HUs.

---

### HU-002 Asignar y modificar roles

| Campo             | Valor                           |
|-------------------|---------------------------------|
| **ID**            | HU-002                          |
| **Título**        | Asignar y modificar roles       | 
| **Módulo**        | Usuarios                        |
| **Prioridad**     | Alta                            |
| **Estado**        | Implementada                    |
| **RF asociados**  | RF-001                          |

---

## Historia

**Como** Administrador
**Necesito** asignar y modificar roles y permisos a los usuarios
**Con el objetivo de** garantizar que cada persona solo acceda a las funciones de su cargo

---

## Criterio de aceptación 001
  - **Dado que** Se pueden asignar roles: Administrador, Mesero, Cajero, Repartidor, Cliente.
  - **cuando** Un usuario solo ve los módulos de su rol.
  - **entonces** El cambio de rol se refleja de inmediato.
## Criterio de aceptación 002
  - **Dado que** el administrador asigna un rol a un usuario.
  - **cuando** selecciona entre Administrador, Mesero, Cajero, Repartidor o Cliente.
  - **entonces** el sistema guarda el rol correctamente.
## Criterio de aceptación 003
  - **Dado que** un usuario tiene un rol asignado.
  - **cuando** inicia sesión.
  - **entonces** solo visualiza los módulos correspondientes a su rol.
## Criterio de aceptación 004
  - **Dado que** el administrador modifica el rol de un usuario.
  - **cuando** guarda el cambio.
  - **entonces** el nuevo rol se refleja de inmediato sin requerir cierre de sesión.
## Criterio de aceptación 005
  - **Dado que** se intenta asignar un rol inválido o inexistente.
  - **cuando** se envía la solicitud.
  - **entonces** el sistema la rechaza con un mensaje de error.
