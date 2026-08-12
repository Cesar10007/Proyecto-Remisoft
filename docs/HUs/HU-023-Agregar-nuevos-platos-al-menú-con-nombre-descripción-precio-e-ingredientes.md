



# HU-023 Agregar nuevos platos al menú con nombre, descripción, precio e ingredientes

| Campo | Valor |
|---|---|
| ID | HU-023 |
| Título | Agregar nuevos platos al menú con nombre, descripción, precio e ingredientes |
| Módulo | Gestión del Menú |
| Prioridad | Media |
| Estado | Prototipo visual |
| RF asociados | RF006 |

---

## Historia

**Como** Administrador. **Necesito** agregar nuevos platos al menú con nombre, descripción, precio e ingredientes. **Con el objetivo de** para mantener la carta actualizada y que los pedidos descuenten correctamente del inventario.

## Criterio de aceptación 001
  - **Dado que** El administrador ingresa: nombre, descripción, precio, categoría e ingredientes con cantidades.
  - **cuando** El plato queda disponible inmediatamente en la interfaz de pedidos.
  - **entonces** Se puede asignar una imagen al plato.
## Criterio de aceptación 002
  - **Dado que** el administrador ingresa nombre, descripción, precio, categoría e ingredientes con cantidades.
  - **cuando** guarda el plato.
  - **entonces** el sistema valida los datos antes de crearlo.
## Criterio de aceptación 003
  - **Dado que** un plato fue creado.
  - **cuando** se guarda.
  - **entonces** queda disponible inmediatamente en la interfaz de pedidos.
## Criterio de aceptación 004
  - **Dado que** el administrador registra un plato.
  - **cuando** lo completa.
  - **entonces** puede asignarle una imagen.
## Criterio de aceptación 005
  - **Dado que** se intenta eliminar un ingrediente que está en uso (inventario, receta, orden de compra o lote).
  - **cuando** se envía la solicitud de eliminación.
  - **entonces** el sistema responde error 409 y no elimina el registro.    
