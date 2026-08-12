# HU-024 Modificar el precio o descripción de un plato existente

| Campo | Valor |
|---|---|
| ID | HU-024 |
| Título | Modificar el precio o descripción de un plato existente |
| Módulo | Gestión del Menú |
| Prioridad | Media |
| Estado | Prototipo visual |
| RF asociados | RF006 |

---

## Historia

**Como** Administrador. **Necesito** modificar el precio o descripción de un plato existente. **Con el objetivo de** para actualizar la carta sin necesidad de eliminar y volver a crear el plato.

## Criterio de aceptación 001
  - **Dado que** El administrador puede editar cualquier campo del plato.
  - **cuando** Los cambios se reflejan inmediatamente en la interfaz de pedidos.
  - **entonces** El sistema registra quién hizo el cambio y cuándo.
## Criterio de aceptación 002
  - **Dado que** el administrador edita un plato.
  - **cuando** modifica precio o descripción.
  - **entonces** el sistema permite el cambio en cualquier campo editable.
## Criterio de aceptación 003
  - **Dado que** se guarda una modificación.
  - **cuando** se confirma.
  - **entonces** los cambios se reflejan inmediatamente en la interfaz de pedidos.
## Criterio de aceptación 004
  - **Dado que** se realiza un cambio en un plato.
  - **cuando** se registra.
  - **entonces** el sistema guarda quién hizo el cambio y cuándo.
## Criterio de aceptación 005
  - **Dado que** se ingresa un precio negativo o inválido.
  - **cuando** se intenta guardar.
  - **entonces** el sistema rechaza la actualización.
