# RF-003 — Facturación Automatizada

**Historias de usuario relacionadas**: HU-011, HU-012, HU-013, HU-014

**Tipo**: Requisito
**Prioridad**: Alta / Esencial
**Fuente del requisito**: NA

## Descripción

El sistema deberá generar de forma automática facturas digitales y físicas que incluyan el detalle completo de los productos consumidos, precios unitarios, impuestos aplicados, métodos de pago utilizados y cualquier cargo adicional configurado por el establecimiento.

Así mismo, el sistema deberá registrar cada factura emitida en el historial de ventas, permitiendo posteriormente su consulta por parte del administrador y del personal autorizado del área contable.

Finalmente, el sistema deberá garantizar la trazabilidad de cada transacción, asociando la factura al pedido correspondiente y almacenando toda la información necesaria para auditorías internas o revisiones fiscales.

---

## Flujo del proceso

| Paso | Descripción |
| ---- | ----------- |
| 1    | El cajero cierra un pedido desde el módulo de pedidos en salón o domicilios. |
| 2    | El sistema genera automáticamente la factura con el detalle de productos, subtotal, impuestos y total. |
| 3    | El cajero selecciona el método de pago (efectivo, tarjeta, transferencia). |
| 4    | Si el pago es en efectivo, el sistema calcula el cambio a entregar. |
| 5    | La factura se asocia al pedido de origen, garantizando la trazabilidad completa. |
| 6    | La factura queda almacenada en el historial de ventas para su consulta posterior. |
| 7    | El administrador o personal contable puede consultar el historial aplicando filtros de fecha, monto o estado. |

---

## Reglas de Negocio

| ID     | Regla |
| ------ | ----- |
| RN-001 | Toda factura debe estar asociada a un único pedido de origen. |
| RN-002 | La factura debe incluir de forma obligatoria: productos, precios unitarios, subtotal, impuestos y total. |
| RN-003 | El método de pago debe registrarse junto con la factura al momento de emitirla. |
| RN-004 | Una factura emitida no puede editarse; solo puede anularse mediante un proceso auditado. |
| RN-005 | Toda factura debe cumplir con la normativa DIAN vigente en Colombia (numeración, CUFE en la versión electrónica). |
| RN-006 | El historial de facturas debe permitir filtrado por fecha, mesero, mesa/domicilio y estado (pagada/anulada). |

---

## Inputs / Outputs

**Input** (generar factura desde pedido):
{ "pedido_id": "integer", "metodo_pago": "string", "monto_recibido": "decimal" }
