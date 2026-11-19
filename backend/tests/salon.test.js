import test from 'node:test';
import assert from 'node:assert/strict';
import { leerLineas, estadoSegunItems, calcularTotales, itemsFacturables } from '../src/utils/salon.js';

test('una comanda requiere platos, cantidades enteras y renglones distintos', () => {
  for (const items of [
    null,
    [],
    [{ id_producto: 1, cantidad: 0 }],
    [{ id_producto: 1, cantidad: 1.5 }],
    [{ id_producto: -1, cantidad: 1 }],
    Array(2).fill({ id_detalle: 9, id_producto: 1, cantidad: 1 }),
  ]) {
    assert.throws(() => leerLineas(items), { status: 422 });
  }
  assert.deepEqual(leerLineas([{ id_producto: 1, cantidad: 2, nota: ' Sin sal ', precio_unitario: 1 }]), [
    { id_detalle: null, id_producto: 1, cantidad: 2, nota: 'Sin sal' },
  ]);
});

test('el pedido solo queda entregado al servir el último plato', () => {
  for (const [estados, esperado] of [
    [[], 'ABIERTO'],
    [['PENDIENTE'], 'ABIERTO'],
    [['PENDIENTE', 'LISTO'], 'EN_PREPARACION'],
    [['ENTREGADO', 'PENDIENTE'], 'EN_PREPARACION'],
    [['ENTREGADO', 'LISTO'], 'LISTO'],
    [['ENTREGADO'], 'ENTREGADO'],
  ])
    assert.equal(estadoSegunItems(estados), esperado);
});

test('la precuenta no factura renglones cancelados y coincide con caja', () => {
  const items = itemsFacturables([
    { Cantidad: 2, Precio_unitario: '1000.50', estado_item: 'LISTO' },
    { Cantidad: 3, Precio_unitario: 10000, estado_item: 'CANCELADO' },
  ]);
  const totales = calcularTotales(items);
  assert.equal(totales.subtotal, 2001);
  assert.equal(totales.total, totales.subtotal + totales.iva);
});
