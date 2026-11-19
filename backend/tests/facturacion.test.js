import test from 'node:test';
import assert from 'node:assert/strict';
import { importesFactura, consumoFacturado } from '../src/utils/facturacion.js';
import { conPago } from '../src/utils/salon.js';

const items = [{ cantidad: 2, precio_unitario: 1000.5 }];
test('factura: centavos, descuento antes del IVA y propina no gravada', () => {
  assert.deepEqual(importesFactura(items, 201, 100.25, 0.19), {
    Descuento: 201,
    Propina: 100.25,
    IVA: 342,
    total: 2242.25,
  });
  assert.equal(importesFactura(items, 2001, 0, 0.19).total, 0);
  assert.equal(importesFactura([{ cantidad: 1, precio_unitario: 0.5 }], 0, 0, 0.19).IVA, 0.1);
  assert.equal(importesFactura([{ cantidad: 1, precio_unitario: 0.5 }], 0, 0, 0.29).IVA, 0.15);
});
test('una factura no admite importes negativos, ambiguos, fuera de rango ni sin artículos', () => {
  for (const valor of [-1, 0.001, '10COP', null, false, {}, 'NaN', Infinity, 100000000]) {
    assert.throws(() => importesFactura(items, 0, valor), { status: 422 });
  }
  assert.throws(() => importesFactura(items, 2001.01), { status: 422 });
  assert.throws(() => importesFactura([], 0, 0), { status: 422 });
});
test('la lectura usa renglones del propio pedido y conserva los valores facturados, incluido precio cero', () => {
  const i = {
    id_detalle_pedido: 9,
    cantidad_facturada: 1,
    nombre_producto: 'Cortesía',
    precio_unitario: 0,
    Detalle_pedido: { id_pedido: 3, Precio_unitario: 8000, Producto: { Nombre: 'Nombre nuevo' } },
  };
  assert.deepEqual(
    consumoFacturado({ id_pedido: 3, Factura_item: [i, { ...i, Detalle_pedido: { id_pedido: 7 } }] }),
    [{ id_detalle: 9, cantidad: 1, nombre: 'Cortesía', precio_unitario: 0 }],
  );
});
test('el pago efectivo bloquea incluso una cabecera histórica; un intento rechazado no es un pago', () => {
  assert.equal(conPago({ estado: 'PAGADA', pago: [] }), true);
  assert.equal(conPago({ estado: 'EMITIDA', pago: [{ estado: 'APROBADO' }] }), true);
  assert.equal(conPago({ estado: 'PENDIENTE', pago: [{ estado: 'RECHAZADO' }] }), false);
});
