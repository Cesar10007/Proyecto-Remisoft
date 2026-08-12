# HU-025 Marcar un plato como no disponible temporalmente

| Campo | Valor |
|---|---|
| ID | HU-025 |
| Título | Marcar un plato como no disponible temporalmente |
| Módulo | Gestión del Menú |
| Prioridad | Media |
| Estado | Prototipo visual |
| RF asociados | RF006 |

---

## Historia

**Como** Administrador. **Necesito** marcar un plato como no disponible temporalmente. **Con el objetivo de** para evitar que se ordene un plato cuando no hay insumos suficientes.

## Criterio de aceptación 001
  - **Dado que** El administrador puede activar/desactivar la disponibilidad de un plato.
  - **cuando** Los platos no disponibles no aparecen en la interfaz de pedidos.
  - **entonces** La acción queda registrada en el historial.
## Criterio de aceptación 002
  - **Dado que** el administrador selecciona un plato.
  - **cuando** cambia su disponibilidad.
  - **entonces** el sistema activa o desactiva el plato correctamente.
## Criterio de aceptación 003
  - **Dado que** un plato está marcado como no disponible.
  - **cuando** se consulta la interfaz de pedidos.
  - **entonces** no aparece como opción para ordenar.
## Criterio de aceptación 004
  - **Dado que** se cambia la disponibilidad de un plato.
  - **cuando** se guarda.
  - **entonces** la acción queda registrada en el historial.
## Criterio de aceptación 005
  - **Dado que** un plato no disponible vuelve a activarse.
  - **cuando** se guarda el cambio.
  - **entonces** aparece nuevamente en la interfaz de pedidos.
