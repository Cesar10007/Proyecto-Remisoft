import test from 'node:test';
import assert from 'node:assert/strict';
import db from '../src/config/prisma.js';
import { escenarioEstablecimiento } from './fixtures/establecimiento.js';

// Operación completa, sin usuarios, recetas, stock, pedidos ni turnos de la demo.
test('jornada de un negocio nuevo: gerencia → salón → cocina → caja → arqueo',
  { skip: process.env.ESTABLECIMIENTO_DB_TEST !== '1' }, async (t) => {
    const { altaGerente, api, llamar, tag, contrasena } = await escenarioEstablecimiento(t);
    const gerente = await altaGerente('Arepería'), otra = await altaGerente('Panadería');
    const g = gerente.token, b = otra.token;
    const post = (token, ruta, body) => api(token, ruta, 'POST', body, 201);
    const mesas = async token => (await api(token, '/mesas')).data;
    assert.deepEqual(await mesas(g), []);

    async function altaPersonal(rol, id_rol) {
      const email = `${rol.toLowerCase()}-${tag}@example.test`;
      const { data } = await post(g, '/usuarios', { id_rol, nombre: rol, email, contrasena });
      const sesion = await api(null, '/auth/login', 'POST', { email, contrasena });
      assert.equal(sesion.rol, rol);
      assert.equal(sesion.user.id_usuario, data.id_usuario);
      assert.equal(sesion.user.id_restaurante, gerente.id_restaurante);
      return sesion;
    }
    const mesero = await altaPersonal('MESERO', 4), cajero = await altaPersonal('CAJERO', 3);
    const m = mesero.token, c = cajero.token;
    const mesa = { numero: 1, capacidad: 4 };
    await post(b, '/mesas', { ...mesa, capacidad: 2 }); // El mismo número en otro restaurante.
    await post(b, '/ingredientes', { nombre: 'Harina ajena', unidad_medida: 'kg' });
    const [otroInsumo] = await api(b, '/ingredientes');
    await post(b, '/inventario/ajuste', { id_ingrediente: otroInsumo.id_ingrediente, tipo: 'ENTRADA', cantidad: 8, motivo: 'Fondo propio' });
    const antes = await mesas(b);
    const stockAjeno = await api(b, `/inventario/${otroInsumo.id_ingrediente}`);

    await post(g, '/mesas', mesa);
    await api(g, '/mesas', 'POST', mesa, 409);
    await api(g, '/mesas/0', 'DELETE', undefined, 422);
    await post(g, '/ingredientes', { nombre: 'Masa', unidad_medida: 'kg', stock_minimo: 1 });
    const [{ id_ingrediente }] = await api(g, '/ingredientes');
    await post(g, '/productos', { Nombre: 'Arepa', precio_venta: 10000 });
    const [{ id_producto }] = await api(g, '/productos');
    const receta = `/productos/${id_producto}/receta`;
    const ingrediente = { id_ingrediente, cantidad: 0.25 };
    await api(g, receta, 'PUT', { ingredientes: [ingrediente] });
    const entrada = { id_ingrediente, tipo: 'ENTRADA', cantidad: 10, motivo: 'Conteo al abrir' };

    await t.test('permisos, ingredientes propios y receta atómica', async () => {
      for (const token of [m, c]) {
        await api(token, '/mesas', 'POST', { numero: 2, capacidad: 2 }, 403);
        await api(token, '/mesas/1', 'DELETE', undefined, 403);
        await api(token, receta, 'PUT', { ingredientes: [] }, 403);
        await api(token, '/inventario/ajuste', 'POST', entrada, 403);
      }
      await api(b, receta, 'GET', undefined, 404);
      await api(b, receta, 'PUT', { ingredientes: [] }, 404);
      for (const ingredientes of [[ingrediente, ingrediente], [{ ...ingrediente, cantidad: 0.0001 }],
        [ingrediente, { ...ingrediente, id_ingrediente: otroInsumo.id_ingrediente }]]) {
        await api(g, receta, 'PUT', { ingredientes }, 422);
      }
      assert.deepEqual((await api(g, receta)).data.map(i => [i.id_ingrediente, i.cantidad]), [[id_ingrediente, 0.25]]);
    });

    const urlEstado = '/salon/mesas/1/estado';
    const { id_atencion } = await api(m, urlEstado, 'PATCH', { estado: 'OCUPADA', comensales: 2 });
    await api(g, '/mesas/1', 'DELETE', undefined, 409); // Sentados, aún sin pedido.
    const comanda = cantidad => ({ mesa: 1, comensales: 2, items: [{ id_producto, cantidad }] });
    const sinStock = await api(m, '/salon/pedidos', 'POST', { ...comanda(2), id_atencion }, 409);
    assert.equal(sinStock.code, 'STOCK_INSUFICIENTE');
    assert.deepEqual(await api(g, '/pedidos'), []);
    const compra = (await post(g, '/inventario/ajuste', entrada)).data;
    assert.equal(compra.id_usuario, gerente.id_usuario);
    assert.equal(compra.id_restaurante, gerente.id_restaurante);
    const inventario = async () => (await api(g, `/inventario/${id_ingrediente}`)).data;
    assert.equal((await inventario()).stock_actual, 10);

    async function servir(cantidad, atencion) {
      const { id_pedido } = await post(m, '/salon/pedidos', { ...comanda(cantidad), id_atencion: atencion });
      await api(g, '/mesas/1', 'PUT', { capacidad: 12 }, 409);
      await api(g, '/mesas/1', 'DELETE', undefined, 409); // Ahora el bloqueo es el pedido.
      const [orden] = await api(m, '/cocina/comandas');
      assert.equal(orden.id_pedido, id_pedido);
      assert.equal(orden.items[0].cantidad, cantidad);
      for (const estado_item of ['PREPARANDO', 'LISTO', 'ENTREGADO']) {
        await api(m, `/cocina/items/${orden.items[0].id_detalle}/avanzar`, 'PATCH', { estado_item });
      }
      await api(m, `/salon/pedidos/${id_pedido}/cuenta`, 'POST', { version: 1 });
      const [pendiente] = await api(c, '/cobro/pendientes');
      assert.equal(pendiente.id_pedido, id_pedido);
      assert.equal(pendiente.total, 11900 * cantidad);
      return id_pedido;
    }
    const primero = await servir(2, id_atencion);
    assert.equal((await inventario()).stock_actual, 9.5);
    const cobro = '/cobro/cerrar-cuenta';
    const pago = { id_pedido: primero, metodo: 'EFECTIVO', monto_recibido: 30000 };
    await api(m, cobro, 'POST', pago, 403);
    await api(c, cobro, 'POST', pago, 409); // Sin turno no hay ni pago ni liberación de mesa.
    await api(g, '/mesas/1', 'DELETE', undefined, 409);
    await post(g, '/cajas', { nombre: 'Mostrador' });
    const [{ id_caja }] = await api(g, '/cajas');
    const { data: { id_turno } } = await post(g, '/turnos', { id_caja, id_usuario_cajero: cajero.user.id_usuario, efectivo_inicial: 50000 });
    await api(c, cobro, 'POST', { ...pago, monto_recibido: 20000 }, 422);
    const { factura } = await post(c, cobro, pago);
    assert.equal(factura.total, 23800);
    assert.equal(factura.cambio, 6200);
    await api(c, cobro, 'POST', pago, 409);
    assert.equal((await inventario()).stock_actual, 9.5);
    assert.equal((await mesas(g))[0].ocupada, false);

    const segundo = await servir(1);
    await post(c, cobro, { id_pedido: segundo, metodo: 'TARJETA', referencia: 'Voucher jornada' });
    assert.deepEqual(await api(c, '/cobro/pendientes'), []);
    const fin = await inventario();
    assert.equal(fin.stock_actual, 9.25);
    const asientos = (await api(g, `/historial?id_ingrediente=${id_ingrediente}`)).data;
    assert.deepEqual(asientos.map(h => [h.movimiento.tipo, Number(h.movimiento.cantidad), h.movimiento.origen, h.movimiento.origen_id, h.id_actor]), [
      ['SALIDA', 0.25, 'PEDIDO', segundo, mesero.user.id_usuario],
      ['SALIDA', 0.5, 'PEDIDO', primero, mesero.user.id_usuario],
      ['ENTRADA', 10, 'AJUSTE', null, gerente.id_usuario],
    ]);
    const flujos = await db.flujo_caja.findMany({ where: { id_turno }, orderBy: { id_flujo: 'asc' }, include: { pago: true } });
    assert.deepEqual(flujos.map(f => [f.metodo, Number(f.ingresos), Number(f.saldo), f.pago.id_usuario_cajero]), [
      ['EFECTIVO', 23800, 73800, cajero.user.id_usuario], ['TARJETA', 11900, 85700, cajero.user.id_usuario],
    ]);
    const [arqueo] = (await api(g, '/turnos/arqueos')).data;
    assert.deepEqual([arqueo.ingresos, arqueo.esperado], [35700, 73800]);
    const cierre = `/turnos/${id_turno}/cerrar`;
    const { data: cerrado } = await api(g, cierre, 'POST', { efectivo_real: 73800 });
    assert.deepEqual([cerrado.estado, Number(cerrado.efectivo_esperado), Number(cerrado.diferencia)], ['CERRADA', 73800, 0]);
    await api(g, cierre, 'POST', { efectivo_real: 0 }, 409);

    await api(g, `/mesas/1?id_restaurante=${otra.id_restaurante}`, 'DELETE');
    assert.deepEqual(await mesas(g), []);
    await api(g, '/mesas/1', 'DELETE', undefined, 404);
    assert.deepEqual((await api(g, '/pedidos')).map(p => [p.Mesa_num, p.estado]), [[1, 'CERRADO'], [1, 'CERRADO']]);
    assert.equal((await api(g, '/facturas')).data.length, 2);
    const ventas = (await api(g, '/reportes/ventas-diarias')).data;
    assert.deepEqual([ventas.total.total_pedidos, ventas.total.ingresos_brutos, ventas.productos_top[0].unidades], [2, 35700, 3]);
    assert.deepEqual(await mesas(b), antes);
    assert.deepEqual(await api(b, `/inventario/${otroInsumo.id_ingrediente}`), stockAjeno);
    assert.equal((await api(b, '/reportes/ventas-diarias')).data.total.ingresos_brutos, 0);
    assert.deepEqual((await api(b, '/turnos/arqueos')).data, []);

    await t.test('libro y cierre de turno quedan en la sede correcta, con los operadores reales', async () => {
      for (const [area, estado] of [['COCINA','PREPARANDO'], ['COCINA','LISTO'], ['MESEROS','ENTREGADO']]) {
        const historial = (await api(g, `/historial?grupo=${area}`)).data;
        assert.ok(historial.every(h => h.grupo === area));
        assert.ok(historial.some(h => h.entidad === 'Detalle de pedido' && h.despues?.endsWith(estado) && h.id_actor === mesero.user.id_usuario));
      }
      const libro = (await api(g, '/turnos/movimientos')).data;
      assert.deepEqual(libro.map(f => [f.id_turno, f.metodo, Number(f.ingresos), Number(f.saldo)]),
        [[id_turno,'TARJETA',11900,85700],[id_turno,'EFECTIVO',23800,73800]]);
      assert.deepEqual((await api(b, '/turnos/movimientos')).data, []);
      const eventos = (await api(g, '/historial')).data;
      for (const [entidad, id] of [['Turno',gerente.id_usuario],['Movimiento de caja',cajero.user.id_usuario],['Pago',cajero.user.id_usuario],['Inventario',mesero.user.id_usuario],['Detalle de pedido',mesero.user.id_usuario]]) {
        assert.ok(eventos.some(e => e.entidad === entidad && e.id_actor === id && e.id_restaurante === gerente.id_restaurante), entidad);
      }
      assert.ok(eventos.some(e => e.entidad === 'Turno' && e.despues?.includes('CERRADA') && e.id_actor === gerente.id_usuario));
    });
    await t.test('eliminar y abrir una misma mesa simultáneamente nunca deja una cuenta sin mesa', async () => {
      await post(g, '/mesas', mesa);
      const [borrar, abrir] = await Promise.all([llamar(g, '/mesas/1', 'DELETE'), llamar(m, '/salon/pedidos', 'POST', comanda(1))]);
      if (borrar.status === 200) {
        assert.equal(abrir.status, 404);
        assert.deepEqual(await mesas(g), []);
        assert.equal((await inventario()).stock_actual, 9.25);
      } else {
        assert.equal(borrar.status, 409); assert.equal(abrir.status, 201);
        assert.equal((await mesas(g))[0].ocupada, true);
        await api(m, `/salon/pedidos/${abrir.result.id_pedido}`, 'DELETE', { version: 1 });
        assert.equal((await inventario()).stock_actual, 9.25);
        await api(g, '/mesas/1', 'DELETE');
      }
    });
  });
