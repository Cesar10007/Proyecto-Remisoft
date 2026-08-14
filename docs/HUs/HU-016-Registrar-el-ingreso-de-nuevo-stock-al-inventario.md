# HU-016 Registrar el ingreso de nuevo stock al inventario

| Campo | Valor |
|---|---|
| ID | HU-016 |
| Título | Registrar el ingreso de nuevo stock al inventario |
| Módulo | Control de Inventario |
| Prioridad | Media |
| Estado | Prototipo visual |
| RF asociados | RF004 |

---

## Historia

**Como** Administrador. **Necesito** registrar el ingreso de nuevo stock al inventario. **Con el objetivo de** para reflejar las compras de insumos y mantener el inventario exacto.

## Criterio de aceptación 001
  - **Dado que** El administrador ingresa producto, cantidad, proveedor y fecha.
  - **cuando** El stock disponible se actualiza inmediatamente.
  - **entonces** El movimiento queda en el historial de entradas.
## Criterio de aceptación 002
  - **Dado que** el administrador ingresa producto, cantidad, proveedor y fecha.
  - **cuando** guarda el registro.
  - **entonces** el sistema lo valida antes de aceptarlo.
## Criterio de aceptación 003
  - **Dado que** se registra un ingreso de stock.
  - **cuando** se confirma.
  - **entonces** el stock disponible se actualiza inmediatamente.
## Criterio de aceptación 004
  - **Dado que** se guarda un movimiento de entrada.
  - **cuando** se completa.
  - **entonces** queda registrado en el historial de entradas.
## Criterio de aceptación 005
  - **Dado que** se ingresa una cantidad negativa o no numérica.
  - **cuando** se envía el formulario.
  - **entonces** el sistema rechaza el registro.
