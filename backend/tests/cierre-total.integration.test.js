import test from 'node:test';
import assert from 'node:assert/strict';
import db from '../src/config/prisma.js';
import { escenarioEstablecimiento } from './fixtures/establecimiento.js';

const soloBD = { skip: process.env.ESTABLECIMIENTO_DB_TEST !== '1' };
test('cierre total por sede, cajas e historial con usuarios ya autenticados', soloBD, async t => {
  const { api, llamar, altaGerente, adminToken, tag, contrasena } = await escenarioEstablecimiento(t);
  const a = await altaGerente('Central'), b = await altaGerente('Barrio'), g = a.token, sede = { id_restaurante: a.id_restaurante };
  const post = (ruta, data) => api(g, ruta, 'POST', data, 201);
  async function empleado(nombre, id_rol) {
    const email = `${nombre}-${tag}@example.test`;
    const { data } = await post('/usuarios', { nombre, email, id_rol, contrasena });
    return { id: data.id_usuario, token: (await api(null, '/auth/login', 'POST', { email, contrasena })).token };
  }
  const cajero = await empleado('Cajera', 3), mesero = await empleado('Mesero', 4), repartidor = await empleado('Reparto', 5);
  await post('/cajas', { nombre: 'Mostrador' }); await post('/cajas', { nombre: 'Terraza' });
  const [c1,c2] = await api(g, '/cajas?estado=ACTIVA');
  const urlEstado = `/cajas/${c1.id_caja}/estado`, turno = id_caja => ({ id_usuario_cajero: cajero.id, id_caja });
  const revision = async () => (await api(g, '/sistema/revision')).pendientes;
  const cerrar = (version_sistema, status) => api(g, '/sistema/cerrar', 'POST', { version_sistema }, status);
  await api(g, urlEstado, 'PATCH', { estado: 'OTRA' }, 422);
  await api(b.token, urlEstado, 'PATCH', { estado: 'INACTIVA' }, 404);
  await api(g, urlEstado, 'PATCH', { estado: 'INACTIVA' });
  assert.deepEqual((await api(g, '/cajas?estado=ACTIVA')).map(c => c.nombre), ['Terraza']);
  await api(g, '/turnos', 'POST', turno(c1.id_caja), 409);
  await api(g, urlEstado, 'PATCH', { estado: 'ACTIVA' });
  const { data: t1 } = await post('/turnos', turno(c1.id_caja));
  assert.equal((await api(g, '/cajas')).find(c => c.id_caja === c1.id_caja).turno_activo,t1.id_turno);
  await api(g, urlEstado, 'PATCH', { estado: 'INACTIVA' }, 409);
  assert.deepEqual((await cerrar(0,409)).pendientes, [{ tipo: 'turnos', total: 1, ejemplo: t1.id_turno }]);
  await api(g, `/turnos/${t1.id_turno}/cerrar`, 'POST', { efectivo_real: 0 });
  const { data: t2 } = await post('/turnos', turno(c2.id_caja));
  await db.flujo_caja.createMany({ data: Array.from({ length: 54 }, (_,i) => ({ id_turno: i%2 ? t1.id_turno : t2.id_turno, ingresos: 1, metodo: 'TARJETA' })) });
  await t.test('el filtro se aplica antes del cursor y del arqueo y nunca devuelve la otra caja', async () => {
    for (const [c, jornada] of [[c1,t1],[c2,t2]]) {
      const url = `/turnos/movimientos?id_caja=${c.id_caja}`;
      const p = await api(g,url), otra = await api(g,`${url}&antes=${p.siguiente}`);
      assert.equal(p.data.length,25); assert.equal(otra.data.length,2); assert.equal(otra.siguiente,null);
      assert.equal(new Set([...p.data,...otra.data].map(m => m.id_flujo)).size,27);
      assert.ok([...p.data,...otra.data].every(m => m.caja === c.nombre && m.id_turno === jornada.id_turno));
      assert.deepEqual((await api(g,`/turnos/arqueos?id_caja=${c.id_caja}`)).data.map(t => [t.id_turno,t.ingresos]),[[jornada.id_turno,27]]);
      await api(b.token,url,'GET',undefined,404);
    }
  });
  await post('/mesas', { numero: 1, capacidad: 2 });
  const { id_atencion } = await api(mesero.token,'/salon/mesas/1/estado','PATCH',{ estado:'OCUPADA', comensales:1 });
  const { id_pedido } = await post('/pedidos',{ Tipo_pedido:'DOMICILIO' });
  const domicilio = await db.domicilio.create({ data: { id_pedido, estado:'EN_CAMINO' } });
  const factura = await db.factura.create({ data:{ id_pedido, estado:'PENDIENTE', total:100 } });
  const pago = await db.pago.create({ data:{ id_factura: factura.id_factura, estado:'PENDIENTE', id_usuario_cajero:cajero.id, id_turno:t2.id_turno, monto:100 } });
  await t.test('revisa pedidos, mesas, cocina vía pedido, domicilios, turnos, cuentas y pagos sin asiento', async () => {
    assert.deepEqual((await revision()).map(i => i.tipo), ['domicilios','facturas','mesas','pagos','pedidos','turnos']);
    await api(g, `/turnos/${t2.id_turno}/cerrar`, 'POST', { efectivo_real: 0 });
    await api(mesero.token,'/salon/mesas/1/estado','PATCH',{ estado:'DISPONIBLE', id_atencion });
    await db.pedido.update({ where:{id_pedido},data:{estado:'CERRADO'} });
    await db.domicilio.update({ where:{id_domicilio:domicilio.id_domicilio},data:{estado:'ENTREGADO'} });
    await db.factura.update({ where:{id_factura:factura.id_factura},data:{estado:'PAGADA'} });
    await db.pago.update({ where:{id_pago:pago.id_pago},data:{estado:'APROBADO'} });
    assert.deepEqual((await cerrar(0,409)).pendientes, [{ tipo:'asientos',total:1,ejemplo:pago.id_pago }]);
    await db.flujo_caja.create({data:{id_turno:t2.id_turno,id_pago:pago.id_pago,ingresos:100}});
    assert.deepEqual(await revision(),[]);
  });
  await t.test('el cierre persiste; no cierra sesión ni afecta otra sede y solo el gerente puede abrir', async () => {
    await api(cajero.token,'/sistema/cerrar','POST',{version_sistema:0},403);
    assert.equal((await cerrar(0,200)).message, 'cierre de sistema exitoso');
    assert.equal((await db.restaurante.findUniqueOrThrow({where:sede})).sistema_abierto,false);
    for (const token of [g,cajero.token,mesero.token,repartidor.token]) {
      assert.deepEqual(await api(token,'/sistema'),{sistema_abierto:false,version_sistema:1});
      await api(token,`/pedidos?id_restaurante=${b.id_restaurante}`,'POST',{ Tipo_pedido:'LLEVAR' },423);
      await api(token,'/auth/me');
    }
    for (const ruta of ['/cocina/comandas','/salon','/usuarios','/solicitudes','/historial','/cajas']) await api(g,ruta,'GET',undefined,423);
    await api(adminToken,`/usuarios/${a.id_usuario}/estado`,'PATCH',{activo:false},423);
    await api(null,'/auth/solicitud-registro','POST',{ nombre:'Solicitud',apellido:'Test',email:`sol-${tag}@example.test`,contrasena,id_rol_solicitado:3,...sede },423);
    await api(adminToken,`/mesas?id_restaurante=${a.id_restaurante}`,'POST',{numero:1},423);
    await api(mesero.token,'/sistema/abrir','POST',{version_sistema:1},403);
    await api(adminToken,`/sistema/abrir?id_restaurante=${a.id_restaurante}`,'POST',{version_sistema:1},403);
    await api(b.token,`/sistema/abrir?id_restaurante=${a.id_restaurante}`,'POST',{version_sistema:1},409);
    assert.equal((await api(b.token,'/sistema')).sistema_abierto,true);
    await api(b.token,'/pedidos','POST',{Tipo_pedido:'LLEVAR'},201);
    await api(g,'/sistema/abrir','POST',{version_sistema:1}); await cerrar(0,409);
    await api(mesero.token,'/salon');
    assert.deepEqual((await api(g,'/historial?grupo=SISTEMA')).data.map(h=>[h.accion,h.id_actor]),[['Apertura del sistema',a.id_usuario],['Cierre total',a.id_usuario]]);
  });
  await t.test('pedido simultáneo al cierre: solo uno de los dos puede confirmar', async () => {
    const [cierre, pedido] = await Promise.all([llamar(g,'/sistema/cerrar','POST',{version_sistema:2}),llamar(mesero.token,'/pedidos','POST',{Tipo_pedido:'LLEVAR'})]);
    assert.ok(cierre.status===200 && pedido.status===423 || cierre.status===409 && pedido.status===201, JSON.stringify([cierre,pedido]));
    if (cierre.status===200) assert.equal(await db.pedido.count({where:{...sede,estado:'ABIERTO'}}),0);
    else assert.equal(cierre.result.pendientes.find(i=>i.tipo==='pedidos').ejemplo,pedido.result.id_pedido);
  });
});
