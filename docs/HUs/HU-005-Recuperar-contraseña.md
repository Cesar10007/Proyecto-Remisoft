# Historias de Usuario - Remisoft

Sistema Web Inteligente para Restaurante Familia Remi.

> **Dentro del Documento** Este documento recoge las historias de usuario (HU) del proyecto, agrupadas por requisito funcional (RF) de origen; Roles que se ocupan en estas HUs.

---

### HU-005 Recuperar contraseña

| Campo             | Valor                           |
|-------------------|---------------------------------|
| **ID**            | HU-005                          |
| **Título**        | Recuperar contraseña            | 
| **Módulo**        | Usuarios y Autenticación        |
| **Prioridad**     | Media                           |
| **Estado**        | Implementada                    |
| **RF asociados**  | RF-001                          |

---

## Historia

**Como** Usuario del sistema
**Necesito** recuperar mi contraseña olvidada
**Con el objetivo de** volver a acceder al sistema sin depender del administrador

---

## Criterio de aceptación 001
  - **Dado que** El sistema envía un enlace o código de recuperación al email registrado.
  - **cuando** El enlace expira en 30 minutos.
  - **entonces** El usuario puede establecer una nueva contraseña.
## Criterio de aceptación 002
  - **Dado que** un usuario solicita recuperar su contraseña,
  - **cuando** ingresa su email registrado,
  - **entonces** el sistema envía un enlace o código de recuperación.
## Criterio de aceptación 003
  - **Dado que** se genera un enlace de recuperación.
  - **cuando** pasan 30 minutos sin usarlo.
  - **entonces** el enlace expira y deja de ser válido.
## Criterio de aceptación 004
  - **Dado que** el usuario usa un enlace válido.
  - **cuando** define una nueva contraseña.
  - **entonces** el sistema la actualiza y permite iniciar sesión con ella.
## Criterio de aceptación 005
  - **Dado que** se ingresa un email no registrado.
  - **cuando** se solicita la recuperación.
  - **entonces** el sistema no revela si el correo existe o no, por seguridad.

