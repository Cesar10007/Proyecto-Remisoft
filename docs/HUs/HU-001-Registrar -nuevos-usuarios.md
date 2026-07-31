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

## Criterios de aceptación
  - **Dado que** El administrador puede ingresar nombre, email, teléfono, clave y rol.
  - **cuando** El sistema valida que el email no esté duplicado.
  - **entonces** El usuario queda activo en el sistema.


