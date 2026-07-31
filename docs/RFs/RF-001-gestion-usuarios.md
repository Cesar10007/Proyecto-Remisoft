# RF-001 — Gestión de Usuarios

**Historias de usuario relacionadas**: HU-001, HU-002, HU-003, HU-004, HU-005

**Tipo**: Requisito
**Prioridad**: Alta / Esencial
**Fuente del requisito**: NA

## Descripción

El sistema deberá gestionar de forma integral el ciclo de vida de los usuarios que interactúan con la plataforma. La funcionalidad permitirá registrar, autenticar, organizar y administrar a diferentes tipos de usuarios que participan en la operación diaria del restaurante, tales como: administradores, meseros, repartidores, cajeros y clientes.

Además, el sistema deberá asignar roles con permisos claramente definidos según las funciones y responsabilidades de cada actor, garantizando que solo puedan acceder a las secciones y operaciones correspondientes a su cargo dentro del establecimiento.

---

## Flujo del proceso

| Paso | Descripción |
| ---- | ----------- |
| 1    | El administrador ingresa los datos del nuevo usuario (nombre, email, teléfono, contraseña y rol). |
| 2    | El sistema valida que el email no esté duplicado en la base de datos. |
| 3    | El usuario queda registrado y activo con el rol asignado. |
| 4    | El usuario ingresa sus credenciales (email y contraseña) en el formulario de login. |
| 5    | El sistema valida las credenciales contra la base de datos y genera un token de sesión (Sanctum). |
| 6    | Según el rol del usuario autenticado, el sistema redirige al dashboard correspondiente. |
| 7    | El administrador puede modificar el rol o desactivar un usuario existente en cualquier momento. |
| 8    | Si el usuario olvida su contraseña, solicita recuperación y el sistema envía un enlace de restablecimiento al correo registrado. |

---

## Reglas de Negocio

| ID     | Regla |
| ------ | ----- |
| RN-001 | El campo `email` debe tener formato válido y ser único en el sistema. |
| RN-002 | La contraseña debe almacenarse cifrada (hash), nunca en texto plano. |
| RN-003 | Los roles permitidos son: Administrador, Mesero, Cajero, Repartidor y Cliente. |
| RN-004 | Un usuario solo puede tener un rol activo a la vez. |
| RN-005 | Un usuario desactivado no puede iniciar sesión, pero su historial se conserva (soft delete). |
| RN-006 | El enlace de recuperación de contraseña expira 30 minutos después de generado. |
| RN-007 | Cada acceso al sistema debe registrar el rol del usuario para restringir las rutas disponibles. |

---

## Inputs / Outputs

**Input** (registro de usuario):
{ "nombre": "string", "email": "string", "telefono": "string", "password": "string", "rol": "string" }

**Output éxito** (HTTP 201):
{
"id": "integer",
"nombre": "string",
"email": "string",
"rol": "string",
"activo": true,
"created_at": "timestamp"
}
