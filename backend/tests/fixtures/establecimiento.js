import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import app from '../../src/app.js';
import db from '../../src/config/prisma.js';

// Solo el superadmin de arranque es fixture. Las sedes se crean y autentican por HTTP.
export async function escenarioEstablecimiento(t) {
  assert.match(process.env.DB_DATABASE, /_test$/);
  const tag = randomUUID();
  const contrasena = `Prueba!${tag}9`;
  const sedes = [];
  const emailAdmin = `admin-${tag}@example.test`;
  const admin = await db.usuario.create({ data: { nombre: tag, email: emailAdmin, id_rol: 1, contrasena_hash: await bcrypt.hash(contrasena, 4) } });
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
    await db.receta.deleteMany({ where: { Producto: sede } });
    for (const modelo of ['mesa_atencion', 'inventario_mov', 'lote_ingrediente', 'turno_caja', 'mesa', 'caja', 'cliente', 'proveedor', 'iA', 'ingrediente', 'producto', 'categoria_productos']) {
      await db[modelo].deleteMany({ where: sede });
    }
    await db.solicitud_registro.deleteMany({ where: { email: `sol-${tag}@example.test` } });
    await db.usuario.deleteMany({ where: { OR: [sede, { id_usuario: admin.id_usuario }, { email: `sin-${tag}@example.test` }] } });
    await db.restaurante.deleteMany({ where: sede });
    await db.actividad_sede.deleteMany({ where: sede }); // incluye retiros de limpieza de este fixture
    await db.$disconnect();
  });
  async function llamar(token, path, method = 'GET', body) {
    const r = await fetch(`http://127.0.0.1:${server.address().port}/api${path}`, {
      method, headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
      body: JSON.stringify(body),
    });
    return { status: r.status, result: await r.json() };
  }
  async function api(token, path, method = 'GET', body, status = 200) {
    const r = await llamar(token, path, method, body);
    const result = r.result;
    assert.equal(r.status, status, `${method} ${path}: ${JSON.stringify(result)}`);
    return result;
  }
  const { token: adminToken } = await api(null, '/auth/login', 'POST', { email: emailAdmin, contrasena });
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
  return { api, llamar, altaGerente, adminToken, contrasena, sedes, tag };
}
