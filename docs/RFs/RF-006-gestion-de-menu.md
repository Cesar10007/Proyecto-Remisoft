# RF-006 — Gestión del Menú

**Historias de usuario relacionadas**: HU-023, HU-024, HU-025, HU-026

**Tipo**: Requisito
**Prioridad**: Media / Deseado
**Fuente del requisito**: NA

## Descripción

El administrador podrá crear, modificar o eliminar platos del menú, definir precios, ingredientes, descripciones y disponibilidad.

Los cambios se reflejarán automáticamente en la interfaz de pedidos.

---

## Flujo del proceso

| Paso | Descripción |
| ---- | ----------- |
| 1    | El administrador ingresa un nuevo plato con nombre, descripción, precio, categoría e ingredientes con sus cantidades. |
| 2    | El sistema asocia el plato a una receta que será usada posteriormente para el descuento de inventario. |
| 3    | El plato queda disponible de inmediato en la interfaz de pedidos de meseros y clientes. |
| 4    | El administrador puede editar cualquier campo de un plato existente (precio, descripción, ingredientes). |
| 5    | Los cambios se reflejan de inmediato en todas las interfaces de pedidos. |
| 6    | El administrador puede marcar un plato como no disponible temporalmente (por falta de insumos). |
| 7    | Los platos no disponibles dejan de mostrarse en las interfaces de pedido hasta reactivarse. |

---

## Reglas de Negocio

| ID     | Regla |
| ------ | ----- |
| RN-001 | Todo plato debe tener nombre, precio, categoría e ingredientes con cantidades definidas. |
| RN-002 | Un plato no puede eliminarse si tiene pedidos históricos asociados; solo puede desactivarse. |
| RN-003 | Los platos marcados como no disponibles no deben aparecer en la interfaz de pedidos. |
| RN-004 | Todo cambio en un plato (precio, ingredientes, disponibilidad) debe registrar quién lo hizo y cuándo. |
| RN-005 | La receta de un plato determina el descuento automático de inventario definido en RF-004. |

---

## Inputs / Outputs

**Input** (crear plato):
{ "nombre": "string", "descripcion": "string", "precio": "decimal", "categoria": "string", "ingredientes": [ { "producto_id": "integer", "cantidad": "decimal" } ] }
