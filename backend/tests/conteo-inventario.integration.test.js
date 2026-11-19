import test from 'node:test';
import assert from 'node:assert/strict';
import { escenarioEstablecimiento } from './fixtures/establecimiento.js';

test('editar stock actual concilia un total con el historial de su sede',
  { skip: process.env.ESTABLECIMIENTO_DB_TEST !== '1' }, async t => {
    const { altaGerente, api, llamar, tag, contrasena } = await escenarioEstablecimiento(t);
    const g = await altaGerente('Conteo'), otra = await altaGerente('Otra');
    const ficha = { nombre: 'Carne', unidad_medida: 'KG', stock_minimo: 20, costo_unitario_ref: 18000.25 };
    await api(g.token, '/ingredientes', 'POST', ficha, 201);
    const [{ id_ingrediente }] = await api(g.token, '/ingredientes');
    const ruta = `/ingredientes/${id_ingrediente}`;
    const leer = async () => (await api(g.token, `/inventario/${id_ingrediente}`)).data;
    const editar = (cambios, status = 200) => api(g.token, ruta, 'PUT', { ...ficha, ...cambios }, status);
    const motivo = 'Conteo físico de bodega';
    await api(g.token, '/inventario/ajuste', 'POST', { id_ingrediente, tipo: 'ENTRADA', cantidad: 19.6, motivo: 'Existencias al abrir' }, 201);
    const antes = await leer();
    const conteo = { stock_esperado: antes.stock_actual, stock_actual: '20', motivo };

    await t.test('rechaza fichas ajenas, roles de lectura y cantidades o motivos inválidos sin escrituras', async () => {
      const email = `caja-conteo-${tag}@example.test`;
      await api(g.token, '/usuarios', 'POST', { nombre: 'Cajera', email, contrasena, id_rol: 3 }, 201);
      const cajera = await api(null, '/auth/login', 'POST', { email, contrasena });
      await api(cajera.token, ruta, 'PUT', { ...ficha, ...conteo }, 403);
      await api(otra.token, ruta, 'PUT', { ...ficha, ...conteo }, 404);
      for (const stock_actual of [-1, 1.0001, '10000000', null, '', false]) {
        await editar({ ...conteo, stock_actual, nombre: 'No guardar' }, 422);
      }
      await editar({ ...conteo, stock_esperado: undefined }, 422);
      await editar({ ...conteo, motivo: '    ' }, 422);
      assert.deepEqual(await leer(), antes);
    });

    await t.test('persiste solo la diferencia, admite cero y no crea movimientos por editar la ficha', async () => {
      assert.equal((await editar(conteo)).stock_actual, 20);
      const [fila] = (await api(g.token, '/inventario')).data;
      assert.equal(fila.stock_actual, 20);
      assert.equal(Number(fila.stock_minimo), 20); // El mínimo no se confundió con el saldo al abrir (19.6).
      assert.equal(fila.stock_bajo, true); // En RemiSoft se alerta también al alcanzar el mínimo.
      const { historial_movimientos: [entrada, original] } = await leer();
      assert.deepEqual(original, antes.historial_movimientos[0]);
      assert.deepEqual([entrada.tipo_movimiento, Number(entrada.cantidad), entrada.origen_tipo, entrada.id_usuario,
        entrada.id_restaurante, entrada.observaciones], ['ENTRADA', 0.4, 'AJUSTE', g.id_usuario, g.id_restaurante, motivo]);
      // El mismo valor (incluido el envío explícito), o editar solo el mínimo y el costo, no duplica movimientos.
      await editar({ stock_esperado: 20, stock_actual: 20 });
      await editar({ stock_minimo: 3.25, costo_unitario_ref: 19000.5 });
      assert.equal((await leer()).movimientos, 2);
      await editar({ ...conteo, nombre: 'Ficha obsoleta' }, 409);
      const trasConflicto = await leer();
      assert.equal(trasConflicto.stock_actual, 20);
      assert.equal(trasConflicto.nombre, ficha.nombre);
      assert.equal(Number(trasConflicto.stock_minimo), 3.25);
      assert.equal(Number(trasConflicto.costo_unitario_ref), 19000.5); // rollback de todos los campos
      await editar({ stock_esperado: 20, stock_actual: 0, motivo });
      const fin = await leer();
      assert.equal(fin.stock_actual, 0);
      assert.equal(Number(fin.stock_minimo), 20);
      assert.deepEqual(fin.historial_movimientos.map(m => [m.tipo_movimiento, Number(m.cantidad)]), [['SALIDA', 20], ['ENTRADA', 0.4], ['ENTRADA', 19.6]]);
      assert.equal((await api(g.token, '/inventario/alertas/stock-bajo')).data[0].alerta, 'SIN STOCK');
    });

    await t.test('dos ediciones simultáneas sobre el mismo saldo no pisan el conteo ganador', async () => {
      const enviar = n => llamar(g.token, ruta, 'PUT', { ...ficha, nombre: `Conteo ${n}`, stock_actual: n, stock_esperado: 0, motivo });
      const respuestas = await Promise.all([enviar(1.001), enviar(2.222)]);
      assert.deepEqual(respuestas.map(r => r.status).sort(), [200, 409]);
      const ganador = respuestas.find(r => r.status === 200).result.stock_actual;
      const fin = await leer();
      assert.equal(fin.stock_actual, ganador);
      assert.equal(fin.nombre, `Conteo ${ganador}`);
      assert.equal(fin.movimientos, 4);
    });
  });
