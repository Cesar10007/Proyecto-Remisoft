import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import db from '../src/config/prisma.js';

// Requiere una BD de pruebas migrada + las vistas y procedimientos de database/.
// No depende de la demo. Solo se eliminan los registros creados por este escenario.
test('alta por superadmin: cada establecimiento nace vacío y conserva su propia operación',
  { skip: process.env.ESTABLECIMIENTO_DB_TEST !== '1' }, async (t) => {
    assert.match(process.env.DB_DATABASE, /_test$/);
    const tag = randomUUID();
    const contrasena = `Prueba!${tag}9`;
    const sedes = [];
    const admin = await db.usuario.create({ data: { nombre: tag, id_rol: 1 } });
    const adminToken = jwt.sign({ sub: String(admin.id_usuario) }, process.env.JWT_SECRET);
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    t.after(async () => {
      await new Promise(resolve => server.close(resolve));
      const sede = { id_restaurante: { in: sedes } };
      const pedido = { pedido: sede };
      await db.flujo_caja.deleteMany({ where: { turno_caja: sede } });
      await db.pago.deleteMany({ where: { Factura: pedido } });
      await db.factura_item.deleteMany({ where: { Factura: pedido } });
      await db.factura.deleteMany({ where: pedido });
      await db.detalle_pedido.deleteMany({ where: pedido });
      await db.pedido.deleteMany({ where: sede });
      await db.detalle_orden_compra.deleteMany({ where: { orden_compra: sede } });
      await db.orden_compra.deleteMany({ where: sede });
      for (const modelo of ['inventario_mov', 'turno_caja', 'mesa', 'caja', 'cliente', 'proveedor', 'iA', 'ingrediente', 'producto', 'categoria_productos']) {
        await db[modelo].deleteMany({ where: sede });
      }
      await db.solicitud_registro.deleteMany({ where: { email: `sol-${tag}@example.test` } });
      await db.usuario.deleteMany({ where: { OR: [sede, { id_usuario: admin.id_usuario }, { email: `sin-${tag}@example.test` }] } });
      await db.restaurante.deleteMany({ where: sede });
      await db.$disconnect();
    });
    async function api(token, path, method = 'GET', body, status = 200) {
      const r = await fetch(`http://127.0.0.1:${server.address().port}/api${path}`, {
        method, headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify(body),
      });
      const result = await r.json();
      assert.equal(r.status, status, `${method} ${path}: ${JSON.stringify(result)}`);
      return result;
    }
    async function altaGerente(nombre) {
      const email = `${nombre}-${tag}@example.test`;
      const alta = await api(adminToken, '/usuarios', 'POST', { nombre, email, contrasena, id_rol: 2, nombre_establecimiento: nombre }, 201);
      const { id_restaurante } = alta.data.restaurante;
      sedes.push(id_restaurante);
      const sesion = await api(null, '/auth/login', 'POST', { email, contrasena });
      assert.equal(sesion.user.id_restaurante, id_restaurante);
      assert.equal(sesion.user.nombre_establecimiento, nombre);
      assert.equal((await api(sesion.token, '/auth/me')).user.id_restaurante, id_restaurante);
      return { token: sesion.token, id_restaurante, id_usuario: sesion.user.id_usuario };
    }

    const a = await altaGerente('Alfa');
    const postA = (ruta, body) => api(a.token, ruta, 'POST', body, 201);
    const prod = { Nombre: 'Arepa', precio_venta: 1000, Tiempo_preparacion: '00:10:00' };
    await postA('/productos', prod);
    await postA('/productos', { ...prod, Nombre: 'Café' });
    const [producto] = await api(a.token, '/productos');
    for (const url of ['/productos/vista', '/productos/sp']) {
      assert.deepEqual((await api(a.token, url)).map(p => [p.Nombre, p.Tiempo_preparacion]), [['Arepa', '00:10:00'], ['Café', '00:10:00']]);
    }
    await postA('/ingredientes', { nombre: 'Maíz', stock_minimo: 3 });
    const [ing] = await api(a.token, '/ingredientes');
    const ajuste = { id_ingrediente: ing.id_ingrediente, tipo: 'ENTRADA', cantidad: 2, motivo: 'Conteo inicial' };
    assert.equal((await postA('/inventario/ajuste', ajuste)).data.id_restaurante, a.id_restaurante);
    assert.equal((await api(a.token, '/inventario')).data[0].stock_actual, 2);
    const [alerta] = (await api(a.token, '/inventario/alertas/stock-bajo')).data;
    assert.equal(alerta.nombre, 'Maíz');
    assert.equal(alerta.stock_actual, 2);
    await postA('/ia', { Tipo_prediccion: 'Demanda', Resultado_generado: 'Resultado registrado para Alfa.' });
    assert.deepEqual((await api(a.token, '/ia')).data.map(r => r.Resultado_generado), ['Resultado registrado para Alfa.']);
    const categoria = await db.categoria_productos.create({ data: { id_restaurante: a.id_restaurante, nombre: 'Desayunos' } });
    const cliente = { Nombre: 'Cliente', Email: 'compartido@example.test' };
    await postA('/clientes', cliente);
    const [clienteA] = await api(a.token, '/clientes');
    await postA('/proveedores', { nombre: 'Mercado' });
    await postA('/cajas', { nombre: 'Barra' });
    await postA('/mesas', { numero: 1, capacidad: 4 });
    const [proveedor] = await api(a.token, '/proveedores'), [caja] = await api(a.token, '/cajas');
    const personal = await postA('/usuarios', { nombre: 'Cajera', id_rol: 3, email: `caja-${tag}@example.test`, contrasena });
    assert.equal(personal.data.id_restaurante, a.id_restaurante);
    const turno = { id_caja: caja.id_caja, id_usuario_cajero: personal.data.id_usuario };
    const { data: abierto } = await postA('/turnos', turno);
    assert.equal(abierto.id_restaurante, a.id_restaurante);
    const { id_pedido } = await postA('/pedidos', { Tipo_pedido: 'LLEVAR' });
    const { data: detalle } = await postA('/detalle-pedido', { id_pedido, id_producto: producto.id_producto, cantidad: 1 });
    const cajera = jwt.sign({ sub: String(personal.data.id_usuario) }, process.env.JWT_SECRET);
    await api(cajera, '/cobro/cerrar-cuenta', 'POST', { id_pedido, metodo: 'TARJETA' }, 201);
    await postA('/pedidos', { Tipo_pedido: 'MESA', Mesa_num: 1 });
    await db.orden_compra.create({ data: { id_restaurante: a.id_restaurante, id_usuario: a.id_usuario,
      id_proveedor: proveedor.id_proveedor, fecha_orden: new Date(),
      detalle_orden_compra: { create: { id_ingrediente: ing.id_ingrediente, cantidad_recibida: 2, precio_unitario: 100 } },
    } });
    assert.equal((await api(a.token, '/reportes/pedidos-activos')).data.pedidos_activos, 1);
    assert.equal((await api(a.token, '/reportes/gastos-del-mes')).data.gastos_mes, 200);
    const ventas = (await api(a.token, '/reportes/ventas-diarias')).data;
    assert.equal(ventas.total.total_pedidos, 1);
    assert.equal(ventas.productos_top[0].producto, 'Arepa');
    assert.ok(ventas.total.ingresos_brutos >= 1000);

    const b = await altaGerente('Beta');
    assert.notEqual(a.id_restaurante, b.id_restaurante);
    await t.test('panel nuevo: listas vacías y métricas cero aun con ventas, stock y análisis en Alfa', async () => {
      for (const url of ['/productos', '/productos/vista', '/productos/sp', '/ingredientes', '/pedidos', '/cajas', '/proveedores', '/clientes', '/domicilios', '/cocina/comandas', '/cobro/pendientes']) {
        assert.deepEqual(await api(b.token, `${url}?id_restaurante=${a.id_restaurante}`), [], url);
      }
      for (const url of ['/ia', '/categorias', '/inventario', '/inventario/alertas/stock-bajo', '/mesas', '/turnos', '/turnos/aperturas', '/turnos/gastos', '/turnos/arqueos', '/facturas', '/detalle-pedido']) {
        assert.deepEqual((await api(b.token, url)).data, [], url);
      }
      assert.deepEqual((await api(b.token, '/restaurantes')).data.map(s => s.id_restaurante), [b.id_restaurante]);
      assert.deepEqual((await api(b.token, '/usuarios')).map(u => u.id_usuario), [b.id_usuario]);
      assert.equal((await api(b.token, '/reportes/pedidos-activos')).data.pedidos_activos, 0);
      assert.equal((await api(b.token, '/reportes/gastos-del-mes')).data.gastos_mes, 0);
      const propias = (await api(b.token, '/reportes/ventas-diarias')).data;
      assert.equal(propias.total.ingresos_brutos, 0);
      assert.deepEqual(propias.dias, []);
      assert.deepEqual(propias.productos_top, []);
    });
    await t.test('las operaciones por ID y las referencias también respetan el establecimiento', async () => {
      const ruta = `/productos/${producto.id_producto}`;
      await api(b.token, ruta, 'GET', undefined, 404);
      await api(b.token, ruta, 'PUT', prod, 404);
      await api(b.token, ruta, 'DELETE', undefined, 404);
      await api(b.token, `/detalle-pedido/${detalle.id_detalle}`, 'GET', undefined, 404);
      await api(b.token, `/pedidos/${id_pedido}`, 'DELETE', undefined, 404);
      await api(b.token, `/usuarios/${a.id_usuario}`, 'GET', undefined, 404);
      await api(b.token, '/productos', 'POST', { ...prod, id_categoria: categoria.id_categoria }, 422);
      await api(b.token, '/pedidos', 'POST', { id_cliente: clienteA.id_cliente }, 422);
      await api(adminToken, '/productos', 'POST', prod, 422); // una escritura operativa nunca queda huérfana
      assert.equal((await api(adminToken, `/productos?id_restaurante=${a.id_restaurante}`)).length, 2);
      await api(b.token, '/inventario/ajuste', 'POST', ajuste, 404);
      await api(b.token, `/ingredientes/${ing.id_ingrediente}`, 'DELETE', undefined, 404);
      await api(b.token, `/proveedores/${proveedor.id_proveedor}`, 'DELETE', undefined, 404);
      await api(b.token, '/turnos', 'POST', turno, 422);
      await api(b.token, `/turnos/${abierto.id_turno}/cerrar`, 'POST', { efectivo_real: 0 }, 404);
      assert.equal((await api(a.token, `/turnos/${abierto.id_turno}`)).data.estado, 'ABIERTA');
      const propio = await api(b.token, '/pedidos', 'POST', {}, 201);
      await api(b.token, '/detalle-pedido', 'POST', { id_pedido: propio.id_pedido, id_producto: producto.id_producto, cantidad: 1 }, 422);
      await api(b.token, '/pedidos', 'POST', { id_mesero: a.id_usuario }, 422);
      await api(b.token, '/productos', 'POST', { ...prod, Nombre: 'Tamal', id_restaurante: a.id_restaurante }, 201);
      assert.deepEqual((await api(b.token, '/productos/sp')).map(p => p.Nombre), ['Tamal']);
      assert.deepEqual((await api(a.token, '/productos/vista')).map(p => p.Nombre), ['Arepa', 'Café']);
      await api(b.token, '/clientes', 'POST', cliente, 201); // email único por sede
      await api(b.token, '/mesas', 'POST', { numero: 1, capacidad: 2 }, 201);
      assert.equal((await api(b.token, '/mesas')).data[0].ocupada, false);
      assert.equal((await api(a.token, '/mesas')).data[0].ocupada, true);
      assert.equal((await api(a.token, `/turnos/${abierto.id_turno}/cerrar`, 'POST', { efectivo_real: 0 })).data.estado, 'CERRADA');
    });
    await t.test('un enlace histórico no expone la ficha actual de otra sede', async () => {
      const historico = await db.pedido.create({ data: {
        id_restaurante: b.id_restaurante, id_cliente: clienteA.id_cliente,
        Detalle_pedido: { create: { id_producto: producto.id_producto, Cantidad: 1, Precio_unitario: 750 } },
      } });
      assert.equal((await api(b.token, `/pedidos/${historico.id_pedido}`)).nombre_cliente, null);
      const [linea] = (await api(b.token, `/detalle-pedido?id_pedido=${historico.id_pedido}`)).data;
      assert.equal(linea.Producto, null);
      assert.equal(Number(linea.Precio_unitario), 750); // El consumo propio se conserva
    });
    await t.test('una aprobación tampoco apropia una sede anterior; un usuario sin sede no ve datos', async () => {
      const email = `sol-${tag}@example.test`;
      const { data: sol } = await api(null, '/auth/solicitud-registro', 'POST', { email, nombre: 'Solicitud', apellido: 'Nueva', contrasena, id_rol_solicitado: 2, nombre_establecimiento: 'Gamma' }, 201);
      const aprobada = (await api(adminToken, `/solicitudes/${sol.id_solicitud}/aprobar`, 'PATCH')).data;
      const { user, token } = await api(null, '/auth/login', 'POST', { email, contrasena });
      sedes.push(user.id_restaurante);
      assert.equal(user.id_usuario, aprobada.usuario.id_usuario);
      assert.equal(new Set(sedes).size, 3);
      assert.deepEqual(await api(token, '/productos'), []);
      const sinSede = await db.usuario.create({ data: { id_rol: 2, email: `sin-${tag}@example.test` } });
      await api(jwt.sign({ sub: String(sinSede.id_usuario), id_restaurante: a.id_restaurante }, process.env.JWT_SECRET), '/productos', 'GET', undefined, 403);
      assert.ok((await api(adminToken, '/usuarios')).some(u => u.id_usuario === b.id_usuario));
    });
  });
