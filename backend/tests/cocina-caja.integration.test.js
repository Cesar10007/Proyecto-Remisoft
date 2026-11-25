import test from 'node:test';
import assert from 'node:assert/strict';
import db from '../src/config/prisma.js';
import { escenarioEstablecimiento } from './fixtures/establecimiento.js';

test(
  'mesero → cocinero → caja: aislamiento por sede, pagos mixtos y recibos por parte',
  { skip: process.env.ESTABLECIMIENTO_DB_TEST !== '1' },
  async (t) => {
    const { altaGerente, api, tag, contrasena } = await escenarioEstablecimiento(t);
    const sedeA = await altaGerente('Cocina Alfa');
    const sedeB = await altaGerente('Cocina Beta');
    const post = (token, ruta, body) => api(token, ruta, 'POST', body, 201);

    async function altaPersonal(gerente, rol, id_rol, prefijo) {
      const email = `${prefijo}-${rol.toLowerCase()}-${tag}@example.test`;
      const alta = await post(gerente.token, '/usuarios', { id_rol, nombre: rol, email, contrasena });
      const sesion = await api(null, '/auth/login', 'POST', { email, contrasena });
      assert.equal(sesion.rol, rol);
      assert.equal(sesion.user.id_restaurante, gerente.id_restaurante);
      assert.equal(sesion.user.id_usuario, alta.data.id_usuario);
      return sesion;
    }

    const meseroA = await altaPersonal(sedeA, 'MESERO', 4, 'alfa');
    const cocineroA = await altaPersonal(sedeA, 'COCINERO', 6, 'alfa');
    const meseroB = await altaPersonal(sedeB, 'MESERO', 4, 'beta');
    const cocineroB = await altaPersonal(sedeB, 'COCINERO', 6, 'beta');
    const cajeroA = await altaPersonal(sedeA, 'CAJERO', 3, 'alfa');
    const cajeroB = await altaPersonal(sedeB, 'CAJERO', 3, 'beta');

    async function prepararSede(gerente, nombre) {
      await post(gerente.token, '/mesas', { numero: 1, capacidad: 4 });
      await post(gerente.token, '/ingredientes', { nombre: `Insumo ${nombre}`, unidad_medida: 'kg' });
      const [{ id_ingrediente }] = await api(gerente.token, '/ingredientes');
      await post(gerente.token, '/productos', { Nombre: `Plato ${nombre}`, precio_venta: 10000 });
      const [{ id_producto }] = await api(gerente.token, '/productos');
      await api(gerente.token, `/productos/${id_producto}/receta`, 'PUT', {
        ingredientes: [{ id_ingrediente, cantidad: 0.1 }],
      });
      await post(gerente.token, '/inventario/ajuste', {
        id_ingrediente, tipo: 'ENTRADA', cantidad: 10, motivo: 'Apertura de prueba',
      });
      return { id_producto };
    }

    const productoA = await prepararSede(sedeA, 'Alfa');
    const productoB = await prepararSede(sedeB, 'Beta');

    async function nuevaOrden(mesero, producto, items = [{ id_producto: producto.id_producto, cantidad: 1 }]) {
      const atencion = await api(mesero.token, '/salon/mesas/1/estado', 'PATCH', {
        estado: 'OCUPADA', comensales: 2,
      });
      return post(mesero.token, '/salon/pedidos', {
        mesa: 1, comensales: 2, id_atencion: atencion.id_atencion, items,
      });
    }

    const ordenA = await nuevaOrden(meseroA, productoA);
    const ordenB = await nuevaOrden(meseroB, productoB);
    const [detalleA] = (await db.detalle_pedido.findMany({
      where: { id_pedido: ordenA.id_pedido }, orderBy: { id_detalle: 'asc' },
    }));

    const comandasA = await api(cocineroA.token, '/cocina/comandas');
    const comandasB = await api(cocineroB.token, '/cocina/comandas');
    assert.deepEqual(comandasA.map((p) => p.id_pedido), [ordenA.id_pedido]);
    assert.deepEqual(comandasB.map((p) => p.id_pedido), [ordenB.id_pedido]);
    assert.deepEqual((await api(meseroA.token, '/cocina/comandas')).map((p) => p.id_pedido), [ordenA.id_pedido]);
    assert.deepEqual((await api(meseroB.token, '/cocina/comandas')).map((p) => p.id_pedido), [ordenB.id_pedido]);
    await api(cocineroB.token, `/cocina/items/${detalleA.id_detalle}/avanzar`, 'PATCH', { estado_item: 'PREPARANDO' }, 404);
    await api(cocineroA.token, `/cocina/items/${detalleA.id_detalle}/avanzar`, 'PATCH', { estado_item: 'LISTO' }, 409);
    await api(cocineroA.token, `/cocina/items/${detalleA.id_detalle}/avanzar`, 'PATCH', { estado_item: 'PREPARANDO' });
    await api(cocineroA.token, `/cocina/items/${detalleA.id_detalle}/avanzar`, 'PATCH', { estado_item: 'LISTO' });
    await api(meseroA.token, `/salon/pedidos/${ordenA.id_pedido}/cuenta`, 'POST', { version: 1 }, 409);
    await api(meseroA.token, `/cocina/items/${detalleA.id_detalle}/avanzar`, 'PATCH', { estado_item: 'ENTREGADO' });
    await api(cocineroA.token, `/cocina/items/${detalleA.id_detalle}/avanzar`, 'PATCH', { estado_item: 'ENTREGADO' }, 409);
    await api(meseroA.token, `/salon/pedidos/${ordenA.id_pedido}/cuenta`, 'POST', { version: 1 });
    const [detalleB] = await db.detalle_pedido.findMany({
      where: { id_pedido: ordenB.id_pedido }, orderBy: { id_detalle: 'asc' },
    });
    for (const estado_item of ['PREPARANDO', 'LISTO']) {
      await api(cocineroB.token, `/cocina/items/${detalleB.id_detalle}/avanzar`, 'PATCH', { estado_item });
    }
    await api(meseroB.token, `/cocina/items/${detalleB.id_detalle}/avanzar`, 'PATCH', { estado_item: 'ENTREGADO' });
    await api(meseroB.token, `/salon/pedidos/${ordenB.id_pedido}/cuenta`, 'POST', { version: 1 });

    await post(sedeA.token, '/cajas', { nombre: 'Caja prueba' });
    const [{ id_caja }] = await api(sedeA.token, '/cajas');
    const turno = await post(sedeA.token, '/turnos', {
      id_caja, id_usuario_cajero: cajeroA.user.id_usuario, efectivo_inicial: 50000,
    });
    const pendientesA = await api(cajeroA.token, '/cobro/pendientes');
    assert.ok(pendientesA.some((p) => p.id_pedido === ordenA.id_pedido));
    const pendientesB = await api(cajeroB.token, '/cobro/pendientes');
    assert.ok(pendientesB.some((p) => p.id_pedido === ordenB.id_pedido));
    assert.ok(!pendientesB.some((p) => p.id_pedido === ordenA.id_pedido));

    const totalA = pendientesA.find((p) => p.id_pedido === ordenA.id_pedido).total;
    assert.equal(totalA, 11900);
    await api(cajeroA.token, '/cobro/cerrar-cuenta', 'POST', {
      id_pedido: ordenA.id_pedido,
      version_factura: null,
      pagos: [
        { metodo: 'EFECTIVO', monto: 5000, monto_recibido: 6000 },
        { metodo: 'TARJETA', monto: 6900, referencia: 'voucher-mixto' },
      ],
    }, 201);
    const facturaA = await db.factura.findFirst({ where: { id_pedido: ordenA.id_pedido } });
    const pagosA = await db.pago.findMany({ where: { id_factura: facturaA.id_factura }, orderBy: { id_pago: 'asc' } });
    assert.deepEqual(pagosA.map((p) => [p.metodo, Number(p.monto), Number(p.cambio ?? 0)]), [
      ['EFECTIVO', 5000, 1000], ['TARJETA', 6900, 0],
    ]);
    assert.equal((await db.flujo_caja.count({ where: { pago: { id_factura: facturaA.id_factura } } })), 2);
    const arqueos = await api(sedeA.token, '/turnos/arqueos');
    assert.deepEqual([arqueos.data[0].ingresos, arqueos.data[0].esperado], [11900, 55000]);

    await post(sedeA.token, '/productos', { Nombre: 'Postre Alfa', precio_venta: 5000 });
    const productoExtra = (await api(sedeA.token, '/productos')).find((p) => p.Nombre === 'Postre Alfa').id_producto;
    const ordenProductos = await nuevaOrden(meseroA, productoA, [
      { id_producto: productoA.id_producto, cantidad: 1 },
      { id_producto: productoExtra, cantidad: 1 },
    ]);
    const detallesProductos = await db.detalle_pedido.findMany({
      where: { id_pedido: ordenProductos.id_pedido }, orderBy: { id_detalle: 'asc' },
    });
    for (const detalle of detallesProductos) {
      for (const estado_item of ['PREPARANDO', 'LISTO']) {
        await api(cocineroA.token, `/cocina/items/${detalle.id_detalle}/avanzar`, 'PATCH', { estado_item });
      }
      await api(meseroA.token, `/cocina/items/${detalle.id_detalle}/avanzar`, 'PATCH', { estado_item: 'ENTREGADO' });
    }
    await api(meseroA.token, `/salon/pedidos/${ordenProductos.id_pedido}/cuenta`, 'POST', { version: 1 });
    const cuentaProductos = (await api(cajeroA.token, '/cobro/pendientes')).find((p) => p.id_pedido === ordenProductos.id_pedido);
    await api(cajeroA.token, '/cobro/dividir-cuenta', 'POST', {
      id_pedido: ordenProductos.id_pedido,
      version_factura: null,
      modo: 'PRODUCTOS',
      partes: [{ items: [{ id_detalle: detallesProductos[0].id_detalle, cantidad: 1 }] }, { items: [] }],
    }, 422);
    const divisionProductos = await post(cajeroA.token, '/cobro/dividir-cuenta', {
      id_pedido: ordenProductos.id_pedido,
      version_factura: cuentaProductos.version_factura,
      modo: 'PRODUCTOS',
      partes: [
        { items: [{ id_detalle: detallesProductos[0].id_detalle, cantidad: 1 }] },
        { items: [{ id_detalle: detallesProductos[1].id_detalle, cantidad: 1 }] },
      ],
    });
    assert.deepEqual(divisionProductos.division.partes.map((p) => p.total), [11900, 5950]);
    const parte1 = divisionProductos.division.partes[0];
    const parte2 = divisionProductos.division.partes[1];
    const versionProductos = (await api(cajeroA.token, '/cobro/pendientes')).find((p) => p.id_pedido === ordenProductos.id_pedido).version_factura;
    const recibo1 = await api(cajeroA.token, `/cobro/partes/${parte1.id_parte}/pagar`, 'POST', {
      version_factura: versionProductos,
      pagos: [{ metodo: 'TARJETA', monto: parte1.total, referencia: 'parte-1' }],
    }, 201);
    assert.equal(recibo1.recibo.factura_pagada, false);
    assert.ok((await api(cajeroA.token, '/cobro/pendientes')).some((p) => p.id_pedido === ordenProductos.id_pedido));
    await api(cajeroA.token, `/cobro/partes/${parte2.id_parte}/pagar`, 'POST', {
      version_factura: versionProductos,
      pagos: [{ metodo: 'TRANSFERENCIA', monto: parte2.total }],
    }, 201);
    assert.equal(await db.factura.count({ where: { id_pedido: ordenProductos.id_pedido } }), 1);
    assert.equal(await db.pago.count({ where: { id_factura: facturaA.id_factura } }), 2);
    const facturaProductos = await db.factura.findFirst({ where: { id_pedido: ordenProductos.id_pedido } });
    assert.equal(facturaProductos.estado, 'PAGADA');
    assert.equal(await db.pago.count({ where: { id_factura: facturaProductos.id_factura } }), 2);

    const ordenIgual = await nuevaOrden(meseroA, productoA);
    const [detalleIgual] = await db.detalle_pedido.findMany({
      where: { id_pedido: ordenIgual.id_pedido }, orderBy: { id_detalle: 'asc' },
    });
    for (const estado_item of ['PREPARANDO', 'LISTO']) {
      await api(cocineroA.token, `/cocina/items/${detalleIgual.id_detalle}/avanzar`, 'PATCH', { estado_item });
    }
    await api(meseroA.token, `/cocina/items/${detalleIgual.id_detalle}/avanzar`, 'PATCH', { estado_item: 'ENTREGADO' });
    await api(meseroA.token, `/salon/pedidos/${ordenIgual.id_pedido}/cuenta`, 'POST', { version: 1 });
    const cuentaIgual = (await api(cajeroA.token, '/cobro/pendientes')).find((p) => p.id_pedido === ordenIgual.id_pedido);
    const divisionIgual = await post(cajeroA.token, '/cobro/dividir-cuenta', {
      id_pedido: ordenIgual.id_pedido,
      version_factura: cuentaIgual.version_factura,
      modo: 'IGUAL',
      numero_partes: 3,
    });
    assert.deepEqual(divisionIgual.division.partes.map((p) => p.total), [3966.67, 3966.67, 3966.66]);
    const versionIgual = (await api(cajeroA.token, '/cobro/pendientes')).find((p) => p.id_pedido === ordenIgual.id_pedido).version_factura;
    for (const [index, parteIgual] of divisionIgual.division.partes.entries()) {
      const pagos = index === 0
        ? [
            { metodo: 'EFECTIVO', monto: 2000, monto_recibido: 2500 },
            { metodo: 'TARJETA', monto: Number((parteIgual.total - 2000).toFixed(2)) },
          ]
        : [{ metodo: 'TRANSFERENCIA', monto: parteIgual.total }];
      const respuesta = await api(cajeroA.token, `/cobro/partes/${parteIgual.id_parte}/pagar`, 'POST', {
        version_factura: versionIgual,
        pagos,
      }, 201);
      assert.equal(respuesta.recibo.factura_pagada, index === 2);
    }
    const facturaIgual = await db.factura.findFirst({ where: { id_pedido: ordenIgual.id_pedido } });
    assert.equal(facturaIgual.estado, 'PAGADA');
    assert.equal(await db.pago.count({ where: { id_factura: facturaIgual.id_factura } }), 4);

    const bitacora = await api(cocineroB.token, '/cocina/historial');
    assert.ok(!bitacora.some((p) => p.id_pedido === ordenA.id_pedido || p.id_pedido === ordenProductos.id_pedido));
    await api(cajeroB.token, `/cobro/partes/${divisionProductos.division.partes[0].id_parte}/pagar`, 'POST', {
      version_factura: versionProductos,
      pagos: [{ metodo: 'TARJETA', monto: parte1.total }],
    }, 404);
    assert.ok(turno.data.id_turno);
  },
);
