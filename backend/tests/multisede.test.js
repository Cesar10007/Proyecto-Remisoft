import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filtroRestaurante,
  sedesPermitidas,
  puedeEntrarSede,
} from '../src/utils/restaurante.js';

// Gerente multisede: la membresía habilita ENTRAR a otra sede, nunca ampliar la
// consulta. Estas pruebas corren sin BD a propósito: son la regla, no el entorno.
test('sedesPermitidas: superadmin no está limitado a una sede', () => {
  assert.equal(sedesPermitidas({ rol: 'SUPERADMIN', id_restaurante: null }), null);
  assert.equal(puedeEntrarSede({ rol: 'SUPERADMIN' }, 99), true);
});

test('sedesPermitidas: un gerente de una sola sede conserva el comportamiento anterior', () => {
  const gerente = { rol: 'GERENTE', id_restaurante: 3, sedes: [3] };
  assert.deepEqual(sedesPermitidas(gerente), [3]);
  assert.equal(puedeEntrarSede(gerente, 3), true);
  assert.equal(puedeEntrarSede(gerente, 4), false);
});

test('sedesPermitidas: gerente multisede puede entrar a cada una de sus sedes', () => {
  const gerente = { rol: 'GERENTE', id_restaurante: 7, sedes: [3, 7] };
  assert.deepEqual(sedesPermitidas(gerente).sort(), [3, 7]);
  assert.equal(puedeEntrarSede(gerente, 3), true);
  assert.equal(puedeEntrarSede(gerente, 7), true);
  assert.equal(puedeEntrarSede(gerente, 8), false, 'una sede ajena nunca es accesible');
});

test('sedesPermitidas: la sede activa siempre cuenta, aunque falte la membresía', () => {
  // Caso de datos migrados: el usuario ya opera en la sede pero la tabla de
  // membresías quedó incompleta. No se le puede dejar sin acceso de golpe.
  const gerente = { rol: 'GERENTE', id_restaurante: 5, sedes: [] };
  assert.deepEqual(sedesPermitidas(gerente), [5]);
  assert.equal(puedeEntrarSede(gerente, 5), true);
  assert.equal(puedeEntrarSede(gerente, 6), false);
});

test('sedesPermitidas: descarta ids inválidos que lleguen del cliente o de la BD', () => {
  const gerente = { rol: 'GERENTE', id_restaurante: 2, sedes: ['2', 0, -1, null, 'abc', 2.5, 4] };
  assert.deepEqual(sedesPermitidas(gerente), [2, 4]);
  assert.equal(puedeEntrarSede(gerente, 'abc'), false);
  assert.equal(puedeEntrarSede(gerente, 0), false);
});

test('puedeEntrarSede: un usuario sin sede ni membresías no entra a ninguna', () => {
  const usuario = { rol: 'MESERO', id_restaurante: null, sedes: [] };
  assert.deepEqual(sedesPermitidas(usuario), []);
  assert.equal(puedeEntrarSede(usuario, 1), false);
});

test('aislamiento: el filtro de consulta usa la sede ACTIVA, no la lista de sedes', () => {
  // La propiedad central del multisede: pertenecer a A y B no filtra por A y B.
  // Cada petición trabaja con una sola sede, sin importar cuántas membresías haya.
  const gerente = { rol: 'GERENTE', id_restaurante: 7, sedes: [3, 7] };
  assert.deepEqual(filtroRestaurante(gerente), { id_restaurante: 7 });
  assert.doesNotThrow(() => puedeEntrarSede(gerente, 3));
  assert.deepEqual(filtroRestaurante(gerente), { id_restaurante: 7 }, 'consultar otra sede no la cambia');
});

test('aislamiento: un multisede sin sede activa recibe 403 en vez de un comodín', () => {
  const gerente = { rol: 'GERENTE', id_restaurante: null, sedes: [3, 7] };
  assert.throws(() => filtroRestaurante(gerente), (err) => err.status === 403);
});
