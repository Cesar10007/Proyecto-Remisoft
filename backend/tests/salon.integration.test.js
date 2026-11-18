import test from 'node:test';
import assert from 'node:assert/strict';
import { randomInt, randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import db from '../src/config/prisma.js';

// Usa una base de pruebas migrada, sin necesitar datos.sql. No ejecuta truncates ni toca mesas reales.
test(
  'salón → cocina → entrega → caja → factura, con concurrencia e inventario reales',
  { skip: process.env.SALON_DB_TEST !== '1' },
  async (t) => {
    assert.match(process.env.DB_DATABASE, /_test$/, 'Usa una base aislada con sufijo _test');
    const tag = randomUUID();
    const sede = await db.restaurante.create({ data: { nombre: `Salón de prueba ${tag}` } });
    const sitio = { id_restaurante: sede.id_restaurante };
    const mesa = await db.mesa.create({ data: { ...sitio, numero: randomInt(1000000, 2000000000), capacidad: 4 } });
    const segundaMesa = await db.mesa.create({
      data: { ...sitio, numero: randomInt(1000000, 2000000000), capacidad: 4 },
    });
    const usuario = async (nombre) =>
      db.usuario.create({ data: { ...sitio, id_rol: (await db.rol.findUniqueOrThrow({ where: { nombre } })).id_rol, nombre } });
    const mesero = await usuario('MESERO'),
      colega = await usuario('MESERO'),
      cajero = await usuario('CAJERO'),
      gerente = await usuario('GERENTE');
    const caja = await db.caja.create({ data: { ...sitio, nombre: 'Prueba' } });
    const ingrediente = await db.ingrediente.create({ data: { ...sitio, nombre: 'Insumo de prueba' } });
    const insumo = { id_ingrediente: ingrediente.id_ingrediente };
    const producto = await db.producto.create({
      data: { ...sitio, Nombre: 'Plato de prueba', precio_venta: 1000, Estado: 1 },
    });
    const productoId = { id_producto: producto.id_producto };
    await db.receta.create({ data: { ...insumo, ...productoId, Cantidad_necesaria: 1 } });
    await db.inventario_mov.create({
      data: { ...insumo, ...sitio, tipo_movimiento: 'ENTRADA', cantidad: 5 },
    });
    const stock = async () =>
      (await db.inventario_mov.findMany({ where: insumo })).reduce(
        (n, m) => n + (m.tipo_movimiento === 'SALIDA' ? -1 : 1) * Number(m.cantidad),
        0,
      );
    const server = app.listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    t.after(async () => {
      await new Promise((resolve) => server.close(resolve));
      const pedido = { pedido: sitio };
      await db.flujo_caja.deleteMany({ where: { turno_caja: sitio } });
      await db.pago.deleteMany({ where: { Factura: pedido } });
      await db.factura_item.deleteMany({ where: { Factura: pedido } });
      await db.factura.deleteMany({ where: pedido });
      await db.detalle_pedido.deleteMany({ where: pedido });
      await db.pedido.deleteMany({ where: sitio });
      await db.inventario_mov.deleteMany({ where: insumo });
      await db.receta.deleteMany({ where: insumo });
      await db.ingrediente.delete({ where: insumo });
      await db.producto.delete({ where: productoId });
      await db.turno_caja.deleteMany({ where: sitio });
      await db.caja.delete({ where: { id_caja: caja.id_caja } });
      await db.mesa_atencion.deleteMany({ where: sitio });
      await db.usuario.deleteMany({ where: sitio });
      await db.mesa.deleteMany({ where: { id_mesa: { in: [mesa.id_mesa, segundaMesa.id_mesa] } } });
      await db.restaurante.delete({ where: sitio });
      await db.$disconnect();
    });
    const pedir = async (u, method, path, body) => {
      const r = await fetch(`http://127.0.0.1:${server.address().port}/api${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt.sign({ sub: String(u.id_usuario) }, process.env.JWT_SECRET)}`,
        },
        body: body && JSON.stringify(body),
      });
      return { status: r.status, data: await r.json() };
    };
    const espera = async (status, ...args) => {
      const r = await pedir(...args);
      assert.equal(r.status, status, JSON.stringify(r.data));
      return r.data;
    };
    const base = '/salon/pedidos';
    const linea = (cantidad, extra = {}) => ({ ...productoId, cantidad, ...extra });
    const body = {
      mesa: mesa.numero,
      comensales: 2,
      items: [linea(2)],
      id_mesero: colega.id_usuario,
      estado: 'CERRADO',
    };
    await db.producto.update({ where: productoId, data: { Estado: 0 } });
    await espera(409, mesero, 'POST', base, body);
    await db.producto.update({ where: productoId, data: { Estado: 1 } });
    await espera(422, mesero, 'POST', base, { ...body, items: [] });
    await espera(422, mesero, 'POST', base, { ...body, comensales: 5 });
    const falta = await espera(409, mesero, 'POST', base, { ...body, items: [linea(9)] });
    assert.equal(falta.code, 'STOCK_INSUFICIENTE');
    assert.equal(await db.pedido.count({ where: sitio }), 0);
    const urlMesa = `/salon/mesas/${mesa.numero}/estado`;
    const ocupar = { estado: 'OCUPADA', comensales: 3 };
    const liberar = (id_atencion) => ({ estado: 'DISPONIBLE', id_atencion });
    const leerMesa = async (usuario) =>
      (await espera(200, usuario, 'GET', '/salon')).mesas.find((m) => m.numero === mesa.numero);
    let atencion;
    await t.test(
      'ocupar, consultar y liberar sin pedido: permisos, doble clic y ficha obsoleta',
      async () => {
        assert.equal((await leerMesa(mesero)).ocupada, false);
        await espera(422, mesero, 'PATCH', urlMesa, { ...ocupar, comensales: 5 });
        await espera(422, mesero, 'PATCH', urlMesa, { estado: 'ENTREGADO' });
        await espera(403, cajero, 'PATCH', urlMesa, ocupar);
        const intentos = await Promise.all([1, 2].map(() => pedir(mesero, 'PATCH', urlMesa, ocupar)));
        assert.deepEqual(intentos.map((r) => r.status).sort(), [200, 409]);
        const primera = intentos.find((r) => r.status === 200).data.id_atencion;
        assert.equal((await leerMesa(mesero)).atencion.comensales, 3);
        const ajena = await leerMesa(colega);
        assert.equal(ajena.ocupada, true);
        assert.equal(ajena.atencion, null); // El colega puede abrir la ficha, pero no gestionar esta atención.
        const inventarioMesas = (await espera(200, colega, 'GET', '/mesas')).data;
        assert.equal(inventarioMesas.find((m) => m.numero === mesa.numero).estado, 'occupied');
        await espera(409, colega, 'PATCH', urlMesa, liberar(primera));
        await espera(409, colega, 'POST', base, { ...body, id_atencion: primera });
        await espera(409, mesero, 'POST', base, body); // Un editor abierto antes de sentar al grupo.
        await espera(200, mesero, 'PATCH', urlMesa, liberar(primera));
        assert.equal((await leerMesa(mesero)).ocupada, false);
        atencion = (await espera(200, mesero, 'PATCH', urlMesa, ocupar)).id_atencion;
        assert.notEqual(atencion, primera);
        await espera(409, mesero, 'PATCH', urlMesa, liberar(primera));
        await espera(409, mesero, 'POST', base, { ...body, id_atencion: primera });
        await espera(409, mesero, 'POST', base, { ...body, id_atencion: atencion, items: [linea(9)] });
        assert.equal((await leerMesa(mesero)).atencion.id_atencion, atencion); // Un pedido fallido no la libera.
        assert.equal(await db.pedido.count({ where: sitio }), 0);
        assert.equal(await stock(), 5);
      },
    );
    const aperturas = await Promise.all(
      [1, 2].map(() => pedir(mesero, 'POST', base, { ...body, id_atencion: atencion })),
    );
    assert.deepEqual(aperturas.map((r) => r.status).sort(), [201, 409]);
    const id = aperturas.find((r) => r.status === 201).data.id_pedido,
      url = `${base}/${id}`;
    const conCuenta = await leerMesa(mesero);
    assert.equal(conCuenta.ocupada, true);
    assert.equal(conCuenta.atencion, null);
    await espera(409, mesero, 'PATCH', urlMesa, liberar(atencion));
    assert.equal(await stock(), 3);
    const info = async () =>
      (await espera(200, mesero, 'GET', '/salon')).pedidos.find((p) => p.id_pedido === id);
    await espera(409, mesero, 'POST', '/facturas', { id_pedido: id }); // todavía se está atendiendo
    let p = await info();
    assert.equal(p.estado, 'ABIERTO');
    assert.equal((await espera(200, colega, 'GET', '/salon')).pedidos.length, 0);
    await t.test(
      'el equipo ve el consumo de esa mesa, sin datos privados ni permiso para modificarlo',
      async () => {
        const [vista] = (await leerMesa(colega)).cuentas;
        assert.equal(vista.id_pedido, id);
        assert.equal(vista.items[0].nombre, 'Plato de prueba');
        assert.equal(vista.items[0].cantidad, 2);
        assert.equal(vista.total, 2380);
        for (const campo of [
          'id_cliente',
          'cliente',
          'Factura',
          'version',
          'pago_registrado',
          'id_factura',
          'total_factura_pendiente',
        ])
          assert.equal(campo in vista, false);
        const plano = (await espera(200, colega, 'GET', '/mesas')).data;
        assert.deepEqual(plano.find((m) => m.numero === mesa.numero).cuentas, [vista]);
        assert.deepEqual(plano.find((m) => m.numero === segundaMesa.numero).cuentas, []);
        await espera(404, colega, 'DELETE', url, { version: 1 });
      },
    );
    const otraSede = await db.restaurante.create({ data: { nombre: `Otra sede ${tag}` } });
    try {
      await db.usuario.update({
        where: { id_usuario: colega.id_usuario },
        data: { id_restaurante: otraSede.id_restaurante },
      });
      assert.deepEqual((await espera(200, colega, 'GET', '/mesas')).data, []);
      await db.mesa.createMany({ data: [mesa, segundaMesa].map(m => ({ id_restaurante: otraSede.id_restaurante, numero: m.numero, capacidad: 4 })) });
      const otroSalon = await espera(200, colega, 'GET', '/salon');
      assert.equal(otroSalon.mesas.find((m) => m.numero === mesa.numero).ocupada, false);
      assert.equal(otroSalon.pedidos.length, 0);
      assert.deepEqual(otroSalon.mesas.find((m) => m.numero === mesa.numero).cuentas, []);
      assert.deepEqual(
        (await espera(200, colega, 'GET', '/mesas')).data.find((m) => m.numero === mesa.numero).cuentas,
        [],
      );
      // Mismo número en dos sedes: las atenciones previas al pedido también están aisladas.
      const urlSegunda = `/salon/mesas/${segundaMesa.numero}/estado`;
      const a = await espera(200, mesero, 'PATCH', urlSegunda, ocupar);
      const b = await espera(200, colega, 'PATCH', urlSegunda, ocupar);
      await espera(409, colega, 'PATCH', urlSegunda, liberar(a.id_atencion));
      await espera(200, colega, 'PATCH', urlSegunda, liberar(b.id_atencion));
      await espera(200, mesero, 'PATCH', urlSegunda, liberar(a.id_atencion));
    } finally {
      await db.mesa_atencion.deleteMany({ where: { id_restaurante: otraSede.id_restaurante } });
      await db.usuario.update({ where: { id_usuario: colega.id_usuario }, data: sitio });
      await db.mesa.deleteMany({ where: { id_restaurante: otraSede.id_restaurante } });
      await db.restaurante.delete({ where: { id_restaurante: otraSede.id_restaurante } });
    }
    await espera(403, mesero, 'POST', '/cobro/cerrar-cuenta', { id_pedido: id, metodo: 'TARJETA' });
    assert.equal(
      (await espera(200, cajero, 'GET', '/cobro/pendientes')).some((c) => c.id_pedido === id),
      false,
    );
    await espera(409, mesero, 'POST', url + '/cuenta', { version: 1 });
    const detalle = p.items[0].id_detalle;
    const edicion = {
      ...body,
      items: [linea(1, { id_detalle: detalle, nota: 'Sin sal', precio_unitario: 1 })],
      version: p.version,
    };
    await espera(409, mesero, 'PUT', url, { ...edicion, items: [linea(9, { id_detalle: detalle })] });
    assert.equal((await info()).items[0].cantidad, 2); // rollback de cabecera, renglones y stock
    await espera(409, mesero, 'PUT', `/detalle-pedido/${detalle}`, { cantidad: 20 });
    await espera(200, mesero, 'PUT', url, edicion);
    assert.equal(await stock(), 4);
    await espera(409, mesero, 'PUT', url, edicion); // edición obsoleta
    const avanzar = (id, estado) =>
      espera(200, mesero, 'PATCH', `/cocina/items/${id}/avanzar`, { estado_item: estado });
    await avanzar(detalle, 'PREPARANDO');
    await espera(409, mesero, 'PUT', url, { ...edicion, version: 2 });
    await espera(409, mesero, 'DELETE', url, { version: 2 });
    await avanzar(detalle, 'LISTO');
    await avanzar(detalle, 'ENTREGADO');
    assert.equal((await info()).estado, 'ENTREGADO');
    await espera(200, mesero, 'POST', url + '/rondas', { version: 2, items: [linea(2)] });
    p = await info();
    assert.equal(p.items.length, 2);
    assert.equal(p.items[0].estado, 'ENTREGADO');
    assert.equal(p.items[0].nota, 'Sin sal');
    assert.equal(p.items[0].precio_unitario, 1000);
    assert.equal(await stock(), 2);
    for (const estado of ['PREPARANDO', 'LISTO', 'ENTREGADO']) await avanzar(p.items[1].id_detalle, estado);
    await espera(200, mesero, 'POST', url + '/cuenta', { version: 3 });
    await espera(409, mesero, 'PATCH', urlMesa, liberar(atencion)); // En caja no significa disponible.
    const pendientes = await espera(200, cajero, 'GET', '/cobro/pendientes');
    assert.equal(pendientes.find((c) => c.id_pedido === id).total, p.total);
    const cobro = { id_pedido: id, metodo: 'TARJETA' };
    await espera(409, cajero, 'POST', '/cobro/cerrar-cuenta', cobro); // sin turno
    await db.turno_caja.create({
      data: { ...sitio, id_caja: caja.id_caja, id_usuario_cajero: cajero.id_usuario, estado: 'ABIERTA' },
    });
    const pagos = await Promise.all([1, 2].map(() => pedir(cajero, 'POST', '/cobro/cerrar-cuenta', cobro)));
    assert.deepEqual(pagos.map((r) => r.status).sort(), [201, 409]);
    const { factura } = pagos.find((r) => r.status === 201).data;
    assert.equal(await db.pago.count({ where: { id_factura: factura.id_factura } }), 1);
    assert.equal(await db.flujo_caja.count({ where: { pago: { id_factura: factura.id_factura } } }), 1);
    assert.equal(await stock(), 2); // no descontar otra vez al cobrar
    const f = (await espera(200, mesero, 'GET', `/facturas/${factura.id_factura}`)).data;
    assert.equal(f.Factura_item.length, 2);
    assert.equal(f.estado, 'PAGADA');
    assert.equal(Number(f.total), p.total);
    await espera(404, colega, 'GET', `/facturas/${factura.id_factura}`);
    assert.equal(
      (await espera(200, mesero, 'GET', '/salon')).mesas.find((m) => m.numero === mesa.numero).ocupada,
      false,
    );
    // Datos históricos incongruentes no deben provocar un segundo cobro.
    await db.pedido.update({ where: { id_pedido: id }, data: { estado: 'ABIERTO', version_salon: null } });
    await db.factura.update({ where: { id_factura: factura.id_factura }, data: { estado: 'EMITIDA' } });
    assert.equal((await info()).pago_registrado, true);
    assert.equal((await espera(200, mesero, 'GET', `/facturas/${factura.id_factura}`)).data.editable, false);
    await espera(409, gerente, 'PUT', `/facturas/${factura.id_factura}`, {
      receptor: 'Otro',
      version_edicion: 0,
    });
    await espera(409, gerente, 'DELETE', `/facturas/${factura.id_factura}`);
    await espera(409, gerente, 'PUT', `/pedidos/${id}`, { Mesa_num: segundaMesa.numero });
    await espera(409, gerente, 'PUT', `/detalle-pedido/${detalle}`, { cantidad: 20 });
    assert.equal(
      (await espera(200, cajero, 'GET', '/cobro/pendientes')).some((c) => c.id_pedido === id),
      false,
    );
    await espera(409, cajero, 'POST', '/cobro/cerrar-cuenta', cobro);
    await db.pedido.update({ where: { id_pedido: id }, data: { estado: 'CERRADO' } });
    const otra = await espera(201, colega, 'POST', base, body);
    assert.equal(await stock(), 0);
    await espera(200, colega, 'DELETE', `${base}/${otra.id_pedido}`, { version: 1 });
    assert.equal(await stock(), 2);
    // Dos mesas distintas compiten por las últimas dos unidades del mismo insumo.
    const competidores = await Promise.all(
      [mesa, segundaMesa].map((m) => pedir(mesero, 'POST', base, { ...body, mesa: m.numero })),
    );
    assert.deepEqual(competidores.map((r) => r.status).sort(), [201, 409]);
    const ultimo = competidores.find((r) => r.status === 201).data.id_pedido;
    assert.equal(await stock(), 0);
    await espera(200, mesero, 'DELETE', `${base}/${ultimo}`, { version: 1 });
    assert.equal(await stock(), 2);

    await t.test('una mesa histórica con varios pedidos solo se libera al terminar el último', async () => {
      const datos = {
        ...sitio,
        id_mesero: mesero.id_usuario,
        Mesa_num: mesa.numero,
        Tipo_pedido: 'MESA',
        estado: 'ABIERTO',
      };
      const a = await db.pedido.create({ data: datos });
      const b = await db.pedido.create({ data: { ...datos, id_mesero: colega.id_usuario } });
      const salon = await espera(200, mesero, 'GET', '/salon');
      assert.deepEqual(
        salon.mesas.find((m) => m.numero === mesa.numero).cuentas.map((p) => p.id_pedido),
        [a.id_pedido, b.id_pedido],
      );
      await espera(200, mesero, 'DELETE', `${base}/${a.id_pedido}`, { version: 0 });
      assert.equal((await leerMesa(mesero)).ocupada, true);
      await espera(409, mesero, 'PATCH', urlMesa, ocupar);
      assert.deepEqual(
        (await leerMesa(mesero)).cuentas.map((p) => p.id_pedido),
        [b.id_pedido],
      );
      await espera(200, colega, 'DELETE', `${base}/${b.id_pedido}`, { version: 0 });
      assert.equal((await leerMesa(mesero)).ocupada, false);
    });

    await t.test(
      'generar → editar → cobrar la misma factura: persistencia, alcance y pago inmutable',
      async () => {
        // La comanda de salón ya descontó stock; generar/editar/cobrar no vuelve a descontarlo.
        const orden = await db.pedido.create({
          data: {
            ...sitio,
            id_mesero: mesero.id_usuario,
            estado: 'POR_COBRAR',
            version_salon: 2,
            Mesa_num: mesa.numero,
            Detalle_pedido: {
              create: [
                { ...productoId, Cantidad: 2, Precio_unitario: 1000.5, estado_item: 'ENTREGADO' },
                { ...productoId, Cantidad: 3, Precio_unitario: 10000, estado_item: 'CANCELADO' },
              ],
            },
          },
        });
        const ventas = async () =>
          (await espera(200, mesero, 'GET', '/reportes/ventas-diarias?desde=2000-01-01&hasta=2099-12-31'))
            .data.total;
        const antes = await ventas();
        const alta = { id_pedido: orden.id_pedido, receptor: 'Grupo del almuerzo' };
        const previo = await stock();
        await espera(404, colega, 'POST', '/facturas', alta);
        await espera(422, mesero, 'POST', '/facturas', { ...alta, total: 1 });
        await espera(422, mesero, 'POST', '/facturas', { ...alta, descuento: 2002 });
        const altas = await Promise.all([1, 2].map(() => pedir(mesero, 'POST', '/facturas', alta)));
        assert.deepEqual(altas.map((r) => r.status).sort(), [201, 409]);
        const f = altas.find((r) => r.status === 201).data.data,
          url = `/facturas/${f.id_factura}`;
        const vista = async () => (await espera(200, mesero, 'GET', url)).data;
        assert.equal(f.estado, 'PENDIENTE');
        assert.equal(Number(f.total), 2381.19);
        assert.equal((await vista()).items.length, 1);
        assert.equal((await vista()).editable, true);
        const cambios = {
          version_edicion: 0,
          receptor: 'Consumo del equipo',
          descuento: 201,
          propina: 100.25,
        };
        await espera(404, colega, 'PUT', url, cambios);
        const otra = await db.restaurante.create({ data: { nombre: `Fuera de sede ${tag}` } });
        try {
          await db.usuario.update({
            where: { id_usuario: gerente.id_usuario },
            data: { id_restaurante: otra.id_restaurante },
          });
          await espera(404, gerente, 'GET', url);
          await espera(404, gerente, 'PUT', url, cambios);
          assert.equal(
            (await espera(200, gerente, 'GET', '/facturas')).data.some((v) => v.id_factura === f.id_factura),
            false,
          );
        } finally {
          await db.usuario.update({ where: { id_usuario: gerente.id_usuario }, data: sitio });
          await db.restaurante.delete({ where: { id_restaurante: otra.id_restaurante } });
        }
        await espera(422, mesero, 'PUT', url, { ...cambios, estado: 'PAGADA' });
        await espera(422, mesero, 'PUT', url, { ...cambios, propina: -20 });
        await espera(422, mesero, 'PUT', url, { ...cambios, descuento: 0.001 });
        await espera(200, mesero, 'PUT', url, cambios);
        await espera(409, mesero, 'PUT', url, cambios); // versión antigua
        await db.producto.update({
          where: productoId,
          data: { Nombre: 'Nombre posterior', precio_venta: 9000 },
        });
        const editada = await vista();
        assert.equal(editada.receptor, cambios.receptor);
        assert.equal(editada.items[0].nombre, 'Plato de prueba');
        assert.equal(editada.items[0].precio_unitario, 1000.5);
        assert.equal(Number(editada.IVA), 342);
        assert.equal(Number(editada.total), 2242.25);
        assert.equal(await db.pago.count({ where: { id_factura: f.id_factura } }), 0);
        assert.deepEqual(await ventas(), antes); // Un borrador no es un ingreso.
        const bandeja = (await espera(200, cajero, 'GET', '/cobro/pendientes')).find(
          (v) => v.id_pedido === orden.id_pedido,
        );
        assert.equal(bandeja.total, 2242.25);
        assert.equal(bandeja.version_factura, 1);
        assert.equal(bandeja.items[0].nombre, 'Plato de prueba');
        const pagar = {
          id_pedido: orden.id_pedido,
          metodo: 'EFECTIVO',
          monto_recibido: 3000,
          version_factura: 1,
        };
        await espera(409, cajero, 'POST', '/cobro/cerrar-cuenta', { ...pagar, version_factura: 0 });
        await espera(422, cajero, 'POST', '/cobro/cerrar-cuenta', { ...pagar, monto_recibido: 1 });
        // Caja y un formulario ya abierto compiten: solo se acepta la revisión que se confirmó.
        const [pago, edicion] = await Promise.all([
          pedir(cajero, 'POST', '/cobro/cerrar-cuenta', pagar),
          pedir(mesero, 'PUT', url, { version_edicion: 1, propina: 200.25 }),
        ]);
        assert.deepEqual([pago.status, edicion.status], pago.status === 201 ? [201, 409] : [409, 200]);
        const cobrada =
          pago.status === 201
            ? pago.data.factura
            : (await espera(201, cajero, 'POST', '/cobro/cerrar-cuenta', { ...pagar, version_factura: 2 }))
                .factura;
        const valor = pago.status === 201 ? 2242.25 : 2342.25;
        const despues = await ventas();
        assert.equal(despues.ingresos_netos - antes.ingresos_netos, valor);
        assert.equal(despues.ingresos_brutos - antes.ingresos_brutos, valor + 201);
        assert.equal(despues.total_pedidos - antes.total_pedidos, 1);
        assert.equal(cobrada.total, valor);
        assert.equal(cobrada.cambio, 3000 - valor);
        assert.equal(cobrada.id_factura, f.id_factura);
        assert.equal(cobrada.consecutivo, f.consecutivo);
        const final = await vista();
        assert.equal(final.estado, 'PAGADA');
        assert.equal(final.editable, false);
        assert.equal(Number(final.pago[0].monto), valor);
        assert.equal(final.items[0].nombre, 'Plato de prueba');
        assert.equal(await stock(), previo);
        assert.equal((await leerMesa(mesero)).ocupada, false);
        assert.equal(await db.factura.count({ where: { id_pedido: orden.id_pedido } }), 1);
        await espera(409, mesero, 'PUT', url, {
          version_edicion: final.version_edicion,
          receptor: 'Nuevo nombre',
        });
        await espera(409, gerente, 'DELETE', url);
        await espera(409, cajero, 'POST', '/cobro/cerrar-cuenta', pagar);
        assert.deepEqual(await vista(), final);
        assert.equal(
          (await espera(200, mesero, 'GET', '/facturas')).data.find((v) => v.id_factura === f.id_factura)
            .pagada,
          true,
        );
        assert.equal(await db.flujo_caja.count({ where: { pago: { id_factura: f.id_factura } } }), 1);
      },
    );
  },
);
