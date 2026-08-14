# HU-026 Ver el menú organizado por categorías con descripción y precio

| Campo | Valor |
|---|---|
| ID | HU-026 |
| Título | Ver el menú organizado por categorías con descripción y precio |
| Módulo | Gestión del Menú |
| Prioridad | Media |
| Estado | Prototipo visual |
| RF asociados | RF006 |

---

## Historia

**Como** Mesero/Cliente. **Necesito** ver el menú organizado por categorías con descripción y precio. **Con el objetivo de** para facilitar la toma de pedidos y la elección del cliente.

## Criterio de aceptación 001
  - **Dado que** El menú muestra categorías (Desayunos, Almuerzos, Bebidas, etc.).
  - **cuando** Cada plato muestra nombre, descripción, precio con IVA incluido.
  - **entonces** Los platos no disponibles no se muestran.
## Criterio de aceptación 002
  - **Dado que** un usuario consulta el menú.
  - **cuando** se carga.
  - **entonces** los platos se muestran organizados por categorías (Desayunos, Almuerzos, Bebidas, etc.).
## Criterio de aceptación 003
  - **Dado que** se muestra un plato.
  - **cuando** se visualiza.
  - **entonces** incluye nombre, descripción y precio con IVA incluido.
## Criterio de aceptación 004
  - **Dado que** un plato está marcado como no disponible.
  - **cuando** se carga el menú.
  - **entonces** no se muestra en la lista.
## Criterio de aceptación 005
  - **Dado que** una categoría no tiene platos disponibles.
  - **cuando** se consulta el menú.
  - **entonces** el sistema no muestra esa categoría vacía.
