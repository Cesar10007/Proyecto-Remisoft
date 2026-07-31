# RF-004 — Control de Inventario

**Historias de usuario relacionadas**: HU-015, HU-016, HU-017, HU-018

**Tipo**: Requisito
**Prioridad**: Media / Deseado
**Fuente del requisito**: NA

## Descripción

El sistema deberá mantener un control en tiempo real del inventario de productos e insumos, actualizando automáticamente las existencias con base en las ventas registradas.

Deberá descontar de forma automática los ingredientes asociados a cada plato vendido, utilizando como referencia las recetas y proporciones previamente configuradas por el administrador.

Asimismo, el sistema deberá registrar cualquier ingreso de nuevo stock, modificando las cantidades disponibles y permitiendo al personal autorizado (administrador o encargado de inventario) verificar la trazabilidad de los movimientos, como entradas, salidas y consumos operativos.

Finalmente, el sistema deberá emitir alertas o notificaciones cuando los niveles de inventario lleguen a umbrales mínimos definidos, facilitando la toma de decisiones para abastecimiento oportuno.

---

## Flujo del proceso

| Paso | Descripción |
| ---- | ----------- |
| 1    | Se confirma un pedido en el módulo de ventas (salón o domicilio). |
| 2    | El sistema consulta la receta del plato y descuenta automáticamente los ingredientes correspondientes. |
| 3    | El movimiento de salida queda registrado con fecha, producto, cantidad y pedido asociado. |
| 4    | El administrador o encargado de inventario registra el ingreso de nuevo stock (compras a proveedores). |
| 5    | El sistema actualiza el stock disponible de forma inmediata. |
| 6    | El sistema verifica continuamente el nivel de cada producto contra su umbral mínimo configurado. |
| 7    | Si un producto llega al umbral mínimo, el sistema genera una alerta visible en el panel del administrador. |
| 8    | El administrador puede consultar el historial completo de movimientos (entradas, salidas, mermas) con filtros. |

---

## Reglas de Negocio

| ID     | Regla |
| ------ | ----- |
| RN-001 | El descuento de inventario es automático y se basa en la receta configurada para cada plato. |
| RN-002 | Todo movimiento de inventario (entrada o salida) debe quedar registrado con fecha, cantidad y responsable. |
| RN-003 | Cada producto debe tener un umbral mínimo configurable por el administrador. |
| RN-004 | El sistema debe alertar cuando el stock de un producto sea igual o menor a su umbral mínimo. |
| RN-005 | No se puede confirmar un pedido si no hay stock suficiente de un ingrediente requerido. |
| RN-006 | El historial de movimientos debe ser exportable para auditorías internas. |

---

## Inputs / Outputs

**Input** (registrar ingreso de stock):
{ "producto_id": "integer", "cantidad": "decimal", "proveedor": "string", "fecha": "date" }
