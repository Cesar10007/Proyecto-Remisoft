# RF-005 — Gestión de Pedidos a Domicilio

**Historias de usuario relacionadas**: HU-019, HU-020, HU-021, HU-022

**Tipo**: Requisito
**Prioridad**: Alta / Esencial
**Fuente del requisito**: NA

## Descripción

El sistema permitirá a los clientes realizar pedidos a domicilio a través de la plataforma web.

Se registrará la dirección de entrega, método de pago, estado del pedido (pendiente, en preparación, en entrega, entregado) y el tiempo estimado.

El personal podrá actualizar el progreso del pedido en tiempo real.

---

## Flujo del proceso

| Paso | Descripción |
| ---- | ----------- |
| 1    | El cliente selecciona productos, ingresa la dirección de entrega y elige el método de pago. |
| 2    | El sistema registra el pedido con estado `pendiente` y calcula un tiempo estimado de entrega. |
| 3    | Cocina prepara el pedido y actualiza el estado a `en preparación`. |
| 4    | El sistema asigna el pedido a un repartidor disponible. |
| 5    | El repartidor actualiza el estado a `en entrega` al salir del restaurante. |
| 6    | El cliente visualiza el estado del pedido en tiempo real desde su sesión. |
| 7    | El repartidor marca el pedido como `entregado` al completar la entrega, pudiendo registrar observaciones. |
| 8    | El administrador supervisa todos los domicilios activos desde un panel central. |

---

## Reglas de Negocio

| ID     | Regla |
| ------ | ----- |
| RN-001 | Todo pedido a domicilio debe incluir dirección de entrega y método de pago válidos. |
| RN-002 | Los estados posibles del pedido son: `pendiente`, `en preparación`, `en entrega`, `entregado`. |
| RN-003 | Un pedido solo puede avanzar de estado en el orden definido, sin saltos. |
| RN-004 | Un repartidor solo puede actualizar el estado de los domicilios que tiene asignados. |
| RN-005 | El tiempo estimado de entrega se recalcula si el pedido presenta demoras en preparación. |
| RN-006 | El administrador puede reasignar un domicilio a otro repartidor en caso de incidencias. |

---

## Inputs / Outputs

**Input** (crear pedido a domicilio):
{ "cliente_id": "integer", "productos": [ { "producto_id": "integer", "cantidad": "integer" } ], "direccion": "string", "metodo_pago": "string" }
