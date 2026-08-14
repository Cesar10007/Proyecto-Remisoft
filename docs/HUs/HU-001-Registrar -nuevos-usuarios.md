# Historias de Usuario - Remisoft

Sistema Web Inteligente para Restaurante Familia Remi.

---

### HU-001 Registrar nuevos usuarios

| Campo             | Valor                           |
|-------------------|---------------------------------|
| **ID**            | HU-001                          |
| **Título**        | Registrar nuevos usuarios       | 
| **Módulo**        | Autenticación                   |
| **Prioridad**     | Alta                            |
| **Estado**        | Implementada                    |
| **RF asociados**  | RF-001                          |

---

## Historia

**Como** Administrador.
**Necesito** registrar nuevos usuarios (meseros, cajeros, repartidores).
**Con el objetivo de** que el personal pueda acceder al sistema con credenciales propias.

## Criterio de aceptación 001
  - **Dado que** El administrador puede ingresar nombre, email, teléfono, clave y rol.
  - **cuando** El sistema valida que el email no esté duplicado.
  - **entonces** El usuario queda activo en el sistema.
## Criterio de aceptación 002
  - **Dado que** el administrador ingresa nombre, email, teléfono, clave y rol.
  - **cuando** envía el formulario.
  - **entonces** el sistema valida que todos los campos obligatorios estén completos antes de guardar.
## Criterio de aceptación 003
  - **Dado que** el administrador registra un email ya existente,
  - **cuando** el sistema valida los datos,
  - **entonces** rechaza el registro e indica que el correo ya está en uso.
## Criterio de aceptación 004
  - **Dado que** el registro es exitoso,
  - **cuando** se guarda el usuario,
  - **entonces** queda activo en el sistema con el rol asignado.
## Criterio de aceptación 005
  - **Dado que** el administrador no selecciona un rol,
  - **cuando** intenta guardar el usuario,
  - **entonces** el sistema muestra un error y no crea el registro.


