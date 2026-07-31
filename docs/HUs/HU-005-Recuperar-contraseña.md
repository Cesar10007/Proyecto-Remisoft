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

## Criterios de aceptación:
  - **Dado que** El sistema envía un enlace o código de recuperación al email registrado.
  - **cuando** El enlace expira en 30 minutos.
  - **entonces** El usuario puede establecer una nueva contraseña.
