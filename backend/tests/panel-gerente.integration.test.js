import test from 'node:test';
import assert from 'node:assert/strict';
import db from '../src/config/prisma.js';
import { escenarioEstablecimiento } from './fixtures/establecimiento.js';

test('panel del gerente: movimientos, saldos y permisos de dos establecimientos',
  { skip: process.env.ESTABLECIMIENTO_DB_TEST !== '1' }, async t => {
    const { api, llamar, altaGerente, contrasena, tag, adminToken } = await escenarioEstablecimiento(t);
    const a = await altaGerente('Panel'), b = await altaGerente('Vecino');
    const post = (path, body) => api(a.token, path, 'POST', body, 201);
    async function empleado(nombre, id_rol) {
      const email = `${nombre}-${tag}@example.test`;
      const { data } = await post('/usuarios', { nombre, email, contrasena, id_rol });
      return { ...data, token: (await api(null, '/auth/login', 'POST', { email, contrasena })).token };
    }
    const colega = await empleado('Gestora', 2), mesero = await empleado('Mesero',4);
    const hist = async (token = a.token) => (await api(token, '/historial')).data;

    await t.test('el cierre de acceso y la visibilidad de la ficha son independientes; el autor persiste', async () => {
      const persona = await empleado('Cajera',3), url = `/usuarios/${persona.id_usuario}`;
      await api(a.token, `${url}/estado`, 'PATCH', { activo: false });
      await api(persona.token, '/auth/me', 'GET', undefined, 403);
      await api(a.token, url, 'PUT', { nombre: 'Cajera editada', email: persona.email, id_rol: 3 });
      for (const token of [a.token, colega.token]) assert.equal((await api(token,'/usuarios')).find(p => p.id_usuario === persona.id_usuario).estado, 'INACTIVO');
      await api(colega.token, `${url}/estado`, 'PATCH', { activo: true });
      await api(a.token, url, 'DELETE');
      assert.ok(!(await api(a.token, '/usuarios')).some(p => p.id_usuario === persona.id_usuario));
      assert.equal((await api(colega.token, '/usuarios')).find(p => p.id_usuario === persona.id_usuario).activo, 0);
      await api(persona.token, '/auth/me', 'GET', undefined, 403);
      await api(a.token, url, 'GET', undefined, 404);
      await api(b.token, url, 'GET', undefined, 404);
      await api(colega.token, `${url}/estado`, 'PATCH', { activo: true });
      assert.ok(!(await api(a.token, '/usuarios')).some(p => p.id_usuario === persona.id_usuario));
      const eventos = (await hist()).filter(h => h.entidad === 'Personal' && h.registro === persona.id_usuario);
      assert.ok(eventos.some(h => h.accion === 'Retiro de mi lista' && h.id_actor === a.id_usuario));
      assert.ok(eventos.some(h => h.accion === 'Reactivación' && h.id_actor === colega.id_usuario));
      assert.ok(eventos.some(h => h.campos?.includes('nombre') && h.despues.includes('Cajera editada')));
      assert.ok(eventos.every(h => h.id_restaurante === a.id_restaurante));
      assert.ok(!JSON.stringify(eventos).includes(persona.email));
      assert.ok(!JSON.stringify(eventos).includes(contrasena));
    });

    await t.test('la edición bloquea la mesa real: ni una atención sin pedido, ni un número reutilizado son editables por accidente', async () => {
      const { data: mesa } = await post('/mesas', { numero: 4, capacidad: 6 });
      const editar = (capacidad, status) => api(a.token, '/mesas/4', 'PUT', { id_mesa: mesa.id_mesa, capacidad }, status);
      await editar(5, 200);
      await api(mesero.token, '/mesas/4', 'PUT', { capacidad: 7 }, 403);
      await api(b.token, '/mesas/4', 'PUT', { capacidad: 8 }, 404);
      const url = '/salon/mesas/4/estado', sentar = { estado: 'OCUPADA', comensales: 3 };
      const { id_atencion } = await api(mesero.token, url, 'PATCH', sentar);
      const ultima = (await hist())[0];
      assert.deepEqual([ultima.entidad, ultima.id_actor], ['Atención de mesa', mesero.id_usuario]);
      await editar(1, 409);
      assert.equal((await hist())[0].id_evento, ultima.id_evento); // La operación denegada no deja una edición.
      await api(mesero.token, url, 'PATCH', { estado: 'DISPONIBLE', id_atencion });
      const [guardar, sentados] = await Promise.all([llamar(a.token,'/mesas/4','PUT',{ capacidad: 1 }), llamar(mesero.token,url,'PATCH',sentar)]);
      assert.ok((guardar.status === 200 && sentados.status === 422) || (guardar.status === 409 && sentados.status === 200));
      if (sentados.status === 200) await api(mesero.token, url, 'PATCH', { estado: 'DISPONIBLE', id_atencion: sentados.result.id_atencion });
      await api(a.token, '/mesas/4','DELETE');
      await post('/mesas',{ numero: 4, capacidad: 2 });
      await editar(8,409);
      assert.equal((await api(a.token, '/mesas')).data[0].capacidad, 2);
    });

    await t.test('el espagueti con lote usa ENTRADA − SALIDA, incluso si la foto del lote quedó en cero', async () => {
      const { id_ingrediente } = await post('/ingredientes', { nombre: 'Espagueti', unidad_medida: 'kg', stock_minimo: 5 });
      const origen = { id_restaurante: a.id_restaurante, id_ingrediente };
      const lote = await db.lote_ingrediente.create({ data: { ...origen, stock_actual: 0 } });
      const alertas = async () => (await api(a.token, '/inventario/alertas/stock-bajo')).data.filter(i => i.id_ingrediente === id_ingrediente);
      assert.equal((await alertas())[0].alerta, 'SIN STOCK');
      await db.inventario_mov.createMany({ data: [['ENTRADA',20],['SALIDA',0.4]].map(([tipo_movimiento,cantidad]) => ({ ...origen, id_usuario: a.id_usuario, id_lote: lote.id_lote, tipo_movimiento, cantidad })) });
      assert.equal((await api(a.token, `/inventario/${id_ingrediente}`)).data.stock_actual, 19.6);
      assert.deepEqual(await alertas(), []);
      const mover = (tipo,cantidad) => post('/inventario/ajuste', { id_ingrediente,tipo,cantidad,motivo:'Conteo despensa' });
      await mover('SALIDA',14.6);
      assert.deepEqual((await alertas()).map(i => [i.alerta,i.stock_actual,i.stock_minimo]), [['BAJO MÍNIMO',5,5]]);
      await api(a.token, `/ingredientes/${id_ingrediente}`, 'PUT', { nombre:'Espagueti', stock_esperado:5, stock_actual:10, motivo:'Reposición confirmada' });
      assert.deepEqual(await alertas(), []);
      await mover('SALIDA',10);
      assert.equal((await alertas())[0].alerta, 'SIN STOCK');
      assert.deepEqual((await api(b.token,'/inventario/alertas/stock-bajo')).data, []);
    });

    await t.test('ventas por fecha de pago en Bogotá: no duplicar descuentos, IVA, propinas o unidades al fraccionar un cobro', async () => {
      await post('/productos',{ Nombre:'Postre', precio_venta:100 });
      const [producto] = await api(a.token, '/productos');
      const pedido = await db.pedido.create({ data: { id_restaurante:a.id_restaurante, Detalle_pedido:{ create:{ id_producto:producto.id_producto, Cantidad:2, Precio_unitario:100 } } }, include:{ Detalle_pedido:true } });
      const emision = new Date('2020-12-29T23:00:00Z');
      const f = await db.factura.create({ data: { id_pedido:pedido.id_pedido, Fecha_emision:emision, estado:'EMITIDA', total:210, Descuento:15, IVA:20, Propina:5,
        Factura_item:{ create:{ id_detalle_pedido:pedido.Detalle_pedido[0].id_detalle, cantidad_facturada:2, precio_unitario:100 } } } });
      const pago = { id_factura:f.id_factura, id_usuario_cajero:a.id_usuario, metodo:'TARJETA' };
      await db.pago.createMany({ data: [
        { ...pago, monto:60, fecha_pago:new Date('2021-01-01T04:59:59Z') }, // 31 de diciembre
        { ...pago, monto:80, fecha_pago:new Date('2021-01-01T05:00:00Z') }, // medianoche, 1 de enero
        { ...pago, monto:70, fecha_pago:new Date('2021-01-01T06:00:00Z') },
        { ...pago, monto:99999, estado:'RECHAZADO', fecha_pago:new Date('2021-01-01T06:00:00Z') },
      ] });
      const ventas = (await api(a.token,'/reportes/ventas-diarias?desde=2020-12-29&hasta=2021-01-01')).data;
      assert.deepEqual(ventas.dias.map(d => [d.fecha,d.ingresos_netos]), [['2021-01-01',150],['2020-12-31',60]]);
      assert.deepEqual(ventas.dias.map(d => d.total_pedidos), [1,1]); // presente ambos días, una sola factura en el rango
      assert.deepEqual(ventas.total, { total_pedidos:1, ingresos_netos:210, ingresos_brutos:225, total_iva:20, total_descuentos:15,total_propinas:5 });
      assert.deepEqual(ventas.productos_top.map(p => [p.producto,p.unidades,p.ingresos]), [['Postre',2,200]]);
      assert.equal((await api(b.token,'/reportes/ventas-diarias?desde=2020-12-29&hasta=2021-01-01')).data.total.ingresos_netos,0);
    });

    await t.test('solicitud y recuperación de acceso quedan vinculadas a la sede, sin exponer correos, claves ni tokens', async () => {
      const email = `sol-${tag}@example.test`;
      const { data: sol } = await api(null,'/auth/solicitud-registro','POST',{ nombre:'Auxiliar',apellido:'Prueba',email,contrasena,id_rol_solicitado:5,id_restaurante:a.id_restaurante },201);
      const { data: aprobada } = await api(a.token,`/solicitudes/${sol.id_solicitud}/aprobar`,'PATCH');
      const token = `recuperacion-${tag}`;
      await db.password_reset_tokens.create({ data:{ email,token,created_at:new Date() } });
      await api(null,'/auth/reset-password','POST',{ email,token,password:`Restablecida!1${tag}` });
      const eventos = await hist();
      assert.ok(eventos.some(e => e.entidad === 'Solicitud' && e.id_actor === a.id_usuario && e.despues.includes('APROBADA')));
      assert.ok(eventos.some(e => e.accion === 'Cambio de contraseña' && e.id_actor === aprobada.usuario.id_usuario && e.campos === 'contraseña'));
      assert.ok(eventos.some(e => e.entidad === 'Sesión' && e.id_actor === mesero.id_usuario));
      for (const secreto of [email,token,contrasena,`Restablecida!1${tag}`,(await db.usuario.findUniqueOrThrow({ where: { email } })).contrasena_hash]) assert.ok(!JSON.stringify(eventos).includes(secreto));
      assert.equal(await db.contexto_actividad.count(),0);
    });

    await t.test('el historial pagina sin duplicados, rechaza lecturas de empleados y nunca toma la sede del formulario', async () => {
      await api(mesero.token, '/historial','GET',undefined,403);
      await api(adminToken, '/historial','GET',undefined,422);
      for (let i=0; i<52; i++) await post('/mesas',{numero:100+i,capacidad:1,id_restaurante:b.id_restaurante});
      const pagina = await api(a.token,`/historial?id_restaurante=${b.id_restaurante}`);
      assert.equal(pagina.data.length,50);
      const mas = (await api(a.token,`/historial?antes=${pagina.siguiente}`)).data;
      assert.ok(mas.length > 0 && mas[0].id_evento < pagina.data.at(-1).id_evento);
      assert.ok([...pagina.data,...mas].every(e => e.id_restaurante === a.id_restaurante));
      assert.ok((await hist(b.token)).every(e => e.id_restaurante === b.id_restaurante && e.entidad !== 'Mesa'));
    });
  });
