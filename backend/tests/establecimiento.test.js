import test from 'node:test';
import assert from 'node:assert/strict';
import { filtroRestaurante } from '../src/utils/restaurante.js';
import { alcanceMesero } from '../src/utils/salon.js';

test('la ausencia de sede no convierte a un empleado en lector global', () => {
  for (const id_restaurante of [null, undefined, 0, -1]) {
    assert.throws(() => filtroRestaurante({ rol: 'GERENTE', id_restaurante }), { status: 403 });
  }
  assert.deepEqual(filtroRestaurante({ rol: 'SUPERADMIN', id_restaurante: null }), {});
  assert.deepEqual(filtroRestaurante({ rol: 'SUPERADMIN', id_restaurante: 8 }), { id_restaurante: 8 });
});

test('el filtro de mesero restringe sus cuentas sin quitar la sede a los demás roles', () => {
  const user = { id_restaurante: 8, id_usuario: 7 };
  assert.deepEqual(alcanceMesero({ ...user, rol: 'GERENTE' }), { id_restaurante: 8 });
  assert.deepEqual(alcanceMesero({ ...user, rol: 'MESERO' }), { id_restaurante: 8, id_mesero: 7 });
});
