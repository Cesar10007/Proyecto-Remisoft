# Historias de Usuario - Remisoft

Sistema Web Inteligente para Restaurante Familia Remi.

> **Dentro del Documento** Este documento recoge las historias de usuario (HU) del proyecto, agrupadas por requisito funcional (RF) de origen; Roles que se ocupan en estas HUs.

---

### HU-003 Iniciar sesión

| Campo             | Valor                           |
|-------------------|---------------------------------|
| **ID**            | HU-002                          |
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

## Criterios de aceptación: 
  - **Dado que** El sistema valida credenciales antes de permitir acceso.
  - **cuando** Si son incorrectas, muestra mensaje de error.
  - **entonces** La sesión expira tras inactividad definida.
