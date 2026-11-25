import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { escenarioEstablecimiento } from './fixtures/establecimiento.js';

// Matriz de aislamiento entre dos sedes: el gerente B nunca ve ni toca lo de A.
// Requiere BD de pruebas migrada (igual que establecimiento.integration.test.js):
//   ESTABLECIMIENTO_DB_TEST=1 pnpm --dir backend test
// Un ID de otra sede responde 404 (no 403) para no confirmar que existe.
test('aislamiento: gerente B no ve ni modifica los datos de la sede A',
  { skip: process.env.ESTABLECIMIENTO_DB_TEST !== '1' }, async (t) => {
    const { api, llamar, altaGerente, adminToken, contrasena, tag } =
      await escenarioEstablecimiento(t);
    const a = await altaGerente('SedeA');
    const postA = (ruta, body) => api(a.token, ruta, 'POST', body, 201);
    const prod = { Nombre: 'Arepa', precio_venta: 1000, Tiempo_preparacion: '00:10:00' };

    // --- Datos de A ---
    await postA('/productos', prod);
    const [producto] = await api(a.token, '/productos');
    const [clienteA] = await api(a.token, '/clientes').then(async () => {
      await postA('/clientes', { Nombre: 'Cliente', Email: 'a@example.test' });
      return api(a.token, '/clientes');
    });
    const [proveedor] = await api(a.token, '/proveedores').then(async () => {
      await postA('/proveedores', { nombre: 'Mercado' });
      return api(a.token, '/proveedores');
    });
    const [caja] = await api(a.token, '/cajas').then(async () => {
      await postA('/cajas', { nombre: 'Barra' });
      return api(a.token, '/cajas');
    });
    await postA('/mesas', { numero: 1, capacidad: 4 });
    await postA('/ingredientes', { nombre: 'Maíz', unidad_medida: 'kg', stock_minimo: 3 });
    const personal = await postA('/usuarios', {
      nombre: 'Cajera', id_rol: 3, email: `caja-${tag}@example.test`, contrasena,
    });
    const { data: turno } = await postA('/turnos', {
      id_caja: caja.id_caja, id_usuario_cajero: personal.data.id_usuario,
    });
    const { id_pedido } = await postA('/pedidos', { Tipo_pedido: 'LLEVAR' });
    const { data: detalle } = await postA('/detalle-pedido', {
      id_pedido, id_producto: producto.id_producto, cantidad: 1,
    });
    const cajera = jwt.sign({ sub: String(personal.data.id_usuario) }, process.env.JWT_SECRET);
    await api(cajera, '/cobro/cerrar-cuenta', 'POST', { id_pedido, metodo: 'TARJETA' }, 201);
    const [factura] = (await api(a.token, '/facturas')).data;

    const b = await altaGerente('SedeB');

    await t.test('listas de B vacías aunque A tenga datos', async () => {
      for (const url of ['/productos', '/clientes', '/proveedores', '/cajas', '/pedidos',
        '/domicilios', '/cocina/comandas', '/cobro/pendientes']) {
        assert.deepEqual(await api(b.token, url), [], url);
      }
      for (const url of ['/mesas', '/ingredientes', '/inventario', '/turnos', '/facturas',
        '/detalle-pedido', '/categorias', '/ia']) {
        assert.deepEqual((await api(b.token, url)).data, [], url);
      }
    });

    await t.test('GET /:id de A con token de B responde 404', async () => {
      const casos = [
        `/productos/${producto.id_producto}`, `/clientes/${clienteA.id_cliente}`,
        `/proveedores/${proveedor.id_proveedor}`, `/cajas/${caja.id_caja}`,
        `/pedidos/${id_pedido}`, `/detalle-pedido/${detalle.id_detalle}`,
        `/facturas/${factura.id_factura}`, `/turnos/${turno.id_turno}`,
        `/usuarios/${a.id_usuario}`,
      ];
      for (const ruta of casos) {
        const { status } = await llamar(b.token, ruta);
        assert.equal(status, 404, `${ruta} debió ser 404`);
      }
    });

    await t.test('PUT/DELETE cruzados también responden 404', async () => {
      await api(b.token, `/productos/${producto.id_producto}`, 'PUT', prod, 404);
      await api(b.token, `/proveedores/${proveedor.id_proveedor}`, 'DELETE', undefined, 404);
      await api(b.token, `/ingredientes/${(await api(a.token, '/ingredientes'))[0].id_ingrediente}`, 'DELETE', undefined, 404);
      await api(b.token, '/mesas/1', 'DELETE', undefined, 404);
    });

    await t.test('?id_restaurante en query no cambia la sede de un gerente', async () => {
      assert.deepEqual(await api(b.token, `/productos?id_restaurante=${a.id_restaurante}`), []);
      assert.deepEqual(await api(b.token, `/clientes?id_restaurante=${a.id_restaurante}`), []);
    });

    await t.test('id_restaurante en el body se ignora: el alta queda en la sede propia', async () => {
      await api(b.token, '/productos', 'POST',
        { ...prod, Nombre: 'Tamal', id_restaurante: a.id_restaurante }, 201);
      assert.deepEqual((await api(b.token, '/productos')).map((p) => p.Nombre), ['Tamal']);
      assert.deepEqual((await api(a.token, '/productos')).map((p) => p.Nombre), ['Arepa']);
    });

    await t.test('referencias cruzadas se rechazan con 422', async () => {
      await api(b.token, '/pedidos', 'POST', { id_cliente: clienteA.id_cliente }, 422);
      const propio = await api(b.token, '/pedidos', 'POST', {}, 201);
      await api(b.token, '/detalle-pedido', 'POST',
        { id_pedido: propio.id_pedido, id_producto: producto.id_producto, cantidad: 1 }, 422);
    });

    await t.test('superadmin sí puede elegir sede; sin sede no escribe', async () => {
      const vistos = await api(adminToken, `/productos?id_restaurante=${a.id_restaurante}`);
      assert.deepEqual(vistos.map((p) => p.Nombre), ['Arepa']);
      await api(adminToken, '/productos', 'POST', prod, 422);
    });
  });

// Gerente multisede: pertenecer a dos sedes habilita CAMBIAR de sede, no ver
// las dos a la vez. Requiere la misma BD de pruebas migrada que el caso anterior.
test('multisede: el gerente cambia de sede sin perder el aislamiento',
  { skip: process.env.ESTABLECIMIENTO_DB_TEST !== '1' }, async (t) => {
    const { api, llamar, altaGerente, adminToken } = await escenarioEstablecimiento(t);
    const a = await altaGerente('MultiA');
    const b = await altaGerente('MultiB');

    await api(a.token, '/productos', 'POST',
      { Nombre: 'Arepa', precio_venta: 1000, Tiempo_preparacion: '00:10:00' }, 201);
    await api(b.token, '/productos', 'POST',
      { Nombre: 'Tamal', precio_venta: 1200, Tiempo_preparacion: '00:10:00' }, 201);
    const nombres = async (token) => (await api(token, '/productos')).map((p) => p.Nombre);

    await t.test('sin membresía solo existe la sede propia', async () => {
      const mias = await api(b.token, '/usuarios/mis-sedes');
      assert.deepEqual(mias.data.map((s) => s.id_restaurante), [b.id_restaurante]);
      // Cambiar a una sede ajena responde 404: no se confirma que exista.
      const { status } = await llamar(b.token, '/usuarios/me/sede', 'PATCH', {
        id_restaurante: a.id_restaurante,
      });
      assert.equal(status, 404);
      assert.deepEqual(await nombres(b.token), ['Tamal']);
    });

    await t.test('solo el superadmin asigna sedes; el gerente no puede hacerlo', async () => {
      await api(b.token, `/usuarios/${b.id_usuario}/sedes`, 'PUT',
        { sedes: [a.id_restaurante, b.id_restaurante] }, 403);

      const asignado = await api(adminToken, `/usuarios/${b.id_usuario}/sedes`, 'PUT',
        { sedes: [a.id_restaurante, b.id_restaurante] });
      assert.equal(asignado.id_restaurante, b.id_restaurante, 'la sede activa no cambia sola');
      assert.deepEqual(
        asignado.data.map((s) => s.id_restaurante).sort(),
        [a.id_restaurante, b.id_restaurante].sort(),
      );
    });

    await t.test('la sede activa manda: una sede por petición, no la unión', async () => {
      const cambio = await api(b.token, '/usuarios/me/sede', 'PATCH', {
        id_restaurante: a.id_restaurante,
      });
      assert.equal(cambio.id_restaurante, a.id_restaurante);
      assert.deepEqual(await nombres(b.token), ['Arepa'], 'ahora opera en A');

      // La query no cambia la sede: ni siquiera entre sedes propias.
      assert.deepEqual(
        await nombres(`${b.token}`),
        ['Arepa'],
      );
      assert.deepEqual(
        (await api(b.token, `/productos?id_restaurante=${b.id_restaurante}`)).map((p) => p.Nombre),
        ['Arepa'],
      );
      assert.equal((await api(b.token, '/auth/me')).user.id_restaurante, a.id_restaurante);
    });

    await t.test('al cambiar de sede cambian también el personal y el historial', async () => {
      // Con la sede activa en A, B administra el personal de A (antes no lo veía).
      const personal = await api(b.token, '/usuarios');
      assert.ok(personal.some((u) => u.id_usuario === a.id_usuario), 've al gerente de A');
      const { status } = await llamar(b.token, '/historial?limite=5');
      assert.equal(status, 200, 'el historial se responde con la sede activa');
    });

    await t.test('retirar la sede activa devuelve al usuario a una sede válida', async () => {
      const retirado = await api(adminToken, `/usuarios/${b.id_usuario}/sedes`, 'PUT', {
        sedes: [b.id_restaurante],
      });
      assert.equal(retirado.id_restaurante, b.id_restaurante);
      assert.deepEqual(await nombres(b.token), ['Tamal']);
      const mias = await api(b.token, '/usuarios/mis-sedes');
      assert.deepEqual(mias.data.map((s) => s.id_restaurante), [b.id_restaurante]);
    });

    await t.test('el superadmin no tiene sede fija: usa el selector, no el cambio', async () => {
      const { status } = await llamar(adminToken, '/usuarios/me/sede', 'PATCH', {
        id_restaurante: a.id_restaurante,
      });
      assert.equal(status, 409);
      const vistos = await api(adminToken, `/productos?id_restaurante=${a.id_restaurante}`);
      assert.deepEqual(vistos.map((p) => p.Nombre), ['Arepa']);
    });

    await t.test('un gerente sigue sin alcanzar la sede de su par', async () => {
      assert.deepEqual(await nombres(a.token), ['Arepa']);
      const { status } = await llamar(a.token, '/usuarios/me/sede', 'PATCH', {
        id_restaurante: b.id_restaurante,
      });
      assert.equal(status, 404);
      await api(a.token, '/productos', 'POST',
        { Nombre: 'Ajiaco', precio_venta: 900, Tiempo_preparacion: '00:10:00' }, 201);
      assert.deepEqual(await nombres(b.token), ['Tamal'], 'B no ve lo nuevo de A');
    });
  });
