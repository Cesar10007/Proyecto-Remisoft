# Historias de Usuario - Remisoft

Sistema Web Inteligente para Restaurante Familia Remi.

> **Dentro del Documento** Este documento recoge las historias de usuario (HU) del proyecto, agrupadas por requisito funcional (RF) de origen; Roles que se ocupan en estas HUs.

---

### HU-003 Iniciar sesión

| Campo             | Valor                           |
|-------------------|---------------------------------|
| **ID**            | HU-003                          |
| **Título**        | Iniciar sesión                  | 
| **Módulo**        | Usuarios y Autenticación        |
| **Prioridad**     | Alta                            |
| **Estado**        | Implementada                    |
| **RF asociados**  | RF-001                          |

---

## Historia 

**Como** Usuario del sistema
**Necesito** iniciar sesión con email y contraseña
**Con el objetivo de** acceder de forma segura a las funciones de mi rol

---

## Criterio de aceptación 001
  - **Dado que** El sistema valida credenciales antes de permitir acceso.
  - **cuando** Si son incorrectas, muestra mensaje de error.
  - **entonces** La sesión expira tras inactividad definida.
## Criterio de aceptación 002
  - **Dado que** un usuario ingresa email y contraseña correctos.
  - **cuando** envía el formulario de login.
  - **entonces** el sistema le permite el acceso según su rol.
## Criterio de aceptación 003
  - **Dado que** un usuario ingresa credenciales incorrectas.
  - **cuando** intenta iniciar sesión.
  - **entonces** el sistema muestra un mensaje de error sin indicar cuál dato falló.
## Criterio de aceptación 004
  - **Dado que** una sesión permanece inactiva por el tiempo definido.
  - **cuando** se cumple ese lapso.
  - **entonces** el sistema cierra la sesión automáticamente.
## Criterio de aceptación 005
  - **Dado que** un usuario supera un número máximo de intentos fallidos.
  - **cuando** vuelve a intentar.
  - **entonces** el sistema bloquea temporalmente el acceso.
