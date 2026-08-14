# Historias de Usuario - Remisoft

Sistema Web Inteligente para Restaurante Familia Remi.

> **Dentro del Documento** Este documento recoge las historias de usuario (HU) del proyecto, agrupadas por requisito funcional (RF) de origen; Roles que se ocupan en estas HUs.

---

### HU-004 Desactivar/eliminar usuarios

| Campo             | Valor                           |
|-------------------|---------------------------------|
| **ID**            | HU-004                          |
| **Título**        | Desactivar/Eliminar usuario     | 
| **Módulo**        | Usuarios y Autenticación        |
| **Prioridad**     | Media                           |
| **Estado**        | Implementada                    |
| **RF asociados**  | RF-001                          |

---

## Historia

**Como** Administrador
**Necesito** desactivar o eliminar usuarios que ya no laboran
**Con el objetivo de** mantener el sistema seguro y sin accesos no autorizados

---

## Criterio de aceptación 001
- **Dado que** El administrador puede desactivar un usuario.
- **cuando** El usuario desactivado no puede iniciar sesión.
- **entonces** El historial del usuario se conserva.
## Criterio de aceptación 002
- **Dado que** el administrador selecciona un usuario activo.
- **cuando** confirma la desactivación.
- **entonces** el usuario queda marcado como inactivo.
## Criterio de aceptación 003
- **Dado que** un usuario fue desactivado.
- **cuando** intenta iniciar sesión.
- **entonces** el sistema le niega el acceso.
## Criterio de aceptación 004
- **Dado que** un usuario es desactivado.
- **cuando** se consulta su historial.
- **entonces** los registros asociados a ese usuario se conservan intactos.


